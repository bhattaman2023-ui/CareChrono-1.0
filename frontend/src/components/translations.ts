export const translations = {
  en: {
    // Header & Badges
    patientApp: "Patient App",
    demo: "Demo:",
    goodToSeeYou: "Good to see you",
    
    // Greeting
    hello: "Hello",
    greetingQuestion: "How are you feeling today?",
    
    // Section Headers
    quickLog: "Quick Log Symptom",
    voiceAssistant: "Voice Assistant Logging",
    recentLogs: "Your Recent Logs",
    entries: "entries",
    noLogs: "No logs recorded yet. Tap a symptom button above to start!",
    
    // Symptoms
    Fever: "Fever",
    Cough: "Cough",
    Fatigue: "Fatigue",
    Headache: "Headache",
    Breathlessness: "Breathlessness",
    "Joint Pain": "Joint Pain",
    
    // Voice Assistant Details
    voiceTitle: "Voice Assistant Logging",
    voiceDesc: "Don't want to type? Speak naturally —",
    voiceExample: '"I\'ve had a mild fever and sore throat since yesterday."',
    
    // AI Insights
    aiInsights: "AI Health Insights",
    personalizedAnalysis: "Personalized Symptom Analysis",
    criticalAlert: "Critical Alert",
    criticalDesc: "Escalating symptoms detected. Urgent diagnostic summary sent to Dr. Jenkins.",
    
    // Log Page UI
    back: "Back",
    logSymptoms: "Log Symptoms",
    logDate: "Log Date",
    selectSymptoms: "Select Symptoms",
    symptomQuestion: "Which symptoms are you experiencing today?",
    selectedCount: "selected",
    severityQuestion: "How bad is each symptom?",
    severityDesc: "Set the severity for today's entries.",
    severityTitle: "Severity",
    mild: "Mild",
    moderate: "Moderate",
    severe: "Severe",
    notesVoice: "Notes or Voice Recording",
    notesDesc: "Describe how you feel. Tap below to speak.",
    placeholder: "Type additional details or use voice above...",
    submit: "Submit Symptom Log",
    compiling: "AI Compiling Timeline...",
    loading: "Loading..."
  },
  hi: {
    // Header & Badges
    patientApp: "मरीज ऐप",
    demo: "डेमो:",
    goodToSeeYou: "आपको देखकर अच्छा लगा",
    
    // Greeting
    hello: "नमस्ते",
    greetingQuestion: "आज आप कैसा महसूस कर रहे हैं?",
    
    // Section Headers
    quickLog: "लक्षण तुरंत दर्ज करें",
    voiceAssistant: "आवाज सहायक लॉगिंग",
    recentLogs: "आपके हालिया लॉग",
    entries: "प्रविष्टियां",
    noLogs: "अभी तक कोई लॉग दर्ज नहीं किया गया है। शुरू करने के लिए ऊपर किसी लक्षण बटन पर टैप करें!",
    
    // Symptoms
    Fever: "बुखार",
    Cough: "खांसी",
    Fatigue: "थकान",
    Headache: "सिरदर्द",
    Breathlessness: "सांस फूलना",
    "Joint Pain": "जोड़ों का दर्द",
    
    // Voice Assistant Details
    voiceTitle: "आवाज सहायक लॉगिंग",
    voiceDesc: "टाइप नहीं करना चाहते? स्वाभाविक रूप से बोलें —",
    voiceExample: '"मुझे कल से हल्का बुखार और गले में खराश है।"',
    
    // AI Insights
    aiInsights: "एआई स्वास्थ्य अंतर्दृष्टि",
    personalizedAnalysis: "व्यक्तिगत लक्षण विश्लेषण",
    criticalAlert: "महत्वपूर्ण चेतावनी",
    criticalDesc: "बढ़ते लक्षण मिले हैं। तत्काल निदान सारांश डॉ. जेन्किंस को भेज दिया गया है।",
    
    // Log Page UI
    back: "पीछे",
    logSymptoms: "लक्षण दर्ज करें",
    logDate: "लॉग की तिथि",
    selectSymptoms: "लक्षण चुनें",
    symptomQuestion: "आज आप किन लक्षणों का अनुभव कर रहे हैं?",
    selectedCount: "चुने गए",
    severityQuestion: "प्रत्येक लक्षण कितना गंभीर है?",
    severityDesc: "आज की प्रविष्टियों के लिए गंभीरता निर्धारित करें।",
    severityTitle: "गंभीरता",
    mild: "हल्का",
    moderate: "मध्यम",
    severe: "गंभीर",
    notesVoice: "नोट्स या वॉयस रिकॉर्डिंग",
    notesDesc: "बताएं कि आप कैसा महसूस कर रहे हैं। बोलने के लिए नीचे टैप करें।",
    placeholder: "अतिरिक्त विवरण टाइप करें या ऊपर आवाज का उपयोग करें...",
    submit: "लक्षण लॉग जमा करें",
    compiling: "एआई टाइमलाइन संकलित कर रहा है...",
    loading: "लोड हो रहा है..."
  }
} as const;

export type Language = "en" | "hi";
export type TranslationKey = keyof typeof translations.en;
