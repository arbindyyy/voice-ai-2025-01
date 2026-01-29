# 🎭 Multi-Voice Dialogue Feature

## Overview
Create professional conversations with multiple voices in one audio file. Perfect for podcasts, audiobooks, educational content, and storytelling.

---

## ✨ Key Features

### 1. **Multiple Speaker Support**
- Add unlimited dialogue lines
- Assign different voices to each character
- Real-time voice switching
- Custom speaker names

### 2. **Emotion Control**
- 5 emotion types: Neutral, Happy, Sad, Angry, Excited
- Dynamic pitch and rate adjustments
- Natural-sounding emotional variations
- Per-line emotion control

### 3. **Advanced Timing**
- Custom pause duration (milliseconds)
- Default 500ms between lines
- Recommended: 500-1000ms for natural flow
- Instant preview

### 4. **Audio Mixing**
- Professional multi-track mixing
- Stereo output (2 channels)
- Automatic audio normalization
- Prevents clipping and distortion

### 5. **Background Music**
- Upload audio file as background
- Auto-set to 20% volume
- Perfect for atmosphere
- Optional feature

### 6. **Script Import/Export**
- Quick script writing format
- Paste entire dialogue at once
- Auto-parse speaker and text
- Save time with bulk import

---

## 📝 How to Use

### Method 1: Visual Editor

1. **Navigate to Dialogue Page**
   ```
   http://localhost:3000/dialogue
   ```

2. **Set Script Title**
   - Enter a descriptive name
   - Used for file naming

3. **Add Dialogue Lines**
   - Click "Add Line" button
   - Fill in speaker name
   - Enter dialogue text
   - Select voice from dropdown
   - Choose emotion
   - Adjust pause (ms)

4. **Optional: Add Background Music**
   - Upload audio file
   - Automatically mixed at 20%

5. **Generate Dialogue**
   - Click "Generate Dialogue"
   - Watch progress (0-100%)
   - Wait for completion

6. **Download**
   - Preview in audio player
   - Click "Download Audio"
   - Saves as WAV file

---

### Method 2: Script Import

1. **Click "Import" Button**

2. **Use Script Format**
   ```
   [SpeakerName|VoiceID]: Text {emotion} {pause:milliseconds}
   ```

3. **Example Script**
   ```
   [Narrator|sc-en-m-1]: Once upon a time... {calm} {pause:1000}
   [Princess|sc-en-f-1]: Help! Someone save me! {sad} {pause:800}
   [Hero|sc-en-m-2]: I'm coming to rescue you! {excited} {pause:500}
   [Princess|sc-en-f-1]: Thank you, brave hero! {happy} {pause:600}
   ```

4. **Paste & Parse**
   - Paste script in text area
   - Click "Parse Script"
   - Lines auto-populate

---

## 🎨 Emotion Guide

### Available Emotions:

| Emotion | Pitch | Rate | Use Case |
|---------|-------|------|----------|
| **Neutral** | 1.0 | 1.0 | Normal conversation |
| **Happy** | 1.15 | 1.1 | Excitement, joy |
| **Sad** | 0.9 | 0.85 | Sorrow, disappointment |
| **Angry** | 1.1 | 1.15 | Frustration, anger |
| **Excited** | 1.2 | 1.2 | High energy, surprise |

### Tips:
- Use **neutral** for most dialogue
- Add **happy** for positive moments
- Use **sad** sparingly for impact
- **Angry** works great for conflict
- **Excited** perfect for announcements

---

## ⚙️ Technical Details

### Audio Processing:
```typescript
Sample Rate: 48000 Hz (Web Audio API default)
Channels: 2 (Stereo)
Format: 16-bit PCM WAV
Bit Depth: 16 bits
Normalization: 95% peak (-0.5 dB headroom)
```

### Mixing Algorithm:
1. Generate each line separately
2. Add silence (pause duration)
3. Concatenate all segments
4. Mix background music (20% volume)
5. Normalize to prevent clipping
6. Export as WAV blob

### Performance:
- Average line: 2-3 seconds generation
- 10 lines: ~20-30 seconds total
- Real-time progress updates
- Efficient memory usage

---

## 📋 Script Format Specification

### Full Format:
```
[Speaker|VoiceID]: Text {emotion} {pause:ms}
```

### Simple Format:
```
Speaker: Text
```
(Defaults: voiceId="default", emotion="neutral", pause=500)

### Components:

1. **Speaker**: Character name
   - Any text without special chars
   - Example: "Alice", "Narrator", "Teacher"

2. **VoiceID**: Voice identifier
   - From voice library
   - Example: "sc-en-f-1", "st-en-m-1"
   - See `/voices` page for IDs

3. **Text**: Dialogue content
   - Any text
   - Supports Hindi & English
   - Punctuation affects delivery

4. **Emotion**: Optional emotion tag
   - Options: neutral, happy, sad, angry, excited
   - Example: `{happy}`, `{sad}`

5. **Pause**: Optional pause duration
   - In milliseconds
   - Example: `{pause:500}`, `{pause:1000}`

---

## 💡 Best Practices

### Voice Selection:
- ✅ Use distinct voices for each character
- ✅ Match gender if specified
- ✅ Consider age (young/middle/old)
- ❌ Don't use same voice for all

### Timing:
- ✅ 500ms: Quick response
- ✅ 800ms: Normal conversation
- ✅ 1000ms: Dramatic pause
- ❌ <200ms: Too fast, unnatural

### Emotions:
- ✅ Use sparingly for impact
- ✅ Match content context
- ✅ Neutral as default
- ❌ Don't overuse excited/angry

### Background Music:
- ✅ Use subtle instrumental
- ✅ Lower volume tracks work best
- ✅ Match mood to content
- ❌ Avoid vocal music (conflicts)

---

## 🎯 Use Cases

### 1. **Podcast Episodes**
```
[Host|sc-en-m-1]: Welcome to our podcast! {happy}
[Guest|sc-en-f-1]: Thanks for having me! {happy}
[Host|sc-en-m-1]: Let's dive into today's topic... {neutral}
```

### 2. **Educational Content**
```
[Teacher|sc-en-f-1]: Today we'll learn about science. {neutral}
[Student|sc-en-m-2]: That sounds interesting! {excited}
[Teacher|sc-en-f-1]: Let's begin with an experiment. {neutral}
```

### 3. **Audiobook Narration**
```
[Narrator|st-en-m-1]: The sun rose over the mountains... {calm}
[Character A|sc-en-f-2]: What a beautiful day! {happy}
[Character B|sc-en-m-3]: Indeed, it's perfect. {neutral}
```

### 4. **Advertisement**
```
[Announcer|sc-en-f-1]: Introducing our new product! {excited}
[Customer|sc-en-m-1]: This changed my life! {happy}
[Announcer|sc-en-f-1]: Order now and save 50%! {excited}
```

---

## 🔧 Troubleshooting

### Issue: Lines not generating
**Solution**: 
- Check all text fields filled
- Verify voice IDs exist
- Ensure browser supports Web Speech API

### Issue: Audio cuts off
**Solution**:
- Increase pause duration
- Check browser audio settings
- Try shorter text segments

### Issue: Background music too loud
**Solution**:
- Pre-process music file volume
- Currently fixed at 20% (auto-mixed)
- Use quieter tracks

### Issue: Script parsing fails
**Solution**:
- Check format: `[Name|ID]: Text`
- Remove extra special characters
- Ensure proper line breaks

---

## 🚀 Advanced Features

### Custom Voice Integration:
```typescript
// Use cloned voices in dialogue
[MyVoice|custom-123456]: Custom voice line! {neutral}
```

### Emotion Mixing (Future):
```typescript
// Combine emotions (coming soon)
{happy+excited}  // Very enthusiastic
{sad+angry}      // Frustrated
```

### Dynamic Pauses (Future):
```typescript
{pause:auto}     // Auto-calculate natural pause
{pause:breath}   // Breathing pause
```

---

## 📊 Comparison with Alternatives

| Feature | VoiceCreator | ElevenLabs | Play.ht |
|---------|--------------|------------|---------|
| Multi-Voice | ✅ Yes | ✅ Yes | ✅ Yes |
| Emotion Control | ✅ 5 types | ✅ Advanced | ✅ Limited |
| Background Music | ✅ Free | ❌ No | ❌ No |
| Script Import | ✅ Yes | ❌ No | ❌ No |
| Cost | 🆓 Free | 💰 Paid | 💰 Paid |
| File Size Limit | ✅ None | ❌ Limited | ❌ Limited |

---

## 🎓 Tutorial Video Script

```
[Instructor|sc-en-f-1]: Hello! Today I'll show you how to create multi-voice dialogues. {happy} {pause:800}

[Instructor|sc-en-f-1]: First, navigate to the Dialogue page. {neutral} {pause:600}

[Instructor|sc-en-f-1]: Click 'Add Line' to create a new dialogue line. {neutral} {pause:700}

[Student|sc-en-m-1]: Is it really that simple? {excited} {pause:500}

[Instructor|sc-en-f-1]: Yes! Just type your text and select a voice. {happy} {pause:800}

[Instructor|sc-en-f-1]: You can also add emotions and adjust pauses. {neutral} {pause:700}

[Student|sc-en-m-1]: Wow, this is amazing! {excited} {pause:500}

[Instructor|sc-en-f-1]: Now click Generate Dialogue and wait. {neutral} {pause:1000}

[Instructor|sc-en-f-1]: That's it! You've created your first multi-voice audio. {happy} {pause:500}
```

---

## 🔮 Future Enhancements

### Planned Features:
1. ⏰ Real-time voice preview
2. 🎚️ Individual line volume control
3. 🎭 More emotion types (10+)
4. 📁 Save/load dialogue projects
5. 🎨 Visual waveform editor
6. 🔊 Audio effects per line
7. 🌐 Multi-language mixing
8. 🤖 AI-powered script generation
9. 📊 Analytics & insights
10. 🎬 Video timeline sync

---

## 💬 Community Examples

### Podcast Intro:
```
[Host|sc-en-f-1]: Welcome to Tech Talk Podcast! {excited} {pause:1000}
[Co-Host|sc-en-m-1]: Today we're discussing AI innovations. {neutral} {pause:800}
[Host|sc-en-f-1]: Let's get started! {happy} {pause:500}
```

### Story Narration:
```
[Narrator|st-en-m-1]: In a distant land... {calm} {pause:1200}
[Hero|sc-en-m-2]: I must find the ancient sword! {excited} {pause:800}
[Villain|sc-en-m-3]: You'll never succeed! {angry} {pause:600}
```

---

## 📞 Support

For issues or questions:
- GitHub Issues: Create a new issue
- Email: support@voicecreator.com
- Discord: Join our community

---

## 🎉 Conclusion

Multi-Voice Dialogue transforms how you create audio content. Start creating professional conversations today!

**Happy Creating! 🚀**
