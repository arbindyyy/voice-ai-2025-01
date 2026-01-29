'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, Upload, Play, Pause, Download, RefreshCw, GitCompare,
    Sparkles, BarChart3, TrendingUp, Volume2, Radio, Zap, Check, X
} from 'lucide-react';
import {
    VoiceComparator,
    ComparisonSample,
    ComparisonResult,
    calculatePreferenceScore,
    formatMetric,
    getMetricLabel
} from '@/lib/comparison-utils';
import { generateSpeech } from '@/lib/tts-engine';
import { getVoices, type Voice } from '@/lib/voice-config';

export default function ComparisonPage() {
    const [sampleA, setSampleA] = useState<ComparisonSample | null>(null);
    const [sampleB, setSampleB] = useState<ComparisonSample | null>(null);
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [isPlaying, setIsPlaying] = useState<'A' | 'B' | null>(null);
    
    // TTS Generation
    const [textA, setTextA] = useState('Compare the quality and characteristics of this voice sample.');
    const [textB, setTextB] = useState('Compare the quality and characteristics of this voice sample.');
    const [voiceA, setVoiceA] = useState('sc-en-f-1');
    const [voiceB, setVoiceB] = useState('sc-en-m-1');
    const [isGeneratingA, setIsGeneratingA] = useState(false);
    const [isGeneratingB, setIsGeneratingB] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const comparatorRef = useRef<VoiceComparator | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const fileInputARef = useRef<HTMLInputElement>(null);
    const fileInputBRef = useRef<HTMLInputElement>(null);

    const voices = getVoices();

    useEffect(() => {
        audioContextRef.current = new AudioContext();
        comparatorRef.current = new VoiceComparator(audioContextRef.current);

        return () => {
            stopPlayback();
            audioContextRef.current?.close();
        };
    }, []);

    const handleFileUpload = async (slot: 'A' | 'B', event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !audioContextRef.current) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            
            const sample: ComparisonSample = {
                id: `${slot}-${Date.now()}`,
                name: file.name,
                audioBuffer,
                metadata: {
                    duration: audioBuffer.duration,
                    timestamp: Date.now()
                }
            };

            if (slot === 'A') {
                setSampleA(sample);
            } else {
                setSampleB(sample);
            }
        } catch (error) {
            console.error('Failed to load audio:', error);
            alert('Failed to load audio file');
        }
    };

    const handleGenerateAudio = async (slot: 'A' | 'B') => {
        if (!audioContextRef.current) return;

        const text = slot === 'A' ? textA : textB;
        const voiceId = slot === 'A' ? voiceA : voiceB;

        if (!text.trim()) return;

        const setGenerating = slot === 'A' ? setIsGeneratingA : setIsGeneratingB;
        
        setGenerating(true);
        try {
            const blob = await generateSpeech(text, voiceId);
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            
            const voice = voices.find((v: Voice) => v.id === voiceId);
            const sample: ComparisonSample = {
                id: `${slot}-${Date.now()}`,
                name: `${voice?.name || voiceId} Sample`,
                audioBuffer,
                metadata: {
                    voiceId,
                    voiceName: voice?.name,
                    text,
                    duration: audioBuffer.duration,
                    timestamp: Date.now()
                }
            };

            if (slot === 'A') {
                setSampleA(sample);
            } else {
                setSampleB(sample);
            }
        } catch (error) {
            console.error('Failed to generate audio:', error);
            alert('Failed to generate audio');
        } finally {
            setGenerating(false);
        }
    };

    const handleCompare = async () => {
        if (!sampleA || !sampleB || !comparatorRef.current) return;

        setIsComparing(true);
        try {
            const result = await comparatorRef.current.compare(sampleA, sampleB);
            setComparisonResult(result);
        } catch (error) {
            console.error('Comparison failed:', error);
            alert('Comparison failed');
        } finally {
            setIsComparing(false);
        }
    };

    const playAudio = async (buffer: AudioBuffer) => {
        if (!audioContextRef.current) return;

        stopPlayback();
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.start(0);
        
        sourceNodeRef.current = source;
        
        source.onended = () => {
            setIsPlaying(null);
            sourceNodeRef.current = null;
        };
    };

    const stopPlayback = () => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        setIsPlaying(null);
    };

    const handlePlay = (slot: 'A' | 'B') => {
        const sample = slot === 'A' ? sampleA : sampleB;
        if (!sample) return;
        
        if (isPlaying === slot) {
            stopPlayback();
        } else {
            setIsPlaying(slot);
            playAudio(sample.audioBuffer);
        }
    };

    const handleReset = () => {
        setSampleA(null);
        setSampleB(null);
        setComparisonResult(null);
        stopPlayback();
    };

    const preferenceScoreA = comparisonResult ? calculatePreferenceScore(comparisonResult.metricsA) : 0;
    const preferenceScoreB = comparisonResult ? calculatePreferenceScore(comparisonResult.metricsB) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">Voice Comparison</h1>
                                <p className="text-sm text-gray-400">Side-by-side A/B testing & analysis</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <GitCompare className="w-6 h-6 text-purple-400" />
                            <TrendingUp className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    {/* Sample A */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="voice-card"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                                    A
                                </div>
                                <span>Sample A</span>
                            </h2>
                            {sampleA && (
                                <button
                                    onClick={handlePlay.bind(null, 'A')}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                                >
                                    {isPlaying === 'A' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                            )}
                        </div>

                        <input
                            ref={fileInputARef}
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleFileUpload('A', e)}
                            className="hidden"
                        />
                        
                        <button
                            onClick={() => fileInputARef.current?.click()}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 mb-4"
                        >
                            <Upload className="w-5 h-5" />
                            <span>Upload Audio</span>
                        </button>

                        <div className="text-center text-sm text-gray-400 mb-4">OR</div>

                        <textarea
                            value={textA}
                            onChange={(e) => setTextA(e.target.value)}
                            placeholder="Generate audio..."
                            className="w-full h-20 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none mb-3"
                        />
                        
                        <select
                            value={voiceA}
                            onChange={(e) => setVoiceA(e.target.value)}
                            className="w-full mb-4 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            {voices.map((voice: Voice) => (
                                <option key={voice.id} value={voice.id}>
                                    {voice.name} ({voice.language})
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => handleGenerateAudio('A')}
                            disabled={isGeneratingA || !textA.trim()}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
                        >
                            {isGeneratingA ? 'Generating...' : 'Generate'}
                        </button>

                        {sampleA && (
                            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <div className="text-sm font-semibold mb-1">{sampleA.name}</div>
                                <div className="text-xs text-gray-400">
                                    Duration: {sampleA.metadata.duration.toFixed(2)}s
                                </div>
                                {sampleA.metadata.voiceName && (
                                    <div className="text-xs text-gray-400">
                                        Voice: {sampleA.metadata.voiceName}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Sample B */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="voice-card"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                                    B
                                </div>
                                <span>Sample B</span>
                            </h2>
                            {sampleB && (
                                <button
                                    onClick={handlePlay.bind(null, 'B')}
                                    className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all"
                                >
                                    {isPlaying === 'B' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                            )}
                        </div>

                        <input
                            ref={fileInputBRef}
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleFileUpload('B', e)}
                            className="hidden"
                        />
                        
                        <button
                            onClick={() => fileInputBRef.current?.click()}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 mb-4"
                        >
                            <Upload className="w-5 h-5" />
                            <span>Upload Audio</span>
                        </button>

                        <div className="text-center text-sm text-gray-400 mb-4">OR</div>

                        <textarea
                            value={textB}
                            onChange={(e) => setTextB(e.target.value)}
                            placeholder="Generate audio..."
                            className="w-full h-20 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none mb-3"
                        />
                        
                        <select
                            value={voiceB}
                            onChange={(e) => setVoiceB(e.target.value)}
                            className="w-full mb-4 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                        >
                            {voices.map((voice: Voice) => (
                                <option key={voice.id} value={voice.id}>
                                    {voice.name} ({voice.language})
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => handleGenerateAudio('B')}
                            disabled={isGeneratingB || !textB.trim()}
                            className="w-full bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
                        >
                            {isGeneratingB ? 'Generating...' : 'Generate'}
                        </button>

                        {sampleB && (
                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <div className="text-sm font-semibold mb-1">{sampleB.name}</div>
                                <div className="text-xs text-gray-400">
                                    Duration: {sampleB.metadata.duration.toFixed(2)}s
                                </div>
                                {sampleB.metadata.voiceName && (
                                    <div className="text-xs text-gray-400">
                                        Voice: {sampleB.metadata.voiceName}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Compare Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center space-x-4 mb-6"
                >
                    <button
                        onClick={handleCompare}
                        disabled={!sampleA || !sampleB || isComparing}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all flex items-center space-x-2 text-lg"
                    >
                        <GitCompare className="w-6 h-6" />
                        <span>{isComparing ? 'Comparing...' : 'Compare Samples'}</span>
                    </button>

                    {(sampleA || sampleB) && (
                        <button
                            onClick={handleReset}
                            className="bg-white/5 hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-lg transition-all flex items-center space-x-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            <span>Reset</span>
                        </button>
                    )}
                </motion.div>

                {/* Comparison Results */}
                {comparisonResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Similarity Score */}
                        <div className="voice-card">
                            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                                <Sparkles className="w-5 h-5" />
                                <span>Similarity Analysis</span>
                            </h2>
                            
                            <div className="text-center mb-6">
                                <div className="text-6xl font-bold mb-2">
                                    {comparisonResult.similarity.toFixed(0)}%
                                </div>
                                <div className="text-gray-400">Overall Similarity</div>
                            </div>

                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                <div className="text-sm font-semibold mb-2">Recommendation:</div>
                                <div className="text-gray-300">{comparisonResult.recommendation}</div>
                            </div>
                        </div>

                        {/* Preference Scores */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="voice-card">
                                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                        A
                                    </div>
                                    <span>Preference Score</span>
                                </h3>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-400 mb-2">
                                        {preferenceScoreA}
                                    </div>
                                    <div className="text-sm text-gray-400">out of 100</div>
                                </div>
                            </div>

                            <div className="voice-card">
                                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                                        B
                                    </div>
                                    <span>Preference Score</span>
                                </h3>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-green-400 mb-2">
                                        {preferenceScoreB}
                                    </div>
                                    <div className="text-sm text-gray-400">out of 100</div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Metrics Comparison */}
                        <div className="voice-card">
                            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5" />
                                <span>Detailed Metrics</span>
                            </h2>

                            <div className="space-y-4">
                                {Object.keys(comparisonResult.metricsA).map((key) => (
                                    <MetricComparison
                                        key={key}
                                        label={getMetricLabel(key)}
                                        valueA={formatMetric(key, (comparisonResult.metricsA as any)[key])}
                                        valueB={formatMetric(key, (comparisonResult.metricsB as any)[key])}
                                        rawA={(comparisonResult.metricsA as any)[key]}
                                        rawB={(comparisonResult.metricsB as any)[key]}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Key Differences */}
                        <div className="voice-card">
                            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5" />
                                <span>Key Differences</span>
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                <DifferenceCard
                                    label="Volume (RMS)"
                                    value={comparisonResult.differences.rms}
                                />
                                <DifferenceCard
                                    label="Pitch"
                                    value={comparisonResult.differences.pitch}
                                />
                                <DifferenceCard
                                    label="Brightness"
                                    value={comparisonResult.differences.brightness}
                                />
                                <DifferenceCard
                                    label="Energy"
                                    value={comparisonResult.differences.energy}
                                />
                                <DifferenceCard
                                    label="Speaking Rate"
                                    value={comparisonResult.differences.speakingRate}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function MetricComparison({ label, valueA, valueB, rawA, rawB }: {
    label: string;
    valueA: string;
    valueB: string;
    rawA: number;
    rawB: number;
}) {
    const percentA = rawA / (rawA + rawB) * 100;
    const percentB = rawB / (rawA + rawB) * 100;

    return (
        <div>
            <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{label}</span>
                <div className="flex space-x-4">
                    <span className="text-blue-400">A: {valueA}</span>
                    <span className="text-green-400">B: {valueB}</span>
                </div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                <div
                    className="bg-blue-500"
                    style={{ width: `${percentA}%` }}
                />
                <div
                    className="bg-green-500"
                    style={{ width: `${percentB}%` }}
                />
            </div>
        </div>
    );
}

function DifferenceCard({ label, value }: { label: string; value: number }) {
    const isSignificant = Math.abs(value) > 20;
    const isPositive = value > 0;

    return (
        <div className={`p-4 rounded-lg border ${
            isSignificant
                ? 'bg-yellow-500/10 border-yellow-500/20'
                : 'bg-white/5 border-white/10'
        }`}>
            <div className="text-sm text-gray-400 mb-1">{label}</div>
            <div className="flex items-center space-x-2">
                <div className={`text-2xl font-bold ${
                    isSignificant ? 'text-yellow-400' : 'text-gray-300'
                }`}>
                    {isPositive && '+'}{value.toFixed(1)}%
                </div>
                {isSignificant && (
                    <Zap className="w-5 h-5 text-yellow-400" />
                )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
                {isSignificant ? 'Significant difference' : 'Similar'}
            </div>
        </div>
    );
}
