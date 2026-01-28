// TTS Engine using Web Speech API with Recording Support
import { Voice } from "./voice-config";

export class TTSEngine {
    private synth: SpeechSynthesis | null = null;
    private utterance: SpeechSynthesisUtterance | null = null;
    private availableVoices: SpeechSynthesisVoice[] = [];
    private audioContext: AudioContext | null = null;
    private mediaStreamDestination: MediaStreamAudioDestinationNode | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private recordingMimeType: string | null = null;

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

            const emotion = this.detectEmotion(text);
            const processedText = this.processTextForNaturalSpeech(text);
            this.utterance = new SpeechSynthesisUtterance(processedText);
            const matchingVoice = this.findMatchingVoice(voice);
            if (matchingVoice) {
                this.utterance.voice = matchingVoice;
            }

            const baseRate = options?.rate ?? voice.rate ?? 1;
            const basePitch = options?.pitch ?? voice.pitch ?? 1;

            let emotionalRateMod = 1.0;
            let emotionalPitchMod = 1.0;

            switch (emotion.type) {
                case "excited":
                    emotionalRateMod = 1.08 + emotion.intensity * 0.02;
                    emotionalPitchMod = 1.1 + emotion.intensity * 0.02;
                    break;
                case "curious":
                    emotionalRateMod = 0.98;
                    emotionalPitchMod = 1.08;
                    break;
                case "expressive":
                    emotionalRateMod = 1.03;
                    emotionalPitchMod = 1.05;
                    break;
                default:
                    emotionalRateMod = 1.0;
                    emotionalPitchMod = 1.0;
            }

            const rateVariation = 1 + (Math.random() * 0.06 - 0.03);
            const pitchVariation = 1 + (Math.random() * 0.04 - 0.02);

            this.utterance.rate = Math.max(0.5, Math.min(2, baseRate * emotionalRateMod * rateVariation));
            this.utterance.pitch = Math.max(0.5, Math.min(2, basePitch * emotionalPitchMod * pitchVariation));
            this.utterance.volume = options?.volume ?? 1;
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

                const emotion = this.detectEmotion(text);
                const processedText = this.processTextForNaturalSpeech(text);
                this.utterance = new SpeechSynthesisUtterance(processedText);
                const matchingVoice = this.findMatchingVoice(voice);
                if (matchingVoice) {
                    this.utterance.voice = matchingVoice;
                }

                const baseRate = options?.rate ?? voice.rate ?? 1;
                const basePitch = options?.pitch ?? voice.pitch ?? 1;

                let emotionalRateMod = 1.0;
                let emotionalPitchMod = 1.0;

                switch (emotion.type) {
                    case "excited":
                        emotionalRateMod = 1.08 + emotion.intensity * 0.02;
                        emotionalPitchMod = 1.1 + emotion.intensity * 0.02;
                        break;
                    case "curious":
                        emotionalRateMod = 0.98;
                        emotionalPitchMod = 1.08;
                        break;
                    case "expressive":
                        emotionalRateMod = 1.03;
                        emotionalPitchMod = 1.05;
                        break;
                    default:
                        emotionalRateMod = 1.0;
                        emotionalPitchMod = 1.0;
                }

                const rateVariation = 1 + (Math.random() * 0.06 - 0.03);
                const pitchVariation = 1 + (Math.random() * 0.04 - 0.02);

                this.utterance.rate = Math.max(0.5, Math.min(2, baseRate * emotionalRateMod * rateVariation));
                this.utterance.pitch = Math.max(0.5, Math.min(2, basePitch * emotionalPitchMod * pitchVariation));
                this.utterance.volume = options?.volume ?? 1;
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
}

let ttsInstance: TTSEngine | null = null;

export const getTTSEngine = (): TTSEngine => {
    if (!ttsInstance) {
        ttsInstance = new TTSEngine();
    }
    return ttsInstance;
};
