#!/usr/bin/env python3
"""
Playwright script to record dashboard interaction for demo video v4
Fixed 404 version with corrected selectors
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

# BONK token address for demo
BONK_TOKEN = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB264"
DASHBOARD_URL = "http://localhost:3001"
OUTPUT_DIR = Path(__file__).parent / "output"

async def record_demo():
    """Record dashboard interaction"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    async with async_playwright() as p:
        print("🚀 Launching browser...")
        browser = await p.chromium.launch(
            headless=True,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-dev-shm-usage'
            ]
        )
        
        # Create context with Full HD viewport and recording
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            record_video_dir=str(OUTPUT_DIR),
            record_video_size={'width': 1920, 'height': 1080}
        )
        
        page = await context.new_page()
        
        print(f"📹 Recording started (1920x1080)...")
        print(f"🌐 Navigating to {DASHBOARD_URL}")
        
        # Navigate to dashboard
        await page.goto(DASHBOARD_URL, wait_until='networkidle', timeout=60000)
        await asyncio.sleep(5)  # Let page fully settle
        
        print("✅ Dashboard loaded - starting demo flow...")
        
        # ==========================================
        # DEMO FLOW
        # ==========================================
        
        # Step 1: Homepage view (20s for intro narration)
        print("📍 Step 1: Homepage view (20s)")
        await asyncio.sleep(20)
        
        # Step 2: Enter token address
        print("📍 Step 2: Entering BONK token address")
        
        # Wait for and find token input
        try:
            # Wait for any input to be visible
            await page.wait_for_selector('input', state='visible', timeout=10000)
            print("   ✓ Input field found")
            
            # Get the first input element
            token_input = await page.query_selector('input')
            
            # Click to focus
            await token_input.click()
            await asyncio.sleep(1)
            
            # Type slowly for visual effect (100ms per character)
            print(f"   ✓ Typing: {BONK_TOKEN}")
            await token_input.type(BONK_TOKEN, delay=100)
            await asyncio.sleep(8)  # Pause after typing
            
        except Exception as e:
            print(f"⚠️  Error with token input: {e}")
            # Take screenshot for debugging
            await page.screenshot(path=str(OUTPUT_DIR / "error-input.png"))
            raise
        
        # Step 3: Submit audit
        print("📍 Step 3: Submitting audit")
        try:
            # Wait for buttons to be available
            await page.wait_for_selector('button', state='visible', timeout=5000)
            
            # Get all buttons and find the submit button
            buttons = await page.query_selector_all('button')
            print(f"   Found {len(buttons)} buttons")
            
            # Try to find submit/audit button by text content
            submit_button = None
            for btn in buttons:
                text = await btn.inner_text()
                print(f"   Button text: {text}")
                if 'audit' in text.lower() or 'submit' in text.lower() or 'analyze' in text.lower():
                    submit_button = btn
                    break
            
            if submit_button:
                await asyncio.sleep(2)  # Pause before clicking
                await submit_button.click()
                print("   ✅ Submit button clicked")
            else:
                # Fallback: press Enter
                print("   ⚠️ No submit button found, pressing Enter")
                await page.keyboard.press('Enter')
            
        except Exception as e:
            print(f"⚠️  Error with submit: {e}")
            # Try Enter as fallback
            await page.keyboard.press('Enter')
        
        # Step 4: Wait for navigation/results
        print("📍 Step 4: Waiting for results page (45s)")
        await asyncio.sleep(10)  # Initial wait for page transition
        
        # Try to detect if we're on results page
        try:
            # Wait for page to load results
            await page.wait_for_load_state('networkidle', timeout=30000)
            print("   ✓ Page loaded")
            
            # Check current URL
            current_url = page.url
            print(f"   Current URL: {current_url}")
            
            # Take screenshot for verification
            await page.screenshot(path=str(OUTPUT_DIR / "results-page.png"))
            print("   ✓ Screenshot saved")
            
        except Exception as e:
            print(f"   ⚠️ Error waiting for results: {e}")
        
        await asyncio.sleep(35)  # Extended wait for narration
        
        # Step 5: Scroll through results (100s total)
        print("📍 Step 5: Scrolling through results")
        
        # Initial view
        await asyncio.sleep(10)
        
        # Scroll sequence with pauses for narration
        scroll_positions = [
            (300, 15, "Risk score section"),
            (600, 20, "Violations section"),
            (900, 20, "Recommendations section"),
            (1200, 15, "Regulatory references"),
            (1500, 10, "Additional details"),
            (0, 10, "Back to top"),
        ]
        
        for pos, wait, desc in scroll_positions:
            print(f"   Scrolling to {pos}px ({desc})")
            await page.evaluate(f'window.scrollTo({{top: {pos}, behavior: "smooth"}})')
            await asyncio.sleep(wait)
        
        print("✅ Demo flow complete!")
        print("⏹️  Stopping recording...")
        
        # Close to finalize video
        await context.close()
        await browser.close()
        
        print(f"📹 Recording saved!")
        
        # Wait for file to be written
        await asyncio.sleep(2)
        
        # Find and rename the generated video file
        video_files = list(OUTPUT_DIR.glob("*.webm"))
        if video_files:
            latest_video = max(video_files, key=lambda p: p.stat().st_mtime)
            final_webm = OUTPUT_DIR / "screen-recording-v4.webm"
            if latest_video != final_webm:
                latest_video.rename(final_webm)
            print(f"✅ WebM saved to: {final_webm}")
            
            # Convert to MP4 for better compatibility
            mp4_path = OUTPUT_DIR / "screen-recording-v4.mp4"
            print(f"🔄 Converting to MP4...")
            
            import subprocess
            result = subprocess.run([
                'ffmpeg', '-y',
                '-i', str(final_webm),
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '20',  # Higher quality
                '-pix_fmt', 'yuv420p',
                str(mp4_path)
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✅ MP4 saved to: {mp4_path}")
                
                # Get video duration
                duration_result = subprocess.run([
                    'ffprobe', '-v', 'error',
                    '-show_entries', 'format=duration',
                    '-of', 'default=noprint_wrappers=1:nokey=1',
                    str(mp4_path)
                ], capture_output=True, text=True)
                
                if duration_result.returncode == 0:
                    duration = float(duration_result.stdout.strip())
                    print(f"   Duration: {duration:.1f}s ({duration/60:.1f} min)")
            else:
                print(f"⚠️  MP4 conversion failed: {result.stderr}")
        else:
            print("⚠️  No video file found!")

if __name__ == '__main__':
    print("=" * 60)
    print("🎬 COLOSSEUM DEMO V4 - SCREEN RECORDING")
    print("=" * 60)
    print(f"Dashboard URL: {DASHBOARD_URL}")
    print(f"Token: BONK ({BONK_TOKEN})")
    print(f"Output: {OUTPUT_DIR}")
    print(f"Resolution: 1920x1080 (Full HD)")
    print("=" * 60)
    print()
    
    asyncio.run(record_demo())
    
    print()
    print("=" * 60)
    print("✅ SCREEN RECORDING COMPLETE!")
    print("=" * 60)
