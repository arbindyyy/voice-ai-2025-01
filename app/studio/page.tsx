"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Mic2,
    Play,
    Pause,
    Download,
    Volume2,
    Settings,
    ArrowLeft,
    Sparkles,
    Languages
} from "lucide-react";
import { voices, Voice, getVoicesByLanguage } from "@/lib/voice-config";
import { getTTSEngine } from "@/lib/tts-engine";
import { downloadAudio } from "@/lib/audio-utils";

export default function StudioPage() {
    const [text, setText] = useState("");
    const [selectedVoice, setSelectedVoice] = useState<Voice>(voices[0]);
    const [language, setLanguage] = useState<"en" | "hi">("en");
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [pitch, setPitch] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [filteredVoices, setFilteredVoices] = useState<Voice[]>([]);

    useEffect(() => {
        const filtered = getVoicesByLanguage(language);
        setFilteredVoices(filtered);
        if (filtered.length > 0 && selectedVoice.language !== language && selectedVoice.language !== "both") {
            setSelectedVoice(filtered[0]);
        }
    }, [language, selectedVoice]);

    const handleSpeak = async () => {
        if (!text.trim()) {
            alert("Please enter some text first!");
            return;
        }

        const tts = getTTSEngine();

        if (isPlaying) {
            tts.stop();
            setIsPlaying(false);
            return;
        }

        setIsPlaying(true);

        try {
            await tts.speak(text, selectedVoice, {
                rate: speed,
                pitch: pitch,
                onEnd: () => setIsPlaying(false),
                onError: () => {
                    setIsPlaying(false);
                    alert("Error playing audio. Please try again.");
                },
            });
        } catch (error) {
            console.error("TTS Error:", error);
            setIsPlaying(false);
        }
    };

    const handleDownload = async () => {
        if (!text.trim()) {
            alert("Please enter some text first!");
            return;
        }

        const tts = getTTSEngine();

        try {
            setIsPlaying(true);

            // Record and generate audio
            const audioBlob = await tts.speakAndRecord(text, selectedVoice, {
                rate: speed,
                pitch: pitch,
                onEnd: () => setIsPlaying(false),
                onError: () => {
                    setIsPlaying(false);
                    alert("Error recording audio. Please try again.");
                },
            });

            // Download the audio file
            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `voice-${selectedVoice.name}-${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setIsPlaying(false);

        } catch (error) {
            console.error("Download Error:", error);
            setIsPlaying(false);
            alert("Error downloading audio. Please try again.");
        }
    };

    const characterCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 glass border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                                <ArrowLeft className="w-5 h-5" />
                                <Mic2 className="w-8 h-8 text-purple-400" />
                                <span className="text-2xl font-bold text-gradient">VoiceCreator</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/voices">
                                <button className="button-secondary text-sm px-4 py-2">
                                    <Volume2 className="w-4 h-4 inline mr-2" />
                                    Voices
                                </button>
                            </Link>
                            <Link href="/clone">
                                <button className="button-primary text-sm px-4 py-2">
                                    <Sparkles className="w-4 h-4 inline mr-2" />
                                    Clone Voice
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-gradient">Studio</span>
                    </h1>
                    <p className="text-gray-400 mb-8">Create amazing voice overs in seconds</p>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left Panel - Text Input */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Language Selector */}
                            <div className="glass-card">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Languages className="w-5 h-5 text-purple-400" />
                                    <h3 className="font-semibold">Language</h3>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setLanguage("en")}
                                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${language === "en"
                                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                            : "glass hover:bg-white/10"
                                            }`}
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => setLanguage("hi")}
                                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${language === "hi"
                                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                            : "glass hover:bg-white/10"
                                            }`}
                                    >
                                        हिंदी (Hindi)
                                    </button>
                                </div>
                            </div>

                            {/* Text Input */}
                            <div className="glass-card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">Your Text</h3>
                                    <div className="text-sm text-gray-400">
                                        {characterCount} chars • {wordCount} words
                                    </div>
                                </div>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder={
                                        language === "en"
                                            ? "Enter your text here... Type anything you want to convert to speech!"
                                            : "यहाँ अपना टेक्स्ट दर्ज करें... जो भी आप बोलना चाहते हैं वह लिखें!"
                                    }
                                    className="w-full h-64 bg-transparent border border-white/20 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none custom-scrollbar"
                                />
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={() =>
                                            setText(
                                                language === "en"
                                                    ? "Welcome to Voice Creator! This is an amazing text-to-speech application with multiple voices and languages."
                                                    : "वॉइस क्रिएटर में आपका स्वागत है! यह एक अद्भुत टेक्स्ट-टू-स्पीच एप्लिकेशन है।"
                                            )
                                        }
                                        className="px-4 py-2 text-sm glass hover:bg-white/10 rounded-lg transition-all"
                                    >
                                        Sample Text
                                    </button>
                                    <button
                                        onClick={() => setText("")}
                                        className="px-4 py-2 text-sm glass hover:bg-white/10 rounded-lg transition-all"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="glass-card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">Controls</h3>
                                    <button
                                        onClick={() => setShowSettings(!showSettings)}
                                        className="p-2 glass hover:bg-white/10 rounded-lg transition-all"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </button>
                                </div>

                                {showSettings && (
                                    <div className="mb-6 space-y-4 p-4 glass rounded-xl">
                                        <div>
                                            <label className="text-sm text-gray-400 mb-2 block">
                                                Speed: {speed.toFixed(1)}x
                                            </label>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="2"
                                                step="0.1"
                                                value={speed}
                                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                                className="w-full accent-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400 mb-2 block">
                                                Pitch: {pitch.toFixed(1)}
                                            </label>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="2"
                                                step="0.1"
                                                value={pitch}
                                                onChange={(e) => setPitch(parseFloat(e.target.value))}
                                                className="w-full accent-purple-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleSpeak}
                                            disabled={!text.trim()}
                                            className="flex-1 button-secondary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isPlaying ? (
                                                <>
                                                    <Pause className="w-5 h-5" />
                                                    <span>Stop</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-5 h-5" />
                                                    <span>Preview</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleDownload}
                                        disabled={!text.trim() || isPlaying}
                                        className="w-full button-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        <span>Generate & Download Audio</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Voice Selection */}
                        <div className="lg:col-span-1">
                            <div className="glass-card sticky top-24">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Volume2 className="w-5 h-5 text-purple-400" />
                                    <h3 className="font-semibold">Select Voice</h3>
                                </div>

                                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                    {filteredVoices.map((voice) => (
                                        <button
                                            key={voice.id}
                                            onClick={() => setSelectedVoice(voice)}
                                            className={`w-full text-left p-4 rounded-xl transition-all ${selectedVoice.id === voice.id
                                                ? "bg-gradient-to-r from-purple-600/50 to-blue-600/50 border-2 border-purple-500"
                                                : "glass hover:bg-white/10 border-2 border-transparent"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-lg">{voice.name}</h4>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                                                            {voice.gender}
                                                        </span>
                                                        <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                                                            {voice.style}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 line-clamp-2">
                                                {voice.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <Link href="/voices">
                                        <button className="w-full button-secondary text-sm">
                                            View All Voices
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}
