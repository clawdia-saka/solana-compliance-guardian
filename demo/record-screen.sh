#!/bin/bash
# Quick screen recording script for demo video
# Usage: ./record-screen.sh

DEMO_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_FILE="$DEMO_DIR/screen-recording-$(date +%Y%m%d-%H%M%S).mp4"

echo "🎥 Solana Compliance Guardian - Screen Recording"
echo "================================================"
echo ""
echo "Output: $OUTPUT_FILE"
echo ""
echo "⚠️  BEFORE RECORDING:"
echo "  1. Dashboard running? Check http://localhost:3000"
echo "  2. Browser opened to dashboard?"
echo "  3. All other apps closed?"
echo "  4. Screen resolution: 1920x1080?"
echo "  5. BONK address ready: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB264"
echo ""
read -p "Ready to record? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "🔴 Recording will start in 3 seconds..."
echo "   Press Ctrl+C to stop recording"
echo ""
sleep 1 && echo "3..." && sleep 1 && echo "2..." && sleep 1 && echo "1..."

# Record screen at 1920x1080, 30fps, good quality
ffmpeg -video_size 1920x1080 -framerate 30 -f x11grab -i :0.0 \
  -c:v libx264 -preset medium -crf 18 \
  -pix_fmt yuv420p \
  "$OUTPUT_FILE"

echo ""
echo "✅ Recording saved to: $OUTPUT_FILE"
echo "📊 File size: $(du -h "$OUTPUT_FILE" | cut -f1)"
echo ""
echo "Next steps:"
echo "  1. Review the recording: vlc $OUTPUT_FILE"
echo "  2. If good, record voiceover: see PRODUCTION_GUIDE.md"
echo "  3. Edit with: kdenlive or ffmpeg"
