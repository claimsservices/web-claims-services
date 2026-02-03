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
// document.querySelectorAll is handled by JSDOM

// Mock document.getElementById - REMOVED to let JSDOM handle it
// const mockGetElementById = jest.fn((id) => {
//   if (id === 'appVersion') {
//     return { textContent: '' };
//   }
//   return null;
// });
// Object.defineProperty(document, 'getElementById', { value: mockGetElementById });


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

    // Default location
    // window.location is read-only in JSDOM environment
  });

  test('should initialize Menu and Helpers correctly on DOMContentLoaded', () => {
    document.body.innerHTML = '<aside id="layout-menu"></aside>';

    // Use isolateModules to ensure main.js re-runs
    jest.isolateModules(() => {
      require('../assets/js/main.js');
    });

    // Manually trigger DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(global.Menu).toHaveBeenCalled();
    expect(window.Helpers.scrollToActive).toHaveBeenCalledWith(false);
  });

  test('should fetch and display app versions', async () => {
    document.body.innerHTML = '<span id="appVersion"></span>';

    jest.isolateModules(() => {
      require('../assets/js/main.js');
    });
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Wait for promises to resolve
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(global.fetch).toHaveBeenCalledWith('/version.json');

    // We expect 1.0.0 based on our mock implementation
    const appVersionEl = document.getElementById('appVersion');
    expect(appVersionEl.textContent).toContain('1.0.0');
  });

  test('should handle menu toggler clicks', () => {
    document.body.innerHTML = `
        <aside id="layout-menu"></aside>
        <a class="layout-menu-toggle"></a>
    `;

    jest.isolateModules(() => {
      require('../assets/js/main.js');
    });
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const toggler = document.querySelector('.layout-menu-toggle');
    toggler.click();

    expect(window.Helpers.toggleCollapsed).toHaveBeenCalled();
  });

  // Test for Bike role menu modification
  test('should modify menu for Bike role', () => {
    localStorageMock.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQmlrZSIsImlhdCI6MTUxNjIzOTAyMn0.some_signature'); // Mock Bike role token

    // Update location using history API
    window.history.pushState({}, 'Bike Dashboard', '/web-claims-services/html/bike-dashboard.html');

    // Ensure document body has the necessary structure BEFORE script loads
    document.body.innerHTML = `
        <aside id="layout-menu" class="layout-menu">
            <ul class="menu-inner">
                <li class="menu-item active">
                    <a href="dashboard.html" class="menu-link">
                        <div data-i18n="Analytics">Dashboard</div>
                    </a>
                    <ul class="menu-sub"></ul>
                </li>
            </ul>
        </aside>
    `;

    jest.isolateModules(() => {
      require('../assets/js/main.js');
    });
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Verify changes
    console.log('DOM Content after script execution:', document.body.innerHTML);
    const dashboardLink = document.querySelector('a[href="task-attachments.html"]');
    expect(dashboardLink).not.toBeNull();

    // Check if the "Pre-approved" link was created
    const preApprovedLink = document.querySelector('a[href="bike-pre-approved.html"]');
    expect(preApprovedLink).not.toBeNull();
    expect(preApprovedLink.textContent).toContain('งาน Pre-approved');
  });
});