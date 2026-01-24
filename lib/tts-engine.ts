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
        this.mediaRecorder = new MediaRecorder(this.mediaStreamDestination.stream, {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 128000,
        });
        this.audioChunks = [];
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };
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
            this.utterance = new SpeechSynthesisUtterance(text);
            const matchingVoice = this.findMatchingVoice(voice);
            if (matchingVoice) {
                this.utterance.voice = matchingVoice;
            }
            this.utterance.rate = options?.rate ?? voice.rate ?? 1;
            this.utterance.pitch = options?.pitch ?? voice.pitch ?? 1;
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
                this.utterance = new SpeechSynthesisUtterance(text);
                const matchingVoice = this.findMatchingVoice(voice);
                if (matchingVoice) {
                    this.utterance.voice = matchingVoice;
                }
                this.utterance.rate = options?.rate ?? voice.rate ?? 1;
                this.utterance.pitch = options?.pitch ?? voice.pitch ?? 1;
                this.utterance.volume = options?.volume ?? 1;
                this.utterance.lang = voice.language === "hi" ? "hi-IN" : "en-US";
                this.utterance.onstart = () => options?.onStart?.();
                this.utterance.onend = () => {
                    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
                        this.mediaRecorder.stop();
                        this.mediaRecorder.onstop = () => {
                            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
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
