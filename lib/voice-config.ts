// Voice configuration for the application
export interface Voice {
    id: string;
    name: string;
    language: "en" | "hi" | "both";
    gender: "male" | "female";
    age: "young" | "middle" | "old";
    style: "natural" | "expressive" | "calm" | "energetic";
    category?: "science" | "history" | "story" | "custom";
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
    // Science Voices (7)
    {
        id: "sc-en-m-1",
        name: "Dr. Orion",
        category: "science",
        language: "en",
        gender: "male",
        age: "middle",
        style: "calm",
        description: "A calm, analytical science narrator",
        sampleText: {
            en: "In today’s experiment, we observe how light bends through glass.",
            hi: "",
        },
        webSpeechVoice: "Google US English",
        pitch: 0.95,
        rate: 0.92,
    },
    {
        id: "sc-en-f-1",
        name: "Dr. Mira",
        category: "science",
        language: "en",
        gender: "female",
        age: "middle",
        style: "natural",
        description: "A friendly science educator voice",
        sampleText: {
            en: "Let’s explore the solar system and the mysteries of Mars.",
            hi: "",
        },
        webSpeechVoice: "Google US English",
        pitch: 1.05,
        rate: 0.95,
    },
    {
        id: "sc-en-m-2",
        name: "Atlas",
        category: "science",
        language: "en",
        gender: "male",
        age: "young",
        style: "energetic",
        description: "Energetic STEM explainer",
        sampleText: {
            en: "Here’s a quick breakdown of quantum physics, step by step.",
            hi: "",
        },
        webSpeechVoice: "Google UK English Male",
        pitch: 1.02,
        rate: 1.0,
    },
    {
        id: "sc-en-f-2",
        name: "Nova",
        category: "science",
        language: "en",
        gender: "female",
        age: "young",
        style: "expressive",
        description: "Bright, expressive science storyteller",
        sampleText: {
            en: "DNA is like a recipe book that tells our cells what to do.",
            hi: "",
        },
        webSpeechVoice: "Google UK English Female",
        pitch: 1.08,
        rate: 0.98,
    },
    {
        id: "sc-hi-m-1",
        name: "Vikram",
        category: "science",
        language: "hi",
        gender: "male",
        age: "middle",
        style: "calm",
        description: "विज्ञान के लिए शांत और स्पष्ट आवाज़",
        sampleText: {
            en: "",
            hi: "आज हम प्रकाश के अपवर्तन को सरल भाषा में समझेंगे।",
        },
        webSpeechVoice: "Google हिन्दी",
        pitch: 0.92,
        rate: 0.85,
    },
    {
        id: "sc-hi-f-1",
        name: "Saanvi",
        category: "science",
        language: "hi",
        gender: "female",
        age: "middle",
        style: "natural",
        description: "विज्ञान की मित्रवत शिक्षिका आवाज़",
        sampleText: {
            en: "",
            hi: "चलो, सौरमंडल के ग्रहों की रोचक बातें जानें।",
        },
        webSpeechVoice: "Google हिन्दी",
        pitch: 1.05,
        rate: 0.88,
    },
    {
        id: "sc-hi-f-2",
        name: "Isha",
        category: "science",
        language: "hi",
        gender: "female",
        age: "young",
        style: "expressive",
        description: "ऊर्जावान विज्ञान प्रस्तोता आवाज़",
        sampleText: {
            en: "",
            hi: "डीएनए हमारे शरीर की निर्देश-पुस्तिका की तरह है।",
        },
        webSpeechVoice: "Google हिन्दी",
        pitch: 1.1,
        rate: 0.92,
    },

    // History Voices (7)
    {
        id: "hi-en-m-1",
        name: "Chronos",
        category: "history",
        language: "en",
        gender: "male",
        age: "middle",
        style: "calm",
        description: "Classic documentary history narrator",
        sampleText: {
            en: "In the 18th century, empires expanded across continents.",
            hi: "",
        },
        webSpeechVoice: "Google US English",
        pitch: 0.9,
        rate: 0.9,
    },
    {
        id: "hi-en-f-1",
        name: "Aurora",
        category: "history",
        language: "en",
        gender: "female",
        age: "middle",
        style: "natural",
        description: "Warm historical storyteller",
        sampleText: {
            en: "Let’s walk through the rise and fall of ancient kingdoms.",
            hi: "",
        },
        webSpeechVoice: "Google UK English Female",
        pitch: 1.0,
        rate: 0.94,
    },
    {
        id: "hi-en-m-2",
        name: "Winston",
        category: "history",
        language: "en",
        gender: "male",
        age: "old",
        style: "calm",
        description: "A mature, authoritative history voice",
        sampleText: {
            en: "These letters reveal the strategy behind the great battles.",
            hi: "",
        },
        webSpeechVoice: "Google UK English Male",
        pitch: 0.88,
        rate: 0.9,
    },
    {
        id: "hi-en-f-2",
        name: "Elena",
        category: "history",
        language: "en",
        gender: "female",
        age: "young",
        style: "expressive",
        description: "Engaging history narrator",
        sampleText: {
            en: "This era reshaped cultures and inspired new ideas.",
            hi: "",
        },
        webSpeechVoice: "Google US English",
        pitch: 1.05,
        rate: 0.98,
    },
    {
        id: "hi-hi-m-1",
        name: "Bhaskar",
        category: "history",
        language: "hi",
        gender: "male",
        age: "old",
        style: "calm",
        description: "इतिहास के लिए गंभीर और विश्वसनीय आवाज़",
        sampleText: {
            en: "",
            hi: "उन्नीसवीं सदी में साम्राज्यों का विस्तार तेज़ हुआ।",
        },
        webSpeechVoice: "Google हिन्दी",
        pitch: 0.9,
        rate: 0.86,
    },
    {
        id: "hi-hi-f-1",
        name: "Meera",
        category: "history",
        language: "hi",
        gender: "female",
        age: "middle",
        style: "natural",
        description: "इतिहास की सजीव कथावाचक आवाज़",
        sampleText: {
            en: "",
            hi: "आइए प्राचीन सभ्यताओं की यात्रा करें।",
        },
        webSpeechVoice: "Google हिन्दी",
        pitch: 1.0,
        rate: 0.9,
    },
    {
        id: "hi-hi-f-2",
        name: "Riya",
        category: "history",
        language: "hi",
        gender: "female",
        age: "young",
        style: "expressive",
        description: "रोचक ऐतिहासिक प्रस्तोता आवाज़",
        sampleText: {
            en: "",
            hi: "यह दौर नई खोजों और बदलावों से भरा था।",
        },
        webSpeechVoice: "Google हिन्दी",
        pitch: 1.08,
        rate: 0.92,
    },

    // Story Voices (7)
    {
        id: "st-en-m-1",
        name: "Noah",
        category: "story",
        language: "en",
        gender: "male",
        age: "middle",
        style: "expressive",
        description: "Warm story narrator",
        sampleText: {
            en: "Once upon a time, a small village hid a big secret.",
            hi: "",
        },
        webSpeechVoice: "Google US English",
        pitch: 1.0,
        rate: 0.95,
    },
    {
        id: "st-en-f-1",
        name: "Luna",
        category: "story",
        language: "en",
        gender: "female",
        age: "young",
        style: "expressive",
        description: "Bright, cinematic storyteller",
        sampleText: {
            en: "The forest glowed as the hero stepped into the moonlight.",
            hi: "",
        },
        webSpeechVoice: "Google UK English Female",
        pitch: 1.1,
        rate: 1.0,
    },
    {
        id: "st-en-m-2",
        name: "Elias",
        category: "story",
        language: "en",
        gender: "male",
        age: "old",
        style: "calm",
        description: "A gentle, timeless tale voice",
        sampleText: {
            en: "The old captain whispered a warning about the storm.",
            hi: "",
        },
        webSpeechVoice: "Google UK English Male",
        pitch: 0.92,
        rate: 0.9,
    },
    {
        id: "st-en-f-2",
        name: "Ivy",
        category: "story",
        language: "en",
        gender: "female",
        age: "middle",
        style: "natural",
        description: "Soft and emotional narrative voice",
        sampleText: {
            en: "She kept the letter hidden for years, waiting to tell the truth.",
            hi: "",
        },
        webSpeechVoice: "Google US English",
        pitch: 1.03,
        rate: 0.94,
    },
    {
        id: "st-hi-m-1",
        name: "Kabir",
        category: "story",
        language: "hi",
        gender: "male",
        age: "middle",
        style: "expressive",
        description: "कहानी के लिए गर्म और भावनात्मक आवाज़",
        sampleText: {
            en: "",
            hi: "एक छोटे से गाँव में एक बड़ा राज़ छिपा था।",
        },
        webSpeechVoice: "Google हिन्दी",
        pitch: 1.0,
        rate: 0.9,
    },
    {
        id: "st-hi-f-1",
        name: "Anaya",
        category: "story",
        language: "hi",
        gender: "female",
        age: "young",
        style: "expressive",
        description: "कहानी सुनाने वाली भावपूर्ण आवाज़",
        sampleText: {
            en: "",
            hi: "चाँदनी में जंगल चमक उठा और यात्रा शुरू हुई।",
        },
        webSpeechVoice: "Google हिन्दी",
        pitch: 1.1,
        rate: 0.95,
    },
    {
        id: "st-hi-f-2",
        name: "Tara",
        category: "story",
        language: "hi",
        gender: "female",
        age: "middle",
        style: "natural",
        description: "नरम और सजीव कथावाचन",
        sampleText: {
            en: "",
            hi: "उस पत्र ने उनकी जिंदगी बदल दी।",
        },
        webSpeechVoice: "Google हिन्दी",
        pitch: 1.03,
        rate: 0.92,
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
