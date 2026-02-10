#!/usr/bin/env python3
"""
Generate clean voiceover using gTTS
"""

from gtts import gTTS
from pathlib import Path

def generate_voiceover(text_path, output_path):
    """Generate MP3 from clean text using gTTS"""
    
    # Read clean text
    with open(text_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    print(f"📖 Read {len(text)} characters from {text_path}")
    
    # Generate speech
    print("🎙️  Generating speech with gTTS (en-US)...")
    tts = gTTS(text=text, lang='en', slow=False)
    
    # Save to file
    output_path.parent.mkdir(exist_ok=True)
    tts.save(str(output_path))
    
    print(f"✅ Saved voiceover to: {output_path}")
    
    # Get file size
    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"📦 File size: {size_mb:.2f} MB")
    
    return output_path

def main():
    text_path = Path(__file__).parent / 'output' / 'voiceover-clean.txt'
    output_path = Path(__file__).parent / 'output' / 'voiceover-clean.mp3'
    
    generate_voiceover(text_path, output_path)
    
    print("\n✨ Voiceover generation complete!")
    print(f"🎧 Play with: mpv {output_path}")

if __name__ == '__main__':
    main()
