"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Mic2,
    ArrowLeft,
    Code,
    Play,
    Download,
    Copy,
    Check,
    AlertCircle,
    BookOpen,
    Sparkles,
    Wand2,
    FileText,
    Loader2,
} from "lucide-react";
import { getTTSEngine } from "@/lib/tts-engine";
import { Voice, voices as defaultVoices } from "@/lib/voice-config";
import { downloadAudio } from "@/lib/audio-utils";
import { ssmlTemplates, ssmlTags, SSMLParser, formatSSML } from "@/lib/ssml-utils";

export default function SSMLEditorPage() {
    const [ssmlCode, setSSMLCode] = useState(ssmlTemplates[0].code);
    const [selectedVoice, setSelectedVoice] = useState<Voice>(defaultVoices[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [validationError, setValidationError] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showTagReference, setShowTagReference] = useState(false);
    const [customVoices, setCustomVoices] = useState<Voice[]>([]);

    const ttsEngine = useMemo(() => getTTSEngine(), []);
    const parser = useMemo(() => new SSMLParser(), []);

    const allVoices = useMemo(() => [...customVoices, ...defaultVoices], [customVoices]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("voiceCreator.customVoices");
            const parsed = stored ? (JSON.parse(stored) as Voice[]) : [];
            if (Array.isArray(parsed)) {
                setCustomVoices(parsed);
            }
        } catch (error) {
            console.error("Failed to load custom voices", error);
        }
    }, []);

    useEffect(() => {
        validateSSML(ssmlCode);
    }, [ssmlCode]);

    const validateSSML = (code: string) => {
        const validation = parser.validate(code);
        if (!validation.valid) {
            setValidationError(validation.error || "Invalid SSML");
        } else {
            setValidationError("");
        }
    };

    const handlePlay = async () => {
        if (validationError) {
            alert("Please fix SSML errors before playing");
            return;
        }

        setIsPlaying(true);
        try {
            // Extract plain text from SSML for basic playback
            const text = ssmlCode.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            
            await ttsEngine.speak(text, selectedVoice, {
                onEnd: () => setIsPlaying(false),
                onError: () => {
                    setIsPlaying(false);
                    alert("Error playing audio");
                },
            });
        } catch (error) {
            console.error("Play error:", error);
            setIsPlaying(false);
        }
    };

    const handleDownload = async () => {
        if (validationError) {
            alert("Please fix SSML errors before downloading");
            return;
        }

        setIsDownloading(true);
        try {
            const text = ssmlCode.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            
            const audioBlob = await ttsEngine.speakAndRecord(text, selectedVoice, {
                onEnd: () => {},
                onError: () => {
                    alert("Error generating audio");
                },
            });

            downloadAudio(audioBlob, `ssml-${Date.now()}.wav`);
        } catch (error) {
            console.error("Download error:", error);
            alert("Error downloading audio");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(ssmlCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFormat = () => {
        try {
            const formatted = formatSSML(ssmlCode);
            setSSMLCode(formatted);
        } catch (error) {
            alert("Could not format SSML");
        }
    };

    const loadTemplate = (template: typeof ssmlTemplates[0]) => {
        setSSMLCode(template.code);
        setShowTemplates(false);
    };

    const insertTag = (tag: typeof ssmlTags[0]) => {
        const example = tag.example;
        const cursorPos = (document.getElementById('ssml-editor') as HTMLTextAreaElement)?.selectionStart || ssmlCode.length;
        const newCode = ssmlCode.slice(0, cursorPos) + '\n' + example + '\n' + ssmlCode.slice(cursorPos);
        setSSMLCode(newCode);
        setShowTagReference(false);
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
                                <button className="button-secondary text-sm px-4 py-2">Studio</button>
                            </Link>
                            <Link href="/dialogue">
                                <button className="button-secondary text-sm px-4 py-2">Dialogue</button>
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
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Code className="w-10 h-10 text-purple-400" />
                            <h1 className="text-4xl font-bold">
                                <span className="text-gradient">SSML Editor</span>
                            </h1>
                        </div>
                        <p className="text-gray-400">
                            Advanced speech control with Speech Synthesis Markup Language
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Editor */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Toolbar */}
                            <div className="glass-card">
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={() => setShowTemplates(!showTemplates)}
                                        className="button-secondary text-sm px-4 py-2"
                                    >
                                        <FileText className="w-4 h-4 mr-2 inline" />
                                        Templates
                                    </button>
                                    <button
                                        onClick={() => setShowTagReference(!showTagReference)}
                                        className="button-secondary text-sm px-4 py-2"
                                    >
                                        <BookOpen className="w-4 h-4 mr-2 inline" />
                                        Tag Reference
                                    </button>
                                    <button onClick={handleFormat} className="button-secondary text-sm px-4 py-2">
                                        <Wand2 className="w-4 h-4 mr-2 inline" />
                                        Format
                                    </button>
                                    <button onClick={handleCopy} className="button-secondary text-sm px-4 py-2">
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2 inline" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4 mr-2 inline" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Templates Modal */}
                            {showTemplates && (
                                <div className="glass-card">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold">SSML Templates</h3>
                                        <button
                                            onClick={() => setShowTemplates(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                        {ssmlTemplates.map((template, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadTemplate(template)}
                                                className="glass p-4 rounded-xl text-left hover:bg-white/10 transition-all"
                                            >
                                                <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                                                <p className="text-xs text-gray-400">{template.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tag Reference Modal */}
                            {showTagReference && (
                                <div className="glass-card">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold">SSML Tags Reference</h3>
                                        <button
                                            onClick={() => setShowTagReference(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {ssmlTags.map((tag, index) => (
                                            <div key={index} className="glass p-4 rounded-xl">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-purple-400">&lt;{tag.name}&gt;</h4>
                                                    <button
                                                        onClick={() => insertTag(tag)}
                                                        className="text-xs px-3 py-1 glass hover:bg-white/10 rounded-lg"
                                                    >
                                                        Insert
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-400 mb-2">{tag.description}</p>
                                                <code className="text-xs text-green-400 block bg-black/30 p-2 rounded">
                                                    {tag.example}
                                                </code>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SSML Editor */}
                            <div className="glass-card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">SSML Code</h3>
                                    {validationError && (
                                        <div className="flex items-center space-x-2 text-red-400 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Validation Error</span>
                                        </div>
                                    )}
                                </div>
                                <textarea
                                    id="ssml-editor"
                                    value={ssmlCode}
                                    onChange={(e) => setSSMLCode(e.target.value)}
                                    className="w-full h-96 bg-black/30 border border-white/20 rounded-xl p-4 text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none custom-scrollbar"
                                    placeholder="Enter SSML code here..."
                                    spellCheck={false}
                                />
                                {validationError && (
                                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                        {validationError}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Controls & Voice Selection */}
                        <div className="space-y-6">
                            {/* Voice Selection */}
                            <div className="glass-card">
                                <h3 className="font-semibold mb-3">Select Voice</h3>
                                <select
                                    value={selectedVoice.id}
                                    onChange={(e) => {
                                        const voice = allVoices.find((v) => v.id === e.target.value);
                                        if (voice) setSelectedVoice(voice);
                                    }}
                                    className="input-field w-full"
                                >
                                    {allVoices.map((voice) => (
                                        <option key={voice.id} value={voice.id}>
                                            {voice.name} ({voice.gender})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Controls */}
                            <div className="glass-card space-y-3">
                                <button
                                    onClick={handlePlay}
                                    disabled={isPlaying || !!validationError}
                                    className="w-full button-secondary disabled:opacity-50"
                                >
                                    {isPlaying ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                                            Playing...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5 mr-2 inline" />
                                            Preview Audio
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading || !!validationError}
                                    className="w-full button-primary disabled:opacity-50"
                                >
                                    {isDownloading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5 mr-2 inline" />
                                            Generate & Download
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Quick Guide */}
                            <div className="glass-card">
                                <h3 className="font-semibold mb-3 flex items-center">
                                    <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                                    Quick Guide
                                </h3>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <p>• Use <code className="text-purple-400">&lt;prosody&gt;</code> for speed/pitch</p>
                                    <p>• Use <code className="text-purple-400">&lt;break&gt;</code> for pauses</p>
                                    <p>• Use <code className="text-purple-400">&lt;emphasis&gt;</code> for stress</p>
                                    <p>• Use <code className="text-purple-400">&lt;say-as&gt;</code> for numbers</p>
                                    <p>• All SSML must be inside <code className="text-purple-400">&lt;speak&gt;</code></p>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="glass-card">
                                <h3 className="font-semibold mb-2">💡 Pro Tips</h3>
                                <ul className="text-sm text-gray-400 space-y-1">
                                    <li>• Combine tags for complex effects</li>
                                    <li>• Test with different voices</li>
                                    <li>• Use templates as starting points</li>
                                    <li>• Format code for readability</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
