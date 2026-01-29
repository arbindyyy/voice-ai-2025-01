// Voice Style Transfer Utilities
// Transform voice characteristics with professional style presets

export interface VoiceStyle {
    id: string;
    name: string;
    description: string;
    category: 'character' | 'age' | 'effect' | 'professional' | 'creative';
    icon: string;
    parameters: StyleParameters;
}

export interface StyleParameters {
    pitchShift: number;        // Semitones (-12 to +12)
    formantShift: number;      // Percentage (-50 to +50)
    timeStretch: number;       // Speed (0.5 to 2.0)
    resonance: number;         // Voice depth (0 to 100)
    breathiness: number;       // Air quality (0 to 100)
    brightness: number;        // High frequency boost (0 to 100)
    warmth: number;           // Low frequency boost (0 to 100)
    nasality: number;         // Nasal quality (0 to 100)
}

export interface StylePreset {
    id: string;
    name: string;
    description: string;
    category: string;
    parameters: StyleParameters;
}

// Voice Style Presets
export const VOICE_STYLES: StylePreset[] = [
    // Character Voices
    {
        id: 'robot',
        name: 'Robot',
        description: 'Mechanical, robotic voice transformation',
        category: 'character',
        parameters: {
            pitchShift: -2,
            formantShift: -15,
            timeStretch: 0.95,
            resonance: 20,
            breathiness: 0,
            brightness: 60,
            warmth: 30,
            nasality: 10
        }
    },
    {
        id: 'alien',
        name: 'Alien',
        description: 'Extraterrestrial, otherworldly voice',
        category: 'character',
        parameters: {
            pitchShift: 4,
            formantShift: 25,
            timeStretch: 1.1,
            resonance: 70,
            breathiness: 40,
            brightness: 80,
            warmth: 20,
            nasality: 60
        }
    },
    {
        id: 'monster',
        name: 'Monster',
        description: 'Deep, growling creature voice',
        category: 'character',
        parameters: {
            pitchShift: -8,
            formantShift: -35,
            timeStretch: 0.85,
            resonance: 90,
            breathiness: 60,
            brightness: 20,
            warmth: 85,
            nasality: 15
        }
    },
    {
        id: 'chipmunk',
        name: 'Chipmunk',
        description: 'High-pitched, squeaky voice',
        category: 'character',
        parameters: {
            pitchShift: 8,
            formantShift: 40,
            timeStretch: 1.2,
            resonance: 30,
            breathiness: 20,
            brightness: 90,
            warmth: 10,
            nasality: 50
        }
    },

    // Age Transformations
    {
        id: 'child',
        name: 'Child',
        description: 'Young, innocent child voice',
        category: 'age',
        parameters: {
            pitchShift: 5,
            formantShift: 30,
            timeStretch: 1.08,
            resonance: 40,
            breathiness: 25,
            brightness: 75,
            warmth: 35,
            nasality: 35
        }
    },
    {
        id: 'teenager',
        name: 'Teenager',
        description: 'Adolescent voice characteristics',
        category: 'age',
        parameters: {
            pitchShift: 2,
            formantShift: 15,
            timeStretch: 1.05,
            resonance: 55,
            breathiness: 30,
            brightness: 65,
            warmth: 45,
            nasality: 25
        }
    },
    {
        id: 'elderly',
        name: 'Elderly',
        description: 'Aged, mature voice quality',
        category: 'age',
        parameters: {
            pitchShift: -3,
            formantShift: -10,
            timeStretch: 0.9,
            resonance: 70,
            breathiness: 55,
            brightness: 35,
            warmth: 70,
            nasality: 40
        }
    },

    // Professional Voices
    {
        id: 'announcer',
        name: 'Announcer',
        description: 'Professional broadcast voice',
        category: 'professional',
        parameters: {
            pitchShift: -1,
            formantShift: -5,
            timeStretch: 0.95,
            resonance: 75,
            breathiness: 15,
            brightness: 55,
            warmth: 80,
            nasality: 10
        }
    },
    {
        id: 'narrator',
        name: 'Narrator',
        description: 'Audiobook narrator style',
        category: 'professional',
        parameters: {
            pitchShift: 0,
            formantShift: 0,
            timeStretch: 0.92,
            resonance: 65,
            breathiness: 20,
            brightness: 50,
            warmth: 75,
            nasality: 15
        }
    },
    {
        id: 'newscaster',
        name: 'Newscaster',
        description: 'News reporter voice',
        category: 'professional',
        parameters: {
            pitchShift: -1,
            formantShift: -3,
            timeStretch: 1.0,
            resonance: 70,
            breathiness: 10,
            brightness: 60,
            warmth: 70,
            nasality: 5
        }
    },

    // Effect Voices
    {
        id: 'telephone',
        name: 'Telephone',
        description: 'Phone call quality',
        category: 'effect',
        parameters: {
            pitchShift: 0,
            formantShift: 0,
            timeStretch: 1.0,
            resonance: 40,
            breathiness: 5,
            brightness: 30,
            warmth: 25,
            nasality: 60
        }
    },
    {
        id: 'megaphone',
        name: 'Megaphone',
        description: 'Amplified, distorted voice',
        category: 'effect',
        parameters: {
            pitchShift: 1,
            formantShift: 5,
            timeStretch: 1.0,
            resonance: 50,
            breathiness: 0,
            brightness: 85,
            warmth: 40,
            nasality: 70
        }
    },
    {
        id: 'underwater',
        name: 'Underwater',
        description: 'Submerged, muffled voice',
        category: 'effect',
        parameters: {
            pitchShift: -2,
            formantShift: -20,
            timeStretch: 0.88,
            resonance: 85,
            breathiness: 30,
            brightness: 15,
            warmth: 60,
            nasality: 45
        }
    },

    // Creative Transformations
    {
        id: 'masculine',
        name: 'Masculine',
        description: 'Deeper, masculine characteristics',
        category: 'creative',
        parameters: {
            pitchShift: -4,
            formantShift: -20,
            timeStretch: 0.95,
            resonance: 80,
            breathiness: 15,
            brightness: 40,
            warmth: 85,
            nasality: 10
        }
    },
    {
        id: 'feminine',
        name: 'Feminine',
        description: 'Lighter, feminine characteristics',
        category: 'creative',
        parameters: {
            pitchShift: 4,
            formantShift: 20,
            timeStretch: 1.05,
            resonance: 50,
            breathiness: 35,
            brightness: 75,
            warmth: 50,
            nasality: 25
        }
    },
    {
        id: 'whisper',
        name: 'Whisper',
        description: 'Soft, breathy whisper',
        category: 'creative',
        parameters: {
            pitchShift: -1,
            formantShift: 5,
            timeStretch: 0.9,
            resonance: 30,
            breathiness: 90,
            brightness: 40,
            warmth: 35,
            nasality: 20
        }
    },
    {
        id: 'demon',
        name: 'Demon',
        description: 'Dark, sinister voice',
        category: 'creative',
        parameters: {
            pitchShift: -10,
            formantShift: -40,
            timeStretch: 0.8,
            resonance: 95,
            breathiness: 70,
            brightness: 10,
            warmth: 90,
            nasality: 25
        }
    }
];

// Voice Style Transfer Processor
export class VoiceStyleTransfer {
    private audioContext: AudioContext;

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
    }

    async applyStyle(
        audioBuffer: AudioBuffer,
        parameters: StyleParameters
    ): Promise<AudioBuffer> {
        let processedBuffer = audioBuffer;

        // Apply time stretching (speed change)
        if (parameters.timeStretch !== 1.0) {
            processedBuffer = await this.applyTimeStretch(processedBuffer, parameters.timeStretch);
        }

        // Apply pitch shifting
        if (parameters.pitchShift !== 0) {
            processedBuffer = await this.applyPitchShift(processedBuffer, parameters.pitchShift);
        }

        // Apply formant shifting
        if (parameters.formantShift !== 0) {
            processedBuffer = await this.applyFormantShift(processedBuffer, parameters.formantShift);
        }

        // Apply tonal characteristics
        processedBuffer = await this.applyTonalCharacteristics(processedBuffer, {
            resonance: parameters.resonance,
            breathiness: parameters.breathiness,
            brightness: parameters.brightness,
            warmth: parameters.warmth,
            nasality: parameters.nasality
        });

        return processedBuffer;
    }

    private async applyTimeStretch(buffer: AudioBuffer, stretch: number): Promise<AudioBuffer> {
        const newLength = Math.floor(buffer.length / stretch);
        const offlineContext = new OfflineAudioContext(
            buffer.numberOfChannels,
            newLength,
            buffer.sampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = stretch;
        source.connect(offlineContext.destination);
        source.start(0);

        return await offlineContext.startRendering();
    }

    private async applyPitchShift(buffer: AudioBuffer, semitones: number): Promise<AudioBuffer> {
        const pitchRatio = Math.pow(2, semitones / 12);
        const newLength = Math.floor(buffer.length / pitchRatio);
        
        const offlineContext = new OfflineAudioContext(
            buffer.numberOfChannels,
            newLength,
            buffer.sampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = pitchRatio;
        source.connect(offlineContext.destination);
        source.start(0);

        return await offlineContext.startRendering();
    }

    private async applyFormantShift(buffer: AudioBuffer, shiftPercent: number): Promise<AudioBuffer> {
        const offlineContext = new OfflineAudioContext(
            buffer.numberOfChannels,
            buffer.length,
            buffer.sampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = buffer;

        // Create formant filters (vowel resonances)
        const formant1 = offlineContext.createBiquadFilter();
        const formant2 = offlineContext.createBiquadFilter();
        const formant3 = offlineContext.createBiquadFilter();

        formant1.type = 'peaking';
        formant2.type = 'peaking';
        formant3.type = 'peaking';

        // Adjust formant frequencies based on shift
        const shiftRatio = 1 + (shiftPercent / 100);
        formant1.frequency.value = 500 * shiftRatio;
        formant2.frequency.value = 1500 * shiftRatio;
        formant3.frequency.value = 2500 * shiftRatio;

        formant1.Q.value = 5;
        formant2.Q.value = 5;
        formant3.Q.value = 5;

        formant1.gain.value = 6;
        formant2.gain.value = 4;
        formant3.gain.value = 3;

        source.connect(formant1);
        formant1.connect(formant2);
        formant2.connect(formant3);
        formant3.connect(offlineContext.destination);

        source.start(0);
        return await offlineContext.startRendering();
    }

    private async applyTonalCharacteristics(
        buffer: AudioBuffer,
        characteristics: {
            resonance: number;
            breathiness: number;
            brightness: number;
            warmth: number;
            nasality: number;
        }
    ): Promise<AudioBuffer> {
        const offlineContext = new OfflineAudioContext(
            buffer.numberOfChannels,
            buffer.length,
            buffer.sampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = buffer;

        // Brightness (high frequency boost)
        const brightnessFilter = offlineContext.createBiquadFilter();
        brightnessFilter.type = 'highshelf';
        brightnessFilter.frequency.value = 4000;
        brightnessFilter.gain.value = (characteristics.brightness / 100) * 12 - 6;

        // Warmth (low frequency boost)
        const warmthFilter = offlineContext.createBiquadFilter();
        warmthFilter.type = 'lowshelf';
        warmthFilter.frequency.value = 200;
        warmthFilter.gain.value = (characteristics.warmth / 100) * 12 - 6;

        // Resonance (mid boost)
        const resonanceFilter = offlineContext.createBiquadFilter();
        resonanceFilter.type = 'peaking';
        resonanceFilter.frequency.value = 1000;
        resonanceFilter.Q.value = 2 + (characteristics.resonance / 100) * 8;
        resonanceFilter.gain.value = (characteristics.resonance / 100) * 8;

        // Nasality (nasal formant)
        const nasalityFilter = offlineContext.createBiquadFilter();
        nasalityFilter.type = 'peaking';
        nasalityFilter.frequency.value = 2500;
        nasalityFilter.Q.value = 10;
        nasalityFilter.gain.value = (characteristics.nasality / 100) * 10;

        // Breathiness (noise injection simulation via filtering)
        const breathinessFilter = offlineContext.createBiquadFilter();
        breathinessFilter.type = 'highpass';
        breathinessFilter.frequency.value = 8000 - (characteristics.breathiness / 100) * 6000;
        breathinessFilter.Q.value = 0.5;

        // Connect filter chain
        source.connect(warmthFilter);
        warmthFilter.connect(resonanceFilter);
        resonanceFilter.connect(brightnessFilter);
        brightnessFilter.connect(nasalityFilter);
        nasalityFilter.connect(breathinessFilter);
        breathinessFilter.connect(offlineContext.destination);

        source.start(0);
        return await offlineContext.startRendering();
    }

    async blendStyles(
        buffer: AudioBuffer,
        style1: StyleParameters,
        style2: StyleParameters,
        blend: number // 0-100 (0 = all style1, 100 = all style2)
    ): Promise<AudioBuffer> {
        const t = blend / 100;
        const blendedParams: StyleParameters = {
            pitchShift: style1.pitchShift + (style2.pitchShift - style1.pitchShift) * t,
            formantShift: style1.formantShift + (style2.formantShift - style1.formantShift) * t,
            timeStretch: style1.timeStretch + (style2.timeStretch - style1.timeStretch) * t,
            resonance: style1.resonance + (style2.resonance - style1.resonance) * t,
            breathiness: style1.breathiness + (style2.breathiness - style1.breathiness) * t,
            brightness: style1.brightness + (style2.brightness - style1.brightness) * t,
            warmth: style1.warmth + (style2.warmth - style1.warmth) * t,
            nasality: style1.nasality + (style2.nasality - style1.nasality) * t
        };

        return await this.applyStyle(buffer, blendedParams);
    }
}

// Utility functions
export function getStylePresetById(id: string): StylePreset | undefined {
    return VOICE_STYLES.find(s => s.id === id);
}

export function getStylesByCategory(category: string): StylePreset[] {
    return VOICE_STYLES.filter(s => s.category === category);
}

export function getDefaultParameters(): StyleParameters {
    return {
        pitchShift: 0,
        formantShift: 0,
        timeStretch: 1.0,
        resonance: 50,
        breathiness: 20,
        brightness: 50,
        warmth: 50,
        nasality: 30
    };
}

export function exportStyleParameters(params: StyleParameters): string {
    return JSON.stringify(params, null, 2);
}

export function importStyleParameters(json: string): StyleParameters | null {
    try {
        const params = JSON.parse(json);
        // Validate parameters
        if (
            typeof params.pitchShift === 'number' &&
            typeof params.formantShift === 'number' &&
            typeof params.timeStretch === 'number' &&
            typeof params.resonance === 'number' &&
            typeof params.breathiness === 'number' &&
            typeof params.brightness === 'number' &&
            typeof params.warmth === 'number' &&
            typeof params.nasality === 'number'
        ) {
            return params;
        }
        return null;
    } catch (error) {
        console.error('Failed to import style parameters:', error);
        return null;
    }
}

export const STYLE_CATEGORIES = [
    { id: 'all', name: 'All Styles', icon: '🎭' },
    { id: 'character', name: 'Characters', icon: '👾' },
    { id: 'age', name: 'Age Transform', icon: '👶' },
    { id: 'professional', name: 'Professional', icon: '🎙️' },
    { id: 'effect', name: 'Effects', icon: '📞' },
    { id: 'creative', name: 'Creative', icon: '✨' }
];
