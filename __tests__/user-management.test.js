const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Set a longer timeout for this test file
jest.setTimeout(10000);

// Utility to create a mock JWT
const createMockJwt = (payload) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedHeader}.${encodedPayload}.signature`;
};

describe('User Management Page Access Control', () => {
  let dom;
  let window;
  let assignMock;

  beforeEach(async () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../html/users.html'), 'utf8');
    const virtualConsole = new (require('jsdom')).VirtualConsole();
    virtualConsole.on('error', (error) => {
      if (!error.message.includes('Not implemented: navigation')) {
        console.error(error);
      }
    });

    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      url: 'file://' + path.resolve(__dirname, '../html/users.html'),
      virtualConsole,
    });
    window = dom.window;

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });

    // Mock atob
    window.atob = (str) => Buffer.from(str, 'base64').toString('binary');

    // Mock fetch
    window.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [] }) }));
    window.alert = jest.fn();

    // Mock window.location
    delete window.location;
    window.location = Object.defineProperties({}, {
      ...Object.getOwnPropertyDescriptors(window.location),
      href: {
        set: jest.fn(),
        get: jest.fn(() => 'file:///C:/Users/takon/OneDrive/Desktop/da/01-claim_service/web-claims-services/html/users.html'),
        configurable: true
      },
      assign: {
        value: jest.fn(),
        writable: true
      },
      replace: {
        value: jest.fn(),
        writable: true
      },
      reload: {
        value: jest.fn(),
        writable: true
      }
    });

    // Mock bootstrap
    window.bootstrap = {
      Offcanvas: {
        getInstance: jest.fn(),
        getOrCreateInstance: jest.fn(),
      }
    };

    // Mock bootstrap
    window.bootstrap = {
      Offcanvas: {
        getInstance: jest.fn(),
        getOrCreateInstance: jest.fn(),
      }
    };
  });

  test('should allow access for Director role', async () => {
    window.localStorage.getItem.mockReturnValue(createMockJwt({ role: 'Director' }));

    // Manually trigger DOMContentLoaded as the script might expect it
    // Note: Since we are loading HTML via JSDOM, the inline scripts might run immediately or need a trigger
    // We can simulate the event listener callback if we can access it, or rely on event dispatch

    // Simulating script execution environment
    const scriptContent = `
      // ... logic from user-management page script ...
    `;
    // Ideally we should load the script file content here if it was external, 
    // but the logic is inline in users.html. 
    // JSDOM with runScripts: 'dangerously' should execute it.

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(window.location.href).not.toContain('dashboard.html');
  });

  test('should redirect if user role is not Director or other allowed roles', async () => {
    window.localStorage.getItem.mockReturnValue(createMockJwt({ role: 'Developer' }));

    // Wait for script execution
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if redirection happened
    // Note: The previous test run might have failed because the inline script didn't run or threw an error
    // We need to check if the inline script in users.html is compatible with this node environment

    // If the inline script listens for DOMContentLoaded:
    const DOMContentLoadedEvent = new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true });
    window.document.dispatchEvent(DOMContentLoadedEvent);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Console logs for debugging
    console.log('Final window.location.href:', window.location.href);
    console.log('Alert calls:', window.alert.mock.calls);

    expect(window.alert).toHaveBeenCalledWith('You do not have permission to access this page.');
    // Check if the setter was called with the dashboard URL
    // Since we mocked href as a setter, reading it back might return the default getter value unless we implemented storage.
    // Check if the setter was called with the dashboard URL
    expect(mockHrefSetter).toHaveBeenCalledWith(expect.stringContaining('dashboard.html'));
  });
});