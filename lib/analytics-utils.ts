// Voice Analytics & Insights Utilities
// Professional audio analysis and quality metrics

export interface AudioMetrics {
    duration: number;              // seconds
    sampleRate: number;            // Hz
    bitDepth: number;              // bits
    channels: number;              // 1=mono, 2=stereo
    fileSize: number;              // bytes
    format: string;                // wav, mp3, etc
}

export interface QualityMetrics {
    overallScore: number;          // 0-100
    clarity: number;               // 0-100
    dynamicRange: number;          // dB
    signalToNoise: number;         // dB
    peakLevel: number;             // dB
    averageLevel: number;          // dB
    clipping: boolean;             // true if clipped
    silenceRatio: number;          // 0-1 (percentage of silence)
}

export interface SpectralAnalysis {
    frequencyRange: { min: number; max: number };
    dominantFrequency: number;     // Hz
    harmonics: number[];           // Hz array
    spectralCentroid: number;      // Hz
    spectralFlatness: number;      // 0-1
    bandwidth: number;             // Hz
}

export interface EmotionAnalysis {
    dominant: string;              // happy, sad, angry, neutral, etc
    confidence: number;            // 0-100
    emotions: {
        happy: number;
        sad: number;
        angry: number;
        neutral: number;
        excited: number;
    };
}

export interface SpeakerProfile {
    gender: 'male' | 'female' | 'unknown';
    confidence: number;            // 0-100
    pitchRange: { min: number; max: number; average: number }; // Hz
    speakingRate: number;          // words per minute
    energy: number;                // 0-100
    voiceType: string;             // bass, tenor, alto, soprano
}

export interface AnalyticsReport {
    id: string;
    timestamp: number;
    audioMetrics: AudioMetrics;
    qualityMetrics: QualityMetrics;
    spectralAnalysis: SpectralAnalysis;
    emotionAnalysis: EmotionAnalysis;
    speakerProfile: SpeakerProfile;
    recommendations: string[];
}

// Voice Analytics Engine
export class VoiceAnalytics {
    private audioContext: AudioContext;

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
    }

    async analyzeAudio(audioBuffer: AudioBuffer, metadata?: { text?: string; format?: string }): Promise<AnalyticsReport> {
        const audioMetrics = this.extractAudioMetrics(audioBuffer, metadata);
        const qualityMetrics = await this.calculateQualityMetrics(audioBuffer);
        const spectralAnalysis = await this.performSpectralAnalysis(audioBuffer);
        const emotionAnalysis = this.detectEmotion(audioBuffer);
        const speakerProfile = this.createSpeakerProfile(audioBuffer);
        const recommendations = this.generateRecommendations(qualityMetrics, spectralAnalysis);

        return {
            id: `analytics-${Date.now()}`,
            timestamp: Date.now(),
            audioMetrics,
            qualityMetrics,
            spectralAnalysis,
            emotionAnalysis,
            speakerProfile,
            recommendations
        };
    }

    private extractAudioMetrics(audioBuffer: AudioBuffer, metadata?: { text?: string; format?: string }): AudioMetrics {
        const duration = audioBuffer.duration;
        const sampleRate = audioBuffer.sampleRate;
        const channels = audioBuffer.numberOfChannels;
        const bitDepth = 16; // WAV default
        const fileSize = audioBuffer.length * channels * (bitDepth / 8);

        return {
            duration,
            sampleRate,
            bitDepth,
            channels,
            fileSize,
            format: metadata?.format || 'wav'
        };
    }

    private async calculateQualityMetrics(audioBuffer: AudioBuffer): Promise<QualityMetrics> {
        const channelData = audioBuffer.getChannelData(0);
        
        // Calculate peak and average levels
        let peak = 0;
        let sum = 0;
        let silenceSamples = 0;
        const silenceThreshold = 0.01;
        
        for (let i = 0; i < channelData.length; i++) {
            const abs = Math.abs(channelData[i]);
            peak = Math.max(peak, abs);
            sum += abs * abs;
            
            if (abs < silenceThreshold) {
                silenceSamples++;
            }
        }
        
        const rms = Math.sqrt(sum / channelData.length);
        const peakLevel = 20 * Math.log10(peak);
        const averageLevel = 20 * Math.log10(rms);
        const dynamicRange = peakLevel - averageLevel;
        
        // Check for clipping
        const clipping = peak >= 0.99;
        
        // Calculate silence ratio
        const silenceRatio = silenceSamples / channelData.length;
        
        // Estimate signal-to-noise ratio
        const noiseFloor = this.estimateNoiseFloor(channelData);
        const signalToNoise = 20 * Math.log10(rms / noiseFloor);
        
        // Calculate clarity (inverse of total harmonic distortion estimate)
        const clarity = Math.min(100, Math.max(0, 70 + signalToNoise / 2));
        
        // Calculate overall score
        let overallScore = 100;
        if (clipping) overallScore -= 30;
        if (dynamicRange < 10) overallScore -= 20;
        if (signalToNoise < 20) overallScore -= 15;
        if (silenceRatio > 0.3) overallScore -= 10;
        overallScore = Math.max(0, Math.min(100, overallScore));
        
        return {
            overallScore,
            clarity,
            dynamicRange,
            signalToNoise,
            peakLevel,
            averageLevel,
            clipping,
            silenceRatio
        };
    }

    private estimateNoiseFloor(channelData: Float32Array): number {
        // Find the quietest 10% of samples
        const sorted = Array.from(channelData).map(Math.abs).sort((a, b) => a - b);
        const quietSamples = sorted.slice(0, Math.floor(sorted.length * 0.1));
        const sum = quietSamples.reduce((a, b) => a + b * b, 0);
        return Math.sqrt(sum / quietSamples.length);
    }

    private async performSpectralAnalysis(audioBuffer: AudioBuffer): Promise<SpectralAnalysis> {
        const offlineContext = new OfflineAudioContext(
            1,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;

        const analyser = offlineContext.createAnalyser();
        analyser.fftSize = 8192;

        source.connect(analyser);
        analyser.connect(offlineContext.destination);
        source.start(0);

        await offlineContext.startRendering();

        const frequencyData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencyData);

        // Find dominant frequency
        let maxValue = 0;
        let maxIndex = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            if (frequencyData[i] > maxValue) {
                maxValue = frequencyData[i];
                maxIndex = i;
            }
        }

        const dominantFrequency = (maxIndex * audioBuffer.sampleRate) / (2 * analyser.frequencyBinCount);

        // Find harmonics (peaks at multiples of dominant frequency)
        const harmonics: number[] = [];
        for (let n = 2; n <= 5; n++) {
            const harmonicFreq = dominantFrequency * n;
            const harmonicIndex = Math.floor((harmonicFreq * 2 * analyser.frequencyBinCount) / audioBuffer.sampleRate);
            if (harmonicIndex < frequencyData.length && frequencyData[harmonicIndex] > maxValue * 0.3) {
                harmonics.push(harmonicFreq);
            }
        }

        // Calculate spectral centroid
        let weightedSum = 0;
        let sum = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            const freq = (i * audioBuffer.sampleRate) / (2 * analyser.frequencyBinCount);
            weightedSum += freq * frequencyData[i];
            sum += frequencyData[i];
        }
        const spectralCentroid = sum > 0 ? weightedSum / sum : 0;

        // Calculate spectral flatness
        let geometricMean = 1;
        let arithmeticMean = 0;
        let count = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            if (frequencyData[i] > 0) {
                geometricMean *= Math.pow(frequencyData[i], 1 / frequencyData.length);
                arithmeticMean += frequencyData[i];
                count++;
            }
        }
        arithmeticMean /= count || 1;
        const spectralFlatness = arithmeticMean > 0 ? geometricMean / arithmeticMean : 0;

        // Calculate bandwidth
        const threshold = maxValue * 0.1;
        let minFreq = 0;
        let maxFreq = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            if (frequencyData[i] > threshold) {
                const freq = (i * audioBuffer.sampleRate) / (2 * analyser.frequencyBinCount);
                if (minFreq === 0) minFreq = freq;
                maxFreq = freq;
            }
        }
        const bandwidth = maxFreq - minFreq;

        return {
            frequencyRange: { min: minFreq, max: maxFreq },
            dominantFrequency,
            harmonics,
            spectralCentroid,
            spectralFlatness,
            bandwidth
        };
    }

    private detectEmotion(audioBuffer: AudioBuffer): EmotionAnalysis {
        const channelData = audioBuffer.getChannelData(0);
        
        // Calculate energy (average amplitude)
        let energy = 0;
        for (let i = 0; i < channelData.length; i++) {
            energy += Math.abs(channelData[i]);
        }
        energy /= channelData.length;

        // Calculate variance (indicates excitement/energy)
        let variance = 0;
        const mean = energy;
        for (let i = 0; i < channelData.length; i++) {
            variance += Math.pow(Math.abs(channelData[i]) - mean, 2);
        }
        variance /= channelData.length;

        // Simple heuristic-based emotion detection
        const emotions = {
            happy: 0,
            sad: 0,
            angry: 0,
            neutral: 0,
            excited: 0
        };

        // High energy + high variance = excited/happy
        if (energy > 0.15 && variance > 0.02) {
            emotions.excited = 70;
            emotions.happy = 60;
            emotions.neutral = 20;
        }
        // High energy + moderate variance = angry
        else if (energy > 0.12 && variance > 0.015) {
            emotions.angry = 65;
            emotions.excited = 30;
            emotions.neutral = 20;
        }
        // Low energy = sad
        else if (energy < 0.08) {
            emotions.sad = 70;
            emotions.neutral = 40;
            emotions.happy = 10;
        }
        // Moderate energy, low variance = neutral
        else {
            emotions.neutral = 80;
            emotions.happy = 30;
            emotions.sad = 20;
        }

        // Find dominant emotion
        let dominant = 'neutral';
        let maxScore = 0;
        for (const [emotion, score] of Object.entries(emotions)) {
            if (score > maxScore) {
                maxScore = score;
                dominant = emotion;
            }
        }

        return {
            dominant,
            confidence: maxScore,
            emotions
        };
    }

    private createSpeakerProfile(audioBuffer: AudioBuffer): SpeakerProfile {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        
        // Estimate pitch using autocorrelation
        const pitches: number[] = [];
        const windowSize = Math.floor(sampleRate * 0.03); // 30ms windows
        const hopSize = Math.floor(windowSize / 2);
        
        for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
            const window = channelData.slice(i, i + windowSize);
            const pitch = this.detectPitch(window, sampleRate);
            if (pitch > 0) {
                pitches.push(pitch);
            }
        }

        // Calculate pitch statistics
        const validPitches = pitches.filter(p => p > 50 && p < 500);
        const minPitch = Math.min(...validPitches);
        const maxPitch = Math.max(...validPitches);
        const avgPitch = validPitches.reduce((a, b) => a + b, 0) / (validPitches.length || 1);

        // Determine gender based on average pitch
        let gender: 'male' | 'female' | 'unknown' = 'unknown';
        let genderConfidence = 0;
        
        if (avgPitch < 165) {
            gender = 'male';
            genderConfidence = Math.min(90, (165 - avgPitch) / 2 + 50);
        } else if (avgPitch > 165) {
            gender = 'female';
            genderConfidence = Math.min(90, (avgPitch - 165) / 2 + 50);
        }

        // Determine voice type
        let voiceType = 'unknown';
        if (gender === 'male') {
            if (avgPitch < 130) voiceType = 'bass';
            else if (avgPitch < 165) voiceType = 'tenor';
        } else if (gender === 'female') {
            if (avgPitch < 220) voiceType = 'alto';
            else voiceType = 'soprano';
        }

        // Estimate speaking rate (very rough)
        const duration = audioBuffer.duration;
        const energy = channelData.reduce((sum, val) => sum + Math.abs(val), 0) / channelData.length;
        const speakingRate = energy > 0.05 ? Math.floor(120 + (energy - 0.05) * 300) : 0;

        // Calculate energy level
        const energyLevel = Math.min(100, energy * 500);

        return {
            gender,
            confidence: genderConfidence,
            pitchRange: { min: minPitch, max: maxPitch, average: avgPitch },
            speakingRate,
            energy: energyLevel,
            voiceType
        };
    }

    private detectPitch(buffer: Float32Array, sampleRate: number): number {
        // Simple autocorrelation-based pitch detection
        const maxLag = Math.floor(sampleRate / 50); // 50 Hz minimum
        const minLag = Math.floor(sampleRate / 500); // 500 Hz maximum
        
        let maxCorr = 0;
        let bestLag = 0;
        
        for (let lag = minLag; lag < maxLag; lag++) {
            let corr = 0;
            for (let i = 0; i < buffer.length - lag; i++) {
                corr += buffer[i] * buffer[i + lag];
            }
            
            if (corr > maxCorr) {
                maxCorr = corr;
                bestLag = lag;
            }
        }
        
        return bestLag > 0 ? sampleRate / bestLag : 0;
    }

    private generateRecommendations(quality: QualityMetrics, spectral: SpectralAnalysis): string[] {
        const recommendations: string[] = [];

        if (quality.clipping) {
            recommendations.push('⚠️ Audio clipping detected. Reduce input gain or volume.');
        }

        if (quality.dynamicRange < 10) {
            recommendations.push('📊 Low dynamic range. Consider using less compression.');
        }

        if (quality.signalToNoise < 30) {
            recommendations.push('🔊 Low signal-to-noise ratio. Record in a quieter environment.');
        }

        if (quality.silenceRatio > 0.3) {
            recommendations.push('⏱️ High silence ratio. Consider trimming silence from recording.');
        }

        if (spectral.bandwidth < 2000) {
            recommendations.push('🎵 Narrow frequency range. Check microphone quality.');
        }

        if (spectral.dominantFrequency < 100 || spectral.dominantFrequency > 4000) {
            recommendations.push('🎤 Unusual dominant frequency. Verify proper microphone placement.');
        }

        if (quality.overallScore >= 90) {
            recommendations.push('✅ Excellent audio quality! No improvements needed.');
        } else if (quality.overallScore >= 70) {
            recommendations.push('👍 Good audio quality with minor room for improvement.');
        } else if (quality.overallScore >= 50) {
            recommendations.push('⚡ Moderate quality. Consider the suggestions above.');
        } else {
            recommendations.push('❌ Poor audio quality. Multiple issues need attention.');
        }

        return recommendations;
    }
}

// Utility functions
export function getQualityRating(score: number): { label: string; color: string; icon: string } {
    if (score >= 90) return { label: 'Excellent', color: 'green', icon: '🌟' };
    if (score >= 75) return { label: 'Very Good', color: 'lime', icon: '✅' };
    if (score >= 60) return { label: 'Good', color: 'yellow', icon: '👍' };
    if (score >= 40) return { label: 'Fair', color: 'orange', icon: '⚠️' };
    return { label: 'Poor', color: 'red', icon: '❌' };
}

export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function exportAnalyticsReport(report: AnalyticsReport): string {
    return JSON.stringify(report, null, 2);
}

export function compareReports(report1: AnalyticsReport, report2: AnalyticsReport): {
    qualityImprovement: number;
    durationDiff: number;
    recommendations: string[];
} {
    const qualityImprovement = report2.qualityMetrics.overallScore - report1.qualityMetrics.overallScore;
    const durationDiff = report2.audioMetrics.duration - report1.audioMetrics.duration;
    
    const recommendations: string[] = [];
    
    if (qualityImprovement > 10) {
        recommendations.push('✅ Significant quality improvement detected!');
    } else if (qualityImprovement < -10) {
        recommendations.push('⚠️ Quality has decreased. Review recording conditions.');
    }
    
    if (Math.abs(durationDiff) > 5) {
        recommendations.push(`⏱️ Duration changed by ${Math.abs(durationDiff).toFixed(1)}s`);
    }
    
    return { qualityImprovement, durationDiff, recommendations };
}

// Analytics History Manager
export class AnalyticsHistory {
    private storageKey = 'voice-analytics-history';
    private maxHistory = 50;

    save(report: AnalyticsReport): void {
        const history = this.getAll();
        history.unshift(report);
        
        // Keep only recent reports
        if (history.length > this.maxHistory) {
            history.splice(this.maxHistory);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(history));
    }

    getAll(): AnalyticsReport[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    getById(id: string): AnalyticsReport | null {
        const history = this.getAll();
        return history.find(r => r.id === id) || null;
    }

    delete(id: string): void {
        const history = this.getAll().filter(r => r.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(history));
    }

    clear(): void {
        localStorage.removeItem(this.storageKey);
    }

    getStats(): {
        totalAnalyses: number;
        averageQuality: number;
        totalDuration: number;
        averageFileSize: number;
    } {
        const history = this.getAll();
        
        if (history.length === 0) {
            return {
                totalAnalyses: 0,
                averageQuality: 0,
                totalDuration: 0,
                averageFileSize: 0
            };
        }
        
        const totalQuality = history.reduce((sum, r) => sum + r.qualityMetrics.overallScore, 0);
        const totalDuration = history.reduce((sum, r) => sum + r.audioMetrics.duration, 0);
        const totalFileSize = history.reduce((sum, r) => sum + r.audioMetrics.fileSize, 0);
        
        return {
            totalAnalyses: history.length,
            averageQuality: totalQuality / history.length,
            totalDuration,
            averageFileSize: totalFileSize / history.length
        };
    }
}
