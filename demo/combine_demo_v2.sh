#!/bin/bash

# Combine screen recording with clean voiceover
# Loop video to match audio duration

VIDEO="screen-recording.mp4"
AUDIO="voiceover-clean.mp3"
OUTPUT="final-demo-v2.mp4"

echo "🎬 Creating final demo video v2..."
echo "   Video: $VIDEO (62s)"
echo "   Audio: $AUDIO (195s)"
echo "   Output: $OUTPUT"

# Get audio duration
AUDIO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO")

echo "   Audio duration: ${AUDIO_DURATION}s"

# Loop video to match audio duration
echo "🔄 Looping video to match audio length..."
ffmpeg -y \
  -stream_loop -1 \
  -i "$VIDEO" \
  -i "$AUDIO" \
  -map 0:v:0 \
  -map 1:a:0 \
  -c:v libx264 \
  -preset fast \
  -crf 22 \
  -pix_fmt yuv420p \
  -c:a aac \
  -b:a 128k \
  -shortest \
  "$OUTPUT"

if [ $? -eq 0 ]; then
    echo "✅ Final demo video created!"
    echo "   Output: $OUTPUT"
    ls -lh "$OUTPUT"
    
    # Show duration
    FINAL_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT")
    echo "   Duration: ${FINAL_DURATION}s ($(echo "$FINAL_DURATION / 60" | bc -l | xargs printf "%.1f")m)"
else
    echo "❌ Failed to create final demo video"
    exit 1
fi
