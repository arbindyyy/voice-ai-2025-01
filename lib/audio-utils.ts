// Audio utility functions
export interface AudioData {
    blob: Blob;
    url: string;
    duration: number;
}

export const downloadAudio = (blob: Blob, filename: string = "voice.wav") => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
    const validTypes = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/ogg", "audio/webm", "audio/x-wav", "audio/wave"];
    const minSize = 1 * 1024 * 1024; // 1MB minimum
    const maxSize = 100 * 1024 * 1024; // 100MB maximum
    
    // Check file extension if MIME type is not recognized
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const validExtensions = ['wav', 'mp3', 'ogg', 'webm', 'mpeg'];
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
        return { valid: false, error: "Invalid file type. Please upload WAV, MP3, OGG, or WEBM files." };
    }
    
    if (file.size < minSize) {
        return { valid: false, error: `File too small. Minimum size is 1MB for quality voice cloning.` };
    }
    
    if (file.size > maxSize) {
        return { valid: false, error: `File too large. Maximum size is 100MB.` };
    }
    
    return { valid: true };
};

export const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.onloadedmetadata = () => resolve(audio.duration);
        audio.onerror = () => reject(new Error("Failed to load audio file"));
        audio.src = URL.createObjectURL(file);
    });
};

export const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export interface VoiceProfile {
    pitch: number;
    rate: number;
    energy: number;
    quality: 'low' | 'medium' | 'high';
    estimatedDuration: number;
}

export const analyzeAudioForCloning = async (file: File): Promise<VoiceProfile> => {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        audio.onloadedmetadata = async () => {
            try {
                const duration = audio.duration;
                const quality = file.size > 50 * 1024 * 1024 ? 'high' : 
                               file.size > 10 * 1024 * 1024 ? 'medium' : 'low';
                
                // Basic voice profile estimation
                const profile: VoiceProfile = {
                    pitch: 1.0,
                    rate: 1.0,
                    energy: 1.0,
                    quality,
                    estimatedDuration: duration
                };
                
                resolve(profile);
            } catch (error) {
                reject(new Error('Failed to analyze audio file'));
            }
        };
        
        audio.onerror = () => reject(new Error('Failed to load audio for analysis'));
        audio.src = URL.createObjectURL(file);
    });
};

export const extractVoiceFeatures = async (files: File[]): Promise<{
    totalDuration: number;
    averageQuality: string;
    voiceCharacteristics: string;
}> => {
    let totalDuration = 0;
    let totalSize = 0;
    
    for (const file of files) {
        try {
            const duration = await getAudioDuration(file);
            totalDuration += duration;
            totalSize += file.size;
        } catch (error) {
            console.error('Error analyzing file:', file.name);
        }
    }
    
    const avgSize = totalSize / files.length;
    const quality = avgSize > 50 * 1024 * 1024 ? 'High Quality (50MB+)' :
                   avgSize > 10 * 1024 * 1024 ? 'Medium Quality (10-50MB)' : 
                   'Standard Quality (1-10MB)';
    
    const characteristics = totalDuration >= 60 ? 'Excellent sample data' :
                           totalDuration >= 30 ? 'Good sample data' :
                           'Minimum sample data - consider adding more';
    
    return {
        totalDuration,
        averageQuality: quality,
        voiceCharacteristics: characteristics
    };
};

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
