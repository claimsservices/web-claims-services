const fs = require('fs');
const path = require('path');

// Helper function to extract the inline script from HTML
const extractScript = (htmlContent) => {
  const scriptRegex = /<script type="module">([\s\S]*?)<\/script>/;
  const match = htmlContent.match(scriptRegex);
  return match ? match[1] : '';
};

describe('Login Redirection Logic', () => {
  let htmlContent;
  let scriptContent;

  beforeAll(() => {
    // Load the HTML and extract the inline script once
    const indexPath = path.resolve(__dirname, '../index.html');
    htmlContent = fs.readFileSync(indexPath, 'utf8');
    scriptContent = extractScript(htmlContent);
  });

  beforeEach(() => {
    // Set up the DOM for each test
    document.body.innerHTML = htmlContent;

    // Mock window.location by spying on the href setter
    const locationSetterSpy = jest.fn();
    const originalLocation = window.location;
    delete window.location;
    Object.defineProperty(window, 'location', {
      // configurable: true, // This is often needed
      get: () => originalLocation,
      set: locationSetterSpy,
    });

    // Mock fetch API
    global.fetch = jest.fn();

    // Run the inline script to attach the event listener
    const scriptWithoutImport = scriptContent.replace(/import .*?;/s, '');
    const API_BASE_URL = 'http://localhost:8181'; // Mock the imported constant
    eval(scriptWithoutImport);

    // Return a cleanup function
    return () => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
      locationSetterSpy.mockRestore();
    };
  });

  // Test Case 1: Officer logs in
  test('should redirect to dashboard.html when role is Officer', async () => {
    // Arrange: Mock a successful login response for an Officer
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'fake-token', role: 'Officer' }),
    });

    // Act: Simulate form submission
    document.getElementById('username').value = 'testofficer';
    document.getElementById('password').value = 'password';
    await document.getElementById('formAuthentication').dispatchEvent(new Event('submit'));

    // Assert: Check if redirection is correct
    expect(window.location).toHaveBeenCalledWith('html/dashboard.html');
  });

  // Test Case 2: Bike user logs in
  test('should redirect to bike-task-detail.html when role is Bike', async () => {
    // Arrange: Mock a successful login response for a Bike user
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'fake-token', role: 'Bike' }),
    });

    // Act: Simulate form submission
    document.getElementById('username').value = 'testbike';
    document.getElementById('password').value = 'password';
    await document.getElementById('formAuthentication').dispatchEvent(new Event('submit'));

    // Assert: Check if redirection is correct
    expect(window.location).toHaveBeenCalledWith('html/bike-task-detail.html');
  });

  // Test Case 3: Director logs in
  test('should redirect to dashboard.html when role is Director', async () => {
    // Arrange: Mock a successful login response for a Director
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'fake-token', role: 'Director' }),
    });

    // Act: Simulate form submission
    document.getElementById('username').value = 'testdirector';
    document.getElementById('password').value = 'password';
    await document.getElementById('formAuthentication').dispatchEvent(new Event('submit'));

    // Assert: Check if redirection is correct
    expect(window.location).toHaveBeenCalledWith('html/dashboard.html');
  });

  // Test Case 4: Login fails
  test('should display an error message on failed login', async () => {
    // Arrange: Mock a failed login response
    fetch.mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Invalid credentials'),
    });

    // Act: Simulate form submission
    document.getElementById('username').value = 'wronguser';
    document.getElementById('password').value = 'wrongpassword';
    await document.getElementById('formAuthentication').dispatchEvent(new Event('submit'));

    // Assert: Check that no redirection happened and an error is shown
    const errorMessage = document.getElementById('username-error').innerText;
    expect(window.location).not.toHaveBeenCalled();
    expect(errorMessage).toBe('Invalid username or password.');
  });
});
