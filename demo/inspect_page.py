#!/usr/bin/env python3
"""Inspect dashboard page structure"""
import asyncio
from playwright.async_api import async_playwright

async def inspect():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("🌐 Loading http://localhost:3001")
        await page.goto("http://localhost:3001", wait_until='load')
        await asyncio.sleep(3)
        
        # Get page title
        title = await page.title()
        print(f"📄 Title: {title}")
        
        # Get all input elements
        print("\n📋 Input elements:")
        inputs = await page.query_selector_all('input')
        for i, inp in enumerate(inputs):
            tag = await inp.evaluate('el => el.outerHTML')
            print(f"  [{i}] {tag[:200]}")
        
        # Get all buttons
        print("\n🔘 Button elements:")
        buttons = await page.query_selector_all('button')
        for i, btn in enumerate(buttons):
            tag = await btn.evaluate('el => el.outerHTML')
            print(f"  [{i}] {tag[:200]}")
        
        # Get page HTML structure (first 3000 chars)
        html = await page.content()
        print(f"\n📝 Page HTML (first 3000 chars):")
        print(html[:3000])
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(inspect())
