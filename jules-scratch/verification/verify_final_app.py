from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Navigate to the application
    page.goto("http://localhost:5200")

    # Wait for the app to potentially finish its initial loading from storage
    page.wait_for_load_state('networkidle')

    # Ensure the playlist is clear before starting
    page.on("dialog", lambda dialog: dialog.accept())
    clear_button = page.get_by_role("button", name="Очистить")
    if clear_button.is_enabled():
        clear_button.click()
        expect(page.locator(".empty")).to_be_visible()

    # Upload two video files
    file_input_selector = 'input[type="file"]:not([webkitdirectory])'
    page.set_input_files(file_input_selector, [
        'jules-scratch/verification/dummy_video.mp4',
        'jules-scratch/verification/dummy_video_2.mp4'
    ])

    # Wait for both items to appear in the list
    playlist_items = page.locator(".list .item")
    expect(playlist_items).to_have_count(2, timeout=15000)

    # Verify initial order
    first_item_title = playlist_items.first.locator(".title")
    expect(first_item_title).to_have_text("dummy_video.mp4")

    # Click the "down" arrow on the first item to reorder
    move_down_button = playlist_items.first.get_by_title("Move Down")
    move_down_button.click()

    # Verify the new order
    expect(first_item_title).to_have_text("dummy_video_2.mp4")

    # Hover over the video player to show the controls
    video_wrapper_selector = ".video-wrapper"
    page.locator(video_wrapper_selector).hover()

    # Verify the new controls are visible
    actions_bar = page.locator(".actions-bar")
    expect(actions_bar).to_be_visible()

    # Verify the auto-advance toggle is in the controls
    auto_advance_toggle = actions_bar.locator(".toggle")
    expect(auto_advance_toggle).to_be_visible()
    expect(auto_advance_toggle).to_contain_text("Автопереход")

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/final_app_verification.png")

    browser.close()

with sync_playwright() as p:
    run_verification(p)