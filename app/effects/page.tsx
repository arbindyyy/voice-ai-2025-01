'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
    ArrowLeft, Play, Pause, Download, Upload, Save, Trash2, 
    Sparkles, Settings, Eye, EyeOff, ChevronDown, ChevronUp,
    Copy, Check, RotateCcw
} from 'lucide-react';
import {
    AUDIO_EFFECTS,
    EFFECT_PRESETS,
    AudioEffectsProcessor,
    AudioEffect,
    EffectPreset,
    getEffectById,
    getEffectsByCategory,
    getPresetById,
    exportEffectChain,
    importEffectChain
} from '@/lib/effects-utils';
import { generateSpeech } from '@/lib/tts-engine';
import { getVoices, type Voice } from '@/lib/voice-config';

interface ActiveEffect {
    id: string;
    effectId: string;
    parameters: Record<string, number | boolean | string>;
    enabled: boolean;
}

export default function AudioEffectsPage() {
    const [text, setText] = useState('Welcome to the audio effects studio. Transform your voice with professional effects.');
    const [selectedVoice, setSelectedVoice] = useState('sc-en-f-1');
    const [originalAudio, setOriginalAudio] = useState<AudioBuffer | null>(null);
    const [processedAudio, setProcessedAudio] = useState<AudioBuffer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [expandedEffect, setExpandedEffect] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'original' | 'processed'>('processed');
    const [copied, setCopied] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const processorRef = useRef<AudioEffectsProcessor | null>(null);

    const voices = getVoices();
    const categories = ['all', 'spatial', 'dynamics', 'filter', 'modulation', 'creative'];

    useEffect(() => {
        audioContextRef.current = new AudioContext();
        processorRef.current = new AudioEffectsProcessor(audioContextRef.current);

        return () => {
            if (sourceNodeRef.current) {
                sourceNodeRef.current.stop();
            }
            audioContextRef.current?.close();
        };
    }, []);

    const handleGenerateAudio = async () => {
        if (!text.trim()) return;

        setIsGenerating(true);
        try {
            const blob = await generateSpeech(text, selectedVoice);
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
            setOriginalAudio(audioBuffer);
            setProcessedAudio(audioBuffer);
        } catch (error) {
            console.error('Audio generation failed:', error);
            alert('Failed to generate audio');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApplyEffects = async () => {
        if (!originalAudio || !processorRef.current) return;

        setIsProcessing(true);
        try {
            const enabledEffects = activeEffects
                .filter(e => e.enabled)
                .map(e => ({ effectId: e.effectId, parameters: e.parameters }));

            const processed = await processorRef.current.applyEffects(originalAudio, enabledEffects);
            setProcessedAudio(processed);
        } catch (error) {
            console.error('Effect processing failed:', error);
            alert('Failed to apply effects');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePlay = () => {
        if (!audioContextRef.current) return;

        if (isPlaying && sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current = null;
            setIsPlaying(false);
            return;
        }

        const audioToPlay = previewMode === 'original' ? originalAudio : processedAudio;
        if (!audioToPlay) return;

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioToPlay;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
            setIsPlaying(false);
            sourceNodeRef.current = null;
        };
        source.start(0);
        sourceNodeRef.current = source;
        setIsPlaying(true);
    };

    const handleDownload = () => {
        if (!processedAudio) return;

        const wavBlob = audioBufferToWav(processedAudio);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audio-effects-${Date.now()}.wav`;
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
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
                offset += 2;
            }
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    };

    const addEffect = (effectId: string) => {
        const effect = getEffectById(effectId);
        if (!effect) return;

        const defaultParams: Record<string, any> = {};
        effect.parameters.forEach(param => {
            defaultParams[param.id] = param.default;
        });

        const newEffect: ActiveEffect = {
            id: `${effectId}-${Date.now()}`,
            effectId,
            parameters: defaultParams,
            enabled: true
        };

        setActiveEffects([...activeEffects, newEffect]);
        setExpandedEffect(newEffect.id);
    };

    const removeEffect = (id: string) => {
        setActiveEffects(activeEffects.filter(e => e.id !== id));
    };

    const toggleEffect = (id: string) => {
        setActiveEffects(activeEffects.map(e =>
            e.id === id ? { ...e, enabled: !e.enabled } : e
        ));
    };

    const updateEffectParameter = (effectId: string, paramId: string, value: number | boolean | string) => {
        setActiveEffects(activeEffects.map(e =>
            e.id === effectId
                ? { ...e, parameters: { ...e.parameters, [paramId]: value } }
                : e
        ));
    };

    const loadPreset = (presetId: string) => {
        const preset = getPresetById(presetId);
        if (!preset) return;

        const newEffects: ActiveEffect[] = preset.effects.map((e, index) => ({
            id: `${e.effectId}-${Date.now()}-${index}`,
            effectId: e.effectId,
            parameters: e.parameters,
            enabled: true
        }));

        setActiveEffects(newEffects);
    };

    const clearEffects = () => {
        setActiveEffects([]);
        setProcessedAudio(originalAudio);
    };

    const exportChain = () => {
        const chain = activeEffects.map(e => ({
            effectId: e.effectId,
            parameters: e.parameters
        }));
        const json = exportEffectChain(chain);
        navigator.clipboard.writeText(json);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const importChain = () => {
        navigator.clipboard.readText().then(text => {
            const chain = importEffectChain(text);
            if (chain.length > 0) {
                const newEffects: ActiveEffect[] = chain.map((e, index) => ({
                    id: `${e.effectId}-${Date.now()}-${index}`,
                    effectId: e.effectId,
                    parameters: e.parameters,
                    enabled: true
                }));
                setActiveEffects(newEffects);
            }
        });
    };

    const filteredEffects = selectedCategory === 'all'
        ? AUDIO_EFFECTS
        : getEffectsByCategory(selectedCategory);

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
                                <h1 className="text-2xl font-bold">Audio Effects Studio</h1>
                                <p className="text-sm text-gray-400">Professional audio processing</p>
                            </div>
                        </div>
                        <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Input & Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Text Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Input</h2>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter text to convert to speech..."
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                            />
                            <select
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="w-full mt-4 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
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
                                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
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
                            <h2 className="text-xl font-bold mb-4">Presets</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {EFFECT_PRESETS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => loadPreset(preset.id)}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 text-left transition-all group"
                                    >
                                        <div className="font-semibold text-sm group-hover:text-purple-400 transition-colors">
                                            {preset.name}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {preset.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Playback Controls */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Playback</h2>
                            <div className="flex items-center space-x-2 mb-4">
                                <button
                                    onClick={() => setPreviewMode('original')}
                                    className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                                        previewMode === 'original'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    Original
                                </button>
                                <button
                                    onClick={() => setPreviewMode('processed')}
                                    className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                                        previewMode === 'processed'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    Processed
                                </button>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handlePlay}
                                    disabled={!originalAudio}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={!processedAudio}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Middle Column - Effects Chain */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="voice-card"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Effects Chain</h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={exportChain}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                        title="Copy effect chain"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={importChain}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                        title="Paste effect chain"
                                    >
                                        <Upload className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={clearEffects}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                        title="Clear all effects"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {activeEffects.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No effects added yet</p>
                                    <p className="text-sm mt-2">Add effects from the library →</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    <AnimatePresence>
                                        {activeEffects.map((activeEffect, index) => {
                                            const effect = getEffectById(activeEffect.effectId);
                                            if (!effect) return null;

                                            return (
                                                <motion.div
                                                    key={activeEffect.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className={`bg-white/5 border rounded-lg overflow-hidden ${
                                                        activeEffect.enabled ? 'border-purple-500/50' : 'border-white/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between p-4">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-2xl">{effect.icon}</span>
                                                            <div>
                                                                <div className="font-semibold">{effect.name}</div>
                                                                <div className="text-xs text-gray-400">{effect.category}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => toggleEffect(activeEffect.id)}
                                                                className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                                            >
                                                                {activeEffect.enabled ? (
                                                                    <Eye className="w-4 h-4 text-green-400" />
                                                                ) : (
                                                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => setExpandedEffect(expandedEffect === activeEffect.id ? null : activeEffect.id)}
                                                                className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                                            >
                                                                {expandedEffect === activeEffect.id ? (
                                                                    <ChevronUp className="w-4 h-4" />
                                                                ) : (
                                                                    <ChevronDown className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => removeEffect(activeEffect.id)}
                                                                className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-400" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {expandedEffect === activeEffect.id && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="border-t border-white/10 p-4 space-y-4"
                                                            >
                                                                {effect.parameters.map((param) => (
                                                                    <div key={param.id}>
                                                                        <label className="text-sm text-gray-400 mb-2 block">
                                                                            {param.name} {param.unit && `(${param.unit})`}
                                                                        </label>
                                                                        {param.type === 'slider' && (
                                                                            <div className="flex items-center space-x-4">
                                                                                <input
                                                                                    type="range"
                                                                                    min={param.min}
                                                                                    max={param.max}
                                                                                    step={(param.max! - param.min!) / 100}
                                                                                    value={activeEffect.parameters[param.id] as number}
                                                                                    onChange={(e) => updateEffectParameter(activeEffect.id, param.id, parseFloat(e.target.value))}
                                                                                    className="flex-1"
                                                                                />
                                                                                <span className="text-sm font-mono w-16 text-right">
                                                                                    {typeof activeEffect.parameters[param.id] === 'number'
                                                                                        ? (activeEffect.parameters[param.id] as number).toFixed(1)
                                                                                        : activeEffect.parameters[param.id]}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}

                            <button
                                onClick={handleApplyEffects}
                                disabled={isProcessing || !originalAudio || activeEffects.filter(e => e.enabled).length === 0}
                                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
                            >
                                {isProcessing ? 'Processing...' : 'Apply Effects'}
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Column - Effects Library */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Effects Library</h2>
                            
                            {/* Category Filter */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                                            selectedCategory === category
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                    >
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Effects Grid */}
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {filteredEffects.map((effect) => (
                                    <button
                                        key={effect.id}
                                        onClick={() => addEffect(effect.id)}
                                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-lg p-4 text-left transition-all group"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <span className="text-2xl">{effect.icon}</span>
                                            <div className="flex-1">
                                                <div className="font-semibold group-hover:text-purple-400 transition-colors">
                                                    {effect.name}
                                                </div>
                                                <div className="text-sm text-gray-400 mt-1">
                                                    {effect.description}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    {effect.parameters.length} parameters
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
