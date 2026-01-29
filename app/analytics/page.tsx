'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, Upload, Download, BarChart3, TrendingUp, Activity,
    Sparkles, FileAudio, Clock, HardDrive, Radio, Trash2, Eye, Copy
} from 'lucide-react';
import {
    VoiceAnalytics,
    AnalyticsReport,
    AnalyticsHistory,
    getQualityRating,
    formatDuration,
    formatFileSize,
    exportAnalyticsReport
} from '@/lib/analytics-utils';
import { generateSpeech } from '@/lib/tts-engine';
import { getVoices, type Voice } from '@/lib/voice-config';

export default function AnalyticsPage() {
    const [currentReport, setCurrentReport] = useState<AnalyticsReport | null>(null);
    const [history, setHistory] = useState<AnalyticsReport[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<string | null>(null);
    
    // TTS Generation
    const [text, setText] = useState('Analyze the quality and characteristics of this voice sample.');
    const [selectedVoice, setSelectedVoice] = useState('sc-en-f-1');
    const [isGenerating, setIsGenerating] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyticsEngineRef = useRef<VoiceAnalytics | null>(null);
    const historyManagerRef = useRef<AnalyticsHistory | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const voices = getVoices();

    useEffect(() => {
        audioContextRef.current = new AudioContext();
        analyticsEngineRef.current = new VoiceAnalytics(audioContextRef.current);
        historyManagerRef.current = new AnalyticsHistory();
        
        // Load history
        if (historyManagerRef.current) {
            setHistory(historyManagerRef.current.getAll());
        }

        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        await analyzeFile(file);
    };

    const handleGenerateAndAnalyze = async () => {
        if (!text.trim()) return;

        setIsGenerating(true);
        try {
            const blob = await generateSpeech(text, selectedVoice);
            await analyzeFile(blob);
        } catch (error) {
            console.error('Generation failed:', error);
            alert('Failed to generate audio');
        } finally {
            setIsGenerating(false);
        }
    };

    const analyzeFile = async (file: Blob) => {
        if (!audioContextRef.current || !analyticsEngineRef.current || !historyManagerRef.current) return;

        setIsAnalyzing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            
            const report = await analyticsEngineRef.current.analyzeAudio(audioBuffer, {
                format: file.type.split('/')[1] || 'unknown'
            });
            
            setCurrentReport(report);
            historyManagerRef.current.save(report);
            setHistory(historyManagerRef.current.getAll());
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Failed to analyze audio');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleViewHistory = (reportId: string) => {
        if (!historyManagerRef.current) return;
        const report = historyManagerRef.current.getById(reportId);
        if (report) {
            setCurrentReport(report);
            setSelectedHistory(reportId);
        }
    };

    const handleDeleteHistory = (reportId: string) => {
        if (!historyManagerRef.current) return;
        historyManagerRef.current.delete(reportId);
        setHistory(historyManagerRef.current.getAll());
        if (selectedHistory === reportId) {
            setCurrentReport(null);
            setSelectedHistory(null);
        }
    };

    const handleExportReport = () => {
        if (!currentReport) return;
        
        const json = exportAnalyticsReport(currentReport);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${currentReport.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const stats = historyManagerRef.current?.getStats() || {
        totalAnalyses: 0,
        averageQuality: 0,
        totalDuration: 0,
        averageFileSize: 0
    };

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
                                <h1 className="text-2xl font-bold">Voice Analytics</h1>
                                <p className="text-sm text-gray-400">Professional audio analysis & insights</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <BarChart3 className="w-6 h-6 text-purple-400" />
                            <Sparkles className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Input */}
                    <div className="space-y-6">
                        {/* Upload or Generate */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Audio Source</h2>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 mb-4"
                            >
                                <Upload className="w-5 h-5" />
                                <span>Upload Audio File</span>
                            </button>

                            <div className="text-center text-sm text-gray-400 mb-4">OR</div>

                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Generate audio to analyze..."
                                className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none mb-3"
                            />
                            
                            <select
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="w-full mb-4 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            >
                                {voices.map((voice: Voice) => (
                                    <option key={voice.id} value={voice.id}>
                                        {voice.name} ({voice.language})
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={handleGenerateAndAnalyze}
                                disabled={isGenerating || !text.trim()}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
                            >
                                {isGenerating ? 'Generating...' : 'Generate & Analyze'}
                            </button>
                        </motion.div>

                        {/* Statistics */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Statistics</h2>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Total Analyses</span>
                                    <span className="font-bold text-lg">{stats.totalAnalyses}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Avg Quality</span>
                                    <span className="font-bold text-lg">{stats.averageQuality.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Total Duration</span>
                                    <span className="font-bold text-lg">{formatDuration(stats.totalDuration)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Avg File Size</span>
                                    <span className="font-bold text-lg">{formatFileSize(stats.averageFileSize)}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* History */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">History</h2>
                            
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {history.length === 0 ? (
                                    <p className="text-center text-gray-400 py-4">No analysis history</p>
                                ) : (
                                    history.map((report) => {
                                        const rating = getQualityRating(report.qualityMetrics.overallScore);
                                        return (
                                            <div
                                                key={report.id}
                                                className={`bg-white/5 hover:bg-white/10 border rounded-lg p-3 transition-all ${
                                                    selectedHistory === report.id ? 'border-purple-500' : 'border-white/10'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <FileAudio className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm font-medium">
                                                                {new Date(report.timestamp).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                            <span>{rating.icon} {rating.label}</span>
                                                            <span>•</span>
                                                            <span>{formatDuration(report.audioMetrics.duration)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        <button
                                                            onClick={() => handleViewHistory(report.id)}
                                                            className="p-1 hover:bg-white/10 rounded transition-all"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteHistory(report.id)}
                                                            className="p-1 hover:bg-red-500/20 rounded transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Middle & Right Columns - Analysis Results */}
                    {isAnalyzing ? (
                        <div className="lg:col-span-2 flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <Activity className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
                                <p className="text-xl font-semibold">Analyzing Audio...</p>
                                <p className="text-gray-400 mt-2">This may take a moment</p>
                            </motion.div>
                        </div>
                    ) : currentReport ? (
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quality Overview */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="voice-card"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">Quality Overview</h2>
                                    <button
                                        onClick={handleExportReport}
                                        className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="text-sm">Export</span>
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="text-center">
                                        <div className="text-6xl font-bold mb-2">
                                            {currentReport.qualityMetrics.overallScore.toFixed(0)}
                                        </div>
                                        <div className="text-2xl font-semibold text-purple-400 mb-2">
                                            {getQualityRating(currentReport.qualityMetrics.overallScore).label}
                                        </div>
                                        <div className="text-4xl">
                                            {getQualityRating(currentReport.qualityMetrics.overallScore).icon}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <MetricBar
                                            label="Clarity"
                                            value={currentReport.qualityMetrics.clarity}
                                            color="blue"
                                        />
                                        <MetricBar
                                            label="Dynamic Range"
                                            value={(currentReport.qualityMetrics.dynamicRange / 60) * 100}
                                            color="green"
                                        />
                                        <MetricBar
                                            label="Signal/Noise"
                                            value={(currentReport.qualityMetrics.signalToNoise / 60) * 100}
                                            color="purple"
                                        />
                                    </div>
                                </div>

                                {/* Recommendations */}
                                {currentReport.recommendations.length > 0 && (
                                    <div className="mt-6 p-4 bg-white/5 rounded-lg">
                                        <h3 className="font-semibold mb-3">Recommendations:</h3>
                                        <div className="space-y-2">
                                            {currentReport.recommendations.map((rec, idx) => (
                                                <div key={idx} className="text-sm text-gray-300">
                                                    {rec}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Audio Metrics */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="voice-card"
                            >
                                <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                                    <FileAudio className="w-5 h-5" />
                                    <span>Audio Metrics</span>
                                </h2>
                                
                                <div className="grid md:grid-cols-3 gap-4">
                                    <InfoCard
                                        icon={<Clock className="w-5 h-5" />}
                                        label="Duration"
                                        value={formatDuration(currentReport.audioMetrics.duration)}
                                    />
                                    <InfoCard
                                        icon={<Radio className="w-5 h-5" />}
                                        label="Sample Rate"
                                        value={`${(currentReport.audioMetrics.sampleRate / 1000).toFixed(1)} kHz`}
                                    />
                                    <InfoCard
                                        icon={<HardDrive className="w-5 h-5" />}
                                        label="File Size"
                                        value={formatFileSize(currentReport.audioMetrics.fileSize)}
                                    />
                                </div>
                            </motion.div>

                            {/* Speaker Profile */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="voice-card"
                            >
                                <h2 className="text-xl font-bold mb-4">Speaker Profile</h2>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Gender</span>
                                                <span className="font-semibold capitalize">{currentReport.speakerProfile.gender}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Confidence</span>
                                                <span className="font-semibold">{currentReport.speakerProfile.confidence.toFixed(0)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Voice Type</span>
                                                <span className="font-semibold capitalize">{currentReport.speakerProfile.voiceType}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Avg Pitch</span>
                                                <span className="font-semibold">{currentReport.speakerProfile.pitchRange.average.toFixed(0)} Hz</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Speaking Rate</span>
                                                <span className="font-semibold">{currentReport.speakerProfile.speakingRate} WPM</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Energy</span>
                                                <span className="font-semibold">{currentReport.speakerProfile.energy.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Emotion Analysis */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="voice-card"
                            >
                                <h2 className="text-xl font-bold mb-4">Emotion Analysis</h2>
                                
                                <div className="mb-4 text-center">
                                    <div className="text-3xl font-bold text-purple-400 mb-1 capitalize">
                                        {currentReport.emotionAnalysis.dominant}
                                    </div>
                                    <div className="text-gray-400">
                                        {currentReport.emotionAnalysis.confidence.toFixed(0)}% confidence
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {Object.entries(currentReport.emotionAnalysis.emotions).map(([emotion, value]) => (
                                        <div key={emotion}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="capitalize text-gray-400">{emotion}</span>
                                                <span className="font-mono">{value}%</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                                    style={{ width: `${value}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Spectral Analysis */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="voice-card"
                            >
                                <h2 className="text-xl font-bold mb-4">Spectral Analysis</h2>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Dominant Freq</span>
                                            <span className="font-semibold">{currentReport.spectralAnalysis.dominantFrequency.toFixed(0)} Hz</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Bandwidth</span>
                                            <span className="font-semibold">{currentReport.spectralAnalysis.bandwidth.toFixed(0)} Hz</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Harmonics</span>
                                            <span className="font-semibold">{currentReport.spectralAnalysis.harmonics.length}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Centroid</span>
                                            <span className="font-semibold">{currentReport.spectralAnalysis.spectralCentroid.toFixed(0)} Hz</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Flatness</span>
                                            <span className="font-semibold">{currentReport.spectralAnalysis.spectralFlatness.toFixed(3)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Range</span>
                                            <span className="font-semibold text-xs">
                                                {currentReport.spectralAnalysis.frequencyRange.min.toFixed(0)} - {currentReport.spectralAnalysis.frequencyRange.max.toFixed(0)} Hz
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ) : (
                        <div className="lg:col-span-2 flex items-center justify-center">
                            <div className="text-center">
                                <BarChart3 className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                                <p className="text-xl font-semibold text-gray-400">No Analysis Yet</p>
                                <p className="text-gray-500 mt-2">Upload audio or generate speech to begin</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
    const colors = {
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        purple: 'from-purple-500 to-pink-500',
        yellow: 'from-yellow-500 to-orange-500'
    };

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">{label}</span>
                <span className="font-mono">{Math.min(100, value).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${colors[color as keyof typeof colors]} transition-all duration-500`}
                    style={{ width: `${Math.min(100, value)}%` }}
                />
            </div>
        </div>
    );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2 text-gray-400">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}
