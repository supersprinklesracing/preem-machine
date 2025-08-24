from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch()
    # Set a mobile viewport
    context = browser.new_context(
        viewport={'width': 375, 'height': 667},
        is_mobile=True,
    )
    page = context.new_page()

    try:
        # 1. Go to the page
        page.goto("http://localhost:4200")

        # 2. Find and click the burger button
        # The burger button is a button, and it's the only one in the header
        burger_button = page.locator('header button')
        expect(burger_button).to_be_visible()
        burger_button.click()

        # 3. Wait for the sidebar to be visible
        sidebar = page.locator('nav.mantine-AppShell-navbar')
        expect(sidebar).to_be_visible()

        # 4. Take a screenshot
        page.screenshot(path="jules-scratch/verification/sidebar_open.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        # Take a screenshot even on failure to help debug
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()
