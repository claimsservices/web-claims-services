/**
 * @jest-environment jsdom
 */

// Mock window.API_BASE_URL
window.API_BASE_URL = 'https://be-claims-service.onrender.com';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
        removeItem: jest.fn(key => { delete store[key]; }),
        clear: jest.fn(() => { store = {}; })
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock navigation
jest.mock('../assets/js/navigation.js', () => ({
    navigateTo: jest.fn(),
}));
const { navigateTo } = require('../assets/js/navigation.js');

// Mock flatpickr globally
window.flatpickr = jest.fn();
global.flatpickr = window.flatpickr;

describe('history-attachments-refactored.js', () => {
    let fetchMock;

    const loadScript = async () => {
        await jest.isolateModules(async () => {
            await import('../assets/js/history-attachments-refactored.js');
        });
        document.dispatchEvent(new Event('DOMContentLoaded'));
    };

    const createMockToken = (role = 'Officer', username = 'testuser') => {
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = {
            id: 123,
            username: username,
            first_name: 'Test',
            last_name: 'User',
            role: role,
            myPicture: 'http://example.com/avatar.jpg',
            email: 'test@example.com',
            exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour valid
        };

        // Simple mock encoding
        const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64');
        return `${b64(header)}.${b64(payload)}.signature`;
    };

    beforeEach(() => {
        navigateTo.mockClear();
        // Reset DOM
        document.body.innerHTML = `
      <div id="history-attachments-menu"></div>
      <span id="appVersion"></span>
      <div id="user-info"></div>
      <div id="user-role"></div>
      <img id="userAvatar" />
      <div id="admin-menu" style="display: none;"></div>
      <table id="userTable"><tbody></tbody></table>
      <ul class="pagination"></ul>
      <input id="filterDateTime" />
      <button id="logout"></button>
    `;

        localStorageMock.clear();
        window.flatpickr = jest.fn();
        global.flatpickr = jest.fn();

        // Mock fetch
        fetchMock = jest.fn((url) => {
            if (url === '/version.json') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ version: '1.0.0' })
                });
            }
            if (url.includes('/api/auth/profile')) {
                return Promise.resolve({ ok: true });
            }
            if (url.includes('/api/history-agent/inquiry')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            });
        });
        global.fetch = fetchMock;
    });

    test('should redirect to login if no token is present', async () => {
        localStorageMock.getItem.mockReturnValue(null);
        await loadScript();
        expect(navigateTo).toHaveBeenCalledWith('../index.html');
    });

    test('should hide history menu if role is Bike', async () => {
        const token = createMockToken('Bike');
        localStorageMock.getItem.mockReturnValue(token);

        await loadScript();

        const historyMenu = document.getElementById('history-attachments-menu');
        expect(historyMenu.style.display).toBe('none');
    });

    test('should not hide history menu if role is Officer', async () => {
        const token = createMockToken('Officer');
        localStorageMock.getItem.mockReturnValue(token);
        await loadScript();

        const historyMenu = document.getElementById('history-attachments-menu');
        expect(historyMenu.style.display).not.toBe('none');
    });

    test('should display app version', async () => {
        const token = createMockToken('Officer');
        localStorageMock.getItem.mockReturnValue(token);

        await loadScript();

        // Wait for fetch promises
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(document.getElementById('appVersion').textContent).toBe('App Version 1.0.0');
    });

    test('should load user profile and update UI', async () => {
        const token = createMockToken('Director');
        localStorageMock.getItem.mockReturnValue(token);

        await loadScript();
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(document.getElementById('user-info').innerText).toBe('Test User');
        expect(document.getElementById('user-role').innerText).toBe('Director');

        const adminMenu = document.getElementById('admin-menu');
        expect(adminMenu.style.display).toBe('block');
    });
});
