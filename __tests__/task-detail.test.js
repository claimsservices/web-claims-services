jest.mock('../assets/js/api-config.js', () => 'http://localhost:8181');
jest.mock('../assets/js/navigation.js', () => ({
  getQueryParam: jest.fn(),
  navigateTo: jest.fn(),
}));

import { getQueryParam, navigateTo } from '../assets/js/navigation.js';

describe('Task Detail Page', () => {
  const originalAlert = window.alert;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock alert
    window.alert = jest.fn();

    // Mock localStorage.getItem to return a valid token
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQWRtaW4gT2ZmaWNlciIsImlhdCI6MTUxNjIzOTAyMn0.some-signature');

    // Set up DOM
    document.body.innerHTML = `<div id="taskId"></div>`; // Minimal DOM

    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Restore original alert
    window.alert = originalAlert;
  });

  test('should call loadOrderData with ID from URL', async () => {
    // Arrange
    getQueryParam.mockReturnValue('TEST-ORDER-ID');
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ order: {}, order_details: {}, order_assign: [], order_hist: [], order_pic: [] }), // Mock successful response
    });

    // Mock initCarModelDropdown
    global.initCarModelDropdown = jest.fn().mockResolvedValue();

    // Act: Load the script which should trigger the logic inside DOMContentLoaded/load
    jest.isolateModules(() => {
      require('../assets/js/task-detail-refactored.js');
    });
    document.dispatchEvent(new Event('DOMContentLoaded'));
    window.dispatchEvent(new Event('load'));
    await new Promise(process.nextTick);

    // Assert
    expect(getQueryParam).toHaveBeenCalledWith('id');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/order-detail/inquiry'), expect.any(Object));
  });

  test('should display an alert on failed order data load', async () => {
    // Arrange
    getQueryParam.mockReturnValue('FAIL-ID');
    fetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Order not found' }),
    });

    // Act
    jest.isolateModules(() => {
      require('../assets/js/task-detail-refactored.js');
    });
    document.dispatchEvent(new Event('DOMContentLoaded'));
    window.dispatchEvent(new Event('load'));
    await new Promise(resolve => setTimeout(resolve, 100));

    // Assert
    expect(window.alert).toHaveBeenCalledWith('❌ ไม่พบข้อมูล: Order not found');
  });
});

