// Advanced Audio Utilities with Editing Capabilities

export interface AudioData {
    blob: Blob;
    url: string;
    duration: number;
}

export interface AudioHistory {
    blob: Blob;
    timestamp: number;
    action: string;
}

// Convert blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Download audio file with format conversion
export const downloadAudio = async (
    blob: Blob,
    filename: string = "voice",
    format: "webm" | "wav" | "mp3" | "ogg" = "webm"
) => {
    let finalBlob = blob;
    let finalFilename = `${filename}.${format}`;

    // For WebM, download directly
    if (format === "webm") {
        const url = URL.createObjectURL(finalBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = finalFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
    }

    // For other formats, convert using Web Audio API
    try {
        const audioContext = new AudioContext();
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Convert to WAV
        const wavBlob = await audioBufferToWav(audioBuffer);

        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Format conversion error:", error);
        // Fallback to WebM if conversion fails
        downloadAudio(blob, filename, "webm");
    }
};

// Convert AudioBuffer to WAV
const audioBufferToWav = (audioBuffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve) => {
        const numberOfChannels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length * numberOfChannels * 2;
        const buffer = new ArrayBuffer(44 + length);
        const view = new DataView(buffer);
        const channels = [];
        let offset = 0;
        let pos = 0;

        // Write WAV header
        const setUint16 = (data: number) => {
            view.setUint16(pos, data, true);
            pos += 2;
        };
        const setUint32 = (data: number) => {
            view.setUint32(pos, data, true);
            pos += 4;
        };

        // "RIFF" chunk descriptor
        setUint32(0x46464952); // "RIFF"
        setUint32(36 + length); // File size - 8
        setUint32(0x45564157); // "WAVE"

        // "fmt " sub-chunk
        setUint32(0x20746d66); // "fmt "
        setUint32(16); // Subchunk1Size (16 for PCM)
        setUint16(1); // AudioFormat (1 for PCM)
        setUint16(numberOfChannels);
        setUint32(audioBuffer.sampleRate);
        setUint32(audioBuffer.sampleRate * numberOfChannels * 2); // ByteRate
        setUint16(numberOfChannels * 2); // BlockAlign
        setUint16(16); // BitsPerSample

        // "data" sub-chunk
        setUint32(0x61746164); // "data"
        setUint32(length);

        // Write audio data
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }

        while (pos < buffer.byteLength) {
            for (let i = 0; i < numberOfChannels; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }

        resolve(new Blob([buffer], { type: "audio/wav" }));
    });
};

// Share audio file
export const shareAudio = async (
    blob: Blob,
    filename: string = "voice.webm",
    title: string = "Voice Creator Audio"
): Promise<boolean> => {
    try {
        // Check if Web Share API is supported
        if (navigator.share && navigator.canShare) {
            const file = new File([blob], filename, { type: blob.type });

            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: title,
                    text: "Check out this voice I created!",
                });
                return true;
            }
        }

        // Fallback: Copy shareable link
        const url = URL.createObjectURL(blob);
        await navigator.clipboard.writeText(url);
        alert("Audio URL copied to clipboard!");
        return true;
    } catch (error) {
        console.error("Share error:", error);
        return false;
    }
};

// Copy audio URL to clipboard
export const copyAudioURL = async (blob: Blob): Promise<string> => {
    const url = URL.createObjectURL(blob);
    try {
        await navigator.clipboard.writeText(url);
        return url;
    } catch (error) {
        console.error("Copy error:", error);
        throw error;
    }
};

// Validate audio file
export const validateAudioFile = (
    file: File
): { valid: boolean; error?: string } => {
    const validTypes = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/ogg", "audio/webm"];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: "Invalid file type. Please upload WAV, MP3, or OGG files.",
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: "File too large. Maximum size is 50MB.",
        };
    }

    return { valid: true };
};

// Get audio duration
export const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.onloadedmetadata = () => {
            resolve(audio.duration);
        };
        audio.onerror = () => {
            reject(new Error("Failed to load audio file"));
        };
        audio.src = URL.createObjectURL(file);
    });
};

// Format duration (seconds to MM:SS)
export const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Audio Editor Class
export class AudioEditor {
    private audioContext: AudioContext;
    private audioBuffer: AudioBuffer | null = null;
    private history: AudioHistory[] = [];
    private maxHistorySize = 10;

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Load audio from blob
    async loadAudio(blob: Blob): Promise<void> {
        const arrayBuffer = await blob.arrayBuffer();
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.addToHistory(blob, "Load");
    }

    // Trim audio (start and end in seconds)
    async trim(startTime: number, endTime: number): Promise<Blob> {
        if (!this.audioBuffer) throw new Error("No audio loaded");

        const sampleRate = this.audioBuffer.sampleRate;
        const startSample = Math.floor(startTime * sampleRate);
        const endSample = Math.floor(endTime * sampleRate);
        const length = endSample - startSample;

        const trimmedBuffer = this.audioContext.createBuffer(
            this.audioBuffer.numberOfChannels,
            length,
            sampleRate
        );

        for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            const channelData = this.audioBuffer.getChannelData(channel);
            const trimmedData = trimmedBuffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                trimmedData[i] = channelData[startSample + i];
            }
        }

        this.audioBuffer = trimmedBuffer;
        const blob = await audioBufferToWav(trimmedBuffer);
        this.addToHistory(blob, "Trim");
        return blob;
    }

    // Adjust volume (multiplier: 0.5 = 50%, 2.0 = 200%)
    async adjustVolume(multiplier: number): Promise<Blob> {
        if (!this.audioBuffer) throw new Error("No audio loaded");

        const newBuffer = this.audioContext.createBuffer(
            this.audioBuffer.numberOfChannels,
            this.audioBuffer.length,
            this.audioBuffer.sampleRate
        );

        for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            const channelData = this.audioBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                newData[i] = Math.max(-1, Math.min(1, channelData[i] * multiplier));
            }
        }

        this.audioBuffer = newBuffer;
        const blob = await audioBufferToWav(newBuffer);
        this.addToHistory(blob, "Volume");
        return blob;
    }

    // Fade in/out
    async fade(type: "in" | "out", duration: number): Promise<Blob> {
        if (!this.audioBuffer) throw new Error("No audio loaded");

        const sampleRate = this.audioBuffer.sampleRate;
        const fadeSamples = Math.floor(duration * sampleRate);

        const newBuffer = this.audioContext.createBuffer(
            this.audioBuffer.numberOfChannels,
            this.audioBuffer.length,
            sampleRate
        );

        for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            const channelData = this.audioBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);

            for (let i = 0; i < channelData.length; i++) {
                let gain = 1;

                if (type === "in" && i < fadeSamples) {
                    gain = i / fadeSamples;
                } else if (type === "out" && i > channelData.length - fadeSamples) {
                    gain = (channelData.length - i) / fadeSamples;
                }

                newData[i] = channelData[i] * gain;
            }
        }

        this.audioBuffer = newBuffer;
        const blob = await audioBufferToWav(newBuffer);
        this.addToHistory(blob, `Fade ${type}`);
        return blob;
    }

    // Reverse audio
    async reverse(): Promise<Blob> {
        if (!this.audioBuffer) throw new Error("No audio loaded");

        const newBuffer = this.audioContext.createBuffer(
            this.audioBuffer.numberOfChannels,
            this.audioBuffer.length,
            this.audioBuffer.sampleRate
        );

        for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            const channelData = this.audioBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                newData[i] = channelData[channelData.length - 1 - i];
            }
        }

        this.audioBuffer = newBuffer;
        const blob = await audioBufferToWav(newBuffer);
        this.addToHistory(blob, "Reverse");
        return blob;
    }

    // Normalize audio
    async normalize(): Promise<Blob> {
        if (!this.audioBuffer) throw new Error("No audio loaded");

        let maxAmplitude = 0;

        // Find max amplitude
        for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            const channelData = this.audioBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                maxAmplitude = Math.max(maxAmplitude, Math.abs(channelData[i]));
            }
        }

        const multiplier = 1 / maxAmplitude;
        return this.adjustVolume(multiplier);
    }

    // Undo last action
    undo(): Blob | null {
        if (this.history.length < 2) return null;
        this.history.pop(); // Remove current
        const previous = this.history[this.history.length - 1];
        return previous.blob;
    }

    // Get history
    getHistory(): AudioHistory[] {
        return this.history;
    }

    // Add to history
    private addToHistory(blob: Blob, action: string): void {
        this.history.push({
            blob,
            timestamp: Date.now(),
            action,
        });

        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    // Export current audio
    async export(): Promise<Blob> {
        if (!this.audioBuffer) throw new Error("No audio loaded");
        return audioBufferToWav(this.audioBuffer);
    }

    // Get current duration
    getDuration(): number {
        return this.audioBuffer?.duration || 0;
    }

    // Cleanup
    cleanup(): void {
        this.audioContext.close();
    }
}

// Record audio from microphone
export class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private stream: MediaStream | null = null;

    async start(): Promise<void> {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.start();
        } catch (error) {
            throw new Error("Failed to access microphone");
        }
    }

    async stop(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject(new Error("No recording in progress"));
                return;
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
                this.cleanup();
                resolve(audioBlob);
            };

            this.mediaRecorder.stop();
        });
    }

    private cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    isRecording(): boolean {
        return this.mediaRecorder?.state === "recording";
    }
}
