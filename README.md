# Voice Creator

A professional text-to-speech web application with voice cloning capabilities, supporting multiple voices in Hindi and English.

## Features

🎙️ **Text-to-Speech** - Convert text to natural-sounding speech
🗣️ **Multiple Voices** - Choose from various voices (male, female, different styles)
🌏 **Hindi & English** - Full support for both languages
✨ **Voice Cloning** - Clone any voice by uploading audio samples
🎨 **Modern UI** - Beautiful, responsive design with glassmorphism effects
📥 **Multi-Format Download** - Download in WebM, WAV, MP3, OGG
📤 **Share Audio** - Share via social media or copy link
🎛️ **Audio Editor** - Complete editing suite with:
  - ✂️ Trim/Cut audio
  - 🔊 Volume adjustment
  - 🎵 Fade in/out effects
  - 🔄 Reverse audio
  - 📊 Normalize audio
  - ↩️ Undo/History
⚡ **Fast & Free** - No paid APIs required

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **TTS Engine**: Web Speech API (browser-based, free)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
voice-creator/
├── app/
│   ├── page.tsx          # Landing page
│   ├── studio/           # TTS studio
│   ├── voices/           # Voice library
│   └── clone/            # Voice cloning
├── lib/
│   ├── tts-engine.ts     # TTS logic
│   ├── voice-config.ts   # Voice definitions
│   └── audio-utils.ts    # Audio utilities
└── components/           # Reusable components
```

## Features Overview

### TTS Studio
- Enter text in Hindi or English
- Select from multiple voices
- Adjust speed and pitch
- Generate and play speech
- Download audio files

### Voice Library
- Browse all available voices
- Filter by language, gender, style
- Preview voice samples
- Quick access to studio

### Voice Cloning
- Upload audio samples
- Create custom voice profiles
- Simulated training process
- Manage cloned voices

## Browser Compatibility

Works best in:
- Chrome/Edge (best Web Speech API support)
- Firefox
- Safari

## License

MIT
