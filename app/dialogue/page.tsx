"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Mic2,
    ArrowLeft,
    Plus,
    Trash2,
    Play,
    Download,
    Save,
    Upload,
    Users,
    Sparkles,
    Loader2,
    Music,
} from "lucide-react";
import { TTSEngine, DialogueLine, DialogueScript } from "@/lib/tts-engine";
import { Voice, voices as defaultVoices } from "@/lib/voice-config";
import { downloadAudio } from "@/lib/audio-utils";

export default function DialoguePage() {
    const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([
        {
            id: "line-1",
            speaker: "Character A",
            voiceId: "sc-en-f-1",
            text: "Hello! How are you today?",
            emotion: "happy",
            pause: 500,
        },
        {
            id: "line-2",
            speaker: "Character B",
            voiceId: "sc-en-m-1",
            text: "I'm doing great, thanks for asking!",
            emotion: "neutral",
            pause: 500,
        },
    ]);

    const [scriptTitle, setScriptTitle] = useState("My Dialogue");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generatedAudio, setGeneratedAudio] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string>("");
    const [backgroundMusic, setBackgroundMusic] = useState<File | null>(null);
    const [showScriptImport, setShowScriptImport] = useState(false);

    const ttsEngine = useMemo(() => new TTSEngine(), []);

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            ttsEngine.cleanup();
        };
    }, [audioUrl, ttsEngine]);

    const availableVoices = useMemo(() => {
        const customVoiceKey = "voiceCreator.customVoices";
        try {
            const stored = localStorage.getItem(customVoiceKey);
            const custom = stored ? (JSON.parse(stored) as Voice[]) : [];
            return [...defaultVoices, ...custom];
        } catch {
            return defaultVoices;
        }
    }, []);

    const addLine = () => {
        const newLine: DialogueLine = {
            id: `line-${Date.now()}`,
            speaker: `Character ${dialogueLines.length + 1}`,
            voiceId: availableVoices[0]?.id || "sc-en-f-1",
            text: "",
            emotion: "neutral",
            pause: 500,
        };
        setDialogueLines([...dialogueLines, newLine]);
    };

    const removeLine = (id: string) => {
        setDialogueLines(dialogueLines.filter((line) => line.id !== id));
    };

    const updateLine = (id: string, updates: Partial<DialogueLine>) => {
        setDialogueLines(
            dialogueLines.map((line) =>
                line.id === id ? { ...line, ...updates } : line
            )
        );
    };

    const handleGenerate = async () => {
        if (dialogueLines.length === 0) {
            alert("Please add at least one dialogue line");
            return;
        }

        if (dialogueLines.some((line) => !line.text.trim())) {
            alert("Please fill in all dialogue text");
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);

        try {
            const script: DialogueScript = {
                id: Date.now().toString(),
                title: scriptTitle,
                lines: dialogueLines,
                backgroundMusic: backgroundMusic
                    ? new Blob([await backgroundMusic.arrayBuffer()], {
                          type: backgroundMusic.type,
                      })
                    : undefined,
            };

            const voiceMap = new Map<string, Voice>();
            for (const line of dialogueLines) {
                const voice = availableVoices.find((v) => v.id === line.voiceId);
                if (voice) {
                    voiceMap.set(line.voiceId, voice);
                }
            }

            const audioBlob = await ttsEngine.generateDialogue(
                script,
                voiceMap,
                (current, total) => {
                    setGenerationProgress(Math.round((current / total) * 100));
                }
            );

            if (audioUrl) URL.revokeObjectURL(audioUrl);
            const url = URL.createObjectURL(audioBlob);
            setGeneratedAudio(audioBlob);
            setAudioUrl(url);
        } catch (error) {
            console.error("Dialogue generation error:", error);
            alert("Failed to generate dialogue. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (generatedAudio) {
            downloadAudio(generatedAudio, `${scriptTitle.replace(/\s+/g, "-")}.wav`);
        }
    };

    const handleScriptImport = (text: string) => {
        const parsed = ttsEngine.parseDialogueScript(text);
        if (parsed.length > 0) {
            setDialogueLines(parsed);
            setShowScriptImport(false);
        } else {
            alert("Could not parse script. Please check the format.");
        }
    };

    const handleBackgroundMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBackgroundMusic(e.target.files[0]);
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
                                <button className="button-secondary text-sm px-4 py-2">Studio</button>
                            </Link>
                            <Link href="/voices">
                                <button className="button-secondary text-sm px-4 py-2">Voices</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Users className="w-10 h-10 text-purple-400" />
                            <h1 className="text-4xl font-bold">
                                <span className="text-gradient">Multi-Voice Dialogue</span>
                            </h1>
                        </div>
                        <p className="text-gray-400">
                            Create conversations with multiple voices
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Dialogue Editor */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Script Title */}
                            <div className="glass-card">
                                <label className="block text-sm font-medium mb-2">Script Title</label>
                                <input
                                    type="text"
                                    value={scriptTitle}
                                    onChange={(e) => setScriptTitle(e.target.value)}
                                    className="input-field w-full"
                                    placeholder="Enter script title"
                                />
                            </div>

                            {/* Dialogue Lines */}
                            <div className="glass-card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg">Dialogue Lines</h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setShowScriptImport(!showScriptImport)}
                                            className="button-secondary text-sm px-3 py-1"
                                        >
                                            <Upload className="w-4 h-4 mr-1 inline" />
                                            Import
                                        </button>
                                        <button onClick={addLine} className="button-primary text-sm px-3 py-1">
                                            <Plus className="w-4 h-4 mr-1 inline" />
                                            Add Line
                                        </button>
                                    </div>
                                </div>

                                {/* Script Import */}
                                {showScriptImport && (
                                    <div className="glass p-4 rounded-xl mb-4">
                                        <p className="text-sm text-gray-400 mb-2">
                                            Format: [Speaker|VoiceID]: Text {"{"} emotion{"}"} {"{"} pause:500{"}"}
                                        </p>
                                        <textarea
                                            className="input-field w-full h-32 mb-2"
                                            placeholder="[Alice|sc-en-f-1]: Hello! {happy} {pause:500}"
                                            id="script-import"
                                        />
                                        <button
                                            onClick={() => {
                                                const textarea = document.getElementById("script-import") as HTMLTextAreaElement;
                                                handleScriptImport(textarea.value);
                                            }}
                                            className="button-primary text-sm"
                                        >
                                            Parse Script
                                        </button>
                                    </div>
                                )}

                                {/* Lines */}
                                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                    {dialogueLines.map((line, index) => (
                                        <div key={line.id} className="glass p-4 rounded-xl">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-purple-400 font-bold">#{index + 1}</span>
                                                    <input
                                                        type="text"
                                                        value={line.speaker}
                                                        onChange={(e) =>
                                                            updateLine(line.id, { speaker: e.target.value })
                                                        }
                                                        className="input-field text-sm px-2 py-1"
                                                        placeholder="Speaker name"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeLine(line.id)}
                                                    className="text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <textarea
                                                value={line.text}
                                                onChange={(e) => updateLine(line.id, { text: e.target.value })}
                                                className="input-field w-full h-20 mb-3"
                                                placeholder="Enter dialogue text..."
                                            />

                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <label className="text-xs text-gray-400">Voice</label>
                                                    <select
                                                        value={line.voiceId}
                                                        onChange={(e) =>
                                                            updateLine(line.id, { voiceId: e.target.value })
                                                        }
                                                        className="input-field text-sm w-full"
                                                    >
                                                        {availableVoices.map((voice) => (
                                                            <option key={voice.id} value={voice.id}>
                                                                {voice.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-xs text-gray-400">Emotion</label>
                                                    <select
                                                        value={line.emotion}
                                                        onChange={(e) =>
                                                            updateLine(line.id, {
                                                                emotion: e.target.value as any,
                                                            })
                                                        }
                                                        className="input-field text-sm w-full"
                                                    >
                                                        <option value="neutral">Neutral</option>
                                                        <option value="happy">Happy</option>
                                                        <option value="sad">Sad</option>
                                                        <option value="angry">Angry</option>
                                                        <option value="excited">Excited</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-xs text-gray-400">Pause (ms)</label>
                                                    <input
                                                        type="number"
                                                        value={line.pause}
                                                        onChange={(e) =>
                                                            updateLine(line.id, {
                                                                pause: parseInt(e.target.value) || 500,
                                                            })
                                                        }
                                                        className="input-field text-sm w-full"
                                                        min="0"
                                                        step="100"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Controls & Output */}
                        <div className="space-y-6">
                            {/* Background Music */}
                            <div className="glass-card">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Music className="w-5 h-5 text-purple-400" />
                                    <h3 className="font-semibold">Background Music</h3>
                                </div>
                                <label className="button-secondary w-full cursor-pointer text-center">
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleBackgroundMusicUpload}
                                        className="hidden"
                                    />
                                    {backgroundMusic ? (
                                        <span className="text-sm">{backgroundMusic.name}</span>
                                    ) : (
                                        <span className="text-sm">Upload Music (Optional)</span>
                                    )}
                                </label>
                                {backgroundMusic && (
                                    <button
                                        onClick={() => setBackgroundMusic(null)}
                                        className="text-xs text-red-400 hover:text-red-300 mt-2"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || dialogueLines.length === 0}
                                className="button-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                                        Generating... {generationProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2 inline" />
                                        Generate Dialogue
                                    </>
                                )}
                            </button>

                            {/* Audio Player */}
                            {audioUrl && (
                                <div className="glass-card">
                                    <h3 className="font-semibold mb-3">Generated Audio</h3>
                                    <audio
                                        src={audioUrl}
                                        controls
                                        className="w-full mb-3"
                                        style={{
                                            filter: "invert(0.9) hue-rotate(180deg)",
                                        }}
                                    />
                                    <button onClick={handleDownload} className="button-primary w-full">
                                        <Download className="w-4 h-4 mr-2 inline" />
                                        Download Audio
                                    </button>
                                </div>
                            )}

                            {/* Info */}
                            <div className="glass-card">
                                <h3 className="font-semibold mb-2">💡 Tips</h3>
                                <ul className="text-sm text-gray-400 space-y-1">
                                    <li>• Use different voices for each character</li>
                                    <li>• Adjust emotions for natural conversation</li>
                                    <li>• Add pauses between lines (500-1000ms)</li>
                                    <li>• Background music at 20% volume</li>
                                    <li>• Script format: [Name|VoiceID]: Text</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
