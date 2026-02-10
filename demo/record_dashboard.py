#!/usr/bin/env python3
"""
Playwright script to record dashboard interaction for demo video
"""
import asyncio
import time
from pathlib import Path
from playwright.async_api import async_playwright

# BONK token address for demo
BONK_TOKEN = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB264"
DASHBOARD_URL = "http://localhost:3002"
OUTPUT_DIR = Path(__file__).parent / "output"

async def record_demo():
    """Record dashboard interaction"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    video_path = OUTPUT_DIR / "screen-recording.webm"
    
    async with async_playwright() as p:
        print("🚀 Launching browser...")
        browser = await p.chromium.launch(
            headless=True,  # Headless mode for server recording
            args=[
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-dev-shm-usage'
            ]
        )
        
        # Create context with specific viewport and recording
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            record_video_dir=str(OUTPUT_DIR),
            record_video_size={'width': 1920, 'height': 1080}
        )
        
        page = await context.new_page()
        
        print(f"📹 Recording started...")
        print(f"🌐 Navigating to {DASHBOARD_URL}")
        
        # Navigate to dashboard
        await page.goto(DASHBOARD_URL, wait_until='load', timeout=60000)
        await asyncio.sleep(3)  # Let page settle and load fully
        
        print("✅ Dashboard loaded - starting demo flow...")
        
        # ==========================================
        # DEMO FLOW: Follow script timeline
        # ==========================================
        
        # Step 1: Homepage view (extended for voiceover)
        print("📍 Step 1: Homepage view (20s)")
        await asyncio.sleep(20)  # Extended for intro narration
        
        # Step 2: Enter token address
        print("📍 Step 2: Entering BONK token address (15s)")
        
        # Find and fill token address input (actual selector: input[placeholder="0x..."])
        try:
            token_input = await page.wait_for_selector('input[type="text"]', timeout=5000)
            await token_input.click()
            await asyncio.sleep(0.5)
            
            # Type slowly for visual effect
            await token_input.type(BONK_TOKEN, delay=100)
            await asyncio.sleep(8)  # Extended pause after typing
            
        except Exception as e:
            print(f"⚠️  Could not find token input: {e}")
            raise
        
        # Submit audit (no jurisdiction/checkbox selection needed on current dashboard)
        print("📍 Step 3: Submitting audit")
        try:
            submit_button = await page.wait_for_selector('button[type="submit"], button:has-text("Audit"), button:has-text("Submit")', timeout=3000)
            await asyncio.sleep(1)  # Pause before clicking
            await submit_button.click()
            print("✅ Audit submitted - waiting for results...")
        except Exception as e:
            print(f"⚠️  Could not find submit button: {e}")
            # Try pressing Enter as fallback
            await page.keyboard.press('Enter')
        
        # Step 3: Agent processing (extended for narration)
        print("📍 Step 6: Agent processing (waiting 40s)")
        # Wait for loading indicators or results
        try:
            # Wait for either loading indicator or results
            await page.wait_for_selector('[class*="loading"], [class*="spinner"], [role="progressbar"]', timeout=5000)
            print("   Loading indicator detected")
        except:
            print("   No loading indicator found, waiting anyway")
        
        await asyncio.sleep(40)  # Extended for narration
        
        # Step 4: Results display (extended for detailed narration)
        print("📍 Step 7: Results display - scrolling through report (100s)")
        try:
            # Wait for results to appear
            await page.wait_for_selector('[class*="result"], [class*="report"], h2, h3', timeout=30000)
            print("   Results loaded!")
        except:
            print("   Could not detect results, continuing anyway")
        
        # Scroll through results slowly with extended pauses
        await asyncio.sleep(10)  # View top of results + intro narration
        
        # Scroll down to see risk score
        await page.evaluate('window.scrollTo({top: 300, behavior: "smooth"})')
        await asyncio.sleep(15)  # Explain risk score
        
        # Scroll to violations
        await page.evaluate('window.scrollTo({top: 600, behavior: "smooth"})')
        await asyncio.sleep(20)  # Explain violations in detail
        
        # Scroll to recommendations
        await page.evaluate('window.scrollTo({top: 900, behavior: "smooth"})')
        await asyncio.sleep(20)  # Explain recommendations
        
        # Scroll to regulatory references
        await page.evaluate('window.scrollTo({top: 1200, behavior: "smooth"})')
        await asyncio.sleep(15)  # Explain regulations
        
        # Scroll further down for more content
        await page.evaluate('window.scrollTo({top: 1500, behavior: "smooth"})')
        await asyncio.sleep(10)
        
        # Scroll back to top for final view
        await page.evaluate('window.scrollTo({top: 0, behavior: "smooth"})')
        await asyncio.sleep(10)  # Final summary
        
        print("✅ Demo flow complete!")
        print("⏹️  Stopping recording...")
        
        # Close browser to finalize video
        await context.close()
        await browser.close()
        
        print(f"📹 Recording saved!")
        
        # Video is saved with a UUID name, need to rename it
        # Wait a moment for file to be written
        await asyncio.sleep(2)
        
        # Find the generated video file
        video_files = list(OUTPUT_DIR.glob("*.webm"))
        if video_files:
            latest_video = max(video_files, key=lambda p: p.stat().st_mtime)
            final_path = OUTPUT_DIR / "screen-recording.webm"
            if latest_video != final_path:
                latest_video.rename(final_path)
            print(f"✅ Video saved to: {final_path}")
            
            # Convert to MP4 for better compatibility
            mp4_path = OUTPUT_DIR / "screen-recording.mp4"
            print(f"🔄 Converting to MP4...")
            import subprocess
            result = subprocess.run([
                'ffmpeg', '-y',
                '-i', str(final_path),
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-crf', '22',
                '-pix_fmt', 'yuv420p',
                str(mp4_path)
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✅ MP4 saved to: {mp4_path}")
            else:
                print(f"⚠️  MP4 conversion failed: {result.stderr}")
        else:
            print("⚠️  No video file found!")

if __name__ == '__main__':
    print("=" * 60)
    print("🎬 COLOSSEUM DEMO - SCREEN RECORDING")
    print("=" * 60)
    print(f"Dashboard URL: {DASHBOARD_URL}")
    print(f"Token: BONK ({BONK_TOKEN})")
    print(f"Output: {OUTPUT_DIR}")
    print("=" * 60)
    print()
    
    asyncio.run(record_demo())
    
    print()
    print("=" * 60)
    print("✅ SCREEN RECORDING COMPLETE!")
    print("=" * 60)
