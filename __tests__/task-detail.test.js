const fs = require('fs');
const path = require('path');

// Helper function to extract the inline script from HTML
const extractScript = (htmlContent, scriptFileName) => {
  const scriptRegex = new RegExp(`<script src="\.\./assets/js/${scriptFileName}" type="module"><\/script>`);
  const match = htmlContent.match(scriptRegex);
  if (match) {
    // For this test, we need to load the script content directly
    const scriptPath = path.resolve(__dirname, `../assets/js/${scriptFileName}`);
    return fs.readFileSync(scriptPath, 'utf8');
  }
  return '';
};

describe('Order Detail Page - loadOrderData error handling', () => {
  let htmlContent;
  let scriptContent;
  const originalLocation = window.location;
  const originalAlert = window.alert;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../html/task-detail.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    scriptContent = extractScript(htmlContent, 'task-detail-refactored.js');
  });

  let locationHrefSetter;

  beforeEach(() => {
    document.body.innerHTML = htmlContent;

    // Mock window.location.href setter
    locationHrefSetter = jest.fn();
    delete window.location;
    window.location = {
      ...originalLocation,
      href: '',
    };
    Object.defineProperty(window.location, 'href', {
        set: locationHrefSetter,
    });

    // Mock window.alert
    window.alert = jest.fn();

    // Mock fetch API
    global.fetch = jest.fn((url, options) => {
      if (url.includes('/api/auth/profile')) {
        // Mock successful profile load
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Protected data.', userId: 'fake-id' }),
        });
      } else if (url.includes('/api/order-detail/inquiry')) {
        // Mock failed order data load
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Order not found' }),
          status: 404,
          statusText: 'Not Found',
        });
      }
      return Promise.reject(new Error('Unhandled fetch request'));
    });

    // Run script
    const scriptWithoutImport = scriptContent.replace(/import .*?;/s, '');
    const API_BASE_URL = 'http://localhost:8181';
    eval(scriptWithoutImport);

    // Simulate DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    window.location = originalLocation; // Restore original location
    window.alert = originalAlert; // Restore original alert
    jest.restoreAllMocks();
  });

  test('should display an alert and not redirect on failed order data load', async () => {
    // Simulate clicking an order link to trigger loadOrderData
    // We need to manually call loadOrderData as it's not directly exposed
    // For this, we'll simulate the URL parameter and then call the function
    const orderId = 'TEST-ORDER-ID';
    Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, search: `?id=${orderId}` }
    });

    // Re-trigger DOMContentLoaded to ensure loadOrderData is called with the new URL
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Wait for all promises to resolve
    await new Promise(process.nextTick); // Allow promises to settle

    expect(window.alert).toHaveBeenCalledWith('❌ ไม่พบข้อมูล: Order not found');
    expect(locationHrefSetter).not.toHaveBeenCalled();
  });
});
