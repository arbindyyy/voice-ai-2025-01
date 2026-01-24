"use client";

import { useState, useEffect, useRef } from "react";
import {
    Play,
    Pause,
    Download,
    Share2,
    Scissors,
    Volume2,
    RotateCcw,
    Sparkles,
    Music,
    Copy,
    X,
    Undo2,
    Check
} from "lucide-react";
import { AudioEditor, downloadAudio, shareAudio, copyAudioURL } from "@/lib/audio-utils";

interface AudioEditorComponentProps {
    audioBlob: Blob | null;
    filename: string;
    onClose?: () => void;
}

export default function AudioEditorComponent({
    audioBlob,
    filename,
    onClose
}: AudioEditorComponentProps) {
    const [currentBlob, setCurrentBlob] = useState<Blob | null>(audioBlob);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(100);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(100);
    const [fadeInDuration, setFadeInDuration] = useState(0);
    const [fadeOutDuration, setFadeOutDuration] = useState(0);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    const audioRef = useRef<HTMLAudioElement>(null);
    const editorRef = useRef<AudioEditor | null>(null);

    useEffect(() => {
        if (audioBlob) {
            setCurrentBlob(audioBlob);
            loadAudio(audioBlob);
        }
    }, [audioBlob]);

    const loadAudio = async (blob: Blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.onloadedmetadata = () => {
                setDuration(audioRef.current?.duration || 0);
                setTrimEnd(audioRef.current?.duration || 100);
            };
        }

        // Initialize editor
        editorRef.current = new AudioEditor();
        await editorRef.current.loadAudio(blob);
        setHistory(["Original"]);
    };

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleVolumeChange = (value: number) => {
        setVolume(value);
        if (audioRef.current) {
            audioRef.current.volume = value / 100;
        }
    };

    const handleTrim = async () => {
        if (!editorRef.current || !currentBlob) return;

        setProcessing(true);
        try {
            const startTime = (trimStart / 100) * duration;
            const endTime = (trimEnd / 100) * duration;
            const trimmedBlob = await editorRef.current.trim(startTime, endTime);
            setCurrentBlob(trimmedBlob);
            await loadAudio(trimmedBlob);
            setHistory([...history, "Trimmed"]);
        } catch (error) {
            console.error("Trim error:", error);
            alert("Error trimming audio");
        }
        setProcessing(false);
    };

    const handleVolumeAdjust = async (multiplier: number) => {
        if (!editorRef.current) return;

        setProcessing(true);
        try {
            const adjustedBlob = await editorRef.current.adjustVolume(multiplier);
            setCurrentBlob(adjustedBlob);
            await loadAudio(adjustedBlob);
            setHistory([...history, `Volume ${multiplier > 1 ? "+" : ""}${Math.round((multiplier - 1) * 100)}%`]);
        } catch (error) {
            console.error("Volume adjust error:", error);
            alert("Error adjusting volume");
        }
        setProcessing(false);
    };

    const handleFade = async (type: "in" | "out") => {
        if (!editorRef.current) return;

        setProcessing(true);
        try {
            const fadeDuration = type === "in" ? fadeInDuration : fadeOutDuration;
            const fadedBlob = await editorRef.current.fade(type, fadeDuration);
            setCurrentBlob(fadedBlob);
            await loadAudio(fadedBlob);
            setHistory([...history, `Fade ${type} (${fadeDuration}s)`]);
        } catch (error) {
            console.error("Fade error:", error);
            alert("Error applying fade");
        }
        setProcessing(false);
    };

    const handleReverse = async () => {
        if (!editorRef.current) return;

        setProcessing(true);
        try {
            const reversedBlob = await editorRef.current.reverse();
            setCurrentBlob(reversedBlob);
            await loadAudio(reversedBlob);
            setHistory([...history, "Reversed"]);
        } catch (error) {
            console.error("Reverse error:", error);
            alert("Error reversing audio");
        }
        setProcessing(false);
    };

    const handleNormalize = async () => {
        if (!editorRef.current) return;

        setProcessing(true);
        try {
            const normalizedBlob = await editorRef.current.normalize();
            setCurrentBlob(normalizedBlob);
            await loadAudio(normalizedBlob);
            setHistory([...history, "Normalized"]);
        } catch (error) {
            console.error("Normalize error:", error);
            alert("Error normalizing audio");
        }
        setProcessing(false);
    };

    const handleUndo = async () => {
        if (!editorRef.current || history.length < 2) return;

        const previousBlob = editorRef.current.undo();
        if (previousBlob) {
            setCurrentBlob(previousBlob);
            await loadAudio(previousBlob);
            setHistory(history.slice(0, -1));
        }
    };

    const handleDownload = async (format: "webm" | "wav" | "mp3" | "ogg") => {
        if (!currentBlob) return;

        await downloadAudio(currentBlob, filename, format);
        setShowDownloadMenu(false);
    };

    const handleShare = async () => {
        if (!currentBlob) return;

        try {
            await shareAudio(currentBlob, `${filename}.webm`, "Voice Creator Audio");
            setShowShareMenu(false);
        } catch (error) {
            console.error("Share error:", error);
        }
    };

    const handleCopyLink = async () => {
        if (!currentBlob) return;

        try {
            await copyAudioURL(currentBlob);
            alert("Audio URL copied to clipboard!");
            setShowShareMenu(false);
        } catch (error) {
            console.error("Copy error:", error);
            alert("Error copying link");
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <Music className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold">Audio Editor</h3>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 glass hover:bg-white/10 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onEnded={() => setIsPlaying(false)}
            />

            {/* Waveform/Progress */}
            <div className="glass p-4 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-2 text-sm text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
                <div
                    className="h-2 bg-white/20 rounded-full cursor-pointer"
                    onClick={(e) => {
                        if (audioRef.current && duration) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const percent = (e.clientX - rect.left) / rect.width;
                            audioRef.current.currentTime = percent * duration;
                        }
                    }}
                >
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                    onClick={handlePlayPause}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center hover:scale-105 transition-transform"
                >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>

                <div className="flex items-center space-x-2 glass px-4 py-2 rounded-xl">
                    <Volume2 className="w-4 h-4" />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="w-24 accent-purple-500"
                    />
                    <span className="text-sm w-10">{volume}%</span>
                </div>
            </div>

            {/* Editing Tools (Tabs) */}
            <div className="space-y-4">
                {/* Trim */}
                <div className="glass p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <Scissors className="w-4 h-4 text-purple-400" />
                            <span className="font-semibold">Trim Audio</span>
                        </div>
                        <button
                            onClick={handleTrim}
                            disabled={processing}
                            className="px-4 py-1 text-sm button-primary disabled:opacity-50"
                        >
                            {processing ? "Processing..." : "Apply"}
                        </button>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <label className="text-sm text-gray-400">Start: {formatTime((trimStart / 100) * duration)}</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={trimStart}
                                onChange={(e) => setTrimStart(Number(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">End: {formatTime((trimEnd / 100) * duration)}</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={trimEnd}
                                onChange={(e) => setTrimEnd(Number(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Volume Adjust */}
                <div className="glass p-4 rounded-xl">
                    <div className="flex items-center space-x-2 mb-3">
                        <Volume2 className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold">Adjust Volume</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={() => handleVolumeAdjust(0.5)} className="px-3 py-2 text-sm glass hover:bg-white/10 rounded-lg">-50%</button>
                        <button onClick={() => handleVolumeAdjust(0.75)} className="px-3 py-2 text-sm glass hover:bg-white/10 rounded-lg">-25%</button>
                        <button onClick={() => handleVolumeAdjust(1.5)} className="px-3 py-2 text-sm glass hover:bg-white/10 rounded-lg">+50%</button>
                        <button onClick={() => handleVolumeAdjust(2)} className="px-3 py-2 text-sm glass hover:bg-white/10 rounded-lg">+100%</button>
                    </div>
                </div>

                {/* Effects */}
                <div className="glass p-4 rounded-xl">
                    <div className="flex items-center space-x-2 mb-3">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold">Effects</span>
                    </div>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-sm text-gray-400">Fade In (seconds)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={fadeInDuration}
                                    onChange={(e) => setFadeInDuration(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                />
                            </div>
                            <button
                                onClick={() => handleFade("in")}
                                disabled={processing || fadeInDuration === 0}
                                className="button-secondary text-sm mt-6 disabled:opacity-50"
                            >
                                Apply Fade In
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-sm text-gray-400">Fade Out (seconds)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={fadeOutDuration}
                                    onChange={(e) => setFadeOutDuration(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                />
                            </div>
                            <button
                                onClick={() => handleFade("out")}
                                disabled={processing || fadeOutDuration === 0}
                                className="button-secondary text-sm mt-6 disabled:opacity-50"
                            >
                                Apply Fade Out
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleReverse}
                                disabled={processing}
                                className="button-secondary text-sm disabled:opacity-50"
                            >
                                <RotateCcw className="w-4 h-4 inline mr-2" />
                                Reverse
                            </button>
                            <button
                                onClick={handleNormalize}
                                disabled={processing}
                                className="button-secondary text-sm disabled:opacity-50"
                            >
                                <Check className="w-4 h-4 inline mr-2" />
                                Normalize
                            </button>
                        </div>
                    </div>
                </div>

                {/* History */}
                {history.length > 1 && (
                    <div className="glass p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                                History: {history[history.length - 1]}
                            </span>
                            <button
                                onClick={handleUndo}
                                disabled={history.length < 2}
                                className="px-3 py-1 text-sm button-secondary disabled:opacity-50"
                            >
                                <Undo2 className="w-4 h-4 inline mr-1" />
                                Undo
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Download & Share */}
            <div className="flex space-x-3 mt-6">
                <div className="relative flex-1">
                    <button
                        onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                        className="w-full button-primary flex items-center justify-center space-x-2"
                    >
                        <Download className="w-5 h-5" />
                        <span>Download</span>
                    </button>

                    {showDownloadMenu && (
                        <div className="absolute bottom-full left-0 mb-2 w-full glass rounded-xl p-2 space-y-1 z-10">
                            <button onClick={() => handleDownload("webm")} className="w-full px-3 py-2 text-sm hover:bg-white/10 rounded-lg text-left">WebM (Default)</button>
                            <button onClick={() => handleDownload("wav")} className="w-full px-3 py-2 text-sm hover:bg-white/10 rounded-lg text-left">WAV (High Quality)</button>
                            <button onClick={() => handleDownload("mp3")} className="w-full px-3 py-2 text-sm hover:bg-white/10 rounded-lg text-left">MP3 (Compatible)</button>
                            <button onClick={() => handleDownload("ogg")} className="w-full px-3 py-2 text-sm hover:bg-white/10 rounded-lg text-left">OGG (Web)</button>
                        </div>
                    )}
                </div>

                <div className="relative flex-1">
                    <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="w-full button-secondary flex items-center justify-center space-x-2"
                    >
                        <Share2 className="w-5 h-5" />
                        <span>Share</span>
                    </button>

                    {showShareMenu && (
                        <div className="absolute bottom-full left-0 mb-2 w-full glass rounded-xl p-2 space-y-1 z-10">
                            <button onClick={handleShare} className="w-full px-3 py-2 text-sm hover:bg-white/10 rounded-lg text-left flex items-center space-x-2">
                                <Share2 className="w-4 h-4" />
                                <span>Share via...</span>
                            </button>
                            <button onClick={handleCopyLink} className="w-full px-3 py-2 text-sm hover:bg-white/10 rounded-lg text-left flex items-center space-x-2">
                                <Copy className="w-4 h-4" />
                                <span>Copy Link</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
