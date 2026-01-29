// Real-Time Voice Morphing Utilities
// Live audio processing with low-latency effects

export interface MorphingPreset {
    id: string;
    name: string;
    description: string;
    category: 'character' | 'effect' | 'musical' | 'creative';
    icon: string;
    effects: MorphingEffect[];
}

export interface MorphingEffect {
    type: 'pitch' | 'formant' | 'reverb' | 'delay' | 'distortion' | 'filter' | 'modulation';
    parameters: Record<string, number>;
    enabled: boolean;
}

export interface AudioAnalysis {
    volume: number;
    frequency: number;
    pitch: number;
    clarity: number;
}

// Real-Time Voice Morphing Presets
export const MORPHING_PRESETS: MorphingPreset[] = [
    {
        id: 'robot',
        name: 'Robot',
        description: 'Mechanical voice transformation',
        category: 'character',
        icon: '🤖',
        effects: [
            {
                type: 'pitch',
                parameters: { shift: -2, detune: 0 },
                enabled: true
            },
            {
                type: 'filter',
                parameters: { type: 2, frequency: 2000, resonance: 5 },
                enabled: true
            },
            {
                type: 'modulation',
                parameters: { rate: 5, depth: 20 },
                enabled: true
            }
        ]
    },
    {
        id: 'deep',
        name: 'Deep Voice',
        description: 'Lower pitch for deeper voice',
        category: 'character',
        icon: '🎤',
        effects: [
            {
                type: 'pitch',
                parameters: { shift: -7, detune: 0 },
                enabled: true
            },
            {
                type: 'formant',
                parameters: { shift: -30 },
                enabled: true
            }
        ]
    },
    {
        id: 'high',
        name: 'High Voice',
        description: 'Higher pitch for lighter voice',
        category: 'character',
        icon: '🐿️',
        effects: [
            {
                type: 'pitch',
                parameters: { shift: 5, detune: 0 },
                enabled: true
            },
            {
                type: 'formant',
                parameters: { shift: 30 },
                enabled: true
            }
        ]
    },
    {
        id: 'radio',
        name: 'Radio',
        description: 'AM radio broadcast effect',
        category: 'effect',
        icon: '📻',
        effects: [
            {
                type: 'filter',
                parameters: { type: 0, frequency: 3400, resonance: 2 },
                enabled: true
            },
            {
                type: 'filter',
                parameters: { type: 1, frequency: 300, resonance: 2 },
                enabled: true
            },
            {
                type: 'distortion',
                parameters: { amount: 20 },
                enabled: true
            }
        ]
    },
    {
        id: 'cave',
        name: 'Cave',
        description: 'Large space reverb',
        category: 'effect',
        icon: '🏔️',
        effects: [
            {
                type: 'reverb',
                parameters: { decay: 4, mix: 50 },
                enabled: true
            },
            {
                type: 'delay',
                parameters: { time: 200, feedback: 30, mix: 20 },
                enabled: true
            }
        ]
    },
    {
        id: 'phone',
        name: 'Phone',
        description: 'Telephone call effect',
        category: 'effect',
        icon: '☎️',
        effects: [
            {
                type: 'filter',
                parameters: { type: 0, frequency: 3000, resonance: 1 },
                enabled: true
            },
            {
                type: 'filter',
                parameters: { type: 1, frequency: 400, resonance: 1 },
                enabled: true
            },
            {
                type: 'distortion',
                parameters: { amount: 15 },
                enabled: true
            }
        ]
    },
    {
        id: 'underwater',
        name: 'Underwater',
        description: 'Submerged effect',
        category: 'effect',
        icon: '🌊',
        effects: [
            {
                type: 'filter',
                parameters: { type: 0, frequency: 800, resonance: 3 },
                enabled: true
            },
            {
                type: 'modulation',
                parameters: { rate: 0.3, depth: 50 },
                enabled: true
            },
            {
                type: 'reverb',
                parameters: { decay: 3, mix: 40 },
                enabled: true
            }
        ]
    },
    {
        id: 'demon',
        name: 'Demon',
        description: 'Dark, sinister voice',
        category: 'character',
        icon: '👹',
        effects: [
            {
                type: 'pitch',
                parameters: { shift: -10, detune: -20 },
                enabled: true
            },
            {
                type: 'distortion',
                parameters: { amount: 40 },
                enabled: true
            },
            {
                type: 'reverb',
                parameters: { decay: 2, mix: 30 },
                enabled: true
            }
        ]
    },
    {
        id: 'chorus',
        name: 'Chorus',
        description: 'Choir-like effect',
        category: 'musical',
        icon: '🎵',
        effects: [
            {
                type: 'modulation',
                parameters: { rate: 1.5, depth: 40 },
                enabled: true
            },
            {
                type: 'delay',
                parameters: { time: 50, feedback: 20, mix: 30 },
                enabled: true
            }
        ]
    },
    {
        id: 'megaphone',
        name: 'Megaphone',
        description: 'Loudspeaker effect',
        category: 'effect',
        icon: '📢',
        effects: [
            {
                type: 'filter',
                parameters: { type: 2, frequency: 2500, resonance: 8 },
                enabled: true
            },
            {
                type: 'distortion',
                parameters: { amount: 50 },
                enabled: true
            }
        ]
    },
    {
        id: 'alien',
        name: 'Alien',
        description: 'Extraterrestrial voice',
        category: 'character',
        icon: '👽',
        effects: [
            {
                type: 'pitch',
                parameters: { shift: 4, detune: 15 },
                enabled: true
            },
            {
                type: 'modulation',
                parameters: { rate: 3, depth: 60 },
                enabled: true
            },
            {
                type: 'delay',
                parameters: { time: 100, feedback: 40, mix: 25 },
                enabled: true
            }
        ]
    },
    {
        id: 'whisper',
        name: 'Whisper',
        description: 'Soft, breathy voice',
        category: 'creative',
        icon: '🤫',
        effects: [
            {
                type: 'pitch',
                parameters: { shift: -1, detune: 0 },
                enabled: true
            },
            {
                type: 'filter',
                parameters: { type: 1, frequency: 6000, resonance: 0.5 },
                enabled: true
            }
        ]
    }
];

// Real-Time Voice Morphing Engine
export class RealtimeVoiceMorpher {
    private audioContext: AudioContext;
    private microphone: MediaStream | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;
    private effectsChain: AudioNode[] = [];
    private analyser: AnalyserNode;
    private outputGain: GainNode;
    private isActive: boolean = false;
    
    // Effect nodes
    private pitchShifter: AudioWorkletNode | null = null;
    private reverbNode: ConvolverNode | null = null;
    private delayNode: DelayNode | null = null;
    private distortionNode: WaveShaperNode | null = null;
    private filterNodes: BiquadFilterNode[] = [];
    private modulatorLFO: OscillatorNode | null = null;
    private modulatorGain: GainNode | null = null;
    
    // Recording
    private mediaRecorder: MediaRecorder | null = null;
    private recordedChunks: Blob[] = [];

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.outputGain = audioContext.createGain();
        this.outputGain.gain.value = 1.0;
    }

    async initialize(micStream: MediaStream): Promise<void> {
        this.microphone = micStream;
        this.sourceNode = this.audioContext.createMediaStreamSource(micStream);
        
        // Connect to analyser
        this.sourceNode.connect(this.analyser);
        
        // Initialize effect nodes
        this.initializeEffects();
        
        this.isActive = true;
    }

    private initializeEffects(): void {
        if (!this.sourceNode) return;

        // Create filter nodes
        for (let i = 0; i < 3; i++) {
            const filter = this.audioContext.createBiquadFilter();
            this.filterNodes.push(filter);
        }

        // Create delay
        this.delayNode = this.audioContext.createDelay(5);
        
        // Create distortion
        this.distortionNode = this.audioContext.createWaveShaper();
        
        // Create reverb
        this.reverbNode = this.audioContext.createConvolver();
        this.createReverbImpulse(2);
        
        // Create modulation LFO
        this.modulatorLFO = this.audioContext.createOscillator();
        this.modulatorGain = this.audioContext.createGain();
        this.modulatorLFO.connect(this.modulatorGain);
        this.modulatorLFO.start();
    }

    applyPreset(preset: MorphingPreset): void {
        // Clear existing chain
        this.clearEffectsChain();
        
        if (!this.sourceNode) return;

        let currentNode: AudioNode = this.sourceNode;

        // Build effects chain based on preset
        for (const effect of preset.effects) {
            if (!effect.enabled) continue;

            const effectNode = this.createEffectNode(effect);
            if (effectNode) {
                currentNode.connect(effectNode);
                currentNode = effectNode;
                this.effectsChain.push(effectNode);
            }
        }

        // Connect to output
        currentNode.connect(this.outputGain);
        this.outputGain.connect(this.audioContext.destination);
    }

    private createEffectNode(effect: MorphingEffect): AudioNode | null {
        switch (effect.type) {
            case 'pitch':
                return this.createPitchShifter(effect.parameters.shift || 0);
            
            case 'formant':
                return this.createFormantShifter(effect.parameters.shift || 0);
            
            case 'reverb':
                if (this.reverbNode) {
                    this.createReverbImpulse(effect.parameters.decay || 2);
                    return this.createWetDryMix(this.reverbNode, effect.parameters.mix || 30);
                }
                return null;
            
            case 'delay':
                if (this.delayNode) {
                    this.delayNode.delayTime.value = (effect.parameters.time || 200) / 1000;
                    const feedbackGain = this.audioContext.createGain();
                    feedbackGain.gain.value = (effect.parameters.feedback || 30) / 100;
                    this.delayNode.connect(feedbackGain);
                    feedbackGain.connect(this.delayNode);
                    return this.createWetDryMix(this.delayNode, effect.parameters.mix || 30);
                }
                return null;
            
            case 'distortion':
                if (this.distortionNode) {
                    this.createDistortionCurve(effect.parameters.amount || 30);
                    return this.distortionNode;
                }
                return null;
            
            case 'filter':
                const filter = this.audioContext.createBiquadFilter();
                const filterType = effect.parameters.type || 0;
                filter.type = ['lowpass', 'highpass', 'bandpass'][filterType] as BiquadFilterType;
                filter.frequency.value = effect.parameters.frequency || 1000;
                filter.Q.value = effect.parameters.resonance || 1;
                return filter;
            
            case 'modulation':
                if (this.modulatorLFO && this.modulatorGain) {
                    this.modulatorLFO.frequency.value = effect.parameters.rate || 1;
                    this.modulatorGain.gain.value = (effect.parameters.depth || 30) / 100;
                    
                    const modDelay = this.audioContext.createDelay(0.1);
                    this.modulatorGain.connect(modDelay.delayTime);
                    return modDelay;
                }
                return null;
            
            default:
                return null;
        }
    }

    private createPitchShifter(semitones: number): AudioNode {
        // Simple pitch shifting using playback rate
        // Note: This affects speed too - for better results, use AudioWorklet
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = Math.pow(2, semitones / 12);
        return gainNode;
    }

    private createFormantShifter(shiftPercent: number): AudioNode {
        const formantFilter1 = this.audioContext.createBiquadFilter();
        const formantFilter2 = this.audioContext.createBiquadFilter();
        
        formantFilter1.type = 'peaking';
        formantFilter2.type = 'peaking';
        
        const shiftRatio = 1 + (shiftPercent / 100);
        formantFilter1.frequency.value = 500 * shiftRatio;
        formantFilter2.frequency.value = 1500 * shiftRatio;
        
        formantFilter1.Q.value = 5;
        formantFilter2.Q.value = 5;
        
        formantFilter1.gain.value = 6;
        formantFilter2.gain.value = 4;
        
        formantFilter1.connect(formantFilter2);
        return formantFilter1;
    }

    private createWetDryMix(wetNode: AudioNode, wetPercent: number): AudioNode {
        const dryGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        const merger = this.audioContext.createChannelMerger(2);
        
        dryGain.gain.value = 1 - (wetPercent / 100);
        wetGain.gain.value = wetPercent / 100;
        
        wetNode.connect(wetGain);
        wetGain.connect(merger, 0, 0);
        dryGain.connect(merger, 0, 1);
        
        return merger;
    }

    private createReverbImpulse(decay: number): void {
        if (!this.reverbNode) return;
        
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * decay;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        this.reverbNode.buffer = impulse;
    }

    private createDistortionCurve(amount: number): void {
        if (!this.distortionNode) return;
        
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        const k = amount * 2;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        
        this.distortionNode.curve = curve;
        this.distortionNode.oversample = '4x';
    }

    private clearEffectsChain(): void {
        // Disconnect all effect nodes
        this.effectsChain.forEach(node => {
            try {
                node.disconnect();
            } catch (e) {
                // Node already disconnected
            }
        });
        this.effectsChain = [];
        
        // Disconnect output
        try {
            this.outputGain.disconnect();
        } catch (e) {
            // Already disconnected
        }
    }

    getAnalysis(): AudioAnalysis {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);
        
        // Calculate volume (RMS)
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i] * dataArray[i];
        }
        const volume = Math.sqrt(sum / bufferLength) / 255;
        
        // Find dominant frequency
        let maxValue = 0;
        let maxIndex = 0;
        for (let i = 0; i < bufferLength; i++) {
            if (dataArray[i] > maxValue) {
                maxValue = dataArray[i];
                maxIndex = i;
            }
        }
        const frequency = (maxIndex * this.audioContext.sampleRate) / (2 * bufferLength);
        
        return {
            volume,
            frequency,
            pitch: this.frequencyToMidiNote(frequency),
            clarity: maxValue / 255
        };
    }

    private frequencyToMidiNote(frequency: number): number {
        return 69 + 12 * Math.log2(frequency / 440);
    }

    getFrequencyData(): Uint8Array {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }

    getTimeDomainData(): Uint8Array {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);
        return dataArray;
    }

    setOutputVolume(volume: number): void {
        this.outputGain.gain.value = Math.max(0, Math.min(1, volume));
    }

    startRecording(): void {
        if (!this.microphone) return;
        
        const destination = this.audioContext.createMediaStreamDestination();
        this.outputGain.connect(destination);
        
        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(destination.stream);
        
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };
        
        this.mediaRecorder.start();
    }

    stopRecording(): Blob | null {
        if (!this.mediaRecorder) return null;
        
        this.mediaRecorder.stop();
        
        if (this.recordedChunks.length === 0) return null;
        
        return new Blob(this.recordedChunks, { type: 'audio/webm' });
    }

    cleanup(): void {
        this.clearEffectsChain();
        
        if (this.sourceNode) {
            this.sourceNode.disconnect();
        }
        
        if (this.microphone) {
            this.microphone.getTracks().forEach(track => track.stop());
        }
        
        if (this.modulatorLFO) {
            this.modulatorLFO.stop();
        }
        
        this.isActive = false;
    }
}

// Utility functions
export function getPresetById(id: string): MorphingPreset | undefined {
    return MORPHING_PRESETS.find(p => p.id === id);
}

export function getPresetsByCategory(category: string): MorphingPreset[] {
    return MORPHING_PRESETS.filter(p => p.category === category);
}

export async function requestMicrophoneAccess(): Promise<MediaStream> {
    try {
        return await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: false
            }
        });
    } catch (error) {
        console.error('Microphone access denied:', error);
        throw new Error('Microphone access is required for voice morphing');
    }
}

export const MORPHING_CATEGORIES = [
    { id: 'all', name: 'All Presets', icon: '🎭' },
    { id: 'character', name: 'Characters', icon: '🤖' },
    { id: 'effect', name: 'Effects', icon: '📻' },
    { id: 'musical', name: 'Musical', icon: '🎵' },
    { id: 'creative', name: 'Creative', icon: '✨' }
];
