# Pre-Flight Checklist - Demo Video Recording
**Solana Compliance Guardian**

---

## ✅ System Requirements

### Services Running
- [ ] **Torii API:** http://localhost:3000
  ```bash
  curl http://localhost:3000/health
  # Should return: {"status":"healthy"}
  ```

- [ ] **Dashboard:** http://localhost:3001
  ```bash
  curl -s http://localhost:3001 | grep "Compliance Guardian"
  # Should return HTML with title
  ```

- [ ] **Solana RPC:** Connection working
  ```bash
  cd ../solana-fetcher && npm test
  # Should successfully fetch token data
  ```

---

## ✅ Recording Equipment

### Display Settings
- [ ] Screen resolution: **1920x1080** (Full HD)
  ```bash
  xrandr | grep '*'
  ```

- [ ] No desktop notifications enabled
  ```bash
  # Disable in GNOME: Settings → Notifications → Do Not Disturb
  ```

- [ ] Clean desktop (no sensitive files visible)

### Browser Setup
- [ ] Open browser at: http://localhost:3001
- [ ] Browser in full-screen mode (F11)
- [ ] Hide bookmarks bar (Ctrl+Shift+B)
- [ ] Close unnecessary tabs
- [ ] Zoom level at 100%

### Audio (if recording voiceover live)
- [ ] Microphone working
  ```bash
  arecord -l
  # Should list available recording devices
  ```

- [ ] Test recording:
  ```bash
  arecord -d 3 -f cd test.wav && aplay test.wav
  ```

- [ ] Background noise minimal (close windows, turn off fans)

---

## ✅ Demo Data Ready

### Token for Demo
- [ ] **BONK Token Address** copied to clipboard:
  ```
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB264
  ```

### Expected Results (for script)
When you audit BONK, you should see:
- Risk Score: ~50-60 (Medium)
- Holder Count: 100,000+
- Top Holder: ~30-40%
- Violations: Centralization, holder concentration

---

## ✅ Recording Tools Ready

### Screen Recorder Installed
Pick ONE:

**Option 1: FFmpeg (Recommended)**
```bash
which ffmpeg
# Should return: /home/linuxbrew/.linuxbrew/bin/ffmpeg
```

**Option 2: SimpleScreenRecorder**
```bash
sudo apt install simplescreenrecorder
simplescreenrecorder &
```

**Option 3: OBS Studio**
```bash
sudo apt install obs-studio
obs &
```

### Video Editor Installed
Pick ONE:

**Option 1: Kdenlive (Recommended)**
```bash
sudo apt install kdenlive
```

**Option 2: OpenShot**
```bash
sudo apt install openshot-qt
```

**Option 3: FFmpeg only (CLI)**
```bash
# Already installed, no GUI needed
```

---

## ✅ Script & Materials

- [ ] **Script** reviewed: `demo/script.md`
  - Read through 3 times
  - Timed yourself (should be ~2-3 min)
  - Marked difficult pronunciation

- [ ] **Production Guide** reviewed: `demo/PRODUCTION_GUIDE.md`
  - Understand recording workflow
  - Know which tools you'll use

- [ ] **Recording script** ready: `demo/record-screen.sh`
  ```bash
  chmod +x demo/record-screen.sh
  ./demo/record-screen.sh
  ```

---

## ✅ Practice Run

### Dry Run (NO Recording)
1. [ ] Open dashboard: http://localhost:3001
2. [ ] Click "New Audit" or input field
3. [ ] Paste BONK address
4. [ ] Select "Japan" jurisdiction
5. [ ] Click "Submit Audit"
6. [ ] Wait for results (~30s)
7. [ ] Review risk score and violations
8. [ ] Note any UI bugs or slow loading

### Timing
- [ ] Entire demo flow takes: **< 2 minutes**
- [ ] No awkward pauses or waiting
- [ ] Smooth mouse movements

---

## ✅ Final Checks

### Close Unnecessary Apps
```bash
# Close everything except:
# - Terminal (for running services)
# - Browser (for dashboard)
# - Screen recorder
pkill firefox || true
pkill slack || true
pkill discord || true
```

### System Performance
```bash
# Check CPU/RAM available
htop
# Press 'q' to quit

# Should have:
# - CPU usage < 50%
# - RAM usage < 80%
# - No heavy processes running
```

### Storage Space
```bash
df -h ~
# Should have at least 5GB free for recording
```

---

## 🎬 Recording Workflow

1. **Start Services** (if not running)
   ```bash
   # Terminal 1: Torii API
   cd ../torii-api && npm start

   # Terminal 2: Dashboard
   cd ../dashboard && PORT=3001 npm run dev
   ```

2. **Open Browser**
   ```bash
   firefox http://localhost:3001 &
   # or chromium
   ```

3. **Start Recording**
   ```bash
   ./demo/record-screen.sh
   ```

4. **Perform Demo**
   - Follow script.md timing
   - Speak clearly (if live voiceover)
   - Smooth mouse movements
   - No rushing

5. **Stop Recording**
   - Press `Ctrl+C` in terminal
   - Review file: `demo/screen-recording-*.mp4`

6. **Watch Playback**
   ```bash
   vlc demo/screen-recording-*.mp4
   ```

7. **If Good → Continue to Editing**
   - If Bad → Practice again and re-record

---

## 🚨 Emergency Fallbacks

### If Dashboard Crashes
- Restart: `pkill -f "next dev" && cd dashboard && PORT=3001 npm run dev &`
- Wait 10 seconds for rebuild
- Refresh browser

### If Torii API Fails
- Restart: `cd torii-api && npm start &`
- Test: `curl http://localhost:3000/health`

### If Screen Recording Lags
- Lower resolution to 1280x720
- Close more applications
- Use `-preset ultrafast` in ffmpeg

### If Audio Not Syncing
- Record screen first (no audio)
- Record voiceover separately
- Sync in video editor later

---

## ✅ Post-Recording

After successful recording:
- [ ] File saved to: `demo/screen-recording-*.mp4`
- [ ] File size reasonable: 100-500MB
- [ ] Video plays smoothly in VLC
- [ ] Audio clear (if recorded)
- [ ] No personal info visible
- [ ] Ready for editing phase

---

## 📞 Need Help?

**Common Issues:**

1. **Port already in use**
   ```bash
   lsof -i :3001
   kill <PID>
   ```

2. **Dashboard not loading**
   ```bash
   tail -f /tmp/dashboard.log
   # Check for errors
   ```

3. **FFmpeg not found**
   ```bash
   brew install ffmpeg
   # or
   sudo apt install ffmpeg
   ```

4. **Audio device not working**
   ```bash
   pactl list sources short
   # Use correct device name in ffmpeg
   ```

---

**Ready to record? Good luck! 🎬**

Next step: Run `./demo/record-screen.sh`
