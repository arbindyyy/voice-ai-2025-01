"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Mic2,
    Play,
    ArrowLeft,
    Filter,
    Search,
    Volume2
} from "lucide-react";
import { voices, Voice } from "@/lib/voice-config";
import { getTTSEngine } from "@/lib/tts-engine";

export default function VoicesPage() {
    const [selectedLanguage, setSelectedLanguage] = useState<"all" | "en" | "hi">("all");
    const [selectedGender, setSelectedGender] = useState<"all" | "male" | "female">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [playingVoice, setPlayingVoice] = useState<string | null>(null);

    const filteredVoices = voices.filter((voice) => {
        const matchesLanguage =
            selectedLanguage === "all" ||
            voice.language === selectedLanguage ||
            voice.language === "both";
        const matchesGender =
            selectedGender === "all" || voice.gender === selectedGender;
        const matchesSearch =
            searchQuery === "" ||
            voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            voice.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesLanguage && matchesGender && matchesSearch;
    });

    const handlePlaySample = async (voice: Voice) => {
        const tts = getTTSEngine();

        if (playingVoice === voice.id) {
            tts.stop();
            setPlayingVoice(null);
            return;
        }

        setPlayingVoice(voice.id);

        const sampleText =
            voice.language === "en" ? voice.sampleText.en : voice.sampleText.hi;

        try {
            await tts.speak(sampleText, voice, {
                onEnd: () => setPlayingVoice(null),
                onError: () => setPlayingVoice(null),
            });
        } catch (error) {
            console.error("Error playing sample:", error);
            setPlayingVoice(null);
        }
    };

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
                        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                            <ArrowLeft className="w-5 h-5" />
                            <Mic2 className="w-8 h-8 text-purple-400" />
                            <span className="text-2xl font-bold text-gradient">VoiceCreator</span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link href="/studio">
                                <button className="button-primary text-sm px-4 py-2">
                                    Go to Studio
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
                        <span className="text-gradient">Voice Library</span>
                    </h1>
                    <p className="text-gray-400 mb-8">
                        Explore our collection of {voices.length} professional voices
                    </p>

                    {/* Filters */}
                    <div className="glass-card mb-8">
                        <div className="flex items-center space-x-2 mb-4">
                            <Filter className="w-5 h-5 text-purple-400" />
                            <h3 className="font-semibold">Filters</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="md:col-span-3 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search voices..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>

                            {/* Language Filter */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Language</label>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value as any)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                                >
                                    <option value="all">All Languages</option>
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                </select>
                            </div>

                            {/* Gender Filter */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Gender</label>
                                <select
                                    value={selectedGender}
                                    onChange={(e) => setSelectedGender(e.target.value as any)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                                >
                                    <option value="all">All Genders</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            {/* Results Count */}
                            <div className="flex items-end">
                                <div className="px-4 py-3 glass rounded-xl w-full text-center">
                                    <span className="text-purple-400 font-semibold">
                                        {filteredVoices.length}
                                    </span>
                                    <span className="text-gray-400 ml-2">voices found</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Voice Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVoices.map((voice, index) => (
                            <motion.div
                                key={voice.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className="voice-card"
                            >
                                <div className="relative">
                                    {/* Voice Avatar/Icon */}
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
                                        <Volume2 className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Voice Info */}
                                    <h3 className="text-2xl font-bold mb-2">{voice.name}</h3>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                                            {voice.language === "en"
                                                ? "English"
                                                : voice.language === "hi"
                                                    ? "Hindi"
                                                    : "Multilingual"}
                                        </span>
                                        <span className="text-xs px-3 py-1 rounded-full bg-white/10">
                                            {voice.gender}
                                        </span>
                                        <span className="text-xs px-3 py-1 rounded-full bg-white/10">
                                            {voice.style}
                                        </span>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {voice.description}
                                    </p>

                                    {/* Sample Text Preview */}
                                    <div className="glass p-3 rounded-lg mb-4 text-sm text-gray-300 italic line-clamp-2">
                                        &quot;
                                        {voice.language === "en"
                                            ? voice.sampleText.en
                                            : voice.sampleText.hi}
                                        &quot;
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handlePlaySample(voice)}
                                            className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${playingVoice === voice.id
                                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white animate-pulse"
                                                    : "glass hover:bg-white/10"
                                                }`}
                                        >
                                            <Play className="w-4 h-4" />
                                            <span>{playingVoice === voice.id ? "Playing..." : "Preview"}</span>
                                        </button>

                                        <Link href={`/studio?voice=${voice.id}`} className="flex-1">
                                            <button className="w-full button-primary text-sm px-4 py-2">
                                                Use Voice
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* No Results */}
                    {filteredVoices.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold mb-2">No voices found</h3>
                            <p className="text-gray-400">Try adjusting your filters</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
