"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Mic2,
    Upload,
    ArrowLeft,
    CheckCircle2,
    Sparkles,
    Mic,
    FileAudio,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { validateAudioFile, getAudioDuration, formatDuration } from "@/lib/audio-utils";
import { Voice } from "@/lib/voice-config";

interface UploadedFile {
    file: File;
    url: string;
    duration: number;
}

export default function ClonePage() {
    const [step, setStep] = useState(1);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [voiceName, setVoiceName] = useState("");
    const [voiceDescription, setVoiceDescription] = useState("");
    const [voiceLanguage, setVoiceLanguage] = useState<"en" | "hi">("en");
    const [voiceGender, setVoiceGender] = useState<"male" | "female">("female");
    const [isTraining, setIsTraining] = useState(false);
    const [trainingProgress, setTrainingProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const customVoiceKey = "voiceCreator.customVoices";

    const sampleText = useMemo(
        () => ({
            en: "Hello, this is my custom voice.",
            hi: "नमस्ते, यह मेरी कस्टम आवाज़ है।",
        }),
        []
    );

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        await processFiles(files);
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            await processFiles(files);
        }
    };

    const processFiles = async (files: File[]) => {
        const validFiles: UploadedFile[] = [];

        for (const file of files) {
            const validation = validateAudioFile(file);
            if (!validation.valid) {
                alert(`${file.name}: ${validation.error}`);
                continue;
            }

            try {
                const duration = await getAudioDuration(file);
                const url = URL.createObjectURL(file);
                validFiles.push({ file, url, duration });
            } catch (error) {
                alert(`Error loading ${file.name}`);
            }
        }

        setUploadedFiles([...uploadedFiles, ...validFiles]);
    };

    const removeFile = (index: number) => {
        const newFiles = [...uploadedFiles];
        URL.revokeObjectURL(newFiles[index].url);
        newFiles.splice(index, 1);
        setUploadedFiles(newFiles);
    };

    const totalDuration = uploadedFiles.reduce((sum, f) => sum + f.duration, 0);

    const handleStartTraining = () => {
        if (uploadedFiles.length === 0) {
            alert("Please upload at least one audio file");
            return;
        }
        if (!voiceName.trim()) {
            alert("Please enter a name for your voice");
            return;
        }

        setStep(3);
        setIsTraining(true);
        setTrainingProgress(0);

        // Simulate training progress
        const interval = setInterval(() => {
            setTrainingProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsTraining(false);
                    setIsComplete(true);
                    const newVoice: Voice = {
                        id: `custom-${Date.now()}`,
                        name: voiceName.trim(),
                        category: "custom",
                        language: voiceLanguage,
                        gender: voiceGender,
                        age: "middle",
                        style: "natural",
                        description: voiceDescription.trim() || "Custom cloned voice",
                        sampleText,
                        webSpeechVoice: voiceLanguage === "hi" ? "Google हिन्दी" : "Google US English",
                        pitch: 1,
                        rate: 1,
                        isCustom: true,
                    };

                    try {
                        const existing = localStorage.getItem(customVoiceKey);
                        const parsed = existing ? (JSON.parse(existing) as Voice[]) : [];
                        localStorage.setItem(customVoiceKey, JSON.stringify([newVoice, ...parsed]));
                    } catch (error) {
                        console.error("Failed to save custom voice", error);
                    }
                    return 100;
                }
                return prev + 2;
            });
        }, 100);
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
                                <button className="button-secondary text-sm px-4 py-2">
                                    Go to Studio
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-2">
                            <span className="text-gradient">Clone Your Voice</span>
                        </h1>
                        <p className="text-gray-400">
                            Create a custom voice clone in just a few steps
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-12">
                        <div className="flex items-center space-x-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${i <= step
                                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                                : "glass text-gray-400"
                                            }`}
                                    >
                                        {i < step || (i === 3 && isComplete) ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            i
                                        )}
                                    </div>
                                    {i < 3 && (
                                        <div
                                            className={`w-24 h-1 mx-2 rounded transition-all ${i < step ? "bg-gradient-to-r from-purple-600 to-blue-600" : "bg-white/20"
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 1: Upload Audio */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="glass-card">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Upload className="w-5 h-5 text-purple-400" />
                                    <h3 className="font-semibold text-xl">Upload Audio Samples</h3>
                                </div>

                                <div className="glass p-4 rounded-xl mb-6">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                                        <div className="text-sm text-gray-300">
                                            <p className="font-semibold mb-1">Requirements:</p>
                                            <ul className="list-disc list-inside space-y-1 text-gray-400">
                                                <li>Upload 1-5 audio files of your voice</li>
                                                <li>Minimum 30 seconds, recommended 3-5 minutes total</li>
                                                <li>Clear audio without background noise</li>
                                                <li>Supported formats: WAV, MP3, OGG</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Area */}
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragActive
                                            ? "border-purple-500 bg-purple-500/10"
                                            : "border-white/20 hover:border-white/40"
                                        }`}
                                >
                                    <FileAudio className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                                    <p className="text-lg font-semibold mb-2">
                                        Drag and drop audio files here
                                    </p>
                                    <p className="text-gray-400 mb-4">or</p>
                                    <label className="button-primary cursor-pointer inline-block">
                                        <input
                                            type="file"
                                            multiple
                                            accept="audio/*"
                                            onChange={handleFileInput}
                                            className="hidden"
                                        />
                                        Choose Files
                                    </label>
                                </div>

                                {/* Uploaded Files */}
                                {uploadedFiles.length > 0 && (
                                    <div className="mt-6 space-y-3">
                                        <h4 className="font-semibold flex items-center justify-between">
                                            <span>Uploaded Files ({uploadedFiles.length})</span>
                                            <span className="text-sm text-gray-400">
                                                Total: {formatDuration(totalDuration)}
                                            </span>
                                        </h4>
                                        {uploadedFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="glass p-4 rounded-xl flex items-center justify-between"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <FileAudio className="w-5 h-5 text-purple-400" />
                                                    <div>
                                                        <p className="font-medium">{file.file.name}</p>
                                                        <p className="text-sm text-gray-400">
                                                            {formatDuration(file.duration)} •{" "}
                                                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeFile(index)}
                                                    className="px-3 py-1 text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={uploadedFiles.length === 0}
                                    className="w-full button-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue to Voice Profile
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Voice Profile */}
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="glass-card">
                                <div className="flex items-center space-x-2 mb-6">
                                    <Mic className="w-5 h-5 text-purple-400" />
                                    <h3 className="font-semibold text-xl">Voice Profile</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Language *</label>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => setVoiceLanguage("en")}
                                                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${voiceLanguage === "en"
                                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                                    : "glass hover:bg-white/10"
                                                    }`}
                                            >
                                                English
                                            </button>
                                            <button
                                                onClick={() => setVoiceLanguage("hi")}
                                                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${voiceLanguage === "hi"
                                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                                    : "glass hover:bg-white/10"
                                                    }`}
                                            >
                                                Hindi
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Gender *</label>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => setVoiceGender("female")}
                                                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${voiceGender === "female"
                                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                                    : "glass hover:bg-white/10"
                                                    }`}
                                            >
                                                Female
                                            </button>
                                            <button
                                                onClick={() => setVoiceGender("male")}
                                                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${voiceGender === "male"
                                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                                    : "glass hover:bg-white/10"
                                                    }`}
                                            >
                                                Male
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Voice Name *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., My Voice, John's Voice"
                                            value={voiceName}
                                            onChange={(e) => setVoiceName(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            placeholder="Describe your voice..."
                                            value={voiceDescription}
                                            onChange={(e) => setVoiceDescription(e.target.value)}
                                            className="w-full h-32 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-4 mt-6">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 button-secondary"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleStartTraining}
                                        className="flex-1 button-primary"
                                    >
                                        Start Training
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Training */}
                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="glass-card text-center">
                                {!isComplete ? (
                                    <>
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
                                            <Loader2 className="w-12 h-12 text-white animate-spin" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Training Your Voice...</h3>
                                        <p className="text-gray-400 mb-6">
                                            This may take a few minutes. Please don&apos;t close this page.
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="max-w-md mx-auto">
                                            <div className="glass rounded-full h-3 overflow-hidden mb-2">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
                                                    style={{ width: `${trainingProgress}%` }}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-400">{trainingProgress}%</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 className="w-12 h-12 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Voice Clone Complete!</h3>
                                        <p className="text-gray-400 mb-8">
                                            Your custom voice <span className="text-purple-400 font-semibold">&quot;{voiceName}&quot;</span> has been created successfully.
                                        </p>

                                        <div className="glass p-6 rounded-xl mb-6 max-w-md mx-auto">
                                            <h4 className="font-semibold mb-3">Voice Details</h4>
                                            <div className="space-y-2 text-sm text-left">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Name:</span>
                                                    <span>{voiceName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Training Files:</span>
                                                    <span>{uploadedFiles.length}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Total Duration:</span>
                                                    <span>{formatDuration(totalDuration)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <Link href="/studio">
                                                <button className="button-primary px-8">
                                                    <Sparkles className="w-4 h-4 inline mr-2" />
                                                    Try Your Voice
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setStep(1);
                                                    setUploadedFiles([]);
                                                    setVoiceName("");
                                                    setVoiceDescription("");
                                                    setIsComplete(false);
                                                    setTrainingProgress(0);
                                                }}
                                                className="button-secondary px-8"
                                            >
                                                Clone Another Voice
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
