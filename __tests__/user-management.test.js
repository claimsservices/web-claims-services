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

    // Mock window.location.assign for redirection
    assignMock = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true, // Make it configurable
      value: { assign: assignMock, href: '' }
    });
    
    // Mock fetch
    window.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [] }) }));
    window.alert = jest.fn();
  });

  test('should allow access for Director role', (done) => {
    window.localStorage.getItem.mockReturnValue(createMockJwt({ role: 'Director' }));

    window.addEventListener('DOMContentLoaded', () => {
        try {
            expect(assignMock).not.toHaveBeenCalled();
            done();
        } catch (error) {
            done(error);
        }
    });
  });

  test('should redirect if user role is not Director or other allowed roles', (done) => {
    window.localStorage.getItem.mockReturnValue(createMockJwt({ role: 'Developer' }));

    window.addEventListener('DOMContentLoaded', () => {
        try {
            expect(window.alert).toHaveBeenCalledWith('You do not have permission to access this page.');
            expect(assignMock).toHaveBeenCalledWith('dashboard.html');
            done();
        } catch (error) {
            done(error);
        }
    });
  });
});