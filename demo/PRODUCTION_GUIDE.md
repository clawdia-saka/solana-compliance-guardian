# Demo Video Production Guide
**Solana Compliance Guardian - Colosseum Hackathon**

---

## 📋 QUICK START CHECKLIST

### Pre-Production (30 min)
- [ ] Read script 3 times aloud
- [ ] Test dashboard functionality end-to-end
- [ ] Prepare BONK token address: `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB264`
- [ ] Install screen recording software
- [ ] Test microphone levels
- [ ] Close all unnecessary applications

### Production (2 hours)
- [ ] Record screen capture (practice 2x, record 3rd time)
- [ ] Record voiceover (or generate TTS)
- [ ] Capture B-roll (optional: typing, dashboard close-ups)

### Post-Production (1.5 hours)
- [ ] Edit video (cut, sync audio, add title cards)
- [ ] Export as MP4 1080p
- [ ] Create thumbnail
- [ ] Upload to YouTube (unlisted)

### Delivery (30 min)
- [ ] Add YouTube link to README.md
- [ ] Test video playback
- [ ] Submit to Colosseum

---

## 🎥 PART 1: SCREEN RECORDING

### Option A: FFmpeg (Simple, Command-Line)

**Install:**
```bash
sudo apt install ffmpeg
```

**Record entire screen (1080p, 30fps):**
```bash
ffmpeg -video_size 1920x1080 -framerate 30 -f x11grab -i :0.0 \
  -c:v libx264 -preset ultrafast -crf 18 \
  demo/screen-recording-raw.mp4
```

**Stop recording:** Press `Ctrl+C`

**Record with audio (if you want to narrate live):**
```bash
ffmpeg -video_size 1920x1080 -framerate 30 -f x11grab -i :0.0 \
  -f pulse -i default \
  -c:v libx264 -preset ultrafast -crf 18 \
  -c:a aac -b:a 128k \
  demo/screen-recording-with-audio.mp4
```

---

### Option B: SimpleScreenRecorder (GUI)

**Install:**
```bash
sudo apt install simplescreenrecorder
```

**Usage:**
1. Launch: `simplescreenrecorder`
2. Select "Record the entire screen"
3. Set resolution: 1920x1080
4. Frame rate: 30 fps
5. Output file: `demo/screen-recording-raw.mp4`
6. Click "Start Recording"
7. Perform demo actions
8. Click "Stop Recording"

---

### Option C: OBS Studio (Professional)

**Install:**
```bash
sudo apt install obs-studio
```

**Setup:**
1. Launch OBS
2. Add Source → Screen Capture
3. Settings → Output:
   - Recording Quality: High Quality, Medium File Size
   - Recording Format: mp4
   - Encoder: x264
4. Settings → Video:
   - Base Resolution: 1920x1080
   - Output Resolution: 1920x1080
   - FPS: 30
5. File → Settings → Output → Recording Path: `demo/`
6. Click "Start Recording"

**Tips for OBS:**
- Use "Studio Mode" for smoother transitions
- Add text overlays for title cards
- Can record multiple takes as "scenes"

---

## 🎙️ PART 2: VOICEOVER

### Option A: Record Your Own Voice

**Tools:**
- **Audacity** (free, open-source)
- **GNOME Sound Recorder**
- **ffmpeg** (command-line)

**Install Audacity:**
```bash
sudo apt install audacity
```

**Recording Steps:**
1. Open Audacity
2. Test microphone levels (aim for -12dB to -6dB peak)
3. Click red "Record" button
4. Read script naturally (don't rush!)
5. Leave 2 seconds silence before/after
6. File → Export → Export as MP3
7. Save to: `demo/voiceover-raw.mp3`

**Tips:**
- Record in a quiet room (close windows, turn off fans)
- Use a pop filter or record 6 inches from mic
- Do multiple takes of difficult sections
- Edit out mistakes/breaths in Audacity

---

### Option B: ElevenLabs TTS (AI Voice)

**Check if skill available:**
```bash
ls ~/.openclaw/skills/ | grep -i eleven
```

**If available, use OpenClaw TTS:**
```bash
# From workspace root
openclaw tts --text "$(cat demo/script.md)" --output demo/voiceover-tts.mp3
```

**Or use ElevenLabs API directly:**
```bash
# Requires API key in ~/.openclaw/credentials/elevenlabs.json
curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/YOUR_VOICE_ID" \
  -H "xi-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Full script text here...",
    "model_id": "eleven_monolingual_v1",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.75
    }
  }' \
  --output demo/voiceover-tts.mp3
```

**Alternative: Festival TTS (Free, Offline)**
```bash
sudo apt install festival
text2wave demo/script-plain.txt -o demo/voiceover-festival.wav
```

---

## ✂️ PART 3: VIDEO EDITING

### Option A: Kdenlive (GUI, Feature-Rich)

**Install:**
```bash
sudo apt install kdenlive
```

**Editing Workflow:**
1. Launch Kdenlive
2. Project Settings:
   - Profile: HD 1080p 30fps
3. Import files:
   - `screen-recording-raw.mp4`
   - `voiceover-raw.mp3`
4. Drag to timeline (video track 1, audio track 2)
5. Sync audio with video actions
6. Add title clips:
   - Project → Add Title Clip
   - Text: "SOLANA COMPLIANCE GUARDIAN"
   - Duration: 3 seconds
7. Cut unnecessary parts (B key to split clip)
8. Add transitions between sections (wipe, fade)
9. Adjust audio levels (voiceover louder than screen audio)
10. Render:
    - File → Render
    - Format: MP4
    - Profile: High quality (1080p)
    - Output: `demo/demo-video-final.mp4`

---

### Option B: FFmpeg (Command-Line, Fast)

**Combine screen recording + voiceover:**
```bash
ffmpeg -i demo/screen-recording-raw.mp4 \
       -i demo/voiceover-raw.mp3 \
       -c:v copy -c:a aac -b:a 192k \
       -map 0:v:0 -map 1:a:0 \
       demo/demo-video-combined.mp4
```

**Add opening title card (3 seconds black screen with text):**
```bash
# Create title card image first (use GIMP or online tool)
# Then merge with video:
ffmpeg -loop 1 -t 3 -i demo/title-card.png \
       -i demo/demo-video-combined.mp4 \
       -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[outv]" \
       -map "[outv]" -map 1:a \
       -c:v libx264 -crf 18 -preset medium \
       demo/demo-video-final.mp4
```

**Trim video (start at 5s, duration 180s):**
```bash
ffmpeg -ss 00:00:05 -i demo/demo-video-combined.mp4 -t 180 \
       -c copy demo/demo-video-trimmed.mp4
```

---

### Option C: OpenShot (GUI, Beginner-Friendly)

**Install:**
```bash
sudo apt install openshot-qt
```

**Similar workflow to Kdenlive, simpler interface.**

---

## 🎨 PART 4: GRAPHICS & TITLE CARDS

### Create Title Cards

**Option A: GIMP (Free Photoshop alternative)**
```bash
sudo apt install gimp
```

1. New Image: 1920x1080, 72dpi
2. Fill background: Dark blue/black
3. Add text: "SOLANA COMPLIANCE GUARDIAN"
4. Font: Bold, 80pt, white
5. Add subtitle: "Built with Torii + AI"
6. Export as PNG: `demo/title-card.png`

**Option B: ImageMagick (Command-line)**
```bash
sudo apt install imagemagick

convert -size 1920x1080 xc:'#0a0e27' \
  -gravity center \
  -pointsize 80 -fill white -font DejaVu-Sans-Bold \
  -annotate +0-50 'SOLANA COMPLIANCE GUARDIAN' \
  -pointsize 40 -fill '#4ade80' \
  -annotate +0+50 'Built with Torii + AI' \
  demo/title-card.png
```

**Option C: Canva (Online, easiest)**
1. Go to: https://www.canva.com
2. Template: YouTube Thumbnail (1920x1080)
3. Add text: Project name
4. Download as PNG

---

### Create Thumbnail

**Quick method:**
```bash
# Extract frame from video at 60 seconds
ffmpeg -i demo/demo-video-final.mp4 -ss 00:01:00 -frames:v 1 \
  demo/thumbnail-base.png

# Add text overlay with ImageMagick
convert demo/thumbnail-base.png \
  -gravity north -pointsize 60 -fill white -stroke black -strokewidth 2 \
  -annotate +0+50 'Solana Compliance Guardian' \
  demo/thumbnail-final.png
```

---

## 📤 PART 5: UPLOAD & DELIVERY

### Upload to YouTube

**Via Web Interface:**
1. Go to: https://studio.youtube.com
2. Click "Create" → "Upload Video"
3. Select: `demo/demo-video-final.mp4`
4. Title: "Solana Compliance Guardian - Autonomous AI Agent Demo"
5. Description:
   ```
   Autonomous AI agent that audits Solana tokens for Japan regulatory compliance.
   
   Built for the Colosseum Agent Hackathon 2026.
   
   Features:
   - Real-time Solana blockchain analysis
   - Japan PSA compliance checking
   - Autonomous risk scoring
   - Built with Torii + Solana Web3.js
   
   GitHub: https://github.com/[your-username]/colosseum-compliance-guardian
   Demo: [live-url]
   ```
6. Thumbnail: Upload `demo/thumbnail-final.png`
7. Visibility: **Unlisted** (or Public)
8. Click "Publish"

**Via YouTube CLI (if available):**
```bash
youtube-upload \
  --title="Solana Compliance Guardian Demo" \
  --description="$(cat demo/youtube-description.txt)" \
  --category=Science \
  --tags="solana,compliance,ai,blockchain" \
  --privacy=unlisted \
  --thumbnail=demo/thumbnail-final.png \
  demo/demo-video-final.mp4
```

---

### Update README.md

Add to project README:
```markdown
## 🎬 Demo Video

Watch the full demo: [YouTube](https://youtu.be/YOUR_VIDEO_ID)

[![Demo Thumbnail](demo/thumbnail-final.png)](https://youtu.be/YOUR_VIDEO_ID)
```

---

## ⏱️ TIMELINE ESTIMATE

| Task | Duration | Notes |
|------|----------|-------|
| Script review & practice | 30 min | Read 3x, time yourself |
| Dashboard testing | 15 min | Ensure no bugs during recording |
| Screen recording setup | 15 min | Test mic, close apps, set resolution |
| Screen recording (3 takes) | 45 min | Practice 2x, record 3rd |
| Voiceover recording | 30 min | Multiple takes, edit breaths |
| Video editing | 60 min | Sync audio, add titles, cut |
| Export & test | 15 min | Render, watch for errors |
| Thumbnail creation | 15 min | Extract frame, add text |
| YouTube upload | 15 min | Write description, set visibility |
| **TOTAL** | **4 hours** | With buffer for retakes |

---

## 🐛 TROUBLESHOOTING

### Screen recording has no audio
- Check PulseAudio: `pactl list sources short`
- Use correct audio device: `-f pulse -i alsa_output.pci-0000_00_1f.3.analog-stereo.monitor`

### Video stutters/lags during recording
- Lower resolution to 1280x720
- Close browser tabs and heavy applications
- Use `-preset ultrafast` with ffmpeg

### Audio out of sync with video
- Re-record with both together, OR
- Use video editor to manually sync
- Check if recording dropped frames

### File size too large
- Compress with: `ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac output.mp4`
- CRF 23 = good quality/size balance (lower = better quality)

---

## 📝 FINAL CHECKLIST

Before submission:
- [ ] Video is 2-3 minutes (not longer!)
- [ ] Audio is clear (no background noise)
- [ ] All text on screen is readable (1080p minimum)
- [ ] No personal info visible (close email tabs)
- [ ] YouTube link works (test in incognito)
- [ ] Thumbnail displays correctly
- [ ] GitHub README has demo link
- [ ] Video demonstrates actual working software (not mockup)

---

## 🎯 SUCCESS CRITERIA

The video should impress judges by showing:
1. ✅ **Working product** - Not just slides, actual software
2. ✅ **Agent autonomy** - Minimal human intervention
3. ✅ **Solana integration** - Real blockchain data
4. ✅ **Unique value** - Only project combining Solana + Japan compliance
5. ✅ **Professional presentation** - Clear, concise, engaging

---

**Good luck! 🚀**

Need help? Check:
- Script: `demo/script.md`
- Recording tips: This file
- Dashboard: `cd dashboard && npm run dev`
