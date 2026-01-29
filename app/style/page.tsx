'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, Play, Pause, Download, Upload, Save, RotateCcw,
    Sparkles, Sliders, Layers, Copy, Check, Shuffle
} from 'lucide-react';
import {
    VOICE_STYLES,
    VoiceStyleTransfer,
    StyleParameters,
    StylePreset,
    getStylePresetById,
    getStylesByCategory,
    getDefaultParameters,
    exportStyleParameters,
    importStyleParameters,
    STYLE_CATEGORIES
} from '@/lib/style-transfer-utils';
import { generateSpeech } from '@/lib/tts-engine';
import { getVoices, type Voice } from '@/lib/voice-config';

export default function VoiceStylePage() {
    const [text, setText] = useState('Transform your voice with professional style transfer technology.');
    const [selectedVoice, setSelectedVoice] = useState('sc-en-f-1');
    const [originalAudio, setOriginalAudio] = useState<AudioBuffer | null>(null);
    const [transformedAudio, setTransformedAudio] = useState<AudioBuffer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);
    const [previewMode, setPreviewMode] = useState<'original' | 'transformed'>('transformed');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [customMode, setCustomMode] = useState(false);
    const [copied, setCopied] = useState(false);

    const [styleParams, setStyleParams] = useState<StyleParameters>(getDefaultParameters());
    const [blendMode, setBlendMode] = useState(false);
    const [blendStyle1, setBlendStyle1] = useState<string>('robot');
    const [blendStyle2, setBlendStyle2] = useState<string>('alien');
    const [blendAmount, setBlendAmount] = useState(50);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const styleTransferRef = useRef<VoiceStyleTransfer | null>(null);

    const voices = getVoices();

    useEffect(() => {
        audioContextRef.current = new AudioContext();
        styleTransferRef.current = new VoiceStyleTransfer(audioContextRef.current);

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
            setTransformedAudio(audioBuffer);
        } catch (error) {
            console.error('Audio generation failed:', error);
            alert('Failed to generate audio');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApplyStyle = async (preset?: StylePreset) => {
        if (!originalAudio || !styleTransferRef.current) return;

        setIsTransforming(true);
        try {
            let paramsToApply = styleParams;

            if (blendMode) {
                const style1 = getStylePresetById(blendStyle1);
                const style2 = getStylePresetById(blendStyle2);
                if (style1 && style2) {
                    const transformed = await styleTransferRef.current.blendStyles(
                        originalAudio,
                        style1.parameters,
                        style2.parameters,
                        blendAmount
                    );
                    setTransformedAudio(transformed);
                    setIsTransforming(false);
                    return;
                }
            } else if (preset) {
                paramsToApply = preset.parameters;
                setStyleParams(paramsToApply);
            }

            const transformed = await styleTransferRef.current.applyStyle(
                originalAudio,
                paramsToApply
            );
            setTransformedAudio(transformed);
        } catch (error) {
            console.error('Style transfer failed:', error);
            alert('Failed to apply style');
        } finally {
            setIsTransforming(false);
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

        const audioToPlay = previewMode === 'original' ? originalAudio : transformedAudio;
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
        if (!transformedAudio) return;

        const wavBlob = audioBufferToWav(transformedAudio);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voice-style-${Date.now()}.wav`;
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

    const updateParameter = (param: keyof StyleParameters, value: number) => {
        setStyleParams({ ...styleParams, [param]: value });
    };

    const resetParameters = () => {
        setStyleParams(getDefaultParameters());
    };

    const exportParams = () => {
        const json = exportStyleParameters(styleParams);
        navigator.clipboard.writeText(json);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const importParams = async () => {
        const text = await navigator.clipboard.readText();
        const params = importStyleParameters(text);
        if (params) {
            setStyleParams(params);
        } else {
            alert('Invalid style parameters in clipboard');
        }
    };

    const filteredStyles = selectedCategory === 'all'
        ? VOICE_STYLES
        : getStylesByCategory(selectedCategory);

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
                                <h1 className="text-2xl font-bold">Voice Style Transfer</h1>
                                <p className="text-sm text-gray-400">Transform voice characteristics</p>
                            </div>
                        </div>
                        <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Input */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Input</h2>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter text..."
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

                        {/* Playback */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
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
                                    onClick={() => setPreviewMode('transformed')}
                                    className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                                        previewMode === 'transformed'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    Transformed
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
                                    disabled={!transformedAudio}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>

                        {/* Mode Toggle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Mode</h2>
                            <div className="space-y-2">
                                <button
                                    onClick={() => { setBlendMode(false); setCustomMode(false); }}
                                    className={`w-full py-3 px-4 rounded-lg transition-all ${
                                        !blendMode && !customMode
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    Preset Mode
                                </button>
                                <button
                                    onClick={() => { setBlendMode(true); setCustomMode(false); }}
                                    className={`w-full py-3 px-4 rounded-lg transition-all ${
                                        blendMode
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    <Shuffle className="w-4 h-4 inline mr-2" />
                                    Blend Mode
                                </button>
                                <button
                                    onClick={() => { setCustomMode(true); setBlendMode(false); }}
                                    className={`w-full py-3 px-4 rounded-lg transition-all ${
                                        customMode
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    <Sliders className="w-4 h-4 inline mr-2" />
                                    Custom Mode
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Middle Column - Style Presets or Blend Controls */}
                    <div className="space-y-6">
                        {!blendMode && !customMode ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="voice-card"
                            >
                                <h2 className="text-xl font-bold mb-4">Style Presets</h2>
                                
                                {/* Category Filter */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {STYLE_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`px-3 py-1 rounded-full text-sm transition-all ${
                                                selectedCategory === cat.id
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {cat.icon} {cat.name}
                                        </button>
                                    ))}
                                </div>

                                {/* Presets Grid */}
                                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                    {filteredStyles.map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => handleApplyStyle(preset)}
                                            disabled={!originalAudio || isTransforming}
                                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-lg p-4 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="font-semibold group-hover:text-purple-400 transition-colors">
                                                        {preset.name}
                                                    </div>
                                                    <div className="text-sm text-gray-400 mt-1">
                                                        {preset.description}
                                                    </div>
                                                </div>
                                                <span className="text-2xl ml-3">{getCategoryIcon(preset.category)}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : blendMode ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="voice-card"
                            >
                                <h2 className="text-xl font-bold mb-4">Blend Styles</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Style 1</label>
                                        <select
                                            value={blendStyle1}
                                            onChange={(e) => setBlendStyle1(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                        >
                                            {VOICE_STYLES.map((style) => (
                                                <option key={style.id} value={style.id}>
                                                    {style.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">
                                            Blend Amount: {blendAmount}%
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={blendAmount}
                                            onChange={(e) => setBlendAmount(parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>100% Style 1</span>
                                            <span>100% Style 2</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Style 2</label>
                                        <select
                                            value={blendStyle2}
                                            onChange={(e) => setBlendStyle2(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                        >
                                            {VOICE_STYLES.map((style) => (
                                                <option key={style.id} value={style.id}>
                                                    {style.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => handleApplyStyle()}
                                        disabled={!originalAudio || isTransforming}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
                                    >
                                        {isTransforming ? 'Processing...' : 'Apply Blend'}
                                    </button>
                                </div>
                            </motion.div>
                        ) : null}
                    </div>

                    {/* Right Column - Custom Parameters */}
                    {customMode && (
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="voice-card"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">Custom Parameters</h2>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={exportParams}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                            title="Copy parameters"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={importParams}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                            title="Paste parameters"
                                        >
                                            <Upload className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={resetParameters}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                            title="Reset"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                                    <ParameterSlider
                                        label="Pitch Shift"
                                        value={styleParams.pitchShift}
                                        min={-12}
                                        max={12}
                                        step={0.5}
                                        unit="semi"
                                        onChange={(v) => updateParameter('pitchShift', v)}
                                    />
                                    <ParameterSlider
                                        label="Formant Shift"
                                        value={styleParams.formantShift}
                                        min={-50}
                                        max={50}
                                        step={1}
                                        unit="%"
                                        onChange={(v) => updateParameter('formantShift', v)}
                                    />
                                    <ParameterSlider
                                        label="Time Stretch"
                                        value={styleParams.timeStretch}
                                        min={0.5}
                                        max={2.0}
                                        step={0.05}
                                        unit="x"
                                        onChange={(v) => updateParameter('timeStretch', v)}
                                    />
                                    <ParameterSlider
                                        label="Resonance"
                                        value={styleParams.resonance}
                                        min={0}
                                        max={100}
                                        step={1}
                                        unit="%"
                                        onChange={(v) => updateParameter('resonance', v)}
                                    />
                                    <ParameterSlider
                                        label="Breathiness"
                                        value={styleParams.breathiness}
                                        min={0}
                                        max={100}
                                        step={1}
                                        unit="%"
                                        onChange={(v) => updateParameter('breathiness', v)}
                                    />
                                    <ParameterSlider
                                        label="Brightness"
                                        value={styleParams.brightness}
                                        min={0}
                                        max={100}
                                        step={1}
                                        unit="%"
                                        onChange={(v) => updateParameter('brightness', v)}
                                    />
                                    <ParameterSlider
                                        label="Warmth"
                                        value={styleParams.warmth}
                                        min={0}
                                        max={100}
                                        step={1}
                                        unit="%"
                                        onChange={(v) => updateParameter('warmth', v)}
                                    />
                                    <ParameterSlider
                                        label="Nasality"
                                        value={styleParams.nasality}
                                        min={0}
                                        max={100}
                                        step={1}
                                        unit="%"
                                        onChange={(v) => updateParameter('nasality', v)}
                                    />
                                </div>

                                <button
                                    onClick={() => handleApplyStyle()}
                                    disabled={!originalAudio || isTransforming}
                                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
                                >
                                    {isTransforming ? 'Processing...' : 'Apply Custom Style'}
                                </button>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ParameterSlider({
    label,
    value,
    min,
    max,
    step,
    unit,
    onChange
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    onChange: (value: number) => void;
}) {
    return (
        <div>
            <label className="text-sm text-gray-400 mb-2 block">
                {label}: {value.toFixed(2)}{unit}
            </label>
            <div className="flex items-center space-x-4">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="flex-1"
                />
            </div>
        </div>
    );
}

function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
        character: '👾',
        age: '👶',
        professional: '🎙️',
        effect: '📞',
        creative: '✨'
    };
    return icons[category] || '🎭';
}
