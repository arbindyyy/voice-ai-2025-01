# Voice Creator

A professional text-to-speech web application with voice cloning and multi-voice dialogue capabilities, supporting multiple voices in Hindi and English.

## Features

🎙️ **Text-to-Speech** - Convert text to natural-sounding speech
🗣️ **Multiple Voices** - Choose from various voices (male, female, different styles)
🌏 **Hindi & English** - Full support for both languages
✨ **Voice Cloning** - Clone any voice by uploading audio samples (1MB-100MB)
👥 **Multi-Voice Dialogue** - Create conversations with multiple speakers
🎭 **Emotion Control** - 5 emotions with intensity control (neutral, happy, sad, angry, excited)
💻 **SSML Editor** - Advanced speech control with Speech Synthesis Markup Language
📦 **Batch Processing** - Process hundreds of texts at once with CSV upload
⚡ **Audio Effects** - Professional effects: reverb, echo, filters, compressor, and more
� **Voice Style Transfer** - Transform voice characteristics with 17+ presets📡 **Real-Time Voice Morphing** - Live voice transformation with microphone input�🎨 **Modern UI** - Beautiful, responsive design with glassmorphism effects
📥 **Multi-Format Download** - Download in WebM, WAV, MP3, OGG
📤 **Share Audio** - Share via social media or copy link
🎛️ **Audio Editor** - Complete editing suite with:
  - ✂️ Trim/Cut audio
  - 🔊 Volume adjustment
  - 🎵 Fade in/out effects
  - 🔄 Reverse audio
  - 📊 Normalize audio
  - ↩️ Undo/History
🎵 **Background Music** - Add background music to dialogues
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
│   ├── dialogue/         # Multi-voice dialogue editor
│   ├── ssml/             # SSML editor
│   ├── batch/            # Batch processing
│   ├── effects/          # Audio effects studio
│   ├── style/            # Voice style transfer
│   ├── realtime/         # Real-time voice morphing (NEW!)
│   └── clone/            # Voice cloning
├── lib/
│   ├── tts-engine.ts     # TTS logic + dialogue generation
│   ├── voice-config.ts   # Voice definitions
│   ├── audio-utils.ts    # Audio utilities
│   ├── ssml-utils.ts     # SSML parser & utilities
│   ├── batch-utils.ts    # Batch processing utilities
│   ├── effects-utils.ts  # Audio effects processing
│   ├── style-transfer-utils.ts  # Voice style transfer
│   └── realtime-morphing-utils.ts  # Real-time morphing (NEW!)
└── components/           # Reusable components
```

## Features Overview

### TTS Studio
- Enter text in Hindi or English
- Select from multiple voices
- **NEW: 5 Emotion Controls** (Neutral, Happy, Sad, Angry, Excited)
- **NEW: Emotion Intensity Slider** (0-100%)
- Adjust speed and pitch
- Generate and play speech
- Download audio files in multiple formats
- Real-time emotion preview

### Voice Library
- Browse all available voices
- Filter by language, gender, style
- Preview voice samples
- Quick access to studio

### Voice Cloning
- Upload 1-5 high-quality audio samples (1MB - 100MB per file)
- Supports WAV, MP3, OGG, WEBM formats
- Larger files (50MB+) produce premium quality clones
- Create custom voice profiles with advanced analysis
- Real-time voice quality assessment
- Simulated training process
- Manage and organize cloned voices

#### Voice Cloning Requirements:
- **File Size**: 1MB to 100MB per file
- **Duration**: Minimum 30 seconds, recommended 3-5 minutes total
- **Quality**: Clear audio without background noise
- **Formats**: WAV, MP3, OGG, WEBM
- **Tip**: Files over 50MB will produce the highest quality voice clones

### Multi-Voice Dialogue (NEW! 🎭)
- Create conversations with multiple speakers
- Assign different voices to each character
- Control emotions per line (happy, sad, angry, excited, neutral)
- Adjust pause duration between lines
- Add background music (20% volume)
- Script import/export functionality
- Real-time generation progress
- Download complete dialogue as single audio file

#### Dialogue Script Format:
```
[Character Name|VoiceID]: Text {emotion} {pause:500}
```

#### Example:
```
[Alice|sc-en-f-1]: Hello! How are you? {happy} {pause:800}
[Bob|sc-en-m-1]: I'm doing great, thanks! {excited} {pause:500}
```

#### Features:
- Visual dialogue editor
- Drag & drop line reordering
- Real-time preview
- Emotion modifiers
- Custom pause control
- Background music mixing
- Professional audio normalization

### SSML Editor (NEW! 💻)
- Advanced speech control with SSML tags
- Industry-standard markup language
- 8+ pre-built templates
- Tag reference guide
- Real-time validation
- Code formatting
- Copy/paste support
- Visual tag insertion

#### Supported SSML Tags:
- `<prosody>` - Control rate, pitch, volume
- `<break>` - Insert pauses (time or strength)
- `<emphasis>` - Add emphasis to words
- `<say-as>` - Format numbers, dates, phone numbers
- `<sub>` - Substitute pronunciation
- `<phoneme>` - Phonetic pronunciation (IPA)

#### Example SSML:
```xml
<speak>
  <prosody rate="slow" pitch="high">
    This is <emphasis level="strong">important</emphasis>!
  </prosody>
  <break time="1s"/>
  Call us at <say-as interpret-as="telephone">555-0123</say-as>
</speak>
```

#### Templates Available:
- Simple Text
- Speed & Pitch Control
- Emphasis & Breaks
- Numbers & Dates
- Volume Variation
- Complex Narrative
- Announcement Style
- Educational Content

### Batch Processing (NEW! 📦)
- Process hundreds of texts at once
- Upload CSV files for automation
- Generate multiple audio files simultaneously
- Queue-based processing system
- Real-time progress tracking
- Customizable file naming patterns
- Download all files as ZIP
- Export processing reports
- 5+ pre-built templates

#### CSV Format:
```csv
text,voice,emotion,intensity
"Hello, welcome to our service",sc-en-f-1,happy,80
"Technical support available 24/7",sc-en-m-2,neutral,50
"Thank you for your patience",sc-en-f-2,calm,70
```

#### Features:
- **CSV Upload**: Drag & drop CSV files
- **Manual Entry**: Add texts individually
- **Templates**: Pre-built batch scenarios
  - Simple Text List
  - Multilingual Announcements
  - Educational Series
  - Customer Service Scripts
  - Story Chapter Narration
- **Queue Management**: Track processing status
- **Progress Tracking**: Real-time counters (completed/failed/pending)
- **Bulk Download**: Download all files as ZIP
- **Export Report**: Save processing report as CSV
- **Custom File Naming**: Choose from 3 patterns
  - Index-based: `audio_001.mp3`
  - Text-based: `hello_welcome.mp3`
  - Timestamp-based: `audio_1234567890.mp3`

#### Batch Processing Use Cases:
- E-learning course narration (100+ lessons)
- Podcast intro/outro generation
- Multilingual product announcements
- Automated customer service messages
- Audiobook chapter production
- Social media content creation
- IVR system voice prompts
- Video narration templates

### Audio Effects Studio (NEW! ⚡)
- Professional audio effects processing
- 13+ effects across 5 categories
- Real-time preview (original vs processed)
- 8+ pre-built effect presets
- Custom effect chains
- Visual parameter controls
- Import/export effect chains

#### Effect Categories:
1. **Spatial Effects**
   - Reverb (room size, decay time, wet/dry mix)
   - Echo/Delay (delay time, feedback, mix)
   - Stereo Width (width control)

2. **Dynamics Effects**
   - Compressor (threshold, ratio, attack, release)
   - Limiter (threshold control)

3. **Filter Effects**
   - 3-Band Equalizer (bass, mids, treble)
   - Low Pass Filter (cutoff, resonance)
   - High Pass Filter (cutoff, resonance)

4. **Modulation Effects**
   - Chorus (rate, depth, mix)
   - Phaser (rate, depth, feedback)

5. **Creative Effects**
   - Distortion (drive, tone)
   - Bit Crusher (bit depth, sample rate)
   - Pitch Shifter (semitone shift)

#### Effect Presets:
- **Radio Voice** - Classic broadcast sound
- **Podcast Pro** - Professional podcast processing
- **Cathedral** - Large hall reverb
- **Telephone** - Phone call simulation
- **Robot Voice** - Robotic transformation
- **PA Announcement** - Public address system
- **Cinematic** - Movie trailer style
- **Underwater** - Submerged sound effect

#### Features:
- Visual effects chain editor
- Enable/disable individual effects
- Real-time parameter adjustment
- Copy/paste effect chains (JSON)
- Original vs processed comparison
- Download processed audio
- Preset loading for quick results
- Professional Web Audio API processing

#### Use Cases:
- Podcast production polish
- Radio show preparation
- Voice acting character creation
- Audio branding for commercials
- Creative sound design
- Music production vocals
- Video game voiceovers
- Audiobook mastering

### Voice Style Transfer (NEW! 🎭)
- Transform voice characteristics with professional presets
- 17+ pre-built style transformations
- 3 operational modes: Preset, Blend, Custom
- Real-time style comparison
- Advanced parameter control
- Style blending system

#### Style Categories:
1. **Character Voices**
   - Robot - Mechanical, robotic transformation
   - Alien - Extraterrestrial, otherworldly voice
   - Monster - Deep, growling creature voice
   - Chipmunk - High-pitched, squeaky voice

2. **Age Transformations**
   - Child - Young, innocent child voice
   - Teenager - Adolescent voice characteristics
   - Elderly - Aged, mature voice quality

3. **Professional Voices**
   - Announcer - Professional broadcast voice
   - Narrator - Audiobook narrator style
   - Newscaster - News reporter voice

4. **Effect Voices**
   - Telephone - Phone call quality
   - Megaphone - Amplified, distorted voice
   - Underwater - Submerged, muffled voice

5. **Creative Transformations**
   - Masculine - Deeper, masculine characteristics
   - Feminine - Lighter, feminine characteristics
   - Whisper - Soft, breathy whisper
   - Demon - Dark, sinister voice

#### Style Parameters:
- **Pitch Shift** - Change voice pitch (-12 to +12 semitones)
- **Formant Shift** - Modify voice timbre (-50% to +50%)
- **Time Stretch** - Adjust speaking speed (0.5x to 2.0x)
- **Resonance** - Control voice depth (0-100%)
- **Breathiness** - Add air quality (0-100%)
- **Brightness** - High frequency boost (0-100%)
- **Warmth** - Low frequency boost (0-100%)
- **Nasality** - Nasal quality (0-100%)

#### Operational Modes:
1. **Preset Mode**
   - One-click style application
   - 17 pre-configured styles
   - Category filtering
   - Instant transformation

2. **Blend Mode**
   - Mix two styles together
   - Adjustable blend ratio (0-100%)
   - Create unique combinations
   - Morph between characters

3. **Custom Mode**
   - Manual parameter adjustment
   - 8 independent controls
   - Real-time preview
   - Export/import settings (JSON)

#### Use Cases:
- Voice acting character creation
- Game character voices
- Animation dubbing
- Podcast character segments
- Audiobook multiple characters
- Content creation variety
- Educational materials
- Entertainment productions

#### Features:
- Original vs transformed comparison
- Real-time audio processing
- Download transformed audio
- Parameter presets
- Custom style saving
- Professional Web Audio API
- Zero latency processing

### Real-Time Voice Morphing (NEW! 📡)
- Live voice transformation with microphone input
- 12+ real-time effect presets
- Zero-latency audio processing
- Real-time waveform visualization
- Audio analysis dashboard
- Recording with effects applied

#### Real-Time Presets:
1. **Character Voices**
   - Robot - Mechanical voice transformation
   - Deep Voice - Lower pitch for deeper voice
   - High Voice - Higher pitch for lighter voice
   - Demon - Dark, sinister voice
   - Alien - Extraterrestrial voice

2. **Effect Voices**
   - Radio - AM radio broadcast effect
   - Cave - Large space reverb
   - Phone - Telephone call effect
   - Underwater - Submerged effect
   - Megaphone - Loudspeaker effect

3. **Musical Effects**
   - Chorus - Choir-like effect

4. **Creative Effects**
   - Whisper - Soft, breathy voice

#### Features:
- **Live Processing**: Hear effects instantly as you speak
- **Microphone Access**: Uses Web Audio API MediaStream
- **Waveform Visualization**: Real-time audio display
- **Audio Analysis**: Volume, frequency, pitch, clarity meters
- **Recording**: Record morphed voice with effects
- **Preset Switching**: Change effects on-the-fly
- **Output Volume Control**: Adjustable volume with mute
- **Category Filtering**: Browse presets by type

#### Technical Features:
- Low-latency audio processing (<10ms)
- Real-time effects chain
- Echo cancellation & noise suppression
- Professional Web Audio API nodes
- MediaRecorder for recording
- Canvas-based visualization
- Automatic gain control

#### Use Cases:
- Live streaming voice effects
- Gaming voice chat modifications
- Podcasting with live effects
- Voice acting practice
- Online meetings fun effects
- Content creation variety
- Theater rehearsals
- Voice training exercises

#### Requirements:
- Microphone access permission
- Modern browser with Web Audio API
- Headphones recommended (prevents feedback)

### Voice Analytics & Insights (NEW! 📊)
Professional audio analysis dashboard providing comprehensive metrics and insights about your voice recordings.

#### Key Features:
- **Quality Metrics**: Overall quality score (0-100), clarity, dynamic range, SNR
- **Spectral Analysis**: FFT-based frequency analysis, harmonics, spectral centroid
- **Emotion Detection**: Automatically detect emotions in speech (happy, sad, angry, neutral, excited)
- **Speaker Profiling**: Gender classification, pitch range, speaking rate, voice type (bass/tenor/alto/soprano)
- **Recommendations Engine**: Context-aware suggestions to improve audio quality

#### Analysis Metrics:
1. **Audio Metrics**
   - Duration, sample rate, bit depth
   - Number of channels
   - File size

2. **Quality Metrics**
   - Overall quality score
   - Clarity percentage
   - Dynamic range (dB)
   - Signal-to-noise ratio (dB)
   - Peak/average levels
   - Clipping detection
   - Silence ratio

3. **Spectral Analysis**
   - Frequency range
   - Dominant frequency
   - Harmonic detection
   - Spectral centroid
   - Spectral flatness
   - Bandwidth analysis

4. **Emotion Analysis**
   - Dominant emotion
   - Confidence percentage
   - Emotion breakdown (happy, sad, angry, neutral, excited)

5. **Speaker Profile**
   - Gender (male/female)
   - Pitch range (min/max/average Hz)
   - Speaking rate (WPM)
   - Energy level
   - Voice type classification

#### Use Cases:
- **Quality Assessment**: Evaluate recording quality before publishing
- **Voice Coaching**: Track speaking patterns and improvement
- **Audio Forensics**: Analyze voice characteristics
- **Content Creation**: Ensure consistent quality across productions
- **Accessibility**: Verify emotional tone delivery

#### Features:
- File upload or generate from TTS
- Real-time analysis processing
- History management (stores last 50 analyses)
- Export reports as JSON
- Compare multiple analyses
- Statistical overview
- Visual metrics dashboard
- Quality rating (excellent/good/fair/poor)

#### Technical Features:
- Advanced FFT spectral analysis
- Autocorrelation pitch detection
- Energy variance emotion detection
- RMS and peak level calculation
- Noise floor estimation
- Clipping detection algorithms
- Speaker profiling heuristics

### Audio Enhancement & Noise Reduction (NEW! 🎚️)
Professional audio post-processing suite with advanced noise reduction, restoration, and mastering tools.

#### Key Features:
- **Noise Reduction**: Spectral subtraction for background noise removal
- **De-Esser**: Reduce harsh sibilance (S/T/CH sounds)
- **Breath Removal**: Detect and remove breath sounds
- **Click Removal**: Eliminate clicks, pops, and mouth noises
- **Dynamic Compression**: Control dynamic range for consistent levels
- **EQ Controls**: Brightness and warmth adjustments
- **Clarity Enhancement**: Harmonic enhancement for vocal presence
- **Audio Normalization**: Automatic level optimization

#### Enhancement Presets:
1. **Restoration**
   - Clean Speech - Remove background noise
   - Podcast Cleanup - Professional podcast restoration
   - Remove Hiss - Eliminate tape hiss and white noise
   - De-Clicker - Remove clicks, pops, mouth sounds

2. **Enhancement**
   - Voice Enhance - Boost clarity and presence
   - Radio Ready - Broadcast-quality processing
   - Warm Voice - Add richness and warmth
   - Crystal Clear - Maximum clarity

3. **Mastering**
   - Audiobook Master - ACX-compliant mastering
   - YouTube Optimize - Optimized for content
   - Streaming Master - Professional streaming audio

4. **Voice-Specific**
   - Male Voice Optimize - Tailored for male vocals
   - Female Voice Optimize - Tailored for female vocals

#### Parameters:
- Noise Reduction (0-100%)
- De-Esser (0-100%)
- Breath Removal (0-100%)
- Click Removal (0-100%)
- Compression (0-100%)
- Brightness (-50 to +50)
- Warmth (-50 to +50)
- Clarity (0-100%)
- Normalize (on/off)

#### Use Cases:
- **Podcast Production**: Clean up recordings with background noise
- **Audiobook Creation**: Meet ACX quality standards
- **YouTube Content**: Optimize audio for online platforms
- **Voice Acting**: Professional vocal processing
- **Restoration**: Fix old or damaged recordings
- **Live Streaming**: Real-time audio enhancement
- **Music Production**: Vocal processing and cleanup

#### Technical Features:
- Spectral noise profiling and subtraction
- Median filtering for click removal
- Energy-based breath detection
- High-frequency sibilance reduction
- Dynamic range compression (up to 4:1 ratio)
- Multi-band EQ processing
- Harmonic clarity enhancement
- Peak normalization to -0.5dB
- Real-time quality analysis (RMS, peak, dynamic range, noise floor)
- Before/after comparison with metrics

#### Features:
- Upload audio files or generate from TTS
- 13 professional presets across 4 categories
- Manual control over all parameters
- Real-time processing with Web Audio API
- Quality analysis before and after
- A/B comparison playback
- Export enhanced audio as WAV
- Visual quality metrics display

### Voice Comparison & A/B Testing (NEW! ⚖️)
Professional side-by-side comparison tool for evaluating voices, analyzing differences, and making informed selection decisions.

#### Key Features:
- **Side-by-Side Comparison**: Compare two audio samples simultaneously
- **Detailed Metrics Analysis**: 10+ audio quality metrics per sample
- **Similarity Scoring**: 0-100% similarity between samples
- **Preference Scoring**: Automatic quality scoring (0-100 points)
- **Difference Highlighting**: Percentage differences in key characteristics
- **Smart Recommendations**: AI-powered comparison insights

#### Comparison Metrics:
1. **Audio Quality**
   - RMS Level (average loudness in dB)
   - Peak Level (maximum amplitude in dB)
   - Dynamic Range (dB spread)

2. **Pitch Analysis**
   - Average Pitch (Hz) using autocorrelation
   - Pitch range and stability

3. **Spectral Characteristics**
   - Spectral Centroid (frequency center of mass)
   - Spectral Brightness (high-frequency ratio)

4. **Temporal Features**
   - Speaking Rate (estimated WPM)
   - Pause Ratio (silence percentage)

5. **Energy Analysis**
   - Average Energy level
   - Energy Variance (expressiveness)

#### Preference Scoring System:
Automatic quality scoring based on:
- **Dynamic Range** (15-40 dB optimal): +10 points
- **RMS Level** (0.1-0.7 optimal): +10 points
- **Pitch Range** (80-400 Hz optimal): +10 points
- **Speaking Rate** (100-200 WPM optimal): +10 points
- **Expressiveness** (0.02-0.15 variance): +10 points
- **Base Score**: 50 points
- **Total**: 0-100 points

#### Similarity Algorithm:
Weighted similarity calculation:
- Pitch (25%) - Most important for voice identity
- RMS Level (15%) - Volume consistency
- Brightness (15%) - Tonal quality
- Energy (15%) - Overall presence
- Speaking Rate (15%) - Delivery pace
- Variance (15%) - Expressiveness
- **Result**: 0-100% overall similarity

#### Use Cases:
- **Voice Selection**: Choose the best voice for your project
- **Quality Assurance**: Compare original vs enhanced audio
- **Emotion Testing**: Evaluate different emotional deliveries
- **Voice Clone Validation**: Verify clone quality against original
- **A/B Testing**: Test different processing chains
- **Casting Decisions**: Compare voice actors side-by-side
- **Version Comparison**: Evaluate multiple takes or edits
- **Consistency Check**: Ensure voice consistency across projects

#### Analysis Features:
- **RMS Comparison**: Loudness level analysis with dB display
- **Pitch Comparison**: Frequency analysis (Hz)
- **Brightness Comparison**: Spectral clarity percentage
- **Speaking Rate**: WPM estimation with syllable detection
- **Energy Variance**: Expressiveness and dynamic variation
- **Pause Analysis**: Silence ratio and speech density
- **Significant Difference Detection**: Highlights >20% differences

#### Recommendations Engine:
Smart analysis provides insights like:
- "Sample A is significantly louder" (>20% RMS difference)
- "Sample B has a higher pitch" (>15% pitch difference)
- "Sample A sounds brighter/crisper" (>25% brightness difference)
- "Sample B has a faster speaking pace" (>20% rate difference)
- "Sample A is more expressive/dynamic" (30%+ variance difference)
- "Both samples are very similar in characteristics" (<10% overall difference)

#### Technical Implementation:
- Autocorrelation-based pitch detection
- FFT spectral centroid calculation
- Energy-based syllable counting for WPM
- RMS and peak level analysis
- Statistical variance calculation
- Multi-metric weighted similarity scoring
- Real-time waveform generation
- Zero external dependencies (pure Web Audio API)

#### Features:
- Upload audio or generate from TTS for both samples
- Independent text and voice selection for A/B
- Real-time playback controls (play/pause each sample)
- Automatic comparison analysis
- Visual metrics with color-coded bars
- Preference scores for each sample
- Significant difference highlighting (yellow indicators)
- Detailed metric breakdown with units
- Smart recommendation text
- Reset and compare again functionality

## Browser Compatibility

Works best in:
- Chrome/Edge (best Web Speech API support)
- Firefox
- Safari

## License

MIT
