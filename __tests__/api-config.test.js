describe('api-config.js', () => {
  beforeEach(() => {
    // Clear any previous API_BASE_URL to ensure isolation
    delete window.API_BASE_URL;
  });

  test('should set window.API_BASE_URL correctly', async () => {
    // Dynamically import the module to ensure it runs in the test environment
    // This simulates the script loading and setting the global variable
    await import('../assets/js/api-config.js');

    expect(window.API_BASE_URL).toBe('https://be-claims-service.onrender.com');
  });
});