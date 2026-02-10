#!/usr/bin/env python3
"""
Voiceover Script Cleaner
引用部分を抽出し、記号を全て削除して純粋な英文テキストのみを生成
"""

import re
from pathlib import Path

def extract_voiceover_text(script_path):
    """Extract voiceover quoted blocks from script.md"""
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all quoted blocks after "Voiceover:"
    # Pattern: lines starting with > (including nested quotes)
    lines = content.split('\n')
    voiceover_lines = []
    in_quote = False
    
    for i, line in enumerate(lines):
        # Check if this or previous line contains "Voiceover:"
        if 'Voiceover:' in line:
            in_quote = True
            continue
        
        # If in quote block and line starts with >
        if in_quote and line.strip().startswith('>'):
            voiceover_lines.append(line)
        elif in_quote and line.strip() == '':
            # Empty line within quote block - keep it
            voiceover_lines.append('')
        elif in_quote and line.strip() and not line.strip().startswith('>') and not line.strip().startswith('[') and not line.strip().startswith('**['):
            # Non-quote, non-visual direction line = end of quote block
            in_quote = False
    
    return '\n'.join(voiceover_lines)

def clean_text(text):
    """Remove all symbols and keep only pure English text"""
    
    # Remove quote markers at start of lines
    text = re.sub(r'^>\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^>>\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^<<\s*', '', text, flags=re.MULTILINE)
    
    # Replace list bullets with commas for TTS flow
    text = re.sub(r'\n\s*-\s+', ', ', text)  # List items become comma-separated
    
    # Remove all specified symbols
    symbols_to_remove = [
        '>', '<', '>>', '<<', 
        '→', '←', '＞', '＜',
        '"', '"', '"',  # All quote types
        '•', '◦', '▪',  # Bullets
        '–', '—',  # Different dashes (em/en dash)
    ]
    
    for symbol in symbols_to_remove:
        text = text.replace(symbol, '')
    
    # Clean up whitespace
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)  # Max 2 newlines
    text = re.sub(r' +', ' ', text)  # Multiple spaces to one
    text = text.strip()
    
    # Ensure sentences end with proper pauses for TTS
    text = re.sub(r'\n\n', '. ', text)  # Paragraph breaks become sentence breaks
    text = re.sub(r'\n', ' ', text)  # Single newlines become spaces
    
    return text

def main():
    script_path = Path(__file__).parent / 'script.md'
    output_path = Path(__file__).parent / 'output' / 'voiceover-clean.txt'
    
    print(f"📖 Reading script from: {script_path}")
    
    # Extract voiceover text
    voiceover_text = extract_voiceover_text(script_path)
    print(f"✅ Extracted {len(voiceover_text)} characters of voiceover text")
    
    # Clean the text
    clean = clean_text(voiceover_text)
    print(f"✨ Cleaned to {len(clean)} characters (removed {len(voiceover_text) - len(clean)} chars)")
    
    # Save cleaned text
    output_path.parent.mkdir(exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(clean)
    
    print(f"💾 Saved clean text to: {output_path}")
    print("\n" + "="*60)
    print("CLEANED TEXT PREVIEW:")
    print("="*60)
    print(clean[:500] + "...\n")
    
    return output_path

if __name__ == '__main__':
    main()
