/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Helper to create mock JWT
const createMockJwt = (payload) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedHeader}.${encodedPayload}.signature`;
};

describe('Task Management Access Control and Initialization', () => {
  let mockLocalStorage;
  let mockLocation;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    // 1. Mock localStorage
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // 2. Mock location safely
    mockLocation = {
      href: 'http://localhost/html/task-management.html',
      search: '',
      pathname: '/html/task-management.html',
      reload: jest.fn(),
    };

    try {
      Object.defineProperty(window.constructor.prototype, 'location', {
        get: () => mockLocation,
        configurable: true,
      });
    } catch (e) {
      try {
        Object.defineProperty(window, 'location', {
          get: () => mockLocation,
          configurable: true,
        });
      } catch (err2) {
        // Ultimate fallback: just mock properties directly if possible
        window.location.assign = jest.fn();
        window.location.replace = jest.fn();
        window.location.reload = mockLocation.reload;
      }
    }

    // 3. Mock global dependencies
    global.carModels = {
      Honda: ['Civic', 'Accord'],
    };
    global.fetch = jest.fn();
    window.alert = jest.fn();

    // Mock bootstrap
    window.bootstrap = {
      Offcanvas: {
        getInstance: jest.fn(),
        getOrCreateInstance: jest.fn(),
      }
    };

    // 4. Setup mock DOM structure representing task-management.html
    document.body.innerHTML = `
      <div id="user-info"></div>
      <input id="ownerName" value="" />
      <div id="user-role"></div>
      <select id="insuranceCompany"><option value=""></option></select>
      <div id="tab-li-profile"></div>
      <div id="tab-li-contact"></div>
      <div id="tab-li-note"></div>
      <div id="tab-li-history"></div>
      <div id="tab-li-upload"></div>
      <select id="orderStatus"><option value=""></option></select>
      <img id="userAvatar" src="" />
      <div id="admin-menu" style="display: none;"></div>
      <input id="jobType" disabled />
      <input id="taskId" />
      <div id="appVersion"></div>
      <button id="logout"></button>
      <button id="logout-menu"></button>
      <select id="brandSelect"></select>
      <select id="modelSelect"></select>
    `;
  });

  test('should allow Officer role and not redirect or logout', async () => {
    // Set Officer role token
    const token = createMockJwt({
      username: 'officer_user',
      first_name: 'Somchai',
      last_name: 'Officer',
      role: 'Officer',
      myPicture: 'http://example.com/avatar.png'
    });
    mockLocalStorage.getItem.mockReturnValue(token);

    // Mock fetch for version check, profile API, and order creation API
    global.fetch.mockImplementation((url, options) => {
      if (url.includes('/version.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ version: '1.5.255' })
        });
      }
      if (url.includes('/api/auth/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'ok' })
        });
      }
      if (url.includes('/api/orders/create')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'TASK-12345' })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    // Load module dynamically
    jest.isolateModules(async () => {
      await import('../assets/js/task-management-refactored.js');

      // Wait for DOMContentLoaded listeners & promises
      const event = new window.Event('DOMContentLoaded');
      window.document.dispatchEvent(event);
      
      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 150));

      // Officer should not be redirected or logged out
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('authToken');
      expect(mockLocation.href).not.toContain('index.html'); // Should not redirect to login page
      
      // UI should be updated with Officer info
      expect(document.getElementById('user-info').innerText).toBe('Somchai Officer');
      expect(document.getElementById('user-role').innerText).toBe('Officer');
      expect(document.getElementById('userAvatar').src).toBe('http://example.com/avatar.png');
    });
  });

  test('should redirect Sales Manager to dashboard.html', async () => {
    const token = createMockJwt({
      username: 'sales_user',
      first_name: 'Somsak',
      last_name: 'Sales',
      role: 'Sales Manager'
    });
    mockLocalStorage.getItem.mockReturnValue(token);

    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ version: '1.5.255' })
    });

    jest.isolateModules(async () => {
      await import('../assets/js/task-management-refactored.js');

      const event = new window.Event('DOMContentLoaded');
      window.document.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 150));

      // Sales Manager should be redirected to dashboard.html
      expect(mockLocation.href).toContain('dashboard.html');
    });
  });

  test('should redirect unauthenticated users to login page', async () => {
    // No token in localStorage
    mockLocalStorage.getItem.mockReturnValue(null);

    jest.isolateModules(async () => {
      await import('../assets/js/task-management-refactored.js');

      const event = new window.Event('DOMContentLoaded');
      window.document.dispatchEvent(event);

      await new Promise(resolve => setTimeout(resolve, 150));

      // Unauthenticated users should be redirected to login page
      expect(mockLocation.href).toContain('../index.html');
    });
  });
});
