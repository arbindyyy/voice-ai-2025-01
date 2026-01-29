// Voice Comparison and A/B Testing utilities

export interface ComparisonSample {
    id: string;
    name: string;
    audioBuffer: AudioBuffer;
    metadata: {
        voiceId?: string;
        voiceName?: string;
        text?: string;
        duration: number;
        timestamp: number;
    };
}

export interface ComparisonMetrics {
    // Audio quality metrics
    rms: number;
    peak: number;
    dynamicRange: number;
    averagePitch: number;
    
    // Spectral characteristics
    spectralCentroid: number;
    spectralBrightness: number;
    
    // Temporal features
    speakingRate: number; // WPM estimate
    pauseRatio: number;
    
    // Energy characteristics
    averageEnergy: number;
    energyVariance: number;
}

export interface ComparisonResult {
    sampleA: ComparisonSample;
    sampleB: ComparisonSample;
    metricsA: ComparisonMetrics;
    metricsB: ComparisonMetrics;
    differences: {
        rms: number;
        pitch: number;
        brightness: number;
        energy: number;
        speakingRate: number;
    };
    similarity: number; // 0-100%
    recommendation: string;
}

export class VoiceComparator {
    private audioContext: AudioContext;

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
    }

    /**
     * Analyze a single audio sample
     */
    async analyzeSample(audioBuffer: AudioBuffer): Promise<ComparisonMetrics> {
        const channelData = audioBuffer.getChannelData(0);
        
        return {
            rms: this.calculateRMS(channelData),
            peak: this.calculatePeak(channelData),
            dynamicRange: this.calculateDynamicRange(channelData),
            averagePitch: this.estimatePitch(channelData, audioBuffer.sampleRate),
            spectralCentroid: this.calculateSpectralCentroid(channelData, audioBuffer.sampleRate),
            spectralBrightness: this.calculateBrightness(channelData),
            speakingRate: this.estimateSpeakingRate(channelData, audioBuffer.sampleRate),
            pauseRatio: this.calculatePauseRatio(channelData),
            averageEnergy: this.calculateAverageEnergy(channelData),
            energyVariance: this.calculateEnergyVariance(channelData)
        };
    }

    /**
     * Compare two audio samples
     */
    async compare(sampleA: ComparisonSample, sampleB: ComparisonSample): Promise<ComparisonResult> {
        const metricsA = await this.analyzeSample(sampleA.audioBuffer);
        const metricsB = await this.analyzeSample(sampleB.audioBuffer);

        const differences = {
            rms: this.calculatePercentDifference(metricsA.rms, metricsB.rms),
            pitch: this.calculatePercentDifference(metricsA.averagePitch, metricsB.averagePitch),
            brightness: this.calculatePercentDifference(metricsA.spectralBrightness, metricsB.spectralBrightness),
            energy: this.calculatePercentDifference(metricsA.averageEnergy, metricsB.averageEnergy),
            speakingRate: this.calculatePercentDifference(metricsA.speakingRate, metricsB.speakingRate)
        };

        const similarity = this.calculateSimilarity(metricsA, metricsB);
        const recommendation = this.generateRecommendation(metricsA, metricsB, differences);

        return {
            sampleA,
            sampleB,
            metricsA,
            metricsB,
            differences,
            similarity,
            recommendation
        };
    }

    /**
     * Calculate RMS level
     */
    private calculateRMS(data: Float32Array): number {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i] * data[i];
        }
        return Math.sqrt(sum / data.length);
    }

    /**
     * Calculate peak level
     */
    private calculatePeak(data: Float32Array): number {
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
            peak = Math.max(peak, Math.abs(data[i]));
        }
        return peak;
    }

    /**
     * Calculate dynamic range
     */
    private calculateDynamicRange(data: Float32Array): number {
        const peak = this.calculatePeak(data);
        let minNonZero = Infinity;
        
        for (let i = 0; i < data.length; i++) {
            const abs = Math.abs(data[i]);
            if (abs > 0.001) {
                minNonZero = Math.min(minNonZero, abs);
            }
        }
        
        return 20 * Math.log10(peak / (minNonZero || 0.001));
    }

    /**
     * Estimate average pitch using autocorrelation
     */
    private estimatePitch(data: Float32Array, sampleRate: number): number {
        const minPeriod = Math.floor(sampleRate / 500); // 500 Hz max
        const maxPeriod = Math.floor(sampleRate / 50);  // 50 Hz min
        
        let maxCorrelation = 0;
        let bestPeriod = minPeriod;
        
        for (let period = minPeriod; period < maxPeriod; period++) {
            let correlation = 0;
            for (let i = 0; i < data.length - period; i++) {
                correlation += data[i] * data[i + period];
            }
            
            if (correlation > maxCorrelation) {
                maxCorrelation = correlation;
                bestPeriod = period;
            }
        }
        
        return sampleRate / bestPeriod;
    }

    /**
     * Calculate spectral centroid (brightness measure)
     */
    private calculateSpectralCentroid(data: Float32Array, sampleRate: number): number {
        const fftSize = 2048;
        let weightedSum = 0;
        let magnitudeSum = 0;
        
        for (let i = 0; i < Math.min(fftSize, data.length); i++) {
            const magnitude = Math.abs(data[i]);
            const frequency = (i * sampleRate) / fftSize;
            weightedSum += frequency * magnitude;
            magnitudeSum += magnitude;
        }
        
        return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    }

    /**
     * Calculate brightness (high-frequency energy ratio)
     */
    private calculateBrightness(data: Float32Array): number {
        let highFreqEnergy = 0;
        let totalEnergy = 0;
        
        for (let i = 0; i < data.length - 1; i++) {
            const highFreq = Math.abs(data[i] - data[i - 1]);
            highFreqEnergy += highFreq * highFreq;
            totalEnergy += data[i] * data[i];
        }
        
        return totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0;
    }

    /**
     * Estimate speaking rate in WPM
     */
    private estimateSpeakingRate(data: Float32Array, sampleRate: number): number {
        const windowSize = Math.floor(sampleRate * 0.1); // 100ms windows
        const threshold = 0.02;
        let syllableCount = 0;
        let inSyllable = false;
        
        for (let i = 0; i < data.length; i += windowSize) {
            let energy = 0;
            for (let j = 0; j < windowSize && i + j < data.length; j++) {
                energy += data[i + j] * data[i + j];
            }
            energy = Math.sqrt(energy / windowSize);
            
            if (energy > threshold && !inSyllable) {
                syllableCount++;
                inSyllable = true;
            } else if (energy <= threshold) {
                inSyllable = false;
            }
        }
        
        const durationMinutes = data.length / sampleRate / 60;
        const wordsPerMinute = (syllableCount / 2) / durationMinutes; // Rough estimate: 2 syllables per word
        
        return Math.max(0, wordsPerMinute);
    }

    /**
     * Calculate pause ratio
     */
    private calculatePauseRatio(data: Float32Array): number {
        const threshold = 0.01;
        let pauseSamples = 0;
        
        for (let i = 0; i < data.length; i++) {
            if (Math.abs(data[i]) < threshold) {
                pauseSamples++;
            }
        }
        
        return pauseSamples / data.length;
    }

    /**
     * Calculate average energy
     */
    private calculateAverageEnergy(data: Float32Array): number {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += Math.abs(data[i]);
        }
        return sum / data.length;
    }

    /**
     * Calculate energy variance
     */
    private calculateEnergyVariance(data: Float32Array): number {
        const avgEnergy = this.calculateAverageEnergy(data);
        let sumSquaredDiff = 0;
        
        for (let i = 0; i < data.length; i++) {
            const diff = Math.abs(data[i]) - avgEnergy;
            sumSquaredDiff += diff * diff;
        }
        
        return Math.sqrt(sumSquaredDiff / data.length);
    }

    /**
     * Calculate percent difference between two values
     */
    private calculatePercentDifference(a: number, b: number): number {
        if (a === 0 && b === 0) return 0;
        return ((b - a) / ((a + b) / 2)) * 100;
    }

    /**
     * Calculate similarity score (0-100%)
     */
    private calculateSimilarity(metricsA: ComparisonMetrics, metricsB: ComparisonMetrics): number {
        const weights = {
            rms: 0.15,
            pitch: 0.25,
            brightness: 0.15,
            energy: 0.15,
            speakingRate: 0.15,
            variance: 0.15
        };

        const rmsSimilarity = 1 - Math.min(1, Math.abs(metricsA.rms - metricsB.rms) / Math.max(metricsA.rms, metricsB.rms, 0.01));
        const pitchSimilarity = 1 - Math.min(1, Math.abs(metricsA.averagePitch - metricsB.averagePitch) / Math.max(metricsA.averagePitch, metricsB.averagePitch, 1));
        const brightnessSimilarity = 1 - Math.min(1, Math.abs(metricsA.spectralBrightness - metricsB.spectralBrightness) / Math.max(metricsA.spectralBrightness, metricsB.spectralBrightness, 0.01));
        const energySimilarity = 1 - Math.min(1, Math.abs(metricsA.averageEnergy - metricsB.averageEnergy) / Math.max(metricsA.averageEnergy, metricsB.averageEnergy, 0.01));
        const rateSimilarity = 1 - Math.min(1, Math.abs(metricsA.speakingRate - metricsB.speakingRate) / Math.max(metricsA.speakingRate, metricsB.speakingRate, 1));
        const varianceSimilarity = 1 - Math.min(1, Math.abs(metricsA.energyVariance - metricsB.energyVariance) / Math.max(metricsA.energyVariance, metricsB.energyVariance, 0.01));

        const totalSimilarity = 
            rmsSimilarity * weights.rms +
            pitchSimilarity * weights.pitch +
            brightnessSimilarity * weights.brightness +
            energySimilarity * weights.energy +
            rateSimilarity * weights.speakingRate +
            varianceSimilarity * weights.variance;

        return totalSimilarity * 100;
    }

    /**
     * Generate recommendation based on comparison
     */
    private generateRecommendation(metricsA: ComparisonMetrics, metricsB: ComparisonMetrics, differences: any): string {
        const recommendations: string[] = [];

        // Volume comparison
        if (Math.abs(differences.rms) > 20) {
            if (metricsA.rms > metricsB.rms) {
                recommendations.push('Sample A is significantly louder');
            } else {
                recommendations.push('Sample B is significantly louder');
            }
        }

        // Pitch comparison
        if (Math.abs(differences.pitch) > 15) {
            if (metricsA.averagePitch > metricsB.averagePitch) {
                recommendations.push('Sample A has a higher pitch');
            } else {
                recommendations.push('Sample B has a higher pitch');
            }
        }

        // Brightness comparison
        if (Math.abs(differences.brightness) > 25) {
            if (metricsA.spectralBrightness > metricsB.spectralBrightness) {
                recommendations.push('Sample A sounds brighter/crisper');
            } else {
                recommendations.push('Sample B sounds brighter/crisper');
            }
        }

        // Speaking rate comparison
        if (Math.abs(differences.speakingRate) > 20) {
            if (metricsA.speakingRate > metricsB.speakingRate) {
                recommendations.push('Sample A has a faster speaking pace');
            } else {
                recommendations.push('Sample B has a faster speaking pace');
            }
        }

        // Energy/expressiveness
        if (metricsA.energyVariance > metricsB.energyVariance * 1.3) {
            recommendations.push('Sample A is more expressive/dynamic');
        } else if (metricsB.energyVariance > metricsA.energyVariance * 1.3) {
            recommendations.push('Sample B is more expressive/dynamic');
        }

        if (recommendations.length === 0) {
            return 'Both samples are very similar in characteristics';
        }

        return recommendations.join('. ') + '.';
    }

    /**
     * Generate waveform data for visualization
     */
    generateWaveformData(audioBuffer: AudioBuffer, width: number): number[] {
        const channelData = audioBuffer.getChannelData(0);
        const samplesPerPixel = Math.floor(channelData.length / width);
        const waveform: number[] = [];

        for (let i = 0; i < width; i++) {
            const start = i * samplesPerPixel;
            const end = start + samplesPerPixel;
            let sum = 0;

            for (let j = start; j < end && j < channelData.length; j++) {
                sum += Math.abs(channelData[j]);
            }

            waveform.push(sum / samplesPerPixel);
        }

        return waveform;
    }
}

/**
 * Calculate preference score based on quality metrics
 */
export function calculatePreferenceScore(metrics: ComparisonMetrics): number {
    let score = 50; // Base score

    // Good dynamic range (15-40 dB)
    if (metrics.dynamicRange > 15 && metrics.dynamicRange < 40) {
        score += 10;
    } else if (metrics.dynamicRange < 10) {
        score -= 10;
    }

    // Good RMS level (not too quiet, not clipping)
    if (metrics.rms > 0.1 && metrics.rms < 0.7) {
        score += 10;
    }

    // Natural pitch range
    if (metrics.averagePitch > 80 && metrics.averagePitch < 400) {
        score += 10;
    }

    // Good speaking rate (120-180 WPM)
    if (metrics.speakingRate > 100 && metrics.speakingRate < 200) {
        score += 10;
    }

    // Expressive (good energy variance)
    if (metrics.energyVariance > 0.02 && metrics.energyVariance < 0.15) {
        score += 10;
    }

    return Math.max(0, Math.min(100, score));
}

/**
 * Format metrics for display
 */
export function formatMetric(key: string, value: number): string {
    switch (key) {
        case 'rms':
        case 'peak':
            return `${(20 * Math.log10(value)).toFixed(1)} dB`;
        case 'dynamicRange':
            return `${value.toFixed(1)} dB`;
        case 'averagePitch':
            return `${value.toFixed(0)} Hz`;
        case 'spectralCentroid':
            return `${(value / 1000).toFixed(1)} kHz`;
        case 'spectralBrightness':
            return `${(value * 100).toFixed(1)}%`;
        case 'speakingRate':
            return `${value.toFixed(0)} WPM`;
        case 'pauseRatio':
            return `${(value * 100).toFixed(1)}%`;
        case 'averageEnergy':
            return `${(value * 100).toFixed(1)}%`;
        case 'energyVariance':
            return `${(value * 100).toFixed(2)}%`;
        default:
            return value.toFixed(2);
    }
}

/**
 * Get metric label
 */
export function getMetricLabel(key: string): string {
    const labels: Record<string, string> = {
        rms: 'RMS Level',
        peak: 'Peak Level',
        dynamicRange: 'Dynamic Range',
        averagePitch: 'Average Pitch',
        spectralCentroid: 'Spectral Centroid',
        spectralBrightness: 'Brightness',
        speakingRate: 'Speaking Rate',
        pauseRatio: 'Pause Ratio',
        averageEnergy: 'Average Energy',
        energyVariance: 'Energy Variance'
    };
    return labels[key] || key;
}
