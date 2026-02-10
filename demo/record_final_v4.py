#!/usr/bin/env python3
"""
Final v4 Demo Recording - WORKING DASHBOARD
Full HD (1920x1080) with proper timing for 2-second audit result
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

BONK_TOKEN = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB264"
DASHBOARD_URL = "http://localhost:3001"
OUTPUT_DIR = Path(__file__).parent / "output"

async def record_demo():
    """Record complete dashboard demo flow"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    async with async_playwright() as p:
        print("🚀 Launching browser (Full HD 1920x1080)...")
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage']
        )
        
        # Full HD context with video recording
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            record_video_dir=str(OUTPUT_DIR),
            record_video_size={'width': 1920, 'height': 1080}
        )
        
        page = await context.new_page()
        
        print(f"📹 Recording started (Full HD)")
        print(f"🌐 Navigating to {DASHBOARD_URL}")
        
        # Navigate to dashboard
        await page.goto(DASHBOARD_URL, wait_until='networkidle')
        await asyncio.sleep(3)
        print("✅ Dashboard loaded")
        
        # ==========================================
        # DEMO FLOW - Optimized for voiceover
        # ==========================================
        
        # Step 1: Homepage view (20s) - Intro narration
        print("📍 Step 1: Homepage view (20s)")
        await asyncio.sleep(20)
        
        # Step 2: Enter BONK token address (15s)
        print("📍 Step 2: Entering BONK token address")
        input_field = await page.wait_for_selector('input[type="text"]', timeout=5000)
        await input_field.click()
        await asyncio.sleep(1)
        
        # Type slowly for visual effect
        await input_field.type(BONK_TOKEN, delay=100)
        print(f"   ✓ Typed: {BONK_TOKEN}")
        await asyncio.sleep(10)  # Extended pause after typing
        
        # Step 3: Submit audit
        print("📍 Step 3: Submitting audit")
        submit_button = await page.wait_for_selector('button[type="submit"]', timeout=5000)
        await asyncio.sleep(2)  # Pause before clicking
        
        # Wait for navigation to results page
        print("   ⏳ Waiting for navigation to results...")
        async with page.expect_navigation(timeout=60000):
            await submit_button.click()
        
        result_url = page.url
        print(f"   ✅ Navigated to: {result_url}")
        
        # Step 4: Wait for results to load (2s + buffer)
        print("📍 Step 4: Waiting for results (loading state)...")
        await asyncio.sleep(5)  # 2s API call + 3s buffer for display
        
        # Take verification screenshot
        screenshot_path = OUTPUT_DIR / "final-v4-results-check.png"
        await page.screenshot(path=str(screenshot_path), full_page=False)
        print(f"   📸 Screenshot: {screenshot_path.name}")
        
        # Step 5: View results (15s) - Initial view narration
        print("📍 Step 5: Viewing results (15s)")
        await asyncio.sleep(15)
        
        # Step 6: Scroll through results - detailed narration
        print("📍 Step 6: Scrolling through Red Flags and details")
        
        scroll_sequence = [
            (400, 12, "Risk Score details"),
            (700, 15, "Red Flag #1: Holder Concentration"),
            (1000, 15, "Red Flag #2: Centralized Authority"),
            (1300, 12, "Red Flag #3: Liquidity"),
            (1600, 10, "Additional details"),
            (0, 10, "Back to top - summary"),
        ]
        
        for pos, wait, desc in scroll_sequence:
            print(f"   Scrolling to {pos}px ({desc}) - {wait}s")
            await page.evaluate(f'window.scrollTo({{top: {pos}, behavior: "smooth"}})')
            await asyncio.sleep(wait)
        
        print("✅ Demo flow complete!")
        print("⏹️  Finalizing recording...")
        
        # Close to save video
        await context.close()
        await browser.close()
        
        print("📹 Recording finalized, processing...")
        await asyncio.sleep(3)
        
        # Find and convert video
        video_files = list(OUTPUT_DIR.glob("*.webm"))
        if video_files:
            latest_video = max(video_files, key=lambda p: p.stat().st_mtime)
            final_webm = OUTPUT_DIR / "final-demo-v4-working.webm"
            
            if latest_video != final_webm:
                latest_video.rename(final_webm)
            
            print(f"✅ WebM: {final_webm.name}")
            
            # Convert to MP4
            print("🔄 Converting to MP4 (high quality)...")
            import subprocess
            
            mp4_path = OUTPUT_DIR / "final-demo-v4-working.mp4"
            result = subprocess.run([
                'ffmpeg', '-y',
                '-i', str(final_webm),
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '18',  # Higher quality (18-23 is good range)
                '-pix_fmt', 'yuv420p',
                str(mp4_path)
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✅ MP4: {mp4_path.name}")
                
                # Get duration
                probe = subprocess.run([
                    'ffprobe', '-v', 'error',
                    '-show_entries', 'format=duration',
                    '-of', 'default=noprint_wrappers=1:nokey=1',
                    str(mp4_path)
                ], capture_output=True, text=True)
                
                if probe.returncode == 0:
                    duration = float(probe.stdout.strip())
                    print(f"   Duration: {duration:.1f}s ({duration/60:.1f} min)")
                
                return str(mp4_path)
            else:
                print(f"⚠️  MP4 conversion error: {result.stderr[:200]}")
                return None
        else:
            print("⚠️  No video file found")
            return None

if __name__ == '__main__':
    print("=" * 70)
    print("🎬 COLOSSEUM DEMO V4 FINAL - WORKING DASHBOARD!")
    print("=" * 70)
    print(f"Dashboard: {DASHBOARD_URL}")
    print(f"Token: BONK ({BONK_TOKEN})")
    print(f"Resolution: 1920x1080 Full HD")
    print(f"Output: {OUTPUT_DIR}")
    print("=" * 70)
    print()
    
    video_path = asyncio.run(record_demo())
    
    print()
    print("=" * 70)
    if video_path:
        print("✅ SCREEN RECORDING COMPLETE!")
        print(f"📹 Video: {video_path}")
        print()
        print("Next step: Integrate voiceover audio")
        print(f"Audio: {OUTPUT_DIR}/voiceover-ultra-clean.mp3")
    else:
        print("❌ RECORDING FAILED")
    print("=" * 70)
