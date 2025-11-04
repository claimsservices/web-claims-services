import { test, expect } from '@playwright/test';

test.describe('Login Functionality with Mocked Backend', () => {
  test('should allow a user to log in successfully', async ({ page }) => {
    // Mock the login API request
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mocked_auth_token',
          role: 'Admin', // Or 'Bike', 'Insurance' depending on the test scenario
          first_name: 'Test',
          last_name: 'User',
          myPicture: 'https://example.com/mock-avatar.png'
        }),
      });
    });

    await page.goto('/index.html'); // Assuming your Login page is index.html

    // Fill in username and password (these values are not important when the Backend is Mocked)
    await page.fill('input#username', 'testuser');
    await page.fill('input#password', 'testpassword');

    // Click the Login button
    await page.click('button[type="submit"]');

    // Assert that the user is redirected to the Dashboard
    await expect(page).toHaveURL(/dashboard.html/);
    // Assert that an element on the Dashboard displaying user info is visible
    await expect(page.locator('#user-info')).toHaveText('Test User');
  });

  test('should show error for invalid mocked credentials', async ({ page }) => {
    // Mock the login API request to return an error
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid username or password.' }),
      });
    });

    await page.goto('/index.html');

    await page.fill('input#username', 'wronguser');
    await page.fill('input#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Assert that an error message is displayed
    await expect(page.locator('#username-error')).toHaveText('Invalid username or password.');
  });
});