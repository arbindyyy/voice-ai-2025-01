// TTS Engine using Web Speech API with Recording Support and Voice Cloning
import { Voice } from "./voice-config";
import { AudioEffectsProcessor } from "./effects-utils";

export interface ClonedVoiceData {
    audioBlobs: Blob[];
    profile: {
        pitch: number;
        rate: number;
        volume: number;
    };
    quality: 'low' | 'medium' | 'high';
}

export interface AudioEffectConfig {
    effectId: string;
    parameters: Record<string, number | boolean | string>;
}

export type EmotionType = 
    | 'neutral' 
    | 'happy' 
    | 'sad' 
    | 'angry' 
    | 'excited' 
    | 'fearful' 
    | 'surprised' 
    | 'calm' 
    | 'energetic' 
    | 'whisper';

export interface EmotionSettings {
    type: EmotionType;
    intensity: number; // 0-100
}

export interface EmotionProfile {
    pitch: number;
    rate: number;
    volume: number;
    emphasis: boolean;
    pauseMultiplier: number;
}

export interface DialogueLine {
    id: string;
    speaker: string;
    voiceId: string;
    text: string;
    pause?: number; // milliseconds pause after this line
    emotion?: EmotionType;
}

export interface DialogueScript {
    id: string;
    title: string;
    lines: DialogueLine[];
    backgroundMusic?: Blob;
}

export class TTSEngine {
    private synth: SpeechSynthesis | null = null;
    private utterance: SpeechSynthesisUtterance | null = null;
    private availableVoices: SpeechSynthesisVoice[] = [];
    private audioContext: AudioContext | null = null;
    private mediaStreamDestination: MediaStreamAudioDestinationNode | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private recordingMimeType: string | null = null;
    private clonedVoices: Map<string, ClonedVoiceData> = new Map();

    constructor() {
        if (typeof window !== "undefined") {
            this.synth = window.speechSynthesis;
            this.loadVoices();
        }
    }

    private loadVoices() {
        if (!this.synth) return;
        this.availableVoices = this.synth.getVoices();
        if (this.availableVoices.length === 0) {
            this.synth.onvoiceschanged = () => {
                this.availableVoices = this.synth!.getVoices();
            };
        }
    }

    public getAvailableVoices(): SpeechSynthesisVoice[] {
        if (!this.synth) return [];
        return this.synth.getVoices();
    }

    private async setupRecording(): Promise<void> {
        if (typeof window === "undefined") return;
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();
        const preferredTypes = [
            "audio/ogg;codecs=opus",
            "audio/webm;codecs=opus",
            "audio/webm",
        ];
        const supportedType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
        this.recordingMimeType = supportedType ?? null;
        const options: MediaRecorderOptions = {
            audioBitsPerSecond: 256000,
        };
        if (this.recordingMimeType) {
            options.mimeType = this.recordingMimeType;
        }
        this.mediaRecorder = new MediaRecorder(this.mediaStreamDestination.stream, options);
        this.audioChunks = [];
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };
    }

    // Emotion Profile System
    public getEmotionProfile(emotion: EmotionType, intensity: number = 50): EmotionProfile {
        const normalizedIntensity = Math.max(0, Math.min(100, intensity)) / 100;
        const baseProfiles: Record<EmotionType, EmotionProfile> = {
            neutral: {
                pitch: 1.0,
                rate: 1.0,
                volume: 1.0,
                emphasis: false,
                pauseMultiplier: 1.0,
            },
            happy: {
                pitch: 1.0 + (0.2 * normalizedIntensity),
                rate: 1.0 + (0.15 * normalizedIntensity),
                volume: 1.0,
                emphasis: true,
                pauseMultiplier: 0.9,
            },
            sad: {
                pitch: 1.0 - (0.15 * normalizedIntensity),
                rate: 1.0 - (0.2 * normalizedIntensity),
                volume: 0.85,
                emphasis: false,
                pauseMultiplier: 1.3,
            },
            angry: {
                pitch: 1.0 + (0.15 * normalizedIntensity),
                rate: 1.0 + (0.2 * normalizedIntensity),
                volume: 1.0 + (0.1 * normalizedIntensity),
                emphasis: true,
                pauseMultiplier: 0.8,
            },
            excited: {
                pitch: 1.0 + (0.25 * normalizedIntensity),
                rate: 1.0 + (0.25 * normalizedIntensity),
                volume: 1.0,
                emphasis: true,
                pauseMultiplier: 0.7,
            },
            fearful: {
                pitch: 1.0 + (0.1 * normalizedIntensity),
                rate: 1.0 + (0.15 * normalizedIntensity),
                volume: 0.9,
                emphasis: false,
                pauseMultiplier: 0.9,
            },
            surprised: {
                pitch: 1.0 + (0.3 * normalizedIntensity),
                rate: 1.0 + (0.1 * normalizedIntensity),
                volume: 1.0 + (0.05 * normalizedIntensity),
                emphasis: true,
                pauseMultiplier: 0.8,
            },
            calm: {
                pitch: 1.0 - (0.05 * normalizedIntensity),
                rate: 1.0 - (0.1 * normalizedIntensity),
                volume: 0.95,
                emphasis: false,
                pauseMultiplier: 1.2,
            },
            energetic: {
                pitch: 1.0 + (0.1 * normalizedIntensity),
                rate: 1.0 + (0.2 * normalizedIntensity),
                volume: 1.0,
                emphasis: true,
                pauseMultiplier: 0.8,
            },
            whisper: {
                pitch: 1.0 - (0.1 * normalizedIntensity),
                rate: 1.0 - (0.15 * normalizedIntensity),
                volume: 0.6,
                emphasis: false,
                pauseMultiplier: 1.4,
            },
        };

        return baseProfiles[emotion];
    }

    public applyEmotionToText(text: string, emotion: EmotionType, intensity: number = 50): string {
        const profile = this.getEmotionProfile(emotion, intensity);
        let processed = text;

        // Add emphasis markers for strong emotions
        if (profile.emphasis && intensity > 60) {
            processed = processed.replace(/\b(\w{4,})\b/g, (match) => {
                if (Math.random() > 0.7) return match; // Only emphasize some words
                return match;
            });
        }

        // Add pauses based on emotion
        if (emotion === 'calm' || emotion === 'sad') {
            processed = processed.replace(/([.!?])\s+/g, '$1  '); // Double spaces for longer pauses
        } else if (emotion === 'excited' || emotion === 'angry') {
            processed = processed.replace(/,\s+/g, ', '); // Shorter pauses
        }

        return processed;
    }

    private detectEmotion(text: string): { type: string; intensity: number } {
        const exclamations = (text.match(/!/g) || []).length;
        const questions = (text.match(/\?/g) || []).length;
        const allCaps = (text.match(/\b[A-Z]{2,}\b/g) || []).length;
        const emotionalWords = /\b(amazing|wonderful|great|excellent|beautiful|love|happy|sad|angry|excited|wow|awesome|fantastic|incredible)\b/gi;
        const emotionalMatches = (text.match(emotionalWords) || []).length;

        if (exclamations > 1 || allCaps > 0 || emotionalMatches > 2) {
            return { type: "excited", intensity: Math.min(exclamations + allCaps + emotionalMatches, 5) };
        }
        if (questions > 1) {
            return { type: "curious", intensity: questions };
        }
        if (exclamations === 1 || emotionalMatches > 0) {
            return { type: "expressive", intensity: 2 };
        }
        return { type: "neutral", intensity: 1 };
    }

    private addEmotionalProsody(text: string): string {
        let processed = text;

        processed = processed.replace(/\b([A-Z]{2,})\b/g, (match) => {
            return match.charAt(0) + match.slice(1).toLowerCase() + "!";
        });

        processed = processed.replace(/([^!])!+/g, "$1 !");
        processed = processed.replace(/([^?])\?+/g, "$1 ?");

        processed = processed.replace(/\b(amazing|wonderful|great|excellent|beautiful|important|critical)\b/gi, (match) => ` ${match} `);

        return processed;
    }

    private processTextForNaturalSpeech(text: string): string {
        let processed = this.addEmotionalProsody(text);

        processed = processed.replace(/([.!?])\s+/g, "$1  ");
        processed = processed.replace(/,\s+/g, ",  ");
        processed = processed.replace(/;\s+/g, ";  ");
        processed = processed.replace(/:\s+/g, ":  ");

        processed = processed.replace(/\b(\d+)\b/g, " $1 ");
        processed = processed.replace(/\b(and|but|or|so)\b/g, " $1 ");

        return processed.trim().replace(/\s+/g, " ");
    }

    public async speak(
        text: string,
        voice: Voice,
        options?: {
            rate?: number;
            pitch?: number;
            volume?: number;
            emotion?: EmotionType;
            emotionIntensity?: number;
            onEnd?: () => void;
            onStart?: () => void;
            onError?: (error: Error) => void;
        }
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.synth) {
                reject(new Error("Speech synthesis not supported"));
                return;
            }
            this.synth.cancel();

            // Apply emotion if specified
            const emotion = options?.emotion || 'neutral';
            const emotionIntensity = options?.emotionIntensity || 50;
            const emotionProfile = this.getEmotionProfile(emotion, emotionIntensity);
            const processedText = this.applyEmotionToText(
                this.processTextForNaturalSpeech(text),
                emotion,
                emotionIntensity
            );

            this.utterance = new SpeechSynthesisUtterance(processedText);
            const matchingVoice = this.findMatchingVoice(voice);
            if (matchingVoice) {
                this.utterance.voice = matchingVoice;
            }

            // Apply emotion-based modifiers
            const baseRate = options?.rate ?? voice.rate ?? 1;
            const basePitch = options?.pitch ?? voice.pitch ?? 1;
            const baseVolume = options?.volume ?? 1;

            this.utterance.rate = Math.max(0.5, Math.min(2, baseRate * emotionProfile.rate));
            this.utterance.pitch = Math.max(0.5, Math.min(2, basePitch * emotionProfile.pitch));
            this.utterance.volume = Math.max(0.1, Math.min(1, baseVolume * emotionProfile.volume));
            this.utterance.lang = voice.language === "hi" ? "hi-IN" : "en-US";

            this.utterance.onstart = () => options?.onStart?.();
            this.utterance.onend = () => {
                options?.onEnd?.();
                resolve();
            };
            this.utterance.onerror = (event) => {
                const error = new Error(`Speech synthesis error: ${event.error}`);
                options?.onError?.(error);
                reject(error);
            };
            this.synth.speak(this.utterance);
        });
    }

    public async speakAndRecord(
        text: string,
        voice: Voice,
        options?: {
            rate?: number;
            pitch?: number;
            volume?: number;
            emotion?: EmotionType;
            emotionIntensity?: number;
            onEnd?: () => void;
            onStart?: () => void;
            onError?: (error: Error) => void;
        }
    ): Promise<Blob> {
        return new Promise(async (resolve, reject) => {
            if (!this.synth) {
                reject(new Error("Speech synthesis not supported"));
                return;
            }
            try {
                await this.setupRecording();
                if (!this.mediaRecorder) {
                    reject(new Error("Failed to setup recording"));
                    return;
                }
                this.mediaRecorder.start();
                this.synth.cancel();

                // Apply emotion if specified
                const emotion = options?.emotion || 'neutral';
                const emotionIntensity = options?.emotionIntensity || 50;
                const emotionProfile = this.getEmotionProfile(emotion, emotionIntensity);
                const processedText = this.applyEmotionToText(
                    this.processTextForNaturalSpeech(text),
                    emotion,
                    emotionIntensity
                );

                this.utterance = new SpeechSynthesisUtterance(processedText);
                const matchingVoice = this.findMatchingVoice(voice);
                if (matchingVoice) {
                    this.utterance.voice = matchingVoice;
                }

                // Apply emotion-based modifiers
                const baseRate = options?.rate ?? voice.rate ?? 1;
                const basePitch = options?.pitch ?? voice.pitch ?? 1;
                const baseVolume = options?.volume ?? 1;

                this.utterance.rate = Math.max(0.5, Math.min(2, baseRate * emotionProfile.rate));
                this.utterance.pitch = Math.max(0.5, Math.min(2, basePitch * emotionProfile.pitch));
                this.utterance.volume = Math.max(0.1, Math.min(1, baseVolume * emotionProfile.volume));
                this.utterance.lang = voice.language === "hi" ? "hi-IN" : "en-US";

                this.utterance.onstart = () => options?.onStart?.();
                this.utterance.onend = () => {
                    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
                        this.mediaRecorder.stop();
                        this.mediaRecorder.onstop = () => {
                            const mimeType = this.recordingMimeType ?? "audio/webm";
                            const audioBlob = new Blob(this.audioChunks, { type: mimeType });
                            options?.onEnd?.();
                            resolve(audioBlob);
                        };
                    }
                };
                this.utterance.onerror = (event) => {
                    const error = new Error(`Speech synthesis error: ${event.error}`);
                    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
                        this.mediaRecorder.stop();
                    }
                    options?.onError?.(error);
                    reject(error);
                };
                this.synth.speak(this.utterance);
            } catch (error) {
                reject(error);
            }
        });
    }

    private findMatchingVoice(voice: Voice): SpeechSynthesisVoice | null {
        const voices = this.getAvailableVoices();
        let match = voices.find((v) => v.name === voice.webSpeechVoice);
        if (!match) {
            const lang = voice.language === "hi" ? "hi" : "en";
            match = voices.find((v) => v.lang.startsWith(lang));
        }
        if (!match) {
            match = voices.find((v) => v.lang.startsWith("en"));
        }
        return match || null;
    }

    public pause() {
        if (this.synth && this.synth.speaking) {
            this.synth.pause();
        }
    }

    public resume() {
        if (this.synth && this.synth.paused) {
            this.synth.resume();
        }
    }

    public stop() {
        if (this.synth) {
            this.synth.cancel();
        }
        if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
            this.mediaRecorder.stop();
        }
    }

    public isSpeaking(): boolean {
        return this.synth?.speaking ?? false;
    }

    public isPaused(): boolean {
        return this.synth?.paused ?? false;
    }

    public cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.mediaRecorder = null;
        this.mediaStreamDestination = null;
        this.audioChunks = [];
    }

    // Voice Cloning Methods
    public async registerClonedVoice(voiceId: string, audioFiles: File[]): Promise<void> {
        const audioBlobs: Blob[] = [];
        
        for (const file of audioFiles) {
            const blob = new Blob([await file.arrayBuffer()], { type: file.type });
            audioBlobs.push(blob);
        }

        // Analyze audio to extract voice characteristics
        const profile = await this.analyzeVoiceProfile(audioBlobs);
        
        const quality: 'low' | 'medium' | 'high' = 
            audioFiles.reduce((sum, f) => sum + f.size, 0) / audioFiles.length > 50 * 1024 * 1024 ? 'high' :
            audioFiles.reduce((sum, f) => sum + f.size, 0) / audioFiles.length > 10 * 1024 * 1024 ? 'medium' : 'low';

        this.clonedVoices.set(voiceId, {
            audioBlobs,
            profile,
            quality
        });
    }

    private async analyzeVoiceProfile(audioBlobs: Blob[]): Promise<{ pitch: number; rate: number; volume: number }> {
        // Simple voice profile estimation based on audio data
        // In a real implementation, this would use Web Audio API for frequency analysis
        return {
            pitch: 1.0,
            rate: 1.0,
            volume: 1.0
        };
    }

    public getClonedVoice(voiceId: string): ClonedVoiceData | undefined {
        return this.clonedVoices.get(voiceId);
    }

    public hasClonedVoice(voiceId: string): boolean {
        return this.clonedVoices.has(voiceId);
    }

    public removeClonedVoice(voiceId: string): boolean {
        return this.clonedVoices.delete(voiceId);
    }

    public getAllClonedVoices(): string[] {
        return Array.from(this.clonedVoices.keys());
    }

    // Multi-Voice Dialogue Methods
    public async generateDialogue(
        script: DialogueScript,
        voices: Map<string, Voice>,
        onProgress?: (current: number, total: number) => void
    ): Promise<Blob> {
        const audioSegments: { blob: Blob; pause: number }[] = [];
        const total = script.lines.length;

        for (let i = 0; i < script.lines.length; i++) {
            const line = script.lines[i];
            const voice = voices.get(line.voiceId);
            
            if (!voice) {
                throw new Error(`Voice not found: ${line.voiceId}`);
            }

            // Apply emotion modifiers
            const options = this.getEmotionModifiers(line.emotion || 'neutral');
            
            // Generate audio for this line
            const audioBlob = await this.speakAndRecord(line.text, voice, options);
            audioSegments.push({
                blob: audioBlob,
                pause: line.pause || 500 // default 500ms pause
            });

            onProgress?.(i + 1, total);
        }

        // Mix all segments together
        return await this.mixAudioSegments(audioSegments, script.backgroundMusic);
    }

    private getEmotionModifiers(emotion: string): { pitch?: number; rate?: number; volume?: number } {
        switch (emotion) {
            case 'happy':
                return { pitch: 1.15, rate: 1.1, volume: 1.0 };
            case 'sad':
                return { pitch: 0.9, rate: 0.85, volume: 0.9 };
            case 'angry':
                return { pitch: 1.1, rate: 1.15, volume: 1.1 };
            case 'excited':
                return { pitch: 1.2, rate: 1.2, volume: 1.0 };
            case 'neutral':
            default:
                return { pitch: 1.0, rate: 1.0, volume: 1.0 };
        }
    }

    private async mixAudioSegments(
        segments: { blob: Blob; pause: number }[],
        backgroundMusic?: Blob
    ): Promise<Blob> {
        if (typeof window === "undefined") {
            throw new Error("Audio mixing requires browser environment");
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const sampleRate = audioContext.sampleRate;

        // Decode all audio segments
        const decodedSegments: { buffer: AudioBuffer; pause: number }[] = [];
        
        for (const segment of segments) {
            const arrayBuffer = await segment.blob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            decodedSegments.push({ buffer: audioBuffer, pause: segment.pause });
        }

        // Calculate total duration
        let totalDuration = 0;
        for (const segment of decodedSegments) {
            totalDuration += segment.buffer.duration + (segment.pause / 1000);
        }

        // Create output buffer
        const numberOfChannels = 2; // stereo
        const outputBuffer = audioContext.createBuffer(
            numberOfChannels,
            Math.ceil(totalDuration * sampleRate),
            sampleRate
        );

        // Mix segments
        let currentTime = 0;
        for (const segment of decodedSegments) {
            const startSample = Math.floor(currentTime * sampleRate);
            
            for (let channel = 0; channel < Math.min(numberOfChannels, segment.buffer.numberOfChannels); channel++) {
                const outputData = outputBuffer.getChannelData(channel);
                const inputData = segment.buffer.getChannelData(
                    Math.min(channel, segment.buffer.numberOfChannels - 1)
                );
                
                for (let i = 0; i < inputData.length && startSample + i < outputData.length; i++) {
                    outputData[startSample + i] += inputData[i];
                }
            }
            
            currentTime += segment.buffer.duration + (segment.pause / 1000);
        }

        // Add background music if provided
        if (backgroundMusic) {
            try {
                const musicArrayBuffer = await backgroundMusic.arrayBuffer();
                const musicBuffer = await audioContext.decodeAudioData(musicArrayBuffer);
                
                const musicVolume = 0.2; // 20% volume for background music
                
                for (let channel = 0; channel < numberOfChannels; channel++) {
                    const outputData = outputBuffer.getChannelData(channel);
                    const musicData = musicBuffer.getChannelData(
                        Math.min(channel, musicBuffer.numberOfChannels - 1)
                    );
                    
                    for (let i = 0; i < Math.min(outputData.length, musicData.length); i++) {
                        outputData[i] += musicData[i] * musicVolume;
                    }
                }
            } catch (error) {
                console.warn('Failed to add background music:', error);
            }
        }

        // Normalize audio to prevent clipping
        this.normalizeAudioBuffer(outputBuffer);

        // Convert to WAV blob
        return this.audioBufferToWav(outputBuffer);
    }

    private normalizeAudioBuffer(buffer: AudioBuffer): void {
        let maxVal = 0;
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                maxVal = Math.max(maxVal, Math.abs(data[i]));
            }
        }
        
        if (maxVal > 1) {
            const scale = 0.95 / maxVal;
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
                const data = buffer.getChannelData(channel);
                for (let i = 0; i < data.length; i++) {
                    data[i] *= scale;
                }
            }
        }
    }

    private audioBufferToWav(buffer: AudioBuffer): Blob {
        const numberOfChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numberOfChannels * bytesPerSample;
        
        const data = new Float32Array(buffer.length * numberOfChannels);
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < buffer.length; i++) {
                data[i * numberOfChannels + channel] = channelData[i];
            }
        }
        
        const dataLength = data.length * bytesPerSample;
        const bufferLength = 44 + dataLength;
        const arrayBuffer = new ArrayBuffer(bufferLength);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        this.writeString(view, 8, 'WAVE');
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        this.writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);
        
        // Write PCM samples
        let offset = 44;
        for (let i = 0; i < data.length; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    private writeString(view: DataView, offset: number, string: string): void {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    public parseDialogueScript(scriptText: string): DialogueLine[] {
        const lines: DialogueLine[] = [];
        const scriptLines = scriptText.split('\n').filter(line => line.trim());
        
        for (let i = 0; i < scriptLines.length; i++) {
            const line = scriptLines[i].trim();
            
            // Format: [Speaker Name|VoiceID]: Text {emotion} {pause:500}
            const match = line.match(/^\[([^\|]+)\|([^\]]+)\]:\s*(.+?)(?:\s*\{([^}]+)\})?(?:\s*\{pause:(\d+)\})?$/);
            
            if (match) {
                const [, speaker, voiceId, text, emotion, pause] = match;
                lines.push({
                    id: `line-${i}`,
                    speaker: speaker.trim(),
                    voiceId: voiceId.trim(),
                    text: text.trim(),
                    emotion: (emotion?.trim() as any) || 'neutral',
                    pause: pause ? parseInt(pause) : 500
                });
            } else {
                // Simple format: Speaker: Text
                const simpleMatch = line.match(/^([^:]+):\s*(.+)$/);
                if (simpleMatch) {
                    const [, speaker, text] = simpleMatch;
                    lines.push({
                        id: `line-${i}`,
                        speaker: speaker.trim(),
                        voiceId: 'default',
                        text: text.trim(),
                        emotion: 'neutral',
                        pause: 500
                    });
                }
            }
        }
        
        return lines;
    }
}

let ttsInstance: TTSEngine | null = null;

export const getTTSEngine = (): TTSEngine => {
    if (!ttsInstance) {
        ttsInstance = new TTSEngine();
    }
    return ttsInstance;
};

// Helper function to generate speech with effects
export async function generateSpeech(
    text: string,
    voiceId: string,
    options?: {
        emotion?: EmotionType;
        intensity?: number;
        effects?: AudioEffectConfig[];
    }
): Promise<Blob> {
    const engine = getTTSEngine();
    const { voices } = await import('./voice-config');
    const voice = voices.find((v: Voice) => v.id === voiceId);
    
    if (!voice) {
        throw new Error(`Voice ${voiceId} not found`);
    }

    // Generate base audio
    const audioBlob = await engine.speakAndRecord(text, voice, {
        emotion: options?.emotion,
        emotionIntensity: options?.intensity
    });

    // Apply effects if provided
    if (options?.effects && options.effects.length > 0) {
        const audioContext = new AudioContext();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const processor = new AudioEffectsProcessor(audioContext);
        const processedBuffer = await processor.applyEffects(audioBuffer, options.effects);
        
        const wav = audioBufferToWav(processedBuffer);
        await audioContext.close();
        return wav;
    }

    return audioBlob;
}

// Helper to convert AudioBuffer to WAV
function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
            offset += 2;
        }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}
