#!/usr/bin/env python3
"""
Extract voiceover text from script.md and generate TTS audio using gTTS
"""
import re
from gtts import gTTS
from pathlib import Path

def extract_voiceover(script_path):
    """Extract all voiceover text from markdown script"""
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all voiceover blocks (inside > quotes)
    pattern = r'> "([^"]+)"'
    matches = re.findall(pattern, content, re.MULTILINE | re.DOTALL)
    
    if not matches:
        # Try alternative pattern without quotes
        pattern = r'> (.+?)(?=\n\n|\*\*\[Visual|\Z)'
        matches = re.findall(pattern, content, re.MULTILINE | re.DOTALL)
    
    # Clean up text
    voiceover_text = []
    for match in matches:
        # Remove extra whitespace and newlines
        text = ' '.join(match.split())
        # Remove [pause] markers for gTTS (we'll handle timing in video editing)
        text = re.sub(r'\[pause \d+\.?\d*s\]', '', text)
        
        # ===== COMPREHENSIVE SYMBOL CLEANUP =====
        # Remove half-width symbols
        text = re.sub(r'>>|<<|>', '', text)  # Remove >, >>, <<
        text = re.sub(r'<(?![a-zA-Z])', '', text)  # Remove < (but not HTML tags)
        text = re.sub(r'→|←|↑|↓|➡|⬅|⬆|⬇', '', text)  # Arrows
        
        # Remove full-width symbols (Japanese/Chinese characters)
        text = re.sub(r'＞＞|＜＜|＞|＜', '', text)  # Full-width angle brackets
        text = re.sub(r'→|←|↑|↓', '', text)  # Full-width arrows (duplicate for safety)
        
        # Replace % with "percent"
        text = re.sub(r'(\d+)\s*%', r'\1 percent', text)
        
        # Remove other symbols that TTS might read aloud
        text = re.sub(r'[※★☆◆◇■□●○◎▲△▼▽]', '', text)  # Japanese symbols
        text = re.sub(r'[【】『』「」〈〉《》]', '', text)  # Japanese brackets
        text = re.sub(r'[～〜]', ' ', text)  # Wave dashes → space
        
        # Remove bullet points at line start
        text = re.sub(r'^\s*[-•·∙⋅]\s*', '', text, flags=re.MULTILINE)
        
        # Clean up extra whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        if text:
            voiceover_text.append(text)
    
    return '\n\n'.join(voiceover_text)

def generate_tts(text, output_path):
    """Generate TTS audio using gTTS"""
    print(f"Generating TTS audio...")
    print(f"Text length: {len(text)} characters")
    print(f"Estimated duration: ~{len(text) / 150:.1f} minutes")
    
    # Use gTTS with US English, slow=False for natural speed
    tts = gTTS(text=text, lang='en', slow=False, tld='com')
    
    # Save to MP3
    tts.save(output_path)
    print(f"✅ Voiceover saved to: {output_path}")

def main():
    script_path = Path(__file__).parent / 'script.md'
    output_path = Path(__file__).parent / 'output' / 'voiceover.mp3'
    
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Extract voiceover text
    print("Extracting voiceover from script...")
    voiceover = extract_voiceover(script_path)
    
    # Save extracted text for reference
    text_path = output_path.with_suffix('.txt')
    with open(text_path, 'w', encoding='utf-8') as f:
        f.write(voiceover)
    print(f"✅ Extracted text saved to: {text_path}")
    
    # Generate TTS
    generate_tts(voiceover, output_path)
    
    print(f"\n🎤 Voiceover generation complete!")
    print(f"   Audio: {output_path}")
    print(f"   Text: {text_path}")

if __name__ == '__main__':
    main()
