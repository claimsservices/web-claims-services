jest.mock('../assets/js/api-config.js', () => 'http://localhost:8181');
jest.mock('../assets/js/navigation.js', () => ({
  navigateTo: jest.fn(),
}));

import { navigateTo } from '../assets/js/navigation.js';

describe('Login Logic', () => {

  beforeEach(() => {
    // Set up the DOM
    document.body.innerHTML = `
      <form id="formAuthentication">
        <input id="username" />
        <input id="password" />
        <div id="username-error" style="display: none;"></div>
        <div class="form-password-toggle"></div>
      </form>
    `;

    // Mock global fetch
    global.fetch = jest.fn();

    // Clear mocks and localStorage before each test
    localStorage.clear();
    navigateTo.mockClear();

    // Load the script
    jest.isolateModules(() => {
      require('../js/login.js');
    });
  });

  test('should redirect to agent-dashboard.html for Bike role', async () => {
    // Arrange: Mock a successful login for a 'Bike' user
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'fake-token', role: 'Bike' }),
    });

    // Act: Simulate form submission
    document.getElementById('username').value = 'bikeuser';
    document.getElementById('password').value = 'password';
    document.getElementById('formAuthentication').dispatchEvent(new Event('submit'));

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    // Assert
    expect(localStorage.getItem('role')).toBe('Bike');
    expect(navigateTo).toHaveBeenCalledWith('html/agent-dashboard.html');
  });

  test('should redirect to dashboard.html for a non-Bike role', async () => {
    // Arrange: Mock a successful login for an 'Admin Officer' user
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'fake-token', role: 'Admin Officer' }),
    });

    // Act: Simulate form submission
    document.getElementById('username').value = 'adminuser';
    document.getElementById('password').value = 'password';
    document.getElementById('formAuthentication').dispatchEvent(new Event('submit'));

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    // Assert
    expect(localStorage.getItem('role')).toBe('Admin Officer');
    expect(navigateTo).toHaveBeenCalledWith('html/dashboard.html');
  });

  test('should show an error message on failed login', async () => {
    // Arrange: Mock a failed login
    fetch.mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Invalid credentials'),
    });

    // Act: Simulate form submission
    document.getElementById('username').value = 'wronguser';
    document.getElementById('password').value = 'wrongpassword';
    document.getElementById('formAuthentication').dispatchEvent(new Event('submit'));

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    // Assert
    const errorMessage = document.getElementById('username-error').innerText;
    expect(errorMessage).toBe('Invalid username or password.');
    expect(navigateTo).not.toHaveBeenCalled();
  });
});

