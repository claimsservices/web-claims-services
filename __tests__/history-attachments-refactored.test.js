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



const { navigateTo } = require('../assets/js/navigation.js');



let mockLocationHref = '';







let originalWindow;















const mockWindow = {







  ...window, // Copy existing window properties







};















jest.mock('../assets/js/navigation.js', () => ({







  navigateTo: jest.fn(url => { mockLocationHref = url; }),







}));







const mockElements = {};







const getMockElement = (id) => {







  if (!mockElements[id]) {







    mockElements[id] = {







      textContent: '',







      innerText: '',







      src: '',







      value: '',







      style: { display: '' },







      addEventListener: jest.fn(),







      removeEventListener: jest.fn(),







      classList: { add: jest.fn(), remove: jest.fn() },







      setAttribute: jest.fn(),







      removeAttribute: jest.fn(),







      appendChild: jest.fn(),







      removeChild: jest.fn(),







      children: [],







      dataset: {},







      focus: jest.fn(),







      click: jest.fn(),







      dispatchEvent: jest.fn(),







    };







  }







  return mockElements[id];







};















// Mock document.getElementById







document.getElementById = jest.fn(id => getMockElement(id));































describe('history-attachments-refactored.js', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    originalWindow = global.window;
    global.window = mockWindow;
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      get: jest.fn(() => mockLocationHref),
      set: jest.fn(url => { mockLocationHref = url; }),
    });
    Object.defineProperty(window.location, 'assign', {
      configurable: true,
      enumerable: true,
      value: jest.fn(url => { mockLocationHref = url; }),
    });
    Object.defineProperty(window.location, 'replace', {
      configurable: true,
      enumerable: true,
      value: jest.fn(url => { mockLocationHref = url; }),
    });
    Object.defineProperty(window.location, 'reload', {
      configurable: true,
      enumerable: true,
      value: jest.fn(),
    });
    localStorageMock.clear();
    global.fetch = jest.fn();
    global.flatpickr = jest.fn(() => {
      return {
        destroy: jest.fn(),
        // Add other methods that might be called on a flatpickr instance if needed
      };
    });
    global.fetch.mockClear();
    global.flatpickr.mockClear();
    global.fetch.mockImplementation((url) => {
      if (url === '/version.json') {
        return Promise.resolve({
          json: () => Promise.resolve({ version: '1.0.0' })
        });
      }
      // Default mock for other fetch calls if needed
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    mockLocationHref = ''; // Reset href

    // Reset mock elements
    Object.keys(mockElements).forEach(key => delete mockElements[key]);

    // Set up common mocks for elements
    getMockElement('appVersion').textContent = '';
    getMockElement('user-info').innerText = '';
    getMockElement('user-role').innerText = '';
    getMockElement('userAvatar').src = '';
    getMockElement('admin-menu').style.display = 'none';
    getMockElement('logout').addEventListener.mockClear();
    getMockElement('logout-menu').addEventListener.mockClear();
    getMockElement('userTableBody').innerHTML = '';
    getMockElement('pagination-container').innerHTML = '';
    getMockElement('filterDateTime').value = '';
    getMockElement('logout'); // Ensure mock is created
    getMockElement('logout-menu'); // Ensure mock is created

    document.getElementById('logout').addEventListener = jest.fn();
    document.getElementById('logout-menu').addEventListener = jest.fn();

    // Import the module under test
    require('../assets/js/history-attachments-refactored.js');
  });







    







          afterEach(() => {







    







            global.window = originalWindow;







    







            jest.restoreAllMocks();







    







            jest.clearAllTimers();







    







          });



  test('should redirect to login if no authToken', () => {
    localStorageMock.getItem.mockReturnValueOnce(null); // No token
    require('../assets/js/history-attachments-refactored.js'); // Re-import to trigger initial checks
    expect(mockLocation.href).toBe('../index.html');
  });

  test('should load user profile and set UI elements', async () => {
    localStorageMock.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJmaXJzdF9uYW1lIjoiSm9obiIsImxhc3RfaW5mbyI6IkRvZSIsInJvbGUiOiJBZG1pbiIsIm15UGljdHVyZSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vYXZhdGFyLnBuZyIsImV4cCI6OTk5OTk5OTk5OX0.signature');
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ first_name: 'John', last_info: 'Doe', role: 'Admin', myPicture: 'https://example.com/avatar.png' }), // Mock profile fetch
    });

    // Manually trigger DOMContentLoaded
    await Promise.resolve(); // Allow promises to resolve
    await jest.runAllTimers(); // Run any timers
    await jest.runOnlyPendingTimers(); // Run any pending timers
    await Promise.resolve(); // Clear microtasks

    expect(getMockElement('user-info').innerText).toBe('John Doe');
    expect(getMockElement('user-role').innerText).toBe('Admin');
    expect(getMockElement('userAvatar').src).toBe('https://example.com/avatar.png');
    expect(global.fetch).toHaveBeenCalledWith('https://be-claims-service.onrender.com/api/auth/profile', expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith('https://be-claims-service.onrender.com/api/auth/profile', expect.any(Object));
  });

  test('should fetch history data and render table', async () => {
    localStorageMock.setItem('authToken', 'mockToken');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { id: 'HIST001', appointment_date: '2023-01-01', location: 'Loc A', creator: 'User A', order_status: 'Completed' },
        { id: 'HIST002', appointment_date: '2023-01-02', location: 'Loc B', creator: 'User B', order_status: 'Pending' },
      ]),
    });

    // Manually trigger fetchData (it's called directly in the script)
    // We need to re-import to ensure fetchData is called after mocks are set up
    require('../assets/js/history-attachments-refactored.js');
    await Promise.resolve(); // Allow promises to resolve
    await jest.runAllTimers(); // Run any timers
    await jest.runOnlyPendingTimers(); // Run any pending promises
    await Promise.resolve(); // Clear microtasks

    expect(global.fetch).toHaveBeenCalledWith(
      'https://be-claims-service.onrender.com/api/history-agent/inquiry',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'mockToken' },
        body: JSON.stringify({}),
      })
    );
    expect(getMockElement('userTableBody').innerHTML).toContain('HIST001');
    expect(getMockElement('userTableBody').innerHTML).toContain('HIST002');
  });

  test('should initialize flatpickr', async () => {
    // Manually trigger DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(global.flatpickr).toHaveBeenCalledWith('#filterDateTime', expect.any(Object));
  });

  test('should handle logout', async () => {
    const logoutBtn = getMockElement('logout');
    expect(logoutBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    const clickHandler = logoutBtn.addEventListener.mock.calls[0][1];
    clickHandler({ preventDefault: jest.fn() }); // Simulate click

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    expect(mockLocation.href).toBe('../index.html');
  });
});