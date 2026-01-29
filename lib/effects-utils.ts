// Audio Effects Utilities
// Professional audio effects processing system

export interface AudioEffect {
    id: string;
    name: string;
    description: string;
    category: 'spatial' | 'dynamics' | 'filter' | 'modulation' | 'creative';
    icon: string;
    parameters: EffectParameter[];
}

export interface EffectParameter {
    id: string;
    name: string;
    description: string;
    type: 'slider' | 'toggle' | 'select';
    min?: number;
    max?: number;
    default: number | boolean | string;
    unit?: string;
    options?: { value: string | number; label: string }[];
}

export interface EffectPreset {
    id: string;
    name: string;
    description: string;
    effects: {
        effectId: string;
        parameters: Record<string, number | boolean | string>;
    }[];
}

// Audio Effects Definitions
export const AUDIO_EFFECTS: AudioEffect[] = [
    // Spatial Effects
    {
        id: 'reverb',
        name: 'Reverb',
        description: 'Add space and depth to your voice',
        category: 'spatial',
        icon: '🏛️',
        parameters: [
            {
                id: 'roomSize',
                name: 'Room Size',
                description: 'Size of the virtual room',
                type: 'slider',
                min: 0,
                max: 100,
                default: 50,
                unit: '%'
            },
            {
                id: 'decay',
                name: 'Decay Time',
                description: 'How long the reverb lasts',
                type: 'slider',
                min: 0.1,
                max: 10,
                default: 2,
                unit: 's'
            },
            {
                id: 'wetDry',
                name: 'Wet/Dry Mix',
                description: 'Balance between original and effect',
                type: 'slider',
                min: 0,
                max: 100,
                default: 30,
                unit: '%'
            }
        ]
    },
    {
        id: 'echo',
        name: 'Echo/Delay',
        description: 'Create repeating echoes',
        category: 'spatial',
        icon: '🔁',
        parameters: [
            {
                id: 'delayTime',
                name: 'Delay Time',
                description: 'Time between echoes',
                type: 'slider',
                min: 50,
                max: 2000,
                default: 500,
                unit: 'ms'
            },
            {
                id: 'feedback',
                name: 'Feedback',
                description: 'Number of echo repeats',
                type: 'slider',
                min: 0,
                max: 90,
                default: 40,
                unit: '%'
            },
            {
                id: 'wetDry',
                name: 'Wet/Dry Mix',
                description: 'Balance between original and effect',
                type: 'slider',
                min: 0,
                max: 100,
                default: 30,
                unit: '%'
            }
        ]
    },
    {
        id: 'stereoWidth',
        name: 'Stereo Width',
        description: 'Control the stereo image width',
        category: 'spatial',
        icon: '↔️',
        parameters: [
            {
                id: 'width',
                name: 'Width',
                description: 'Stereo image width',
                type: 'slider',
                min: 0,
                max: 200,
                default: 100,
                unit: '%'
            }
        ]
    },

    // Dynamics Effects
    {
        id: 'compressor',
        name: 'Compressor',
        description: 'Balance loud and quiet parts',
        category: 'dynamics',
        icon: '🎚️',
        parameters: [
            {
                id: 'threshold',
                name: 'Threshold',
                description: 'Level where compression starts',
                type: 'slider',
                min: -60,
                max: 0,
                default: -24,
                unit: 'dB'
            },
            {
                id: 'ratio',
                name: 'Ratio',
                description: 'Amount of compression',
                type: 'slider',
                min: 1,
                max: 20,
                default: 4,
                unit: ':1'
            },
            {
                id: 'attack',
                name: 'Attack',
                description: 'How quickly compression starts',
                type: 'slider',
                min: 0,
                max: 100,
                default: 10,
                unit: 'ms'
            },
            {
                id: 'release',
                name: 'Release',
                description: 'How quickly compression stops',
                type: 'slider',
                min: 10,
                max: 1000,
                default: 100,
                unit: 'ms'
            }
        ]
    },
    {
        id: 'limiter',
        name: 'Limiter',
        description: 'Prevent clipping and distortion',
        category: 'dynamics',
        icon: '🛡️',
        parameters: [
            {
                id: 'threshold',
                name: 'Threshold',
                description: 'Maximum output level',
                type: 'slider',
                min: -20,
                max: 0,
                default: -1,
                unit: 'dB'
            }
        ]
    },

    // Filter Effects
    {
        id: 'eq',
        name: 'Equalizer',
        description: 'Adjust frequency balance',
        category: 'filter',
        icon: '🎛️',
        parameters: [
            {
                id: 'lowFreq',
                name: 'Bass',
                description: 'Low frequency boost/cut',
                type: 'slider',
                min: -12,
                max: 12,
                default: 0,
                unit: 'dB'
            },
            {
                id: 'midFreq',
                name: 'Mids',
                description: 'Mid frequency boost/cut',
                type: 'slider',
                min: -12,
                max: 12,
                default: 0,
                unit: 'dB'
            },
            {
                id: 'highFreq',
                name: 'Treble',
                description: 'High frequency boost/cut',
                type: 'slider',
                min: -12,
                max: 12,
                default: 0,
                unit: 'dB'
            }
        ]
    },
    {
        id: 'lowpass',
        name: 'Low Pass Filter',
        description: 'Remove high frequencies',
        category: 'filter',
        icon: '📉',
        parameters: [
            {
                id: 'frequency',
                name: 'Cutoff Frequency',
                description: 'Frequency where filter starts',
                type: 'slider',
                min: 200,
                max: 20000,
                default: 5000,
                unit: 'Hz'
            },
            {
                id: 'resonance',
                name: 'Resonance',
                description: 'Filter emphasis',
                type: 'slider',
                min: 0,
                max: 20,
                default: 1,
                unit: 'Q'
            }
        ]
    },
    {
        id: 'highpass',
        name: 'High Pass Filter',
        description: 'Remove low frequencies',
        category: 'filter',
        icon: '📈',
        parameters: [
            {
                id: 'frequency',
                name: 'Cutoff Frequency',
                description: 'Frequency where filter starts',
                type: 'slider',
                min: 20,
                max: 5000,
                default: 80,
                unit: 'Hz'
            },
            {
                id: 'resonance',
                name: 'Resonance',
                description: 'Filter emphasis',
                type: 'slider',
                min: 0,
                max: 20,
                default: 1,
                unit: 'Q'
            }
        ]
    },

    // Modulation Effects
    {
        id: 'chorus',
        name: 'Chorus',
        description: 'Thicken and widen the sound',
        category: 'modulation',
        icon: '🌊',
        parameters: [
            {
                id: 'rate',
                name: 'Rate',
                description: 'Modulation speed',
                type: 'slider',
                min: 0.1,
                max: 10,
                default: 1.5,
                unit: 'Hz'
            },
            {
                id: 'depth',
                name: 'Depth',
                description: 'Modulation intensity',
                type: 'slider',
                min: 0,
                max: 100,
                default: 50,
                unit: '%'
            },
            {
                id: 'wetDry',
                name: 'Wet/Dry Mix',
                description: 'Balance between original and effect',
                type: 'slider',
                min: 0,
                max: 100,
                default: 40,
                unit: '%'
            }
        ]
    },
    {
        id: 'phaser',
        name: 'Phaser',
        description: 'Sweeping, swooshing effect',
        category: 'modulation',
        icon: '〰️',
        parameters: [
            {
                id: 'rate',
                name: 'Rate',
                description: 'Sweep speed',
                type: 'slider',
                min: 0.1,
                max: 10,
                default: 0.5,
                unit: 'Hz'
            },
            {
                id: 'depth',
                name: 'Depth',
                description: 'Sweep intensity',
                type: 'slider',
                min: 0,
                max: 100,
                default: 50,
                unit: '%'
            },
            {
                id: 'feedback',
                name: 'Feedback',
                description: 'Resonance amount',
                type: 'slider',
                min: 0,
                max: 90,
                default: 30,
                unit: '%'
            }
        ]
    },

    // Creative Effects
    {
        id: 'distortion',
        name: 'Distortion',
        description: 'Add grit and character',
        category: 'creative',
        icon: '⚡',
        parameters: [
            {
                id: 'drive',
                name: 'Drive',
                description: 'Distortion amount',
                type: 'slider',
                min: 0,
                max: 100,
                default: 30,
                unit: '%'
            },
            {
                id: 'tone',
                name: 'Tone',
                description: 'Brightness control',
                type: 'slider',
                min: 0,
                max: 100,
                default: 50,
                unit: '%'
            }
        ]
    },
    {
        id: 'bitcrusher',
        name: 'Bit Crusher',
        description: 'Lo-fi digital degradation',
        category: 'creative',
        icon: '🎮',
        parameters: [
            {
                id: 'bits',
                name: 'Bit Depth',
                description: 'Audio resolution',
                type: 'slider',
                min: 1,
                max: 16,
                default: 8,
                unit: 'bits'
            },
            {
                id: 'sampleRate',
                name: 'Sample Rate',
                description: 'Sampling frequency reduction',
                type: 'slider',
                min: 1000,
                max: 44100,
                default: 8000,
                unit: 'Hz'
            }
        ]
    },
    {
        id: 'pitchShift',
        name: 'Pitch Shifter',
        description: 'Change pitch without speed',
        category: 'creative',
        icon: '🎵',
        parameters: [
            {
                id: 'shift',
                name: 'Pitch Shift',
                description: 'Semitones to shift',
                type: 'slider',
                min: -12,
                max: 12,
                default: 0,
                unit: 'semi'
            }
        ]
    }
];

// Effect Presets
export const EFFECT_PRESETS: EffectPreset[] = [
    {
        id: 'radio',
        name: 'Radio Voice',
        description: 'Classic radio broadcast sound',
        effects: [
            {
                effectId: 'eq',
                parameters: { lowFreq: -6, midFreq: 3, highFreq: 2 }
            },
            {
                effectId: 'compressor',
                parameters: { threshold: -20, ratio: 6, attack: 5, release: 50 }
            }
        ]
    },
    {
        id: 'podcast',
        name: 'Podcast Pro',
        description: 'Professional podcast sound',
        effects: [
            {
                effectId: 'highpass',
                parameters: { frequency: 100, resonance: 1 }
            },
            {
                effectId: 'compressor',
                parameters: { threshold: -18, ratio: 4, attack: 10, release: 100 }
            },
            {
                effectId: 'limiter',
                parameters: { threshold: -1 }
            }
        ]
    },
    {
        id: 'cathedral',
        name: 'Cathedral',
        description: 'Large hall reverb',
        effects: [
            {
                effectId: 'reverb',
                parameters: { roomSize: 90, decay: 5, wetDry: 50 }
            }
        ]
    },
    {
        id: 'telephone',
        name: 'Telephone',
        description: 'Phone call simulation',
        effects: [
            {
                effectId: 'lowpass',
                parameters: { frequency: 3400, resonance: 1 }
            },
            {
                effectId: 'highpass',
                parameters: { frequency: 300, resonance: 1 }
            },
            {
                effectId: 'bitcrusher',
                parameters: { bits: 12, sampleRate: 8000 }
            }
        ]
    },
    {
        id: 'robot',
        name: 'Robot Voice',
        description: 'Robotic transformation',
        effects: [
            {
                effectId: 'pitchShift',
                parameters: { shift: -3 }
            },
            {
                effectId: 'bitcrusher',
                parameters: { bits: 8, sampleRate: 11025 }
            },
            {
                effectId: 'phaser',
                parameters: { rate: 2, depth: 70, feedback: 50 }
            }
        ]
    },
    {
        id: 'announcement',
        name: 'PA Announcement',
        description: 'Public address system',
        effects: [
            {
                effectId: 'lowpass',
                parameters: { frequency: 4000, resonance: 2 }
            },
            {
                effectId: 'distortion',
                parameters: { drive: 20, tone: 30 }
            },
            {
                effectId: 'reverb',
                parameters: { roomSize: 70, decay: 1.5, wetDry: 20 }
            }
        ]
    },
    {
        id: 'cinematic',
        name: 'Cinematic',
        description: 'Movie trailer style',
        effects: [
            {
                effectId: 'eq',
                parameters: { lowFreq: 4, midFreq: 2, highFreq: -2 }
            },
            {
                effectId: 'reverb',
                parameters: { roomSize: 80, decay: 3, wetDry: 35 }
            },
            {
                effectId: 'compressor',
                parameters: { threshold: -22, ratio: 8, attack: 15, release: 200 }
            }
        ]
    },
    {
        id: 'underwater',
        name: 'Underwater',
        description: 'Submerged sound effect',
        effects: [
            {
                effectId: 'lowpass',
                parameters: { frequency: 800, resonance: 5 }
            },
            {
                effectId: 'chorus',
                parameters: { rate: 0.3, depth: 80, wetDry: 60 }
            }
        ]
    }
];

// Audio Effects Processor Class
export class AudioEffectsProcessor {
    private audioContext: AudioContext;
    private sourceNode: AudioBufferSourceNode | null = null;
    private effectsChain: AudioNode[] = [];

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
    }

    async applyEffects(
        audioBuffer: AudioBuffer,
        effects: { effectId: string; parameters: Record<string, number | boolean | string> }[]
    ): Promise<AudioBuffer> {
        const offlineContext = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;

        let currentNode: AudioNode = source;

        // Build effects chain
        for (const effect of effects) {
            const effectNode = this.createEffectNode(offlineContext, effect.effectId, effect.parameters);
            if (effectNode) {
                currentNode.connect(effectNode);
                currentNode = effectNode;
            }
        }

        currentNode.connect(offlineContext.destination);
        source.start(0);

        return await offlineContext.startRendering();
    }

    private createEffectNode(
        context: BaseAudioContext,
        effectId: string,
        parameters: Record<string, number | boolean | string>
    ): AudioNode | null {
        switch (effectId) {
            case 'reverb':
                return this.createReverb(context, parameters);
            case 'echo':
                return this.createEcho(context, parameters);
            case 'stereoWidth':
                return this.createStereoWidth(context, parameters);
            case 'compressor':
                return this.createCompressor(context, parameters);
            case 'limiter':
                return this.createLimiter(context, parameters);
            case 'eq':
                return this.createEQ(context, parameters);
            case 'lowpass':
                return this.createLowPass(context, parameters);
            case 'highpass':
                return this.createHighPass(context, parameters);
            case 'chorus':
                return this.createChorus(context, parameters);
            case 'phaser':
                return this.createPhaser(context, parameters);
            case 'distortion':
                return this.createDistortion(context, parameters);
            case 'bitcrusher':
                return this.createBitCrusher(context, parameters);
            case 'pitchShift':
                // Pitch shifting requires more complex implementation
                console.warn('Pitch shifting not yet implemented in Web Audio API');
                return null;
            default:
                return null;
        }
    }

    private createReverb(context: BaseAudioContext, params: Record<string, any>): AudioNode {
        const convolver = context.createConvolver();
        const wetDry = (params.wetDry as number) / 100;
        
        // Create impulse response
        const duration = (params.decay as number) || 2;
        const sampleRate = context.sampleRate;
        const length = sampleRate * duration;
        const impulse = context.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        convolver.buffer = impulse;
        
        // Wet/Dry mix
        const dryGain = context.createGain();
        const wetGain = context.createGain();
        const merger = context.createChannelMerger(2);
        
        dryGain.gain.value = 1 - wetDry;
        wetGain.gain.value = wetDry;
        
        return convolver;
    }

    private createEcho(context: BaseAudioContext, params: Record<string, any>): AudioNode {
        const delay = context.createDelay(5);
        const feedback = context.createGain();
        const wetGain = context.createGain();
        
        delay.delayTime.value = ((params.delayTime as number) || 500) / 1000;
        feedback.gain.value = ((params.feedback as number) || 40) / 100;
        wetGain.gain.value = ((params.wetDry as number) || 30) / 100;
        
        delay.connect(feedback);
        feedback.connect(delay);
        
        return delay;
    }

    private createStereoWidth(context: BaseAudioContext, params: Record<string, any>): AudioNode {
        const splitter = context.createChannelSplitter(2);
        const merger = context.createChannelMerger(2);
        const width = ((params.width as number) || 100) / 100;
        
        const leftGain = context.createGain();
        const rightGain = context.createGain();
        
        leftGain.gain.value = width;
        rightGain.gain.value = width;
        
        splitter.connect(leftGain, 0);
        splitter.connect(rightGain, 1);
        leftGain.connect(merger, 0, 0);
        rightGain.connect(merger, 0, 1);
        
        return splitter;
    }

    private createCompressor(context: BaseAudioContext, params: Record<string, any>): AudioNode {
        const compressor = context.createDynamicsCompressor();
        
        compressor.threshold.value = (params.threshold as number) || -24;
        compressor.ratio.value = (params.ratio as number) || 4;
        compressor.attack.value = ((params.attack as number) || 10) / 1000;
        compressor.release.value = ((params.release as number) || 100) / 1000;
        
        return compressor;
    }

    private createLimiter(context: BaseAudioContext, params: Record<string, any>): AudioNode {
        const limiter = context.createDynamicsCompressor();
        
        limiter.threshold.value = (params.threshold as number) || -1;
        limiter.knee.value = 0;
        limiter.ratio.value = 20;
        limiter.attack.value = 0.001;
        limiter.release.value = 0.01;
        
        return limiter;
    }

    private createEQ(context: BaseAudioContext, params: Record<string, any>): AudioNode {
        const lowShelf = context.createBiquadFilter();
        const midPeak = context.createBiquadFilter();
        const highShelf = context.createBiquadFilter();
        
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 250;
        lowShelf.gain.value = (params.lowFreq as number) || 0;
        
        midPeak.type = 'peaking';
        midPeak.frequency.value = 1000;
        midPeak.Q.value = 1;
        midPeak.gain.value = (params.midFreq as number) || 0;
        
        highShelf.type = 'highshelf';
        highShelf.frequency.value = 4000;
        highShelf.gain.value = (params.highFreq as number) || 0;
        
        lowShelf.connect(midPeak);
        midPeak.connect(highShelf);
        
        return lowShelf;
    }

    private createLowPass(context: BaseAudioContext, params: Record<string, any>): AudioNode {
        const filter = context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = (params.frequency as number) || 5000;
        filter.Q.value = (params.resonance as number) || 1;
        return filter;
    }

    private createHighPass(context: BaseAudioContext, params: Record<string, any>): AudioNode {
        const filter = context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = (params.frequency as number) || 80;
        filter.Q.value = (params.resonance as number) || 1;
        return filter;
    }

    private createChorus(context: BaseAudioContext, params: Record<string, any>): AudioNode {
        const delay = context.createDelay(0.05);
        const lfo = context.createOscillator();
        const depth = context.createGain();
        
        lfo.frequency.value = (params.rate as number) || 1.5;
        depth.gain.value = (((params.depth as number) || 50) / 100) * 0.01;
        
        lfo.connect(depth);
        depth.connect(delay.delayTime);
        lfo.start();
        
        return delay;
    }

    private createPhaser(context: BaseAudioContext, params: Record<string, any>): AudioNode {
        const allpass = context.createBiquadFilter();
        allpass.type = 'allpass';
        allpass.frequency.value = 1000;
        
        const lfo = context.createOscillator();
        const depth = context.createGain();
        
        lfo.frequency.value = (params.rate as number) || 0.5;
        depth.gain.value = (((params.depth as number) || 50) / 100) * 1000;
        
        lfo.connect(depth);
        depth.connect(allpass.frequency);
        lfo.start();
        
        return allpass;
    }

    private createDistortion(context: BaseAudioContext, params: Record<string, any>): AudioNode {
        const distortion = context.createWaveShaper();
        const drive = ((params.drive as number) || 30) / 100;
        
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + drive) * x * 20 * deg) / (Math.PI + drive * Math.abs(x));
        }
        
        distortion.curve = curve;
        distortion.oversample = '4x';
        
        return distortion;
    }

    private createBitCrusher(context: BaseAudioContext, params: Record<string, any>): AudioNode {
        const crusher = context.createScriptProcessor(4096, 1, 1);
        const bits = (params.bits as number) || 8;
        const normFreq = ((params.sampleRate as number) || 8000) / context.sampleRate;
        
        let phase = 0;
        let lastValue = 0;
        
        crusher.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const output = e.outputBuffer.getChannelData(0);
            
            for (let i = 0; i < input.length; i++) {
                phase += normFreq;
                if (phase >= 1.0) {
                    phase -= 1.0;
                    const step = Math.pow(2, bits);
                    lastValue = Math.floor(input[i] * step) / step;
                }
                output[i] = lastValue;
            }
        };
        
        return crusher;
    }
}

// Utility functions
export function getEffectById(effectId: string): AudioEffect | undefined {
    return AUDIO_EFFECTS.find(e => e.id === effectId);
}

export function getEffectsByCategory(category: string): AudioEffect[] {
    return AUDIO_EFFECTS.filter(e => e.category === category);
}

export function getPresetById(presetId: string): EffectPreset | undefined {
    return EFFECT_PRESETS.find(p => p.id === presetId);
}

export function exportEffectChain(effects: { effectId: string; parameters: Record<string, any> }[]): string {
    return JSON.stringify(effects, null, 2);
}

export function importEffectChain(json: string): { effectId: string; parameters: Record<string, any> }[] {
    try {
        return JSON.parse(json);
    } catch (error) {
        console.error('Failed to import effect chain:', error);
        return [];
    }
}
