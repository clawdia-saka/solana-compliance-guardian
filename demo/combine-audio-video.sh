#!/bin/bash
# Combine screen recording with voiceover audio
# Usage: ./combine-audio-video.sh <video-file> <audio-file>

if [ $# -ne 2 ]; then
    echo "Usage: $0 <video-file> <audio-file>"
    echo ""
    echo "Example:"
    echo "  $0 screen-recording.mp4 voiceover.mp3"
    exit 1
fi

VIDEO_FILE="$1"
AUDIO_FILE="$2"
OUTPUT_FILE="demo-video-combined-$(date +%Y%m%d-%H%M%S).mp4"

if [ ! -f "$VIDEO_FILE" ]; then
    echo "❌ Video file not found: $VIDEO_FILE"
    exit 1
fi

if [ ! -f "$AUDIO_FILE" ]; then
    echo "❌ Audio file not found: $AUDIO_FILE"
    exit 1
fi

echo "🎬 Combining video and audio..."
echo "  Video: $VIDEO_FILE"
echo "  Audio: $AUDIO_FILE"
echo "  Output: $OUTPUT_FILE"
echo ""

# Combine video (no audio) with new audio track
ffmpeg -i "$VIDEO_FILE" -i "$AUDIO_FILE" \
  -c:v copy \
  -c:a aac -b:a 192k \
  -map 0:v:0 -map 1:a:0 \
  -shortest \
  "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Combined video saved to: $OUTPUT_FILE"
    echo "📊 File size: $(du -h "$OUTPUT_FILE" | cut -f1)"
    echo ""
    echo "🎬 Play it:"
    echo "   vlc $OUTPUT_FILE"
else
    echo ""
    echo "❌ Error combining files. Check that both files are valid."
    exit 1
fi
