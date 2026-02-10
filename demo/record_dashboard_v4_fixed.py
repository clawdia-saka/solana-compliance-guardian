#!/usr/bin/env python3
"""
Playwright script to record dashboard interaction for demo video v4 FIXED
Properly waits for navigation to audit results page
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

BONK_TOKEN = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB264"
DASHBOARD_URL = "http://localhost:3001"
OUTPUT_DIR = Path(__file__).parent / "output"

async def record_demo():
    """Record dashboard interaction with proper navigation"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    async with async_playwright() as p:
        print("🚀 Launching browser (Full HD)...")
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage']
        )
        
        # Full HD viewport with video recording
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            record_video_dir=str(OUTPUT_DIR),
            record_video_size={'width': 1920, 'height': 1080}
        )
        
        page = await context.new_page()
        
        print(f"📹 Recording started...")
        print(f"🌐 Navigating to {DASHBOARD_URL}")
        
        # Navigate to dashboard
        await page.goto(DASHBOARD_URL, wait_until='load')
        await asyncio.sleep(5)
        
        print(f"✅ Dashboard loaded - starting demo flow...")
        
        # ==========================================
        # DEMO FLOW
        # ==========================================
        
        # Step 1: Homepage view (20s)
        print("📍 Step 1: Homepage view (20s)")
        await asyncio.sleep(20)
        
        # Step 2: Enter token address (15s)
        print("📍 Step 2: Entering BONK token address")
        input_field = await page.query_selector('input[type="text"]')
        await input_field.click()
        await asyncio.sleep(1)
        await input_field.type(BONK_TOKEN, delay=100)  # Type slowly
        print(f"   ✓ Typed: {BONK_TOKEN}")
        await asyncio.sleep(8)
        
        # Step 3: Submit and wait for navigation (10s total)
        print("📍 Step 3: Submitting audit")
        submit_button = await page.query_selector('button[type="submit"]')
        await asyncio.sleep(2)
        
        # IMPORTANT: Wait for navigation before clicking
        print("   ⏳ Waiting for navigation to results page...")
        async with page.expect_navigation(timeout=60000):
            await submit_button.click()
        
        print(f"   ✅ Navigated to: {page.url}")
        
        # Step 4: Results page view (40s)
        print("📍 Step 4: Results page loaded - viewing (40s)")
        await asyncio.sleep(10)  # Let page settle
        
        # Take screenshot for verification
        screenshot_path = OUTPUT_DIR / "recording-results-page.png"
        await page.screenshot(path=str(screenshot_path))
        print(f"   📸 Screenshot: {screenshot_path.name}")
        
        await asyncio.sleep(30)  # Extended view for narration
        
        # Step 5: Scroll through results (90s)
        print("📍 Step 5: Scrolling through results")
        
        scroll_sequence = [
            (300, 15, "Risk score"),
            (600, 18, "Violations"),
            (900, 18, "Recommendations"),
            (1200, 15, "Regulations"),
            (1500, 12, "Details"),
            (1800, 10, "More content"),
            (0, 12, "Back to top"),
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
        
        print("📹 Recording finalized")
        await asyncio.sleep(2)
        
        # Find and rename video
        video_files = list(OUTPUT_DIR.glob("*.webm"))
        if video_files:
            latest_video = max(video_files, key=lambda p: p.stat().st_mtime)
            final_webm = OUTPUT_DIR / "screen-recording-v4-final.webm"
            
            if latest_video != final_webm:
                latest_video.rename(final_webm)
            
            print(f"✅ WebM: {final_webm.name}")
            
            # Convert to MP4
            print("🔄 Converting to MP4...")
            import subprocess
            
            mp4_path = OUTPUT_DIR / "screen-recording-v4-final.mp4"
            result = subprocess.run([
                'ffmpeg', '-y',
                '-i', str(final_webm),
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '20',
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
        else:
            print("⚠️  No video file found")
        
        return None

if __name__ == '__main__':
    print("=" * 60)
    print("🎬 COLOSSEUM DEMO V4 FINAL - NO 404!")
    print("=" * 60)
    print(f"Dashboard: {DASHBOARD_URL}")
    print(f"Token: BONK ({BONK_TOKEN})")
    print(f"Output: {OUTPUT_DIR}")
    print(f"Resolution: 1920x1080 Full HD")
    print("=" * 60)
    print()
    
    video_path = asyncio.run(record_demo())
    
    print()
    print("=" * 60)
    if video_path:
        print("✅ SCREEN RECORDING COMPLETE!")
        print(f"📹 Video: {video_path}")
    else:
        print("❌ RECORDING FAILED")
    print("=" * 60)
