#!/bin/bash
# Create final YouTube-ready demo video with title card
set -e

OUTPUT_DIR="$HOME/.openclaw/workspace/colosseum-compliance-guardian/demo/output"
cd "$OUTPUT_DIR"

echo "🎬 Creating final demo video..."
echo

# 1. Create thumbnail/title card (1920x1080)
echo "📍 Creating thumbnail and title card..."
ffmpeg -y \
  -f lavfi -i color=c=#0a0e1a:s=1920x1080:d=5 \
  -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='SOLANA':fontcolor=white:fontsize=96:x=(w-text_w)/2:y=300,\
       drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='COMPLIANCE GUARDIAN':fontcolor=#06b6d4:fontsize=96:x=(w-text_w)/2:y=400,\
       drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='AI-Powered Token Compliance Auditing for Japan':fontcolor=#94a3b8:fontsize=36:x=(w-text_w)/2:y=550,\
       drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='Colosseum Agent Hackathon 2026':fontcolor=#475569:fontsize=28:x=(w-text_w)/2:y=900" \
  -frames:v 1 \
  thumbnail.png

echo "✅ Thumbnail created: thumbnail.png"

# Create 5-second title card video
ffmpeg -y -loop 1 -i thumbnail.png -t 5 -pix_fmt yuv420p -vf "scale=1920:1080" title-card.mp4
echo "✅ Title card video created (5s)"

# 2. Extract opening audio (first 5s for title)
echo "📍 Extracting audio segments..."
ffmpeg -y -i voiceover.mp3 -t 5 -c:a copy title-audio.mp3

# Extract audio for demo section (skip first 60s of opening/problem, take next 93s for demo)
ffmpeg -y -ss 60 -i voiceover.mp3 -t 93 -c:a copy demo-audio.mp3

echo "✅ Audio segments extracted"

# 3. Add audio to title card
echo "📍 Combining title card with audio..."
ffmpeg -y -i title-card.mp4 -i title-audio.mp3 -c:v copy -c:a aac -b:a 192k -shortest title-with-audio.mp4

# 4. Add audio to screen recording
echo "📍 Adding audio to screen recording..."
ffmpeg -y -i screen-recording.mp4 -i demo-audio.mp3 -c:v copy -c:a aac -b:a 192k -map 0:v -map 1:a screen-with-audio.mp4

# 5. Concatenate title + demo
echo "📍 Creating concat file..."
cat > concat-list.txt << EOF
file 'title-with-audio.mp4'
file 'screen-with-audio.mp4'
EOF

echo "📍 Concatenating videos..."
ffmpeg -y -f concat -safe 0 -i concat-list.txt -c copy final-demo-temp.mp4

# 6. Re-encode to fix any sync issues
echo "📍 Final encode for YouTube..."
ffmpeg -y -i final-demo-temp.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 20 \
  -pix_fmt yuv420p \
  -c:a aac \
  -b:a 192k \
  -ar 48000 \
  -movflags +faststart \
  final-demo.mp4

# Get duration
DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 final-demo.mp4)
MIN=$(echo "scale=2; $DUR / 60" | bc)

echo
echo "=========================================="
echo "✅ FINAL DEMO COMPLETE!"
echo "=========================================="
echo
echo "📦 Files created:"
echo "   📹 final-demo.mp4 (${MIN} minutes)"
echo "   🖼️  thumbnail.png (1920x1080)"
echo
echo "📊 Stats:"
ls -lh final-demo.mp4 thumbnail.png | awk '{print "   "$9": "$5}'
echo
echo "🚀 Ready for YouTube upload!"
