// Audio Enhancement and Noise Reduction utilities

export interface EnhancementConfig {
    noiseReduction: number; // 0-100%
    deEsser: number; // 0-100%
    breathRemoval: number; // 0-100%
    clickRemoval: number; // 0-100%
    normalize: boolean;
    compression: number; // 0-100%
    brightness: number; // -50 to +50
    warmth: number; // -50 to +50
    clarity: number; // 0-100%
}

export interface EnhancementPreset {
    id: string;
    name: string;
    description: string;
    config: EnhancementConfig;
    category: 'restore' | 'enhance' | 'master' | 'voice';
}

export const ENHANCEMENT_PRESETS: EnhancementPreset[] = [
    // Restoration Presets
    {
        id: 'clean-speech',
        name: 'Clean Speech',
        description: 'Remove background noise from speech recordings',
        category: 'restore',
        config: {
            noiseReduction: 70,
            deEsser: 30,
            breathRemoval: 40,
            clickRemoval: 50,
            normalize: true,
            compression: 40,
            brightness: 5,
            warmth: 0,
            clarity: 60
        }
    },
    {
        id: 'podcast-cleanup',
        name: 'Podcast Cleanup',
        description: 'Professional podcast audio restoration',
        category: 'restore',
        config: {
            noiseReduction: 60,
            deEsser: 40,
            breathRemoval: 50,
            clickRemoval: 60,
            normalize: true,
            compression: 50,
            brightness: 10,
            warmth: 5,
            clarity: 70
        }
    },
    {
        id: 'remove-hiss',
        name: 'Remove Hiss',
        description: 'Eliminate tape hiss and white noise',
        category: 'restore',
        config: {
            noiseReduction: 85,
            deEsser: 20,
            breathRemoval: 20,
            clickRemoval: 30,
            normalize: true,
            compression: 30,
            brightness: -5,
            warmth: 0,
            clarity: 50
        }
    },
    {
        id: 'declicker',
        name: 'De-Clicker',
        description: 'Remove clicks, pops, and mouth sounds',
        category: 'restore',
        config: {
            noiseReduction: 30,
            deEsser: 50,
            breathRemoval: 60,
            clickRemoval: 90,
            normalize: true,
            compression: 35,
            brightness: 0,
            warmth: 0,
            clarity: 50
        }
    },

    // Enhancement Presets
    {
        id: 'voice-enhance',
        name: 'Voice Enhance',
        description: 'Boost vocal clarity and presence',
        category: 'enhance',
        config: {
            noiseReduction: 40,
            deEsser: 35,
            breathRemoval: 30,
            clickRemoval: 40,
            normalize: true,
            compression: 45,
            brightness: 15,
            warmth: 10,
            clarity: 80
        }
    },
    {
        id: 'radio-ready',
        name: 'Radio Ready',
        description: 'Broadcast-quality vocal processing',
        category: 'enhance',
        config: {
            noiseReduction: 50,
            deEsser: 45,
            breathRemoval: 40,
            clickRemoval: 50,
            normalize: true,
            compression: 60,
            brightness: 20,
            warmth: 15,
            clarity: 85
        }
    },
    {
        id: 'warm-voice',
        name: 'Warm Voice',
        description: 'Add warmth and richness to vocals',
        category: 'enhance',
        config: {
            noiseReduction: 45,
            deEsser: 30,
            breathRemoval: 25,
            clickRemoval: 35,
            normalize: true,
            compression: 40,
            brightness: -5,
            warmth: 25,
            clarity: 60
        }
    },
    {
        id: 'crystal-clear',
        name: 'Crystal Clear',
        description: 'Maximum clarity and articulation',
        category: 'enhance',
        config: {
            noiseReduction: 55,
            deEsser: 40,
            breathRemoval: 35,
            clickRemoval: 45,
            normalize: true,
            compression: 50,
            brightness: 25,
            warmth: 0,
            clarity: 90
        }
    },

    // Mastering Presets
    {
        id: 'audiobook-master',
        name: 'Audiobook Master',
        description: 'ACX-compliant audiobook mastering',
        category: 'master',
        config: {
            noiseReduction: 65,
            deEsser: 45,
            breathRemoval: 55,
            clickRemoval: 60,
            normalize: true,
            compression: 55,
            brightness: 8,
            warmth: 12,
            clarity: 75
        }
    },
    {
        id: 'youtube-optimize',
        name: 'YouTube Optimize',
        description: 'Optimized for YouTube content',
        category: 'master',
        config: {
            noiseReduction: 50,
            deEsser: 40,
            breathRemoval: 45,
            clickRemoval: 50,
            normalize: true,
            compression: 60,
            brightness: 15,
            warmth: 10,
            clarity: 80
        }
    },
    {
        id: 'streaming-master',
        name: 'Streaming Master',
        description: 'Professional streaming audio',
        category: 'master',
        config: {
            noiseReduction: 60,
            deEsser: 50,
            breathRemoval: 50,
            clickRemoval: 55,
            normalize: true,
            compression: 65,
            brightness: 18,
            warmth: 8,
            clarity: 85
        }
    },

    // Voice-Specific Presets
    {
        id: 'male-voice',
        name: 'Male Voice Optimize',
        description: 'Optimized for male vocals',
        category: 'voice',
        config: {
            noiseReduction: 50,
            deEsser: 35,
            breathRemoval: 40,
            clickRemoval: 45,
            normalize: true,
            compression: 50,
            brightness: 5,
            warmth: 20,
            clarity: 70
        }
    },
    {
        id: 'female-voice',
        name: 'Female Voice Optimize',
        description: 'Optimized for female vocals',
        category: 'voice',
        config: {
            noiseReduction: 50,
            deEsser: 50,
            breathRemoval: 35,
            clickRemoval: 45,
            normalize: true,
            compression: 45,
            brightness: 15,
            warmth: 10,
            clarity: 75
        }
    }
];

export class AudioEnhancer {
    private audioContext: AudioContext;

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
    }

    /**
     * Apply enhancement configuration to audio buffer
     */
    async enhance(audioBuffer: AudioBuffer, config: EnhancementConfig): Promise<AudioBuffer> {
        let processedBuffer = audioBuffer;

        // Apply noise reduction first
        if (config.noiseReduction > 0) {
            processedBuffer = await this.applyNoiseReduction(processedBuffer, config.noiseReduction);
        }

        // Remove clicks and pops
        if (config.clickRemoval > 0) {
            processedBuffer = this.removeClicks(processedBuffer, config.clickRemoval);
        }

        // Remove breaths
        if (config.breathRemoval > 0) {
            processedBuffer = this.removeBreaths(processedBuffer, config.breathRemoval);
        }

        // Apply de-esser
        if (config.deEsser > 0) {
            processedBuffer = this.applyDeEsser(processedBuffer, config.deEsser);
        }

        // Apply EQ (brightness and warmth)
        if (config.brightness !== 0 || config.warmth !== 0) {
            processedBuffer = this.applyEQ(processedBuffer, config.brightness, config.warmth);
        }

        // Apply clarity enhancement
        if (config.clarity > 0) {
            processedBuffer = this.enhanceClarity(processedBuffer, config.clarity);
        }

        // Apply compression
        if (config.compression > 0) {
            processedBuffer = this.applyCompression(processedBuffer, config.compression);
        }

        // Normalize if requested
        if (config.normalize) {
            processedBuffer = this.normalize(processedBuffer);
        }

        return processedBuffer;
    }

    /**
     * Spectral noise reduction using noise profiling
     */
    private async applyNoiseReduction(audioBuffer: AudioBuffer, amount: number): Promise<AudioBuffer> {
        const offline = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        const source = offline.createBufferSource();
        source.buffer = audioBuffer;

        // Create noise gate with adaptive threshold
        const threshold = -40 - (amount / 100) * 20; // -40dB to -60dB
        const noiseGate = this.createNoiseGate(audioBuffer, threshold);

        // Apply spectral subtraction
        const enhanced = this.spectralSubtraction(audioBuffer, noiseGate, amount / 100);

        source.connect(offline.destination);
        source.start(0);

        return enhanced;
    }

    /**
     * Create noise profile from quiet sections
     */
    private createNoiseGate(audioBuffer: AudioBuffer, thresholdDb: number): Float32Array {
        const channel = audioBuffer.getChannelData(0);
        const threshold = Math.pow(10, thresholdDb / 20);
        const noiseProfile = new Float32Array(channel.length);

        for (let i = 0; i < channel.length; i++) {
            noiseProfile[i] = Math.abs(channel[i]) < threshold ? channel[i] : 0;
        }

        return noiseProfile;
    }

    /**
     * Spectral subtraction noise reduction
     */
    private spectralSubtraction(audioBuffer: AudioBuffer, noiseProfile: Float32Array, strength: number): AudioBuffer {
        const newBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const input = audioBuffer.getChannelData(ch);
            const output = newBuffer.getChannelData(ch);

            // Simple spectral subtraction
            for (let i = 0; i < input.length; i++) {
                const noise = noiseProfile[Math.min(i, noiseProfile.length - 1)];
                const cleaned = input[i] - (noise * strength);
                output[i] = cleaned;
            }
        }

        return newBuffer;
    }

    /**
     * Remove clicks and pops using median filtering
     */
    private removeClicks(audioBuffer: AudioBuffer, intensity: number): AudioBuffer {
        const newBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        const windowSize = Math.floor(3 + (intensity / 100) * 7); // 3-10 samples
        const threshold = 0.1 + (intensity / 100) * 0.4; // 0.1-0.5

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const input = audioBuffer.getChannelData(ch);
            const output = newBuffer.getChannelData(ch);

            for (let i = 0; i < input.length; i++) {
                // Detect sudden amplitude changes
                if (i > 0 && Math.abs(input[i] - input[i - 1]) > threshold) {
                    // Replace with median of surrounding samples
                    const window: number[] = [];
                    for (let j = Math.max(0, i - windowSize); j < Math.min(input.length, i + windowSize); j++) {
                        window.push(input[j]);
                    }
                    window.sort((a, b) => a - b);
                    output[i] = window[Math.floor(window.length / 2)];
                } else {
                    output[i] = input[i];
                }
            }
        }

        return newBuffer;
    }

    /**
     * Remove breath sounds using energy detection
     */
    private removeBreaths(audioBuffer: AudioBuffer, intensity: number): AudioBuffer {
        const newBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        const windowSize = Math.floor(audioBuffer.sampleRate * 0.05); // 50ms window
        const breathThreshold = 0.02 + (intensity / 100) * 0.08; // 0.02-0.1

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const input = audioBuffer.getChannelData(ch);
            const output = newBuffer.getChannelData(ch);

            for (let i = 0; i < input.length; i++) {
                // Calculate local energy
                let energy = 0;
                for (let j = Math.max(0, i - windowSize); j < Math.min(input.length, i + windowSize); j++) {
                    energy += input[j] * input[j];
                }
                energy = Math.sqrt(energy / windowSize);

                // Detect and remove breaths (low energy, broadband)
                if (energy < breathThreshold) {
                    output[i] = input[i] * (1 - intensity / 100);
                } else {
                    output[i] = input[i];
                }
            }
        }

        return newBuffer;
    }

    /**
     * De-esser to reduce sibilance
     */
    private applyDeEsser(audioBuffer: AudioBuffer, intensity: number): AudioBuffer {
        const newBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        // Sibilance is typically 5kHz-10kHz
        const sibilanceFreq = 7000;
        const bandwidth = 3000;
        const threshold = 0.3 - (intensity / 100) * 0.2; // 0.3-0.1

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const input = audioBuffer.getChannelData(ch);
            const output = newBuffer.getChannelData(ch);

            // Simple high-frequency detection and reduction
            for (let i = 1; i < input.length - 1; i++) {
                // High-frequency content approximation
                const highFreq = Math.abs(input[i] - input[i - 1]);
                
                if (highFreq > threshold) {
                    const reduction = 1 - (intensity / 100) * 0.7;
                    output[i] = input[i] * reduction;
                } else {
                    output[i] = input[i];
                }
            }
        }

        return newBuffer;
    }

    /**
     * Apply EQ for brightness and warmth
     */
    private applyEQ(audioBuffer: AudioBuffer, brightness: number, warmth: number): AudioBuffer {
        const newBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        // Simple EQ curves
        const brightnessGain = 1 + (brightness / 100);
        const warmthGain = 1 + (warmth / 100);

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const input = audioBuffer.getChannelData(ch);
            const output = newBuffer.getChannelData(ch);

            for (let i = 0; i < input.length; i++) {
                let sample = input[i];

                // Brightness (boost highs)
                if (brightness > 0 && i > 0) {
                    const highPass = (sample - input[i - 1]) * brightnessGain;
                    sample = sample + highPass * 0.3;
                } else if (brightness < 0) {
                    sample = sample * brightnessGain;
                }

                // Warmth (boost lows)
                if (warmth !== 0 && i > 10) {
                    let lowPass = 0;
                    for (let j = 0; j < 10; j++) {
                        lowPass += input[i - j];
                    }
                    lowPass /= 10;
                    sample = sample + (lowPass - sample) * (warmth / 50) * 0.3;
                }

                output[i] = sample;
            }
        }

        return newBuffer;
    }

    /**
     * Enhance clarity using harmonic enhancement
     */
    private enhanceClarity(audioBuffer: AudioBuffer, amount: number): AudioBuffer {
        const newBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        const strength = amount / 100;

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const input = audioBuffer.getChannelData(ch);
            const output = newBuffer.getChannelData(ch);

            for (let i = 0; i < input.length; i++) {
                // Add harmonics for clarity
                const enhanced = input[i] * (1 + strength * 0.3);
                output[i] = Math.max(-1, Math.min(1, enhanced));
            }
        }

        return newBuffer;
    }

    /**
     * Apply dynamic range compression
     */
    private applyCompression(audioBuffer: AudioBuffer, ratio: number): AudioBuffer {
        const newBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        const threshold = 0.3;
        const compressionRatio = 1 + (ratio / 100) * 3; // 1:1 to 4:1

        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const input = audioBuffer.getChannelData(ch);
            const output = newBuffer.getChannelData(ch);

            for (let i = 0; i < input.length; i++) {
                const sample = input[i];
                const abs = Math.abs(sample);

                if (abs > threshold) {
                    const excess = abs - threshold;
                    const compressed = threshold + (excess / compressionRatio);
                    output[i] = Math.sign(sample) * compressed;
                } else {
                    output[i] = sample;
                }
            }
        }

        return newBuffer;
    }

    /**
     * Normalize audio to target level
     */
    private normalize(audioBuffer: AudioBuffer, targetLevel: number = 0.95): AudioBuffer {
        const newBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        // Find peak across all channels
        let peak = 0;
        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const data = audioBuffer.getChannelData(ch);
            for (let i = 0; i < data.length; i++) {
                peak = Math.max(peak, Math.abs(data[i]));
            }
        }

        const gain = targetLevel / (peak || 1);

        // Apply gain to all channels
        for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
            const input = audioBuffer.getChannelData(ch);
            const output = newBuffer.getChannelData(ch);

            for (let i = 0; i < input.length; i++) {
                output[i] = input[i] * gain;
            }
        }

        return newBuffer;
    }

    /**
     * Analyze audio quality before and after
     */
    analyzeQuality(audioBuffer: AudioBuffer): {
        rms: number;
        peak: number;
        dynamicRange: number;
        noiseFloor: number;
    } {
        let sumSquares = 0;
        let peak = 0;
        let min = Infinity;

        const channel = audioBuffer.getChannelData(0);

        for (let i = 0; i < channel.length; i++) {
            const abs = Math.abs(channel[i]);
            sumSquares += channel[i] * channel[i];
            peak = Math.max(peak, abs);
            if (abs > 0.001) {
                min = Math.min(min, abs);
            }
        }

        const rms = Math.sqrt(sumSquares / channel.length);
        const dynamicRange = 20 * Math.log10(peak / (min || 0.001));
        const noiseFloor = 20 * Math.log10(min || 0.001);

        return { rms, peak, dynamicRange, noiseFloor };
    }
}

export function getPresetsByCategory(category: EnhancementPreset['category']): EnhancementPreset[] {
    return ENHANCEMENT_PRESETS.filter(p => p.category === category);
}

export function getPresetById(id: string): EnhancementPreset | undefined {
    return ENHANCEMENT_PRESETS.find(p => p.id === id);
}

export function getDefaultConfig(): EnhancementConfig {
    return {
        noiseReduction: 0,
        deEsser: 0,
        breathRemoval: 0,
        clickRemoval: 0,
        normalize: false,
        compression: 0,
        brightness: 0,
        warmth: 0,
        clarity: 0
    };
}
