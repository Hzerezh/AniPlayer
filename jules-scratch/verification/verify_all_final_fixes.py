import time
import re
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Navigate to the application and wait for it to be ready
    page.goto("http://localhost:5200")
    page.wait_for_load_state('networkidle')

    # Ensure the playlist is clear before starting
    page.on("dialog", lambda dialog: dialog.accept())
    clear_button = page.get_by_role("button", name="Очистить")
    if clear_button.is_enabled():
        clear_button.click()
        expect(page.locator(".empty")).to_be_visible()

    # 1. Test Critical Playback Fix: Upload the first video
    file_input_selector = 'input[type="file"]:not([webkitdirectory])'
    page.set_input_files(file_input_selector, 'jules-scratch/verification/dummy_video.mp4')

    # Verify the video element has its src set correctly using a regex
    video_player = page.locator(".video-player")
    expect(video_player).to_have_attribute("src", re.compile(r"^blob:"), timeout=10000)

    # Verify the first item is in the list and active
    first_item = page.locator(".list .item").first
    expect(first_item).to_be_visible()
    expect(first_item).to_have_attribute("data-active", "true")

    # 2. Test Playlist Sorting: Upload a second video
    page.set_input_files(file_input_selector, 'jules-scratch/verification/dummy_video_2.mp4')
    playlist_items = page.locator(".list .item")
    expect(playlist_items).to_have_count(2)

    # Click 'move down' on the first item
    playlist_items.first.get_by_title("Move Down").click()
    # Verify the order has changed
    expect(playlist_items.first.locator(".title")).to_have_text("dummy_video_2.mp4")

    # 3. Test Control Visibility Fix
    video_wrapper = page.locator(".video-wrapper")
    controls = page.locator(".controls")

    # Controls appear on hover
    video_wrapper.hover()
    expect(controls).to_be_visible()

    # Move mouse away and verify controls disappear
    page.mouse.move(0, 0)
    time.sleep(3.1) # Wait for timeout to fire
    expect(controls).not_to_be_visible()

    # 4. Test Hotkey Correction
    # Get initial time, press hotkey, then check for change
    initial_time = video_player.evaluate("node => node.currentTime")
    page.press('body', '>')
    time.sleep(0.1) # Give it a moment to process
    new_time = video_player.evaluate("node => node.currentTime")
    assert new_time > initial_time

    # 5. Take final screenshot
    video_wrapper.hover() # Make controls visible for the screenshot
    expect(controls).to_be_visible()
    page.screenshot(path="jules-scratch/verification/final_app_all_fixes.png")

    browser.close()

with sync_playwright() as p:
    run_verification(p)