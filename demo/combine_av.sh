#!/bin/bash
# Combine audio and video for Colosseum demo
# Simplified version: match audio to video duration

OUTPUT_DIR="$HOME/.openclaw/workspace/colosseum-compliance-guardian/demo/output"
cd "$OUTPUT_DIR"

echo "🎬 COMBINING AUDIO + VIDEO"
echo "=========================="

# Get durations
AUDIO_DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 voiceover.mp3)
VIDEO_DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 screen-recording.mp4)

echo "Audio duration: $AUDIO_DUR seconds"
echo "Video duration: $VIDEO_DUR seconds"
echo

# Option 1: Extract matching audio segment (demo flow narration starts around 1:00 = 60s in script)
# Demo flow is 1:00-2:10 in script = 70 seconds of narration
# Let's extract ~90 seconds of audio starting from 60s mark to match our 93s video

echo "📍 Option 1: Extracting audio segment for demo section..."
ffmpeg -y -ss 60 -i voiceover.mp3 -t $VIDEO_DUR -c:a copy audio-segment.mp3

echo "📍 Combining audio segment with video..."
ffmpeg -y \
  -i screen-recording.mp4 \
  -i audio-segment.mp3 \
  -c:v copy \
  -c:a aac \
  -b:a 192k \
  -map 0:v:0 \
  -map 1:a:0 \
  -shortest \
  demo-with-audio.mp4

echo "✅ Created: demo-with-audio.mp4 (screen recording + matching audio)"
echo

# Option 2: Full video with audio overlay (screen recording plays during demo section)
# For now, let's also create a version where we just overlay the full audio on the video
# and loop/extend the video to match audio length if needed

echo "📍 Option 2: Creating version with full voiceover..."
echo "   (Note: Video will end before audio, will show black screen)"

ffmpeg -y \
  -i screen-recording.mp4 \
  -i voiceover.mp3 \
  -filter_complex "[0:v]fps=30,format=yuv420p[v]" \
  -map "[v]" \
  -map 1:a \
  -c:v libx264 \
  -preset fast \
  -crf 22 \
  -c:a aac \
  -b:a 192k \
  -shortest \
  full-voiceover-version.mp4

echo "✅ Created: full-voiceover-version.mp4 (full audio, video ends early)"
echo

# Option 3: Best for hackathon - add title card at beginning, then demo
echo "📍 Option 3: Creating YouTube-ready version with title card..."

# Create title card image (1920x1080, 5 seconds)
ffmpeg -y \
  -f lavfi \
  -i color=c=black:s=1920x1080:d=5 \
  -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='SOLANA COMPLIANCE GUARDIAN':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2-100,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='AI-Powered Token Compliance Auditing':fontcolor=cyan:fontsize=36:x=(w-text_w)/2:y=(h-text_h)/2+50,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='Colosseum Hackathon 2026':fontcolor=gray:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2+120" \
  -c:v libx264 \
  -pix_fmt yuv420p \
  title-card.mp4

echo "✅ Created title card (5 seconds)"

# Extract first 5 seconds of audio for title card
ffmpeg -y -i voiceover.mp3 -t 5 -c:a copy title-audio.mp3

# Combine: title card (5s) + screen recording (93s) + audio
echo "📍 Concatenating title + demo..."

# Create concat file
cat > concat.txt << EOF
file 'title-card.mp4'
file 'screen-recording.mp4'
EOF

# Concatenate videos
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy video-combined.mp4

# Add full audio
ffmpeg -y \
  -i video-combined.mp4 \
  -i voiceover.mp3 \
  -c:v copy \
  -c:a aac \
  -b:a 192k \
  -shortest \
  final-demo.mp4

echo
echo "=========================="
echo "✅ COMPLETE!"
echo "=========================="
echo
echo "📦 Output files:"
ls -lh *.mp4 | grep -E '(demo-with-audio|full-voiceover|final-demo)' | awk '{print "   "$9" - "$5}'
echo
echo "🎯 Recommended for upload: final-demo.mp4"
echo

# Get final duration
FINAL_DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 final-demo.mp4)
echo "📊 Final video duration: $(printf "%.1f" $FINAL_DUR) seconds ($(printf "%.1f" $(echo "$FINAL_DUR / 60" | bc -l)) minutes)"
