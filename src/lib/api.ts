import type { Message } from '../hooks/useChat'

// Crusader AI personality and response system
// This simulates AI responses for demonstration purposes
// In production, connect to Hermes/OpenAI API

// Simulated response database for demonstration
const BIBLE_VERSES: Record<string, string> = {
  'john 3:16': 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. (John 3:16)',
  'psalm 23': 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. He guides me along right paths for the sake of his name. (Psalm 23:1-3)',
  'psalm 23:1': 'The Lord is my shepherd, I lack nothing. (Psalm 23:1)',
  'romans 8:28': 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose. (Romans 8:28)',
  'philippians 4:13': 'I can do all this through him who gives me strength. (Philippians 4:13)',
  'isaiah 40:31': 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint. (Isaiah 40:31)',
  'jeremiah 29:11': 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future. (Jeremiah 29:11)',
  'proverbs 3:5': 'Trust in the Lord with all your heart and lean not on your own understanding. (Proverbs 3:5)',
  'matthew 11:28': 'Come to me, all you who are weary and burdened, and I will give you rest. (Matthew 11:28)',
  '1 corinthians 13:4': 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. (1 Corinthians 13:4)',
  'genesis 1:1': 'In the beginning God created the heavens and the earth. (Genesis 1:1)',
  'john 1:1': 'In the beginning was the Word, and the Word was with God, and the Word was God. (John 1:1)',
  'romans 3:23': 'For all have sinned and fall short of the glory of God. (Romans 3:23)',
  'romans 6:23': 'For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord. (Romans 6:23)',
  'ephesians 2:8': 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God. (Ephesians 2:8)',
  'hebrews 11:1': 'Now faith is confidence in what we hope for and assurance about what we do not see. (Hebrews 11:1)',
  '1 peter 3:15': 'But in your hearts revere Christ as Lord. Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have. But do this with gentleness and respect. (1 Peter 3:15)',
  'john 14:6': 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me." (John 14:6)',
  'acts 1:8': 'But you will receive power when the Holy Spirit has come upon you, and you will be my witnesses in Jerusalem and in all Judea and Samaria, and to the ends of the earth. (Acts 1:8)',
  'psalm 46:1': 'God is our refuge and strength, an ever-present help in trouble. (Psalm 46:1)',
}

// Generate contextual responses based on user input
function generateResponse(userMessage: string, mode: string, _conversationHistory: Message[]): string {
  const message = userMessage.toLowerCase()
  
  // Scripture lookup mode responses
  if (mode === 'scripture') {
    for (const [ref, verse] of Object.entries(BIBLE_VERSES)) {
      if (message.includes(ref.toLowerCase()) || message.includes(ref.split(' ')[0].toLowerCase())) {
        return `${verse}\n\nThis verse reminds us of God's love and faithfulness. Take time to meditate on His Word today. God bless!`
      }
    }
    return `I'd be happy to help you look up scripture! Try searching for a specific verse like "John 3:16" or "Psalm 23". You can also ask me to explain a particular passage or provide context for Bible study.\n\nGod bless!`
  }
  
  // Debate mode responses
  if (mode === 'debate') {
    if (message.includes('evil') || message.includes('suffering')) {
      return `The problem of evil is one of the most profound questions humans face. Here's a Christian perspective:\n\n1. **Free Will Defense**: God gave humans free will, which allows for genuine love but also the possibility of moral evil.\n\n2. **Soul-Making Theodicy**: Suffering can be used by God for spiritual growth and character development (Romans 5:3-5).\n\n3. **The Greatest Good**: God allows suffering when it serves a greater purpose that we cannot see from our finite perspective.\n\n4. **God's Solidarity**: In Christ, God Himself enters into human suffering, giving it meaning and redeeming it.\n\nRemember that Christianity doesn't claim suffering is good, but that God can bring good out of it for those who love Him (Romans 8:28).\n\nGod bless!`
    }
    if (message.includes('prove') || message.includes('exist')) {
      return `There are several classical arguments for God's existence:\n\n**1. Cosmological Argument**: Everything that begins to exist has a cause. The universe began to exist, therefore it must have a cause - God.\n\n**2. Teleological Argument (Design)**: The fine-tuning of the universe suggests an intelligent designer. The constants necessary for life are extraordinarily precise.\n\n**3. Moral Argument**: Objective moral values exist. If God doesn't exist, where do objective morals come from?\n\n**4. Kalam Argument**: An infinite regress of events is impossible. Therefore, there must be a first cause - God.\n\nThese arguments don't prove God definitively to everyone, but they show that belief in God is reasonable and rational.\n\nGod bless!`
    }
    return `That's an important theological question. Let me offer a thoughtful Christian perspective:\n\nChristianity addresses this through:\n- The nature of God as perfectly good and all-powerful\n- The reality of human free will\n- The promise of redemption and restoration\n- The hope of eternal life where suffering will be eliminated\n\nThe Christian worldview doesn't claim to have every answer to every "why" question, but it provides a framework for understanding purpose, meaning, and hope even in difficult circumstances.\n\nGod bless!`
  }
  
  // Chat mode responses
  if (message.includes('gospel') || message.includes('explain')) {
    return `The Gospel is the good news of God's love for us through Jesus Christ:\n\n**1. God loves you** - "For God so loved the world..." (John 3:16)\n\n**2. We are sinners** - "All have sinned and fall short of the glory of God" (Romans 3:23)\n\n**3. Jesus died for us** - "God demonstrates his own love for us in this: While we were still sinners, Christ died for us" (Romans 5:8)\n\n**4. Through faith** - "For it is by grace you have been saved, through faith" (Ephesians 2:8)\n\n**5. Eternal life** - "Whoever believes in him shall not perish but have eternal life" (John 3:16)\n\nWould you like me to explain any part in more detail? God bless!`
  }
  
  if (message.includes('pray') || message.includes('prayer')) {
    return `Here is a simple prayer you can use:\n\n*"Heavenly Father, Thank You for Your love and mercy. Lord Jesus, I acknowledge my need for You in my life. Forgive me of my sins and help me to live according to Your will. Fill me with Your Holy Spirit that I may grow in faith and love. Guide my steps and use me for Your glory. Thank You for hearing my prayer. In Jesus' name, Amen."*\n\nRemember, prayer is simply talking to God from your heart. He cares about every concern you bring to Him.\n\nGod bless!`
  }
  
  if (message.includes('verse') || message.includes('daily')) {
    return `Here's a meaningful verse for today:\n\n**Philippians 4:13**\n*"I can do all this through him who gives me strength."*\n\nNo matter what you're facing today, remember that through Christ, you have strength for every situation. He is your source of power, peace, and hope.\n\nWould you like more scripture or would you like me to help you apply this verse to a specific area of your life?\n\nGod bless!`
  }
  
  if (message.includes('news') || message.includes('christian')) {
    return `I'm unable to access current news at the moment, but I can share some common themes in Christian news:\n\n- Church growth and evangelism efforts worldwide\n- Christian persecution and prayers for believers in difficult regions\n- Theological discussions and debates in the broader Christian community\n- Upcoming Christian holidays and their significance\n- Stories of faith, hope, and transformation\n\nFor current Christian news, I'd recommend trusted sources like:\n- Christianity Today\n- Christian Broadcasting Network\n- Relevant Magazine\n- Your local church bulletins\n\nIs there a specific Christian topic or news story you'd like to discuss?\n\nGod bless!`
  }
  
  if (message.includes('bible') || message.includes('scripture')) {
    return `The Bible is God's Word to us, and it's a wonderful resource for spiritual growth! Here's how I can help:\n\n- **Look up specific verses** - Just ask for the verse or passage\n- **Get context** - I can explain the historical and cultural background\n- **Interpretation** - I can help you understand what a passage means\n- **Cross-references** - I can show you related verses\n\nSome popular books to explore:\n- **Gospels**: Matthew, Mark, Luke, John (life of Jesus)\n- **Psalms**: Songs and prayers for every situation\n- **Proverbs**: Wisdom for daily living\n- **Romans**: Foundation of Christian theology\n\nWhat would you like to study today?\n\nGod bless!`
  }
  
  // Default response for general questions
  return `Thank you for your question! As Crusader, I'm here to help you explore Christian faith, theology, and scripture.\n\nSome things I can help with:\n- Answering Bible questions\n- Explaining theological concepts\n- Providing devotional insights\n- Discussing faith and reason\n- Exploring apologetics\n\nFeel free to ask any question you have about Christianity, or switch to Scripture mode for Bible lookup, or Debate mode for theological discussions.\n\nGod bless!`
}

// Main API function
export async function sendChatMessage(
  content: string, 
  mode: string = 'chat',
  conversationHistory: Message[] = []
): Promise<string> {
  // Simulate network delay for realistic feel
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700))
  
  // Check for specific scripture lookups first
  if (mode === 'scripture') {
    const response = generateResponse(content, mode, conversationHistory)
    return response
  }
  
  // Generate contextual response
  return generateResponse(content, mode, conversationHistory)
}
