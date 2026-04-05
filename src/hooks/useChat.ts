import { useState, useCallback } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  thoughts?: string
}

type APIFunction = (content: string, mode: string) => Promise<string>;

// ============================================================================
// TEXT-TO-SPEECH - Crusader speaks with his own voice (Web Speech API)
// ============================================================================
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to get a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Male')) ||
                          voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, []);
  
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);
  
  return { speak, stopSpeaking, isSpeaking };
}

const SIMULATED_RESPONSES: Record<string, string[]> = {
  greeting: [
    "Welcome! I'm Crusader, your Christian AI assistant. How can I serve you today? God bless!",
    "Hello in Christ! I'm here to help with any questions about faith, scripture, or theology. What would you like to explore? God bless!",
    "Grace and peace to you! I'm Crusader, ready to discuss Christian topics, search scripture, or engage in theological dialogue. How may I help? God bless!",
  ],
  verse: [
    "**Philippians 4:13**\n*I can do all this through him who gives me strength.*\n\nWhatever you're facing today, remember that Christ empowers you. He is your source of strength, peace, and hope. Lean into Him and find rest for your soul. God bless!",
    "**Isaiah 40:31**\n*But those who hope in the Lord will renew their strength.*\n\nWhen you feel weary, lift your eyes to heaven. God promises to renew your strength as you trust in Him. Keep walking by faith, not by sight. God bless!",
    "**John 3:16**\n*For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.*\n\nThis is the heart of the Gospel - God's immeasurable love for you. Receive this gift today and share it with others. God bless!",
  ],
  gospel: [
    "The Gospel is the good news of God's salvation:\n\n**1. God's Love** - John 3:16\n*For God so loved the world...*\n\n**2. Our Need** - Romans 3:23\n*All have sinned and fall short of the glory of God.*\n\n**3. God's Provision** - Romans 5:8\n*God demonstrates his own love for us in this: While we were still sinners, Christ died for us.*\n\n**4. Salvation by Faith** - Ephesians 2:8\n*For it is by grace you have been saved, through faith.*\n\n**5. Eternal Life** - John 3:16\n*Whoever believes in him shall not perish but have eternal life.*\n\nWould you like me to explain any part more? God bless!",
  ],
  prayer: [
    "*Heavenly Father, Thank You for Your unfailing love and mercy. Lord Jesus, I acknowledge my need for You in my life. Forgive me of my sins and help me to live according to Your will. Fill me with Your Holy Spirit that I may grow in faith and love. Guide my steps and use me for Your glory. Thank You for hearing my prayer. In Jesus' name, Amen.*\n\nPrayer is simply talking to God from your heart. He cares about every concern you bring to Him. God bless!",
    "*Dear Lord, Grant me wisdom to understand Your Word. Give me strength for today's trials. Help me to walk in faith and obedience. May my life bring glory to Your name. In Jesus' name, Amen.*\n\nGod answers prayers according to His will. Keep praying with persistence and faith. God bless!",
  ],
  news: [
    "I'm unable to access current news at the moment, but I can share common themes in Christian news:\n\n- Global evangelism efforts and church planting movements\n- Stories of faith transformation and revival\n- Christian persecution and prayer requests for believers worldwide\n- Theological discussions in the broader Christian community\n- Upcoming Christian holidays and their significance\n\nFor current Christian news, I'd recommend trusted sources like Christianity Today, CBN, or your local church bulletins. Is there a specific Christian topic you'd like to discuss? God bless!",
  ],
};

function getSimulatedResponse(message: string, mode: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for specific topics
  if (lowerMessage.includes('gospel') || lowerMessage.includes('explain') || lowerMessage.includes('salvation')) {
    const responses = SIMULATED_RESPONSES.gospel;
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (lowerMessage.includes('pray') || lowerMessage.includes('prayer')) {
    const responses = SIMULATED_RESPONSES.prayer;
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (lowerMessage.includes('verse') || lowerMessage.includes('daily')) {
    const responses = SIMULATED_RESPONSES.verse;
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (lowerMessage.includes('news') || lowerMessage.includes('headline')) {
    const responses = SIMULATED_RESPONSES.news;
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Scripture lookups
  const scriptureLookups: Record<string, string> = {
    'john 3:16': '**John 3:16**\n*For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.*\n\nThis is the most famous verse in the Bible and captures the essence of God\'s love for us. It reminds us that salvation is a free gift through faith in Jesus Christ. God bless!',
    'psalm 23': '**Psalm 23:1-3**\n*The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. He guides me along right paths for the sake of his name.*\n\nDavid wrote this psalm as a reminder that God provides for our every need. He is our shepherd who guides, protects, and restores us. God bless!',
    'romans 8:28': '**Romans 8:28**\n*And we know that in all things God works for the good of those who love him, who have been called according to his purpose.*\n\nThis does not mean everything that happens is good, but that God can use all circumstances - even difficult ones - for His divine purpose in our lives. God bless!',
    'philippians 4:13': '**Philippians 4:13**\n*I can do all this through him who gives me strength.*\n\nThis verse is not about positive thinking, but about dependence on Christ. Through Him, we can face any circumstance. God bless!',
  };
  
  for (const [ref, verse] of Object.entries(scriptureLookups)) {
    if (lowerMessage.includes(ref)) {
      return verse;
    }
  }
  
  // Mode-specific responses
  if (mode === 'scripture') {
    if (lowerMessage.includes('genesis') || lowerMessage.includes('exodus') || lowerMessage.includes('leviticus') || 
        lowerMessage.includes('numbers') || lowerMessage.includes('deuteronomy') || lowerMessage.includes('joshua') ||
        lowerMessage.includes('judges') || lowerMessage.includes('ruth') || lowerMessage.includes('samuel') ||
        lowerMessage.includes('kings') || lowerMessage.includes('chronicles')) {
      return `That's from the Old Testament! These historical books tell the story of God's people Israel. Would you like me to explain the context or meaning of this passage? God bless!`;
    }
    return `I'd be happy to help with scripture! Try searching for specific verses like "John 3:16", "Psalm 23", or "Romans 8:28". I can also help explain Bible passages, provide context, or suggest related verses. What would you like to explore? God bless!`;
  }
  
  if (mode === 'debate') {
    if (lowerMessage.includes('evil') || lowerMessage.includes('suffering')) {
      return `The problem of evil is one of the most profound questions humans face. Here's a Christian perspective:\n\n1. **Free Will Defense**: God gave humans free will, allowing genuine love but also the possibility of moral evil.\n\n2. **Soul-Making Theodicy**: Suffering can be used by God for spiritual growth (Romans 5:3-5).\n\n3. **The Greatest Good**: God allows suffering when it serves a greater purpose.\n\n4. **God's Solidarity**: In Christ, God enters human suffering and redeems it.\n\nChristianity doesn't claim suffering is good, but that God can bring good out of it (Romans 8:28). God bless!`;
    }
    if (lowerMessage.includes('prove') || lowerMessage.includes('exist')) {
      return `There are several classical arguments for God's existence:\n\n**1. Cosmological Argument**: Everything that begins to exist has a cause. The universe began to exist, therefore it must have a cause - God.\n\n**2. Teleological Argument (Design)**: The fine-tuning of the universe suggests an intelligent designer.\n\n**3. Moral Argument**: Objective moral values exist. If God doesn't exist, where do they come from?\n\n**4. Kalam Argument**: An infinite regress of events is impossible. Therefore, there must be a first cause.\n\nThese arguments don't prove God definitively, but show that belief in God is reasonable. God bless!`;
    }
    return `That's an important theological question. Let me offer a thoughtful Christian perspective:\n\nChristianity addresses this through:\n- The nature of God as perfectly good and all-powerful\n- The reality of human free will\n- The promise of redemption and restoration\n- The hope of eternal life where suffering will be eliminated\n\nThe Christian worldview provides a framework for understanding purpose, meaning, and hope even in difficult circumstances. God bless!`;
  }
  
  // Default responses
  const defaults = [
    "Thank you for your question! As Crusader, I'm here to help you explore Christian faith, theology, and scripture.\n\nSome things I can help with:\n- Answering Bible questions\n- Explaining theological concepts\n- Providing devotional insights\n- Discussing faith and reason\n- Exploring apologetics\n\nFeel free to ask any question you have about Christianity! God bless!",
    "That's a thoughtful question! I'm here to help you grow in understanding of the Christian faith.\n\nSome ways I can assist:\n- Scripture lookup and interpretation\n- Theological explanations\n- Apologetics and faith defense\n- Prayer and devotional support\n- Christian worldview perspectives\n\nWhat would you like to explore? God bless!",
    "I appreciate your question! Let me offer some insight from a Christian perspective.\n\nI'm designed to help with:\n- Bible study and verse lookup\n- Theology and church history\n- Apologetics and answering objections\n- Faith and practice questions\n- Evangelism preparation\n\nHow can I serve you today? God bless!",
  ];
  
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (
    content: string, 
    mode: string = 'chat',
    apiCall?: APIFunction
  ) => {
    // Add user message
    setMessages(prev => [
      ...prev,
      { role: 'user', content, timestamp: new Date() }
    ])

    setIsLoading(true)

    try {
      let response: string;
      
      if (apiCall) {
        // Use real AI API
        try {
          response = await apiCall(content, mode);
        } catch (error) {
          console.error('API call failed, falling back to simulated:', error);
          response = getSimulatedResponse(content, mode);
        }
      } else {
        // Use simulated responses
        response = getSimulatedResponse(content, mode);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      }
      
      // Add assistant message
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response, timestamp: new Date() }
      ])
    } catch (error) {
      // Add error message
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: `I apologize, but I'm having trouble processing your request right now. Please try again. God bless!\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          timestamp: new Date() 
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  }
}
