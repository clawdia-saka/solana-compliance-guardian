#!/usr/bin/env python3
"""Test the audit flow manually"""
import asyncio
from playwright.async_api import async_playwright

BONK_TOKEN = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB264"

async def test_audit():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)  # Headless
        page = await browser.new_page()
        
        print("🌐 Loading dashboard...")
        await page.goto("http://localhost:3001", wait_until='load')
        await asyncio.sleep(2)
        
        print("📝 Page title:", await page.title())
        print("📍 Current URL:", page.url)
        
        # Enter token
        print(f"\n✏️  Entering token: {BONK_TOKEN}")
        input_field = await page.query_selector('input[type="text"]')
        await input_field.fill(BONK_TOKEN)
        await asyncio.sleep(1)
        
        # Click submit
        print("🔘 Clicking Start Audit button...")
        submit_button = await page.query_selector('button[type="submit"]')
        
        # Set up navigation listener BEFORE clicking
        print("⏳ Waiting for navigation...")
        async with page.expect_navigation(timeout=60000):
            await submit_button.click()
        
        print(f"\n✅ Navigated to: {page.url}")
        await asyncio.sleep(5)
        
        # Take screenshot
        await page.screenshot(path="test-result-page.png")
        print("📸 Screenshot saved: test-result-page.png")
        
        # Get page content preview
        html = await page.content()
        if "404" in html:
            print("❌ ERROR: 404 found in page!")
        else:
            print("✅ No 404 error detected")
        
        # Wait a bit more
        await asyncio.sleep(10)
        print(f"\n📍 Final URL: {page.url}")
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_audit())
