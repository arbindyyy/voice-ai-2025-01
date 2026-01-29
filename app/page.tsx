"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mic2, Sparkles, Languages, UserCircle, ArrowRight, Volume2, Wand2, Users, Code, Layers, Zap, Palette, Radio, BarChart3, Activity, GitCompare } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 glass border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <Mic2 className="w-8 h-8 text-purple-400" />
                            <span className="text-2xl font-bold text-gradient">VoiceCreator</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/studio" className="text-gray-300 hover:text-white transition-colors">
                                Studio
                            </Link>
                            <Link href="/voices" className="text-gray-300 hover:text-white transition-colors">
                                Voices
                            </Link>
                            <Link href="/dialogue" className="text-gray-300 hover:text-white transition-colors">
                                Dialogue
                            </Link>
                            <Link href="/batch" className="text-gray-300 hover:text-white transition-colors">
                                Batch
                            </Link>
                            <Link href="/effects" className="text-gray-300 hover:text-white transition-colors">
                                Effects
                            </Link>
                            <Link href="/style" className="text-gray-300 hover:text-white transition-colors">
                                Style
                            </Link>
                            <Link href="/realtime" className="text-gray-300 hover:text-white transition-colors">
                                Live
                            </Link>
                            <Link href="/ssml" className="text-gray-300 hover:text-white transition-colors">
                                SSML
                            </Link>
                            <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors">
                                Analytics
                            </Link>
                            <Link href="/enhance" className="text-gray-300 hover:text-white transition-colors">
                                Enhance
                            </Link>
                            <Link href="/compare" className="text-gray-300 hover:text-white transition-colors">
                                Compare
                            </Link>
                            <Link href="/clone" className="text-gray-300 hover:text-white transition-colors">
                                Clone
                            </Link>
                        </div>
                        <Link href="/studio">
                            <button className="button-primary">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-32 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-8 border border-purple-500/30">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-purple-300">Advanced AI Voice Technology</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Create Stunning
                            <br />
                            <span className="text-gradient">Voice Overs</span> Instantly
                        </h1>

                        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                            Transform text into natural-sounding speech in Hindi and English.
                            Multiple voices, voice cloning, and advanced controls - all for free.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/studio">
                                <button className="button-primary flex items-center space-x-2 text-lg px-8 py-4">
                                    <span>Start Creating</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                            <Link href="/voices">
                                <button className="button-secondary flex items-center space-x-2 text-lg px-8 py-4">
                                    <Volume2 className="w-5 h-5" />
                                    <span>Explore Voices</span>
                                </button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Demo Audio Player Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-20 max-w-4xl mx-auto"
                    >
                        <div className="glass-card p-8">
                            <div className="waveform-container mb-6">
                                <div className="flex items-center justify-center h-full space-x-1">
                                    {[...Array(50)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-gradient-to-t from-purple-600 to-blue-400 rounded-full animate-pulse-slow"
                                            style={{
                                                height: `${Math.random() * 60 + 20}%`,
                                                animationDelay: `${i * 0.05}s`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-400">
                                <span>Sample Audio</span>
                                <span>0:15</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Powerful <span className="text-gradient">Features</span>
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Everything you need to create professional voice overs
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="voice-card"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
                                <Mic2 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Multiple Voices</h3>
                            <p className="text-gray-400">
                                Choose from a variety of natural-sounding voices. Male, female, young, old - we have them all.
                            </p>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="voice-card"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center mb-4">
                                <Languages className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Hindi & English</h3>
                            <p className="text-gray-400">
                                Full support for both Hindi and English text-to-speech with authentic pronunciation.
                            </p>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="voice-card"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                                <Wand2 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Voice Cloning</h3>
                            <p className="text-gray-400">
                                Clone any voice by uploading audio samples. Create custom voices that sound just like you.
                            </p>
                        </motion.div>

                        {/* Feature 4 - New */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                            className="voice-card"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Multi-Voice Dialogue</h3>
                            <p className="text-gray-400">
                                Create conversations with multiple voices. Perfect for podcasts, stories, and educational content.
                            </p>
                        </motion.div>

                        {/* Feature 5 - SSML Editor */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            viewport={{ once: true }}
                            className="voice-card"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                                <Code className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">SSML Editor</h3>
                            <p className="text-gray-400">
                                Advanced speech control with SSML. Fine-tune pronunciation, pauses, emphasis, and more.
                            </p>
                        </motion.div>

                        {/* Feature 6 - Batch Processing */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            viewport={{ once: true }}
                            className="voice-card"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                                <Layers className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Batch Processing</h3>
                            <p className="text-gray-400">
                                Process hundreds of texts at once. Upload CSV files and generate multiple audio files.
                            </p>
                        </motion.div>

                        {/* Feature 7 - Audio Effects */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            viewport={{ once: true }}
                            className="voice-card"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Audio Effects</h3>
                            <p className="text-gray-400">
                                Transform your voice with professional effects. Reverb, echo, filters, and more.
                            </p>
                        </motion.div>

                        {/* Feature 8 - Voice Style Transfer */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            viewport={{ once: true }}
                            className="voice-card"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4">
                                <Palette className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Style Transfer</h3>
                            <p className="text-gray-400">
                                Change voice characteristics. Robot, child, elderly, and 17+ style presets.
                            </p>
                        </motion.div>

                        {/* Feature 9 - Real-Time Morphing */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.9 }}
                            viewport={{ once: true }}
                            className="voice-card"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                                <Radio className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Live Morphing</h3>
                            <p className="text-gray-400">
                                Real-time voice transformation. Speak and hear effects instantly with live processing.
                            </p>
                        </motion.div>

                        {/* Feature 10 - Voice Analytics */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.0 }}
                            viewport={{ once: true }}
                            className="voice-card"
                        >
                            <Link href="/analytics" className="block">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                                    <BarChart3 className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Voice Analytics</h3>
                                <p className="text-gray-400">
                                    Professional audio analysis. Quality metrics, emotion detection, speaker profiling, and insights.
                                </p>
                            </Link>
                        </motion.div>

                        {/* Feature 11 - Audio Enhancement */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.1 }}
                            viewport={{ once: true }}
                            className="voice-card"
                        >
                            <Link href="/enhance" className="block">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mb-4">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Audio Enhancement</h3>
                                <p className="text-gray-400">
                                    Professional noise reduction, de-esser, breath removal, and audio restoration tools.
                                </p>
                            </Link>
                        </motion.div>

                        {/* Feature 12 - Voice Comparison */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.2 }}
                            viewport={{ once: true }}
                            className="voice-card"
                        >
                            <Link href="/compare" className="block">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4">
                                    <GitCompare className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Voice Comparison</h3>
                                <p className="text-gray-400">
                                    Side-by-side A/B testing, quality comparison, preference scoring, and detailed analysis.
                                </p>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="glass-card text-center p-12 bg-gradient-to-br from-purple-900/30 to-blue-900/30"
                    >
                        <UserCircle className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                        <h2 className="text-4xl font-bold mb-4">
                            Ready to Create Amazing Voices?
                        </h2>
                        <p className="text-gray-300 text-lg mb-8">
                            Join thousands of creators using VoiceCreator for their projects
                        </p>
                        <Link href="/studio">
                            <button className="button-primary text-lg px-10 py-4">
                                Try It Now - It&apos;s Free
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 py-8 px-4 mt-20">
                <div className="max-w-7xl mx-auto text-center text-gray-400">
                    <p>&copy; 2026 VoiceCreator. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
