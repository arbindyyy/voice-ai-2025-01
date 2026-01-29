'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, Mic, MicOff, Play, Pause, Download, Volume2, VolumeX,
    Radio, Activity, BarChart3, Sparkles, Save, Share2
} from 'lucide-react';
import {
    MORPHING_PRESETS,
    MORPHING_CATEGORIES,
    RealtimeVoiceMorpher,
    MorphingPreset,
    AudioAnalysis,
    getPresetById,
    getPresetsByCategory,
    requestMicrophoneAccess
} from '@/lib/realtime-morphing-utils';

export default function RealtimeMorphingPage() {
    const [isActive, setIsActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string>('robot');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [outputVolume, setOutputVolume] = useState(100);
    const [analysis, setAnalysis] = useState<AudioAnalysis>({
        volume: 0,
        frequency: 0,
        pitch: 0,
        clarity: 0
    });

    const morpherRef = useRef<RealtimeVoiceMorpher | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        audioContextRef.current = new AudioContext();
        
        return () => {
            if (morpherRef.current) {
                morpherRef.current.cleanup();
            }
            audioContextRef.current?.close();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const handleStartMorphing = async () => {
        try {
            const micStream = await requestMicrophoneAccess();
            
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
            }
            
            morpherRef.current = new RealtimeVoiceMorpher(audioContextRef.current);
            await morpherRef.current.initialize(micStream);
            
            const preset = getPresetById(selectedPreset);
            if (preset) {
                morpherRef.current.applyPreset(preset);
            }
            
            setIsActive(true);
            startVisualization();
            startAnalysisUpdate();
        } catch (error) {
            console.error('Failed to start morphing:', error);
            alert('Microphone access is required. Please grant permission and try again.');
        }
    };

    const handleStopMorphing = () => {
        if (morpherRef.current) {
            morpherRef.current.cleanup();
            morpherRef.current = null;
        }
        setIsActive(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    const handlePresetChange = (presetId: string) => {
        setSelectedPreset(presetId);
        
        if (morpherRef.current && isActive) {
            const preset = getPresetById(presetId);
            if (preset) {
                morpherRef.current.applyPreset(preset);
            }
        }
    };

    const handleVolumeChange = (volume: number) => {
        setOutputVolume(volume);
        if (morpherRef.current) {
            morpherRef.current.setOutputVolume(volume / 100);
        }
    };

    const handleToggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        if (morpherRef.current) {
            morpherRef.current.setOutputVolume(newMuted ? 0 : outputVolume / 100);
        }
    };

    const handleStartRecording = () => {
        if (morpherRef.current) {
            morpherRef.current.startRecording();
            setIsRecording(true);
        }
    };

    const handleStopRecording = () => {
        if (morpherRef.current) {
            const blob = morpherRef.current.stopRecording();
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `voice-morph-${Date.now()}.webm`;
                a.click();
                URL.revokeObjectURL(url);
            }
            setIsRecording(false);
        }
    };

    const startVisualization = () => {
        if (!canvasRef.current || !morpherRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            if (!morpherRef.current) return;

            const dataArray = morpherRef.current.getTimeDomainData();
            const bufferLength = dataArray.length;

            ctx.fillStyle = 'rgb(20, 20, 30)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgb(147, 51, 234)';
            ctx.beginPath();

            const sliceWidth = canvas.width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * canvas.height) / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        draw();
    };

    const startAnalysisUpdate = () => {
        const updateAnalysis = () => {
            if (!morpherRef.current) return;

            const newAnalysis = morpherRef.current.getAnalysis();
            setAnalysis(newAnalysis);

            setTimeout(updateAnalysis, 100);
        };

        updateAnalysis();
    };

    const filteredPresets = selectedCategory === 'all'
        ? MORPHING_PRESETS
        : getPresetsByCategory(selectedCategory);

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
                                <h1 className="text-2xl font-bold">Real-Time Voice Morphing</h1>
                                <p className="text-sm text-gray-400">Live voice transformation</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Radio className={`w-6 h-6 ${isActive ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
                            <Sparkles className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Controls */}
                    <div className="space-y-6">
                        {/* Microphone Control */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Microphone</h2>
                            
                            <div className="flex items-center justify-center mb-6">
                                {!isActive ? (
                                    <button
                                        onClick={handleStartMorphing}
                                        className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center justify-center transition-all transform hover:scale-105 shadow-lg"
                                    >
                                        <Mic className="w-16 h-16 text-white" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleStopMorphing}
                                        className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 flex items-center justify-center transition-all transform hover:scale-105 shadow-lg animate-pulse"
                                    >
                                        <MicOff className="w-16 h-16 text-white" />
                                    </button>
                                )}
                            </div>

                            <div className="text-center mb-4">
                                <p className="text-lg font-semibold">
                                    {isActive ? '🎤 Live' : 'Click to Start'}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {isActive ? 'Morphing active' : 'Grant microphone access'}
                                </p>
                            </div>

                            {isActive && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Output Volume</span>
                                        <button
                                            onClick={handleToggleMute}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                        >
                                            {isMuted ? (
                                                <VolumeX className="w-4 h-4 text-red-400" />
                                            ) : (
                                                <Volume2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={outputVolume}
                                        onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                                        disabled={isMuted}
                                        className="w-full"
                                    />
                                    <div className="text-right text-sm text-gray-400">
                                        {isMuted ? 'Muted' : `${outputVolume}%`}
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Recording */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Recording</h2>
                            
                            {!isRecording ? (
                                <button
                                    onClick={handleStartRecording}
                                    disabled={!isActive}
                                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
                                >
                                    <Radio className="w-5 h-5" />
                                    <span>Start Recording</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleStopRecording}
                                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 animate-pulse"
                                >
                                    <Pause className="w-5 h-5" />
                                    <span>Stop & Download</span>
                                </button>
                            )}

                            <p className="text-xs text-gray-400 mt-3 text-center">
                                {isRecording ? '🔴 Recording morphed audio...' : 'Record your morphed voice'}
                            </p>
                        </motion.div>

                        {/* Audio Analysis */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Audio Analysis</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Volume</span>
                                        <span className="font-mono">{(analysis.volume * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-100"
                                            style={{ width: `${analysis.volume * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Frequency</span>
                                        <span className="font-mono">{analysis.frequency.toFixed(0)} Hz</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-100"
                                            style={{ width: `${Math.min(analysis.frequency / 20, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Pitch</span>
                                        <span className="font-mono">{analysis.pitch.toFixed(1)}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
                                            style={{ width: `${Math.min((analysis.pitch / 127) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Clarity</span>
                                        <span className="font-mono">{(analysis.clarity * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-100"
                                            style={{ width: `${analysis.clarity * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Middle Column - Visualization */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                                <Activity className="w-5 h-5" />
                                <span>Waveform</span>
                            </h2>
                            
                            <canvas
                                ref={canvasRef}
                                width={600}
                                height={200}
                                className="w-full h-48 bg-gray-950 rounded-lg border border-white/10"
                            />

                            <div className="mt-4 text-center text-sm text-gray-400">
                                {isActive ? 'Real-time audio visualization' : 'Start morphing to see waveform'}
                            </div>
                        </motion.div>

                        {/* Current Preset Info */}
                        {selectedPreset && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="voice-card"
                            >
                                <h2 className="text-xl font-bold mb-4">Active Preset</h2>
                                
                                {(() => {
                                    const preset = getPresetById(selectedPreset);
                                    if (!preset) return null;
                                    
                                    return (
                                        <div className="bg-white/5 border border-purple-500/50 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-purple-400">
                                                        {preset.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {preset.description}
                                                    </p>
                                                </div>
                                                <span className="text-3xl">{preset.icon}</span>
                                            </div>
                                            
                                            <div className="space-y-2 mt-4">
                                                <div className="text-xs text-gray-500 uppercase tracking-wider">
                                                    Effects Chain
                                                </div>
                                                {preset.effects.map((effect, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center space-x-2 text-sm"
                                                    >
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            effect.enabled ? 'bg-green-400' : 'bg-gray-600'
                                                        }`} />
                                                        <span className="text-gray-300 capitalize">
                                                            {effect.type}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Presets */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="voice-card"
                        >
                            <h2 className="text-xl font-bold mb-4">Voice Presets</h2>
                            
                            {/* Category Filter */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {MORPHING_CATEGORIES.map((cat) => (
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
                                {filteredPresets.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => handlePresetChange(preset.id)}
                                        className={`w-full rounded-lg p-4 text-left transition-all ${
                                            selectedPreset === preset.id
                                                ? 'bg-purple-600/20 border-2 border-purple-500'
                                                : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="font-semibold flex items-center space-x-2">
                                                    <span>{preset.name}</span>
                                                    {selectedPreset === preset.id && (
                                                        <span className="text-xs bg-purple-500 px-2 py-0.5 rounded-full">
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-400 mt-1">
                                                    {preset.description}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    {preset.effects.length} effects
                                                </div>
                                            </div>
                                            <span className="text-2xl ml-3">{preset.icon}</span>
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
