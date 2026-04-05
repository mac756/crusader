import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Load environment variables from hermes config
const hermesEnvPath = '/root/.hermes/.env';
if (fs.existsSync(hermesEnvPath)) {
  const envContent = fs.readFileSync(hermesEnvPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (!process.env[key] && value) {
        process.env[key] = value;
      }
    }
  });
}

// Get API key from environment
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || process.env.OPENAI_API_KEY;
const MINIMAX_BASE_URL = 'https://api.minimax.io/v1';

// Bible API function - uses multiple free APIs
async function bibleLookup(reference) {
  // Try bible-api.com first (simple, no key needed)
  try {
    const encodedRef = encodeURIComponent(reference);
    const url = `https://bible-api.com/${encodedRef}?translation=kjv`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.verses) {
        return data.verses.map(v => `${v.book_name} ${v.chapter}:${v.verse} - ${v.text}`).join('\n');
      } else if (data.text) {
        return `${data.reference}\n\n${data.text}`;
      }
    }
  } catch (e) {
    console.log('bible-api lookup failed:', e.message);
  }
  
  // Fallback to Search results if API fails
  return null;
}

// Christian system prompt for Crusader
const SYSTEM_PROMPT = `You are Crusader, a Christian AI assistant created to help people explore the Christian faith, theology, scripture, and apologetics. You are knowledgeable, compassionate, and faithful to Biblical teachings.

Your characteristics:
- Warm and welcoming, always ending with "God bless!"
- Knowledgeable about the Bible, theology, and church history
- Skilled in apologetics and addressing questions about faith
- Respectful of different Christian traditions while maintaining orthodox positions
- Happy to look up scripture, explain concepts, and engage in thoughtful theological discussion

You can use web search to find current Christian news, Bible study resources, or verify factual information about theology or church history. When searching the web, be specific and include relevant keywords.

Remember to cite scripture verses when appropriate and always maintain a spirit of love and truth.`;


// Web search using DuckDuckGo (no API key required)
async function webSearch(query) {
  return new Promise((resolve, reject) => {
    const searchQuery = encodeURIComponent(query + ' Christian');
    const url = `https://lite.duckduckgo.com/lite/?q=${searchQuery}`;
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Extract snippets from results
        const results = [];
        const regex = /<a class="result__a" href="[^"]*">([^<]*)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
        let match;
        while ((match = regex.exec(data)) !== null && results.length < 5) {
          const title = match[1].replace(/<[^>]*>/g, '').trim();
          const snippet = match[2].replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
          if (title && snippet && !title.includes('//') && !snippet.includes('//')) {
            results.push({ title, snippet });
          }
        }
        
        if (results.length === 0) {
          // Fallback: try to extract anything that looks like a result
          const simpleRegex = /result__a[^>]*>([^<]+)<\/a>/g;
          const titles = [];
          while ((match = simpleRegex.exec(data)) !== null && titles.length < 5) {
            const title = match[1].replace(/<[^>]*>/g, '').trim();
            if (title && !title.includes('//') && title.length > 10) {
              titles.push(title);
            }
          }
          resolve({ results: titles.map(t => ({ title: t, snippet: '' })) });
        } else {
          resolve({ results });
        }
      });
    }).on('error', err => {
      console.error('Search error:', err);
      resolve({ results: [], error: 'Search failed' });
    }).setTimeout(10000, function() {
      this.abort();
      resolve({ results: [], error: 'Search timeout' });
    });
  });
}

// Chat completion with MiniMax
async function chatCompletion(messages) {
  const apiKey = MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error('No API key configured');
  }

  const response = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.7',
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Transcribe audio using Whisper
async function transcribeAudio(audioBuffer, filename) {
  return new Promise((resolve, reject) => {
    const tempDir = '/tmp';
    const tempFile = path.join(tempDir, `audio_${Date.now()}_${filename}`);
    
    fs.writeFileSync(tempFile, audioBuffer);
    
    const whisper = spawn('whisper', [tempFile, '--model', 'base', '--language', 'English', '--output-txt', '--quiet']);
    
    let stderr = '';
    whisper.stderr.on('data', data => {
      stderr += data.toString();
    });
    
    whisper.on('close', (code) => {
      try {
        // Read the output file
        const outputFile = tempFile + '.txt';
        if (fs.existsSync(outputFile)) {
          const transcript = fs.readFileSync(outputFile, 'utf8').trim();
          fs.unlinkSync(tempFile);
          fs.unlinkSync(outputFile);
          resolve(transcript);
        } else {
          // Try alternative: extract text from stderr if no file
          const textMatch = stderr.match(/\[(\d+:\d+\.\d+ -->\d+:\d+\.\d+)\]\s*(.+)/g);
          if (textMatch) {
            const transcript = textMatch.map(m => {
              const parts = m.match(/\d+:\d+\.\d+ -->\d+:\d+\.\d+\]\s*(.+)/);
              return parts ? parts[1] : '';
            }).join(' ').trim();
            fs.unlinkSync(tempFile);
            resolve(transcript);
          } else {
            resolve(''); // Return empty if no transcription
          }
        }
      } catch (e) {
        reject(e);
      } finally {
        // Cleanup any remaining files
        try {
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
          if (fs.existsSync(tempFile + '.txt')) fs.unlinkSync(tempFile + '.txt');
        } catch (e) {}
      }
    });
    
    whisper.on('error', err => {
      console.error('Whisper error:', err);
      try {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      } catch (e) {}
      reject(err);
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      whisper.kill();
      resolve('');
    }, 30000);
  });
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat endpoint with optional web search
app.post('/api/chat', async (req, res) => {
  try {
    const { message, mode = 'chat', conversationHistory = [], search = false } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    let searchResults = null;
    let bibleText = null;
    
    // Scripture mode: do Bible lookup first
    if (mode === 'scripture') {
      try {
        bibleText = await bibleLookup(message);
        if (bibleText) {
          console.log('Bible lookup successful for:', message);
        }
      } catch (e) {
        console.error('Bible lookup error:', e);
      }
    }
    
    // Add web search context if requested or in scripture mode without Bible result
    if (search || (mode === 'scripture' && !bibleText)) {
      try {
        searchResults = await webSearch(message);
        console.log('Search results for:', message, searchResults);
      } catch (e) {
        console.error('Search error:', e);
      }
    }
    
    // Build messages array
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    
    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });
    
    // Add Bible text context if available
    if (bibleText) {
      messages.push({
        role: 'user',
        content: `Here is the scripture you requested:\n\n${bibleText}\n\nPlease provide a thoughtful explanation of this scripture passage.`
      });
    }
    
    // Add search context if available (only if no Bible text found)
    if (searchResults && searchResults.results && searchResults.results.length > 0 && !bibleText) {
      const searchContext = searchResults.results
        .map(r => `${r.title}: ${r.snippet || 'No description available'}`)
        .join('\n\n');
      messages.push({
        role: 'user',
        content: `Please consider this search results when answering (but answer from your own knowledge):\n${searchContext}`
      });
    }
    
    // Add current message (only if not in scripture mode with Bible text)
    if (!bibleText) {
      messages.push({ role: 'user', content: message });
    }
    
    // Get AI response
    const response = await chatCompletion(messages);
    
    res.json({ 
      response,
      searchResults: searchResults?.results || null,
      bibleText: bibleText || null,
      mode 
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to get response' });
  }
});

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const results = await webSearch(query);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message || 'Search failed' });
  }
});

// Bible lookup endpoint - full Bible access
app.get('/api/bible/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    
    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }
    
    const text = await bibleLookup(reference);
    
    if (text) {
      res.json({ reference, text, found: true });
    } else {
      res.json({ reference, text: null, found: false, error: 'Verse not found' });
    }
  } catch (error) {
    console.error('Bible lookup error:', error);
    res.status(500).json({ error: error.message || 'Bible lookup failed' });
  }
});

// Get all books of the Bible
app.get('/api/bible/books/all', async (req, res) => {
  const books = [
    // Old Testament
    { name: 'Genesis', abbrev: 'gen', testament: 'old' },
    { name: 'Exodus', abbrev: 'exod', testament: 'old' },
    { name: 'Leviticus', abbrev: 'lev', testament: 'old' },
    { name: 'Numbers', abbrev: 'num', testament: 'old' },
    { name: 'Deuteronomy', abbrev: 'deut', testament: 'old' },
    { name: 'Joshua', abbrev: 'josh', testament: 'old' },
    { name: 'Judges', abbrev: 'judg', testament: 'old' },
    { name: 'Ruth', abbrev: 'ruth', testament: 'old' },
    { name: '1 Samuel', abbrev: '1sam', testament: 'old' },
    { name: '2 Samuel', abbrev: '2sam', testament: 'old' },
    { name: '1 Kings', abbrev: '1kgs', testament: 'old' },
    { name: '2 Kings', abbrev: '2kgs', testament: 'old' },
    { name: '1 Chronicles', abbrev: '1chr', testament: 'old' },
    { name: '2 Chronicles', abbrev: '2chr', testament: 'old' },
    { name: 'Ezra', abbrev: 'ezra', testament: 'old' },
    { name: 'Nehemiah', abbrev: 'neh', testament: 'old' },
    { name: 'Esther', abbrev: 'esth', testament: 'old' },
    { name: 'Job', abbrev: 'job', testament: 'old' },
    { name: 'Psalms', abbrev: 'ps', testament: 'old' },
    { name: 'Proverbs', abbrev: 'prov', testament: 'old' },
    { name: 'Ecclesiastes', abbrev: 'eccl', testament: 'old' },
    { name: 'Song of Solomon', abbrev: 'song', testament: 'old' },
    { name: 'Isaiah', abbrev: 'isa', testament: 'old' },
    { name: 'Jeremiah', abbrev: 'jer', testament: 'old' },
    { name: 'Lamentations', abbrev: 'lam', testament: 'old' },
    { name: 'Ezekiel', abbrev: 'ezek', testament: 'old' },
    { name: 'Daniel', abbrev: 'dan', testament: 'old' },
    { name: 'Hosea', abbrev: 'hose', testament: 'old' },
    { name: 'Joel', abbrev: 'joel', testament: 'old' },
    { name: 'Amos', abbrev: 'amos', testament: 'old' },
    { name: 'Obadiah', abbrev: 'obad', testament: 'old' },
    { name: 'Jonah', abbrev: 'jonah', testament: 'old' },
    { name: 'Micah', abbrev: 'mic', testament: 'old' },
    { name: 'Nahum', abbrev: 'nah', testament: 'old' },
    { name: 'Habakkuk', abbrev: 'hab', testament: 'old' },
    { name: 'Zephaniah', abbrev: 'zeph', testament: 'old' },
    { name: 'Haggai', abbrev: 'hag', testament: 'old' },
    { name: 'Zechariah', abbrev: 'zech', testament: 'old' },
    { name: 'Malachi', abbrev: 'mal', testament: 'old' },
    // New Testament
    { name: 'Matthew', abbrev: 'mat', testament: 'new' },
    { name: 'Mark', abbrev: 'mark', testament: 'new' },
    { name: 'Luke', abbrev: 'luke', testament: 'new' },
    { name: 'John', abbrev: 'john', testament: 'new' },
    { name: 'Acts', abbrev: 'acts', testament: 'new' },
    { name: 'Romans', abbrev: 'rom', testament: 'new' },
    { name: '1 Corinthians', abbrev: '1cor', testament: 'new' },
    { name: '2 Corinthians', abbrev: '2cor', testament: 'new' },
    { name: 'Galatians', abbrev: 'gal', testament: 'new' },
    { name: 'Ephesians', abbrev: 'eph', testament: 'new' },
    { name: 'Philippians', abbrev: 'phil', testament: 'new' },
    { name: 'Colossians', abbrev: 'col', testament: 'new' },
    { name: '1 Thessalonians', abbrev: '1thess', testament: 'new' },
    { name: '2 Thessalonians', abbrev: '2thess', testament: 'new' },
    { name: '1 Timothy', abbrev: '1tim', testament: 'new' },
    { name: '2 Timothy', abbrev: '2tim', testament: 'new' },
    { name: 'Titus', abbrev: 'titus', testament: 'new' },
    { name: 'Philemon', abbrev: 'phlm', testament: 'new' },
    { name: 'Hebrews', abbrev: 'heb', testament: 'new' },
    { name: 'James', abbrev: 'jas', testament: 'new' },
    { name: '1 Peter', abbrev: '1pet', testament: 'new' },
    { name: '2 Peter', abbrev: '2pet', testament: 'new' },
    { name: '1 John', abbrev: '1john', testament: 'new' },
    { name: '2 John', abbrev: '2john', testament: 'new' },
    { name: '3 John', abbrev: '3john', testament: 'new' },
    { name: 'Jude', abbrev: 'jude', testament: 'new' },
    { name: 'Revelation', abbrev: 'rev', testament: 'new' },
  ];
  
  res.json({ books });
});

// Transcription endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audio, filename = 'recording.webm' } = req.body;
    
    if (!audio) {
      return res.status(400).json({ error: 'Audio data is required' });
    }
    
    // Decode base64 audio
    const audioBuffer = Buffer.from(audio, 'base64');
    
    // Transcribe
    const transcript = await transcribeAudio(audioBuffer, filename);
    
    res.json({ transcript });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: error.message || 'Transcription failed' });
  }
});

// espeak-ng Text-to-Speech endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Limit text length to prevent abuse
    const truncatedText = text.slice(0, 5000);
    
    // Create temp file for espeak-ng
    const tempDir = '/tmp';
    const inputFile = path.join(tempDir, `tts_input_${Date.now()}.txt`);
    const outputFile = path.join(tempDir, `tts_output_${Date.now()}.wav`);
    
    // Write text to file
    fs.writeFileSync(inputFile, truncatedText, 'utf8');
    
    // Run espeak-ng
    const espeak = spawn('espeak-ng', [
      '-f', inputFile,
      '-w', outputFile,
      '--pitch=90',     // Slightly lower pitch for more authoritative voice
      '--speed=160',    // Normal speed
      '-s', '150',      // Words per minute
      '-g', '5',        // Word gap
    ]);
    
    await new Promise((resolve, reject) => {
      espeak.on('close', (code) => {
        // Clean up input file
        try { fs.unlinkSync(inputFile); } catch (e) {}
        if (code === 0) {
          resolve(null);
        } else {
          reject(new Error(`espeak-ng exited with code ${code}`));
        }
      });
      espeak.on('error', reject);
    });
    
    // Check if output file exists and read it
    if (!fs.existsSync(outputFile)) {
      throw new Error('espeak-ng did not produce output');
    }
    
    const audioBuffer = fs.readFileSync(outputFile);
    
    // Clean up output file
    try { fs.unlinkSync(outputFile); } catch (e) {}
    
    // Send audio as WAV
    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': audioBuffer.length,
    });
    res.send(audioBuffer);
    
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error.message || 'TTS failed' });
  }
});

// Daily devotional endpoint
const DAILY_VERSES = [
  { verse: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", commentary: "This is the most famous verse in the Bible and captures the essence of God's love for us. It reminds us that salvation is a free gift through faith in Jesus Christ. God bless!" },
  { verse: "Psalm 23:1", text: "The Lord is my shepherd, I lack nothing.", commentary: "David wrote this psalm as a reminder that God provides for our every need. He is our shepherd who guides, protects, and restores us. When we feel lost or afraid, we can trust that the Good Shepherd is watching over us." },
  { verse: "Philippians 4:13", text: "I can do all this through him who gives me strength.", commentary: "This verse is not about positive thinking, but about dependence on Christ. Through Him, we can face any circumstance - whether abundance or poverty, trial or triumph." },
  { verse: "Isaiah 40:31", text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", commentary: "When you feel weary, lift your eyes to heaven. God promises to renew your strength as you trust in Him. Keep walking by faith, not by sight." },
  { verse: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", commentary: "This does not mean everything that happens is good, but that God can use all circumstances - even difficult ones - for His divine purpose in our lives." },
  { verse: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", commentary: "God commands us to be strong and courageous, not because we are capable on our own, but because He is with us. This promise gives us confidence to face any challenge." },
  { verse: "Matthew 11:28", text: "Come to me, all you who are weary and burdened, and I will give you rest.", commentary: "Jesus invites us to bring our burdens to Him. He offers rest for the soul - not just physical rest, but spiritual renewal and peace that comes from knowing Him." },
  { verse: "1 Corinthians 13:4", text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.", commentary: "This famous description of love reminds us that true love is not about feelings but about action. It is patient, kind, and selfless - a reflection of God's love for us." },
  { verse: "Proverbs 3:5", text: "Trust in the Lord with all your heart and lean not on your own understanding.", commentary: "True wisdom begins with total surrender to God. We must trust Him even when we don't understand our circumstances, knowing that His plans are higher than ours." },
  { verse: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", commentary: "This beloved verse reminds us that God has a purpose for each of our lives. His plans are for our good, not our harm. When we seek Him, He guides our steps." },
];

function getDailyVerse() {
  // Use the day of year to get a consistent verse for each day
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = dayOfYear % DAILY_VERSES.length;
  return DAILY_VERSES[index];
}

app.get('/api/devotional', async (req, res) => {
  try {
    const dailyVerse = getDailyVerse();
    res.json({
      date: new Date().toISOString().split('T')[0],
      verse: dailyVerse.verse,
      text: dailyVerse.text,
      commentary: dailyVerse.commentary
    });
  } catch (error) {
    console.error('Devotional error:', error);
    res.status(500).json({ error: error.message || 'Failed to get devotional' });
  }
});

// Voice recording endpoint (raw binary)
app.post('/api/voice', async (req, res) => {
  try {
    const chunks = [];
    
    req.on('data', chunk => chunks.push(chunk));
    
    req.on('end', async () => {
      const audioBuffer = Buffer.concat(chunks);
      const filename = `voice_${Date.now()}.webm`;
      
      const transcript = await transcribeAudio(audioBuffer, filename);
      
      res.json({ transcript });
    });
  } catch (error) {
    console.error('Voice transcription error:', error);
    res.status(500).json({ error: error.message || 'Voice transcription failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Crusader API server running on port ${PORT}`);
  console.log(`API Key configured: ${MINIMAX_API_KEY ? 'Yes' : 'No'}`);
});
