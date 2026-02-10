#!/bin/bash

# Final demo video with ultra-clean voiceover
# No symbol reading issues

VIDEO="screen-recording.mp4"
AUDIO="voiceover-ultra-clean.mp3"
OUTPUT="final-demo-v2.mp4"

echo "🎬 Creating FINAL demo video v2 (ultra-clean)..."
echo "   Video: $VIDEO"
echo "   Audio: $AUDIO (no symbols!)"
echo "   Output: $OUTPUT"

# Get audio duration
AUDIO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO")

echo "   Audio duration: ${AUDIO_DURATION}s"

# Remove old version if exists
rm -f "$OUTPUT"

# Loop video to match audio duration
echo "🔄 Combining video + audio..."
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
  "$OUTPUT" 2>&1 | tail -20

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ FINAL demo video created!"
    echo "   Output: $OUTPUT"
    ls -lh "$OUTPUT"
    
    # Show specs
    echo ""
    echo "📊 Video Specs:"
    ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name -of default=noprint_wrappers=1 "$OUTPUT" 2>&1 | grep -E "width|height|codec"
    
    FINAL_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT")
    echo "duration=${FINAL_DURATION}s"
    
    echo ""
    echo "🎉 Ready for submission!"
else
    echo "❌ Failed to create final demo video"
    exit 1
fi
