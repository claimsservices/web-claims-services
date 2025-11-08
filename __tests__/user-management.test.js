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

describe('User Management Page Access Control', () => {

  test('should allow access for Director role', async () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../html/users.html'), 'utf8');
    const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'file://' + __dirname });
    const window = dom.window;

    const locationSpy = jest.spyOn(window, 'location', 'get');

    Object.defineProperty(window, 'localStorage', {
      value: { getItem: () => createMockJwt({ role: 'Director' }) },
      writable: true
    });
    window.atob = (str) => Buffer.from(str, 'base64').toString('binary');
    window.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [] }) }));

    await new Promise(resolve => window.addEventListener('load', resolve));

    expect(locationSpy).not.toHaveBeenCalled();
  });

  test('should redirect if user role is Developer', async () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../html/users.html'), 'utf8');
    const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'file://' + __dirname });
    const window = dom.window;

    let redirectedUrl = '';
    Object.defineProperty(window, 'location', {
        set: (url) => {
            redirectedUrl = url;
        },
        get: () => ({ href: redirectedUrl })
    });

    window.alert = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: () => createMockJwt({ role: 'Developer' }) },
      writable: true
    });
    window.atob = (str) => Buffer.from(str, 'base64').toString('binary');
    
    await new Promise(resolve => window.addEventListener('load', resolve));
    
    expect(window.alert).toHaveBeenCalledWith('You do not have permission to access this page.');
    expect(redirectedUrl).toBe('dashboard.html');
  });
});