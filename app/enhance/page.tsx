'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, Upload, Play, Pause, Download, RefreshCw, BarChart3,
    Sparkles, Sliders, Volume2, Zap, Activity, Settings, Copy, Check
} from 'lucide-react';
import {
    AudioEnhancer,
    EnhancementConfig,
    EnhancementPreset,
    ENHANCEMENT_PRESETS,
    getPresetsByCategory,
    getPresetById,
    getDefaultConfig
} from '@/lib/enhancement-utils';
import { generateSpeech } from '@/lib/tts-engine';
import { getVoices, type Voice } from '@/lib/voice-config';

export default function EnhancementPage() {
    const [originalAudio, setOriginalAudio] = useState<AudioBuffer | null>(null);
    const [enhancedAudio, setEnhancedAudio] = useState<AudioBuffer | null>(null);
    const [config, setConfig] = useState<EnhancementConfig>(getDefaultConfig());
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState<'original' | 'enhanced' | null>(null);
    const [compareMode, setCompareMode] = useState(false);
    
    // Quality metrics
    const [originalQuality, setOriginalQuality] = useState<any>(null);
    const [enhancedQuality, setEnhancedQuality] = useState<any>(null);

    // TTS Generation
    const [text, setText] = useState('Test audio enhancement with professional noise reduction and clarity optimization.');
    const [selectedVoice, setSelectedVoice] = useState('sc-en-f-1');
    const [isGenerating, setIsGenerating] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const enhancerRef = useRef<AudioEnhancer | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const voices = getVoices();

    useEffect(() => {
        audioContextRef.current = new AudioContext();
        enhancerRef.current = new AudioEnhancer(audioContextRef.current);

        return () => {
            stopPlayback();
            audioContextRef.current?.close();
        };
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !audioContextRef.current) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            setOriginalAudio(audioBuffer);
            setEnhancedAudio(null);
            
            if (enhancerRef.current) {
                const quality = enhancerRef.current.analyzeQuality(audioBuffer);
                setOriginalQuality(quality);
            }
        } catch (error) {
            console.error('Failed to load audio:', error);
            alert('Failed to load audio file');
        }
    };

    const handleGenerateAudio = async () => {
        if (!text.trim() || !audioContextRef.current) return;

        setIsGenerating(true);
        try {
            const blob = await generateSpeech(text, selectedVoice);
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            
            setOriginalAudio(audioBuffer);
            setEnhancedAudio(null);
            
            if (enhancerRef.current) {
                const quality = enhancerRef.current.analyzeQuality(audioBuffer);
                setOriginalQuality(quality);
            }
        } catch (error) {
            console.error('Failed to generate audio:', error);
            alert('Failed to generate audio');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEnhance = async () => {
        if (!originalAudio || !enhancerRef.current) return;

        setIsProcessing(true);
        try {
            const enhanced = await enhancerRef.current.enhance(originalAudio, config);
            setEnhancedAudio(enhanced);
            
            const quality = enhancerRef.current.analyzeQuality(enhanced);
            setEnhancedQuality(quality);
        } catch (error) {
            console.error('Enhancement failed:', error);
            alert('Enhancement failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePresetSelect = (presetId: string) => {
        const preset = getPresetById(presetId);
        if (preset) {
            setConfig(preset.config);
            setSelectedPreset(presetId);
        }
    };

    const handleConfigChange = (key: keyof EnhancementConfig, value: number | boolean) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        setSelectedPreset(null); // Clear preset selection when manually adjusting
    };

    const handleReset = () => {
        setConfig(getDefaultConfig());
        setSelectedPreset(null);
        setEnhancedAudio(null);
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

    const handlePlayOriginal = () => {
        if (!originalAudio) return;
        
        if (isPlaying === 'original') {
            stopPlayback();
        } else {
            setIsPlaying('original');
            playAudio(originalAudio);
        }
    };

    const handlePlayEnhanced = () => {
        if (!enhancedAudio) return;
        
        if (isPlaying === 'enhanced') {
            stopPlayback();
        } else {
            setIsPlaying('enhanced');
            playAudio(enhancedAudio);
        }
    };

    const handleDownload = async () => {
        if (!enhancedAudio) return;

        const wav = audioBufferToWav(enhancedAudio);
        const url = URL.createObjectURL(wav);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'enhanced-audio.wav';
        a.click();
        URL.revokeObjectURL(url);
    };

    const audioBufferToWav = (buffer: AudioBuffer): Blob => {
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
            for (let ch = 0; ch < numberOfChannels; ch++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    };

    const categories: Array<{ id: EnhancementPreset['category']; name: string; icon: any }> = [
        { id: 'restore', name: 'Restore', icon: RefreshCw },
        { id: 'enhance', name: 'Enhance', icon: Sparkles },
        { id: 'master', name: 'Master', icon: Zap },
        { id: 'voice', name: 'Voice', icon: Volume2 }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900">
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">Audio Enhancement</h1>
                                <p className="text-sm text-gray-400">Professional noise reduction & audio restoration</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Sparkles className="w-6 h-6 text-indigo-400" />
                            <Activity className="w-8 h-8 text-indigo-400" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Input & Presets */}
                    <div className="space-y-6">
                        {/* Audio Source */}
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
                                placeholder="Generate audio to enhance..."
                                className="w-full h-20 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none mb-3"
                            />
                            
                            <select
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="w-full mb-4 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            >
                                {voices.map((voice: Voice) => (
                                    <option key={voice.id} value={voice.id}>
                                        {voice.name} ({voice.language})
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={handleGenerateAudio}
                                disabled={isGenerating || !text.trim()}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
                            >
                                {isGenerating ? 'Generating...' : 'Generate Audio'}
                            </button>
                        </motion.div>

                        {/* Presets */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Enhancement Presets</h2>
                            
                            {categories.map((category) => {
                                const presets = getPresetsByCategory(category.id);
                                const Icon = category.icon;
                                
                                return (
                                    <div key={category.id} className="mb-4">
                                        <div className="flex items-center space-x-2 mb-2 text-gray-400">
                                            <Icon className="w-4 h-4" />
                                            <span className="text-sm font-semibold">{category.name}</span>
                                        </div>
                                        <div className="space-y-1">
                                            {presets.map((preset) => (
                                                <button
                                                    key={preset.id}
                                                    onClick={() => handlePresetSelect(preset.id)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                                                        selectedPreset === preset.id
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-white/5 hover:bg-white/10 text-gray-300'
                                                    }`}
                                                >
                                                    <div className="font-medium">{preset.name}</div>
                                                    <div className="text-xs opacity-75">{preset.description}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </div>

                    {/* Middle Column - Controls */}
                    <div className="space-y-6">
                        {/* Enhancement Controls */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="voice-card"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Enhancement Controls</h2>
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <SliderControl
                                    label="Noise Reduction"
                                    value={config.noiseReduction}
                                    onChange={(v) => handleConfigChange('noiseReduction', v)}
                                    min={0}
                                    max={100}
                                    suffix="%"
                                />
                                
                                <SliderControl
                                    label="De-Esser"
                                    value={config.deEsser}
                                    onChange={(v) => handleConfigChange('deEsser', v)}
                                    min={0}
                                    max={100}
                                    suffix="%"
                                />
                                
                                <SliderControl
                                    label="Breath Removal"
                                    value={config.breathRemoval}
                                    onChange={(v) => handleConfigChange('breathRemoval', v)}
                                    min={0}
                                    max={100}
                                    suffix="%"
                                />
                                
                                <SliderControl
                                    label="Click Removal"
                                    value={config.clickRemoval}
                                    onChange={(v) => handleConfigChange('clickRemoval', v)}
                                    min={0}
                                    max={100}
                                    suffix="%"
                                />
                                
                                <SliderControl
                                    label="Compression"
                                    value={config.compression}
                                    onChange={(v) => handleConfigChange('compression', v)}
                                    min={0}
                                    max={100}
                                    suffix="%"
                                />
                                
                                <SliderControl
                                    label="Brightness"
                                    value={config.brightness}
                                    onChange={(v) => handleConfigChange('brightness', v)}
                                    min={-50}
                                    max={50}
                                />
                                
                                <SliderControl
                                    label="Warmth"
                                    value={config.warmth}
                                    onChange={(v) => handleConfigChange('warmth', v)}
                                    min={-50}
                                    max={50}
                                />
                                
                                <SliderControl
                                    label="Clarity"
                                    value={config.clarity}
                                    onChange={(v) => handleConfigChange('clarity', v)}
                                    min={0}
                                    max={100}
                                    suffix="%"
                                />

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-sm text-gray-400">Normalize Audio</span>
                                    <button
                                        onClick={() => handleConfigChange('normalize', !config.normalize)}
                                        className={`w-12 h-6 rounded-full transition-colors ${
                                            config.normalize ? 'bg-indigo-600' : 'bg-gray-600'
                                        }`}
                                    >
                                        <div
                                            className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                                config.normalize ? 'translate-x-6' : 'translate-x-0.5'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleEnhance}
                                disabled={!originalAudio || isProcessing}
                                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                <span>{isProcessing ? 'Processing...' : 'Enhance Audio'}</span>
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Column - Output & Analysis */}
                    <div className="space-y-6">
                        {/* Playback Controls */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Playback</h2>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={handlePlayOriginal}
                                    disabled={!originalAudio}
                                    className="w-full bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
                                >
                                    {isPlaying === 'original' ? (
                                        <Pause className="w-5 h-5" />
                                    ) : (
                                        <Play className="w-5 h-5" />
                                    )}
                                    <span>Original Audio</span>
                                </button>

                                <button
                                    onClick={handlePlayEnhanced}
                                    disabled={!enhancedAudio}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
                                >
                                    {isPlaying === 'enhanced' ? (
                                        <Pause className="w-5 h-5" />
                                    ) : (
                                        <Play className="w-5 h-5" />
                                    )}
                                    <span>Enhanced Audio</span>
                                </button>

                                <button
                                    onClick={handleDownload}
                                    disabled={!enhancedAudio}
                                    className="w-full bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
                                >
                                    <Download className="w-5 h-5" />
                                    <span>Download Enhanced</span>
                                </button>
                            </div>
                        </motion.div>

                        {/* Quality Analysis */}
                        {(originalQuality || enhancedQuality) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="voice-card"
                            >
                                <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                                    <BarChart3 className="w-5 h-5" />
                                    <span>Quality Analysis</span>
                                </h2>

                                {originalQuality && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Original</h3>
                                        <QualityMetrics quality={originalQuality} />
                                    </div>
                                )}

                                {enhancedQuality && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Enhanced</h3>
                                        <QualityMetrics quality={enhancedQuality} />
                                        
                                        {originalQuality && (
                                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                                <div className="text-sm font-semibold text-green-400 mb-1">Improvement</div>
                                                <div className="text-xs text-gray-300">
                                                    Dynamic Range: {(enhancedQuality.dynamicRange - originalQuality.dynamicRange).toFixed(1)} dB
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SliderControl({ label, value, onChange, min, max, suffix = '' }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    suffix?: string;
}) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{label}</span>
                <span className="font-mono text-white">{value}{suffix}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
            />
        </div>
    );
}

function QualityMetrics({ quality }: { quality: any }) {
    return (
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-gray-400">RMS Level</span>
                <span className="font-mono">{(20 * Math.log10(quality.rms)).toFixed(1)} dB</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-400">Peak Level</span>
                <span className="font-mono">{(20 * Math.log10(quality.peak)).toFixed(1)} dB</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-400">Dynamic Range</span>
                <span className="font-mono">{quality.dynamicRange.toFixed(1)} dB</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-400">Noise Floor</span>
                <span className="font-mono">{quality.noiseFloor.toFixed(1)} dB</span>
            </div>
        </div>
    );
}
