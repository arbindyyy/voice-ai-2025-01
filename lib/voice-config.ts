// Voice configuration for the application
export interface Voice {
    id: string;
    name: string;
    language: "en" | "hi" | "both";
    gender: "male" | "female";
    age: "young" | "middle" | "old";
    style: "natural" | "expressive" | "calm" | "energetic";
    description: string;
    sampleText: {
        en: string;
        hi: string;
    };
    webSpeechVoice?: string;
    pitch?: number;
    rate?: number;
    isCustom?: boolean;
}

export const voices: Voice[] = [
    // English Voices
    {
        id: "en-male-1",
        name: "James",
        language: "en",
        gender: "male",
        age: "middle",
        style: "natural",
        description: "A clear and professional male voice",
        sampleText: {
            en: "Hello, I am James. I can help you create amazing voice overs.",
            hi: "",
        },
        webSpeechVoice: "Google US English",
        pitch: 0.95,
        rate: 0.95,
    },
    {
        id: "en-male-2",
        name: "David",
        language: "en",
        gender: "male",
        age: "young",
        style: "energetic",
        description: "A youthful and energetic male voice",
        sampleText: {
            en: "Hey there! I'm David and I'm here to make your content sound amazing!",
            hi: "",
        },
        webSpeechVoice: "Google UK English Male",
        pitch: 1.05,
        rate: 1.0,
    },
    {
        id: "en-female-1",
        name: "Emma",
        language: "en",
        gender: "female",
        age: "young",
        style: "natural",
        description: "A warm and friendly female voice",
        sampleText: {
            en: "Hi! I'm Emma. Let me help you bring your words to life.",
            hi: "",
        },
        webSpeechVoice: "Google US English",
        pitch: 1.15,
        rate: 0.95,
    },
    {
        id: "en-female-2",
        name: "Sarah",
        language: "en",
        gender: "female",
        age: "middle",
        style: "calm",
        description: "A soothing and professional female voice",
        sampleText: {
            en: "Welcome. I'm Sarah, your calm and clear voice assistant.",
            hi: "",
        },
        webSpeechVoice: "Google UK English Female",
        pitch: 1.1,
        rate: 0.88,
    },

    // Hindi Voices
    {
        id: "hi-male-1",
        name: "Arjun",
        language: "hi",
        gender: "male",
        age: "middle",
        style: "natural",
        description: "एक स्पष्ट और पेशेवर पुरुष आवाज़",
        sampleText: {
            en: "",
            hi: "नमस्ते, मैं अर्जुन हूं। मैं आपकी मदद कर सकता हूं।",
        },
        webSpeechVoice: "Google हिन्दी",
        pitch: 0.92,
        rate: 0.85,
    },
    {
        id: "hi-male-2",
        name: "Raj",
        language: "hi",
        gender: "male",
        age: "young",
        style: "energetic",
        description: "एक ऊर्जावान युवा पुरुष आवाज़",
        sampleText: {
            en: "",
            hi: "हेलो दोस्तों! मैं राज हूं और मैं यहां आपकी मदद के लिए हूं!",
        },
        webSpeechVoice: "Google हिन्दी",
        pitch: 1.0,
        rate: 0.9,
    },
    {
        id: "hi-female-1",
        name: "Priya",
        language: "hi",
        gender: "female",
        age: "young",
        style: "natural",
        description: "एक मधुर और मैत्रीपूर्ण महिला आवाज़",
        sampleText: {
            en: "",
            hi: "नमस्ते! मैं प्रिया हूं। आपके शब्दों को जीवंत बनाने में मदद करूंगी।",
        },
        webSpeechVoice: "Google हिन्दी",
        pitch: 1.12,
        rate: 0.85,
    },
    {
        id: "hi-female-2",
        name: "Anjali",
        language: "hi",
        gender: "female",
        age: "middle",
        style: "calm",
        description: "एक शांत और पेशेवर महिला आवाज़",
        sampleText: {
            en: "",
            hi: "स्वागत है। मैं अंजलि हूं, आपकी शांत आवाज़ सहायक।",
        },
        webSpeechVoice: "Google हिन्दी",
        pitch: 1.08,
        rate: 0.82,
    },
];

export const getVoiceById = (id: string): Voice | undefined => {
    return voices.find((v) => v.id === id);
};

export const getVoicesByLanguage = (language: "en" | "hi"): Voice[] => {
    return voices.filter((v) => v.language === language || v.language === "both");
};

export const getVoicesByGender = (gender: "male" | "female"): Voice[] => {
    return voices.filter((v) => v.gender === gender);
};
