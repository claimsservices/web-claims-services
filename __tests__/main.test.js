jest.mock('../assets/vendor/js/menu.js', () => ({
  Menu: jest.fn(),
}));

// Mock window.Helpers
window.Helpers = {
  scrollToActive: jest.fn(),
  mainMenu: null,
  isSmallScreen: jest.fn(() => false), // Assume not small screen for most tests
  setAutoUpdate: jest.fn(),
  initPasswordToggle: jest.fn(),
  initSpeechToText: jest.fn(),
  setCollapsed: jest.fn(),
};

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

// Mock fetch
global.fetch = jest.fn((url) => {
  if (url === '/version.json') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ version: '1.0.0' }),
    });
  } else if (url === 'https://be-claims-service.onrender.com/api/version') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ version: '2.0.0' }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

// Mock document.querySelectorAll for menu elements
const mockMenuElement = {
  addEventListener: jest.fn(),
  querySelector: jest.fn(() => ({ offsetTop: 10 })),
  closest: jest.fn(() => null),
};
const mockLayoutMenu = {
  addEventListener: jest.fn(),
  querySelectorAll: jest.fn(() => [mockMenuElement]),
};
Object.defineProperty(document, 'querySelectorAll', {
  value: jest.fn((selector) => {
    if (selector === '#layout-menu') {
      return [mockLayoutMenu];
    }
    return [];
  }),
});

// Mock document.getElementById
const mockGetElementById = jest.fn((id) => {
  if (id === 'appVersion') {
    return { textContent: '' };
  }
  return null;
});
Object.defineProperty(document, 'getElementById', { value: mockGetElementById });


describe('main.js', () => {
  beforeEach(() => {
    global.Menu = jest.fn(); // Ensure Menu is globally available for main.js
    window.Helpers = {
      scrollToActive: jest.fn(),
      mainMenu: null,
      isSmallScreen: jest.fn(() => false),
      setAutoUpdate: jest.fn(),
      initPasswordToggle: jest.fn(),
      initSpeechToText: jest.fn(),
      setCollapsed: jest.fn(),
      toggleCollapsed: jest.fn(),
    };

    // Reset mocks before each test
    jest.clearAllMocks();
    localStorageMock.clear();
    // Reset window.API_BASE_URL for each test
    window.API_BASE_URL = 'https://be-claims-service.onrender.com';

    // Mock bootstrap
    global.bootstrap = {
      Tooltip: jest.fn(),
    };
  });

  test('should initialize Menu and Helpers correctly on DOMContentLoaded', async () => {
    // Import main.js after mocks are set up
    await import('../assets/js/main.js');

    // Manually trigger DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(document.querySelectorAll).toHaveBeenCalledWith('#layout-menu');
    expect(global.Menu).toHaveBeenCalledWith(mockLayoutMenu, {
      orientation: 'vertical',
      closeChildren: false,
    });
    expect(window.Helpers.scrollToActive).toHaveBeenCalledWith(false);
    expect(window.Helpers.mainMenu).toBeInstanceOf(global.Menu);
  });

  test('should fetch and display app versions', async () => {
    await import('../assets/js/main.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith('/version.json');
    expect(global.fetch).toHaveBeenCalledWith('https://be-claims-service.onrender.com/api/version');

    const appVersionEl = document.getElementById('appVersion');
    expect(appVersionEl.textContent).toBe('FE: 1.0.0 | BE: 1.0.0');
  });

  test('should handle menu toggler clicks', async () => {
    await import('../assets/js/main.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const mockToggler = {
      addEventListener: jest.fn((event, callback) => {
        if (event === 'click') {
          callback({ preventDefault: jest.fn() });
        }
      }),
    };
    document.querySelectorAll.mockImplementation((selector) => {
      if (selector === '.layout-menu-toggle') {
        return [mockToggler];
      }
      if (selector === '#layout-menu') {
        return [mockLayoutMenu];
      }
      return [];
    });

    // Re-dispatch DOMContentLoaded to pick up new mock for toggler
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(mockToggler.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(window.Helpers.toggleCollapsed).toHaveBeenCalled();
  });

  // Test for Bike role menu modification
  test('should modify menu for Bike role', async () => {
    localStorageMock.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQmlrZSIsImlhdCI6MTUxNjIzOTAyMn0.some_signature'); // Mock Bike role token

    // Mock document.querySelector for menu links
    const mockDashboardLink = {
      href: 'dashboard.html',
      closest: jest.fn(() => ({
        classList: { remove: jest.fn(), add: jest.fn() },
        closest: jest.fn(() => ({
          appendChild: jest.fn()
        })),
        cloneNode: jest.fn(() => ({
          querySelector: jest.fn(() => ({
            textContent: '',
            href: ''
          })),
          classList: { remove: jest.fn(), add: jest.fn() },
        })),
      })),
      querySelector: jest.fn(() => ({
        textContent: ''
      })),
    };
    document.querySelector = jest.fn((selector) => {
      if (selector === 'a[href="dashboard.html"]') {
        return mockDashboardLink;
      }
      return null;
    });

    // Mock window.location.pathname
    delete window.location;
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/web-claims-services/html/agent-dashboard.html',
      },
      writable: true,
    });

    await import('../assets/js/main.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(mockDashboardLink.href).toBe('bike-dashboard.html');
    expect(mockDashboardLink.closest().closest().appendChild).toHaveBeenCalled(); // Check if new link was appended
  });
});