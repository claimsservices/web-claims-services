const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Utility to create a mock JWT
const createMockJwt = (payload) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedHeader}.${encodedPayload}.signature`;
};

describe('Dashboard Menu Access After Permissions Change', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    jest.useFakeTimers();
    const html = fs.readFileSync(path.resolve(__dirname, '../html/dashboard.html'), 'utf8');
    dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
    window = dom.window;
    document = window.document;

    // Mock dependencies
    Object.defineProperty(window, 'localStorage', {
      value: (() => {
        let store = {};
        return {
          getItem: (key) => store[key] || null,
          setItem: (key, value) => { store[key] = value.toString(); },
          removeItem: (key) => { delete store[key]; },
          clear: () => { store = {}; },
        };
      })(),
    });
    window.atob = (str) => Buffer.from(str, 'base64').toString('binary');
    window.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ order: {} }) }));
    window.flatpickr = jest.fn(() => ({ destroy: jest.fn() }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const runScript = () => {
    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../assets/js/dashboard-refactored.js'), 'utf8');
    const scriptElement = document.createElement('script');
    scriptElement.textContent = scriptContent;
    document.body.appendChild(scriptElement);
    document.dispatchEvent(new window.Event('DOMContentLoaded'));
    jest.runAllTimers();
  };

  test('should display admin menu for Director role', () => {
    const directorToken = createMockJwt({ role: 'Director' });
    window.localStorage.setItem('authToken', directorToken);
    runScript();
    const adminMenu = document.getElementById('admin-menu');
    expect(adminMenu.style.display).toBe('block');
  });
  
    test('should display admin menu for Operation Manager role', () => {
    const opManagerToken = createMockJwt({ role: 'Operation Manager' });
    window.localStorage.setItem('authToken', opManagerToken);
    runScript();
    const adminMenu = document.getElementById('admin-menu');
    expect(adminMenu.style.display).toBe('block');
  });

  test('should NOT display admin menu for Developer role', () => {
    const developerToken = createMockJwt({ role: 'Developer' });
    window.localStorage.setItem('authToken', developerToken);
    runScript();
    const adminMenu = document.getElementById('admin-menu');
    expect(adminMenu.style.display).toBe('none');
  });

  test('should NOT display admin menu for Officer role', () => {
    const officerToken = createMockJwt({ role: 'Officer' });
    window.localStorage.setItem('authToken', officerToken);
    runScript();
    const adminMenu = document.getElementById('admin-menu');
    expect(adminMenu.style.display).toBe('none');
  });
});