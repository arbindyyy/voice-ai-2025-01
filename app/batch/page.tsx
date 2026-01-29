"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Mic2,
    ArrowLeft,
    Upload,
    Play,
    Download,
    Trash2,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    FileText,
    Layers,
    Sparkles,
    Plus,
} from "lucide-react";
import { getTTSEngine } from "@/lib/tts-engine";
import { Voice, voices as defaultVoices } from "@/lib/voice-config";
import {
    BatchProcessor,
    BatchItem,
    CSVParser,
    batchTemplates,
    generateBatchFileName,
    downloadAllAsZip,
    exportBatchReport,
} from "@/lib/batch-utils";

export default function BatchPage() {
    const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
    const [defaultVoice, setDefaultVoice] = useState<Voice>(defaultVoices[0]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentProgress, setCurrentProgress] = useState({ current: 0, total: 0 });
    const [showTemplates, setShowTemplates] = useState(false);
    const [showManualAdd, setShowManualAdd] = useState(false);
    const [manualText, setManualText] = useState("");
    const [customVoices, setCustomVoices] = useState<Voice[]>([]);
    const [fileNamePattern, setFileNamePattern] = useState("audio_{index}");

    const ttsEngine = useMemo(() => getTTSEngine(), []);
    const batchProcessor = useMemo(() => new BatchProcessor(), []);
    const csvParser = useMemo(() => new CSVParser(), []);

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const validation = csvParser.validate(text);

        if (!validation.valid) {
            alert(validation.error || "Invalid CSV file");
            return;
        }

        const parsed = csvParser.parse(text);
        const items: BatchItem[] = parsed.map((item, index) => ({
            id: `item-${Date.now()}-${index}`,
            text: item.text,
            voiceId: item.voiceId || defaultVoice.id,
            status: 'pending' as const,
            fileName: generateBatchFileName(index, item.text, fileNamePattern) + '.wav'
        }));

        setBatchItems(items);
        batchProcessor.clearQueue();
        items.forEach(item => batchProcessor.addItem(item));
    };

    const handleManualAdd = () => {
        if (!manualText.trim()) {
            alert("Please enter text");
            return;
        }

        const lines = manualText.split('\n').filter(line => line.trim());
        const items: BatchItem[] = lines.map((line, index) => ({
            id: `item-${Date.now()}-${index}`,
            text: line.trim(),
            voiceId: defaultVoice.id,
            status: 'pending' as const,
            fileName: generateBatchFileName(batchItems.length + index, line, fileNamePattern) + '.wav'
        }));

        setBatchItems([...batchItems, ...items]);
        items.forEach(item => batchProcessor.addItem(item));
        setManualText("");
        setShowManualAdd(false);
    };

    const handleLoadTemplate = (template: typeof batchTemplates[0]) => {
        const parsed = csvParser.parse(template.csv);
        const items: BatchItem[] = parsed.map((item, index) => ({
            id: `item-${Date.now()}-${index}`,
            text: item.text,
            voiceId: item.voiceId || defaultVoice.id,
            status: 'pending' as const,
            fileName: generateBatchFileName(index, item.text, fileNamePattern) + '.wav'
        }));

        setBatchItems(items);
        batchProcessor.clearQueue();
        items.forEach(item => batchProcessor.addItem(item));
        setShowTemplates(false);
    };

    const handleRemoveItem = (id: string) => {
        setBatchItems(batchItems.filter(item => item.id !== id));
        batchProcessor.removeItem(id);
    };

    const handleClearAll = () => {
        if (confirm("Clear all items?")) {
            setBatchItems([]);
            batchProcessor.clearQueue();
        }
    };

    const handleStartProcessing = async () => {
        if (batchItems.length === 0) {
            alert("Please add items to process");
            return;
        }

        setIsProcessing(true);

        batchProcessor.onProgress((current, total, item) => {
            setCurrentProgress({ current, total });
            setBatchItems(prev =>
                prev.map(i => (i.id === item.id ? { ...i, ...item } : i))
            );
        });

        await batchProcessor.process(async (item) => {
            const voice = allVoices.find(v => v.id === item.voiceId) || defaultVoice;
            return await ttsEngine.speakAndRecord(item.text, voice, {
                rate: item.metadata?.speed || 1,
                pitch: item.metadata?.pitch || 1,
                emotion: item.metadata?.emotion as any,
                emotionIntensity: item.metadata?.emotionIntensity || 50,
            });
        });

        setIsProcessing(false);
        alert("Batch processing completed!");
    };

    const handleDownloadAll = async () => {
        const completedItems = batchItems.filter(item => item.status === 'completed');
        if (completedItems.length === 0) {
            alert("No completed items to download");
            return;
        }

        await downloadAllAsZip(completedItems);
    };

    const handleExportReport = () => {
        const report = exportBatchReport(batchItems);
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch_report_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const completedCount = batchItems.filter(i => i.status === 'completed').length;
    const failedCount = batchItems.filter(i => i.status === 'failed').length;
    const pendingCount = batchItems.filter(i => i.status === 'pending').length;

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
                            <Layers className="w-10 h-10 text-purple-400" />
                            <h1 className="text-4xl font-bold">
                                <span className="text-gradient">Batch Processing</span>
                            </h1>
                        </div>
                        <p className="text-gray-400">
                            Generate multiple audio files at once from CSV or text list
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="glass-card text-center">
                            <div className="text-3xl font-bold text-purple-400">{batchItems.length}</div>
                            <div className="text-sm text-gray-400">Total</div>
                        </div>
                        <div className="glass-card text-center">
                            <div className="text-3xl font-bold text-green-400">{completedCount}</div>
                            <div className="text-sm text-gray-400">Completed</div>
                        </div>
                        <div className="glass-card text-center">
                            <div className="text-3xl font-bold text-red-400">{failedCount}</div>
                            <div className="text-sm text-gray-400">Failed</div>
                        </div>
                        <div className="glass-card text-center">
                            <div className="text-3xl font-bold text-blue-400">{pendingCount}</div>
                            <div className="text-sm text-gray-400">Pending</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Controls */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Upload/Add */}
                            <div className="glass-card">
                                <h3 className="font-semibold mb-4">Add Items</h3>
                                <div className="space-y-3">
                                    <label className="button-secondary w-full cursor-pointer text-center">
                                        <Upload className="w-4 h-4 mr-2 inline" />
                                        Upload CSV File
                                        <input
                                            type="file"
                                            accept=".csv,.txt"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>

                                    <button
                                        onClick={() => setShowManualAdd(!showManualAdd)}
                                        className="button-secondary w-full"
                                    >
                                        <Plus className="w-4 h-4 mr-2 inline" />
                                        Add Manually
                                    </button>

                                    <button
                                        onClick={() => setShowTemplates(!showTemplates)}
                                        className="button-secondary w-full"
                                    >
                                        <FileText className="w-4 h-4 mr-2 inline" />
                                        Load Template
                                    </button>
                                </div>
                            </div>

                            {/* Manual Add */}
                            {showManualAdd && (
                                <div className="glass-card">
                                    <h3 className="font-semibold mb-3">Add Text Lines</h3>
                                    <textarea
                                        value={manualText}
                                        onChange={(e) => setManualText(e.target.value)}
                                        className="input-field w-full h-32 mb-3"
                                        placeholder="Enter one text per line..."
                                    />
                                    <button onClick={handleManualAdd} className="button-primary w-full">
                                        Add to Queue
                                    </button>
                                </div>
                            )}

                            {/* Templates */}
                            {showTemplates && (
                                <div className="glass-card">
                                    <h3 className="font-semibold mb-3">Templates</h3>
                                    <div className="space-y-2">
                                        {batchTemplates.map((template, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleLoadTemplate(template)}
                                                className="w-full glass p-3 rounded-lg text-left hover:bg-white/10"
                                            >
                                                <div className="font-semibold text-sm">{template.name}</div>
                                                <div className="text-xs text-gray-400">{template.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Settings */}
                            <div className="glass-card">
                                <h3 className="font-semibold mb-4">Settings</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-2">Default Voice</label>
                                        <select
                                            value={defaultVoice.id}
                                            onChange={(e) => {
                                                const voice = allVoices.find(v => v.id === e.target.value);
                                                if (voice) setDefaultVoice(voice);
                                            }}
                                            className="input-field w-full"
                                        >
                                            {allVoices.map((voice) => (
                                                <option key={voice.id} value={voice.id}>
                                                    {voice.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 block mb-2">File Name Pattern</label>
                                        <select
                                            value={fileNamePattern}
                                            onChange={(e) => setFileNamePattern(e.target.value)}
                                            className="input-field w-full"
                                        >
                                            <option value="audio_{index}">audio_001, audio_002...</option>
                                            <option value="audio_{timestamp}_{index}">audio_timestamp_001...</option>
                                            <option value="{text}_{index}">[text_preview]_001...</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="glass-card space-y-3">
                                <button
                                    onClick={handleStartProcessing}
                                    disabled={isProcessing || batchItems.length === 0}
                                    className="w-full button-primary disabled:opacity-50"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                                            Processing {currentProgress.current}/{currentProgress.total}
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5 mr-2 inline" />
                                            Start Processing
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleDownloadAll}
                                    disabled={completedCount === 0}
                                    className="w-full button-secondary disabled:opacity-50"
                                >
                                    <Download className="w-5 h-5 mr-2 inline" />
                                    Download All ({completedCount})
                                </button>

                                <button
                                    onClick={handleExportReport}
                                    disabled={batchItems.length === 0}
                                    className="w-full button-secondary disabled:opacity-50"
                                >
                                    <FileText className="w-5 h-5 mr-2 inline" />
                                    Export Report
                                </button>

                                <button
                                    onClick={handleClearAll}
                                    disabled={batchItems.length === 0}
                                    className="w-full button-secondary text-red-400 disabled:opacity-50"
                                >
                                    <Trash2 className="w-5 h-5 mr-2 inline" />
                                    Clear All
                                </button>
                            </div>
                        </div>

                        {/* Right: Queue */}
                        <div className="lg:col-span-2">
                            <div className="glass-card">
                                <h3 className="font-semibold mb-4">Processing Queue</h3>
                                
                                {batchItems.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>No items in queue</p>
                                        <p className="text-sm">Upload a CSV file or add items manually</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                        {batchItems.map((item, index) => (
                                            <div
                                                key={item.id}
                                                className={`glass p-4 rounded-xl ${
                                                    item.status === 'processing' ? 'border-2 border-purple-500' : ''
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className="text-purple-400 font-bold">#{index + 1}</span>
                                                            {item.status === 'completed' && (
                                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                            )}
                                                            {item.status === 'failed' && (
                                                                <XCircle className="w-5 h-5 text-red-400" />
                                                            )}
                                                            {item.status === 'processing' && (
                                                                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                                            )}
                                                            {item.status === 'pending' && (
                                                                <Clock className="w-5 h-5 text-gray-400" />
                                                            )}
                                                            <span className="text-xs px-2 py-1 glass rounded-full">
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm mb-1">{item.text}</p>
                                                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                            <span>Voice: {allVoices.find(v => v.id === item.voiceId)?.name}</span>
                                                            {item.fileName && <span>• {item.fileName}</span>}
                                                        </div>
                                                        {item.error && (
                                                            <p className="text-xs text-red-400 mt-2">Error: {item.error}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        disabled={item.status === 'processing'}
                                                        className="text-gray-400 hover:text-red-400 disabled:opacity-30"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
