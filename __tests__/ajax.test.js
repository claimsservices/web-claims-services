import { Helpers } from '../js/helpers.js';


// Mocking XMLHttpRequest
const mockXHR = {
  open: jest.fn(),
  send: jest.fn(),
  status: 200,
  statusText: 'OK',
  response: '{"data": "test data"}',
  onload: null,
  onerror: null
};

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
  // Mock the global XMLHttpRequest
  global.XMLHttpRequest = jest.fn(() => mockXHR);
});

describe('Helpers.ajaxCall', () => {
  it('should resolve with response text on successful request', async () => {
    const promise = Helpers.ajaxCall('test-url');
    
    // Manually trigger onload
    mockXHR.onload();

    await expect(promise).resolves.toBe('{"data": "test data"}');

    expect(mockXHR.open).toHaveBeenCalledWith('GET', 'test-url');
    expect(mockXHR.send).toHaveBeenCalled();
  });

  it('should reject with an error on a failed request', async () => {
    mockXHR.status = 500;
    mockXHR.statusText = 'Internal Server Error';

    const promise = Helpers.ajaxCall('test-url');

    // Manually trigger onload for a failed request
    mockXHR.onload();

    await expect(promise).rejects.toThrow('Internal Server Error');
  });

  it('should reject with an error on a network error', async () => {
    const promise = Helpers.ajaxCall('test-url');

    // Manually trigger onerror
    mockXHR.onerror(new Error('Network Error'));

    await expect(promise).rejects.toThrow('Network Error: Error: Network Error');
  });
});
