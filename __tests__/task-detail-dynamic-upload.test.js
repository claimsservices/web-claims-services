import { JSDOM } from 'jsdom';
import { TextEncoder } from 'util'; // Import TextEncoder
import imageCompression from 'browser-image-compression';

// Mock API_BASE_URL
jest.mock('../assets/js/api-config.js', () => 'http://localhost:8181');

// Mock navigation functions
jest.mock('../assets/js/navigation.js', () => ({
  getQueryParam: jest.fn(() => 'test-order-id'),
  navigateTo: jest.fn(),
}));

// Mock imageCompression library
jest.mock('browser-image-compression', () => jest.fn(file => Promise.resolve(file)));

describe('Task Detail - Dynamic Image Upload', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    dom = new JSDOM(`
      <div id="taskForm">
        <input id="taskId" value="ST-TEST-001" />
        <div id="around-images-section">
          <div class="row">
            <div class="col-4 mb-3 text-center">
                <button type="button" class="btn btn-outline-primary add-image-btn" data-category="around">
                    <i class="bi bi-plus-circle"></i> เพิ่มรูปภาพ
                </button>
            </div>
          </div>
        </div>
        <div id="accessories-images-section">
          <div class="row">
            <div class="col-4 mb-3 text-center">
                <button type="button" class="btn btn-outline-primary add-image-btn" data-category="accessories">
                    <i class="bi bi-plus-circle"></i> เพิ่มรูปภาพ
                </button>
            </div>
          </div>
        </div>
      </div>
    `, { url: "http://localhost" });

        document = dom.window.document;

        window = dom.window;

        global.document = document;

        global.window = window;

        dom.window.TextEncoder = TextEncoder; // Assign TextEncoder to JSDOM window

        global.localStorage = {
      getItem: jest.fn(key => {
        if (key === 'authToken') {
          const mockPayload = { role: 'Admin', first_name: 'Test', last_name: 'User' };
          return `header.${btoa(JSON.stringify(mockPayload))}.signature`;
        }
        return null;
      }),
      removeItem: jest.fn(),
    };
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ uploaded: [{ url: 'http://fake.url/uploaded-image.jpg' }] }),
    }));
    global.alert = jest.fn();
    global.prompt = jest.fn(); // Mock prompt for edit title functionality

    // Mock imageCompression to return the file directly
    imageCompression.mockImplementation(file => Promise.resolve(file));

    // Load the script after DOM is set up
    jest.isolateModules(() => {
      require('../assets/js/task-detail-refactored.js');
    });

    // Manually dispatch DOMContentLoaded event
    document.dispatchEvent(new window.Event('DOMContentLoaded'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should add a new image slot when "Add Image" button is clicked', async () => {
    const addImageBtn = document.querySelector('.add-image-btn[data-category="around"]');
    expect(addImageBtn).not.toBeNull();

    // Simulate click
    addImageBtn.click();

    // Wait for DOM updates (if any async operations were involved)
    await new Promise(process.nextTick);

    const newSlot = document.querySelector('.dynamic-image-slot');
    expect(newSlot).not.toBeNull();
    expect(newSlot.querySelector('input[type="file"]')).not.toBeNull();
    expect(newSlot.querySelector('.title').textContent.trim()).toBe('กรุณาใส่ชื่อ');
  });

  test('should upload an image when a file is selected in a dynamic slot', async () => {
    const addImageBtn = document.querySelector('.add-image-btn[data-category="around"]');
    addImageBtn.click();
    await new Promise(process.nextTick);

    const fileInput = document.querySelector('.dynamic-image-slot input[type="file"]');
    expect(fileInput).not.toBeNull();

    const mockFile = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' });
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: true,
    });

    // Simulate change event
    fileInput.dispatchEvent(new window.Event('change', { bubbles: true }));

    await new Promise(process.nextTick); // Wait for async upload

    expect(imageCompression).toHaveBeenCalledWith(mockFile, expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8181/api/upload/image/transactions',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );

    const imgElement = fileInput.closest('label').querySelector('img');
    expect(imgElement.src).toContain('http://fake.url/uploaded-image.jpg');
    expect(imgElement.closest('label').dataset.filled).toBe('true');
  });

  test('should remove an image slot when its delete button is clicked', async () => {
    const addImageBtn = document.querySelector('.add-image-btn[data-category="around"]');
    addImageBtn.click();
    await new Promise(process.nextTick);

    const newSlot = document.querySelector('.dynamic-image-slot');
    expect(newSlot).not.toBeNull();

    const deleteBtn = newSlot.querySelector('.delete-btn');
    expect(deleteBtn).not.toBeNull();

    deleteBtn.click();
    await new Promise(process.nextTick);

    expect(document.querySelector('.dynamic-image-slot')).toBeNull();
  });

  test('should update image title when edit button is clicked and prompt is confirmed', async () => {
    // Add an image slot and simulate upload to make it editable
    const addImageBtn = document.querySelector('.add-image-btn[data-category="around"]');
    addImageBtn.click();
    await new Promise(process.nextTick);

    const fileInput = document.querySelector('.dynamic-image-slot input[type="file"]');
    const mockFile = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' });
    Object.defineProperty(fileInput, 'files', { value: [mockFile], writable: true });
    fileInput.dispatchEvent(new window.Event('change', { bubbles: true }));
    await new Promise(process.nextTick);

    const editButton = document.querySelector('.dynamic-image-slot .edit-title-btn');
    expect(editButton).not.toBeNull();

    const titleDiv = document.querySelector('.dynamic-image-slot .title');
    titleDiv.textContent = 'Original Title'; // Set an original title

    global.prompt.mockReturnValueOnce('New Dynamic Title');

    editButton.click();
    await new Promise(process.nextTick);

    expect(global.prompt).toHaveBeenCalledWith('กรุณาใส่ชื่อรูปภาพใหม่:', 'Original Title');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8181/api/order-pic/update-title',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          orderId: 'ST-TEST-001',
          picUrl: 'http://fake.url/uploaded-image.jpg',
          newTitle: 'New Dynamic Title'
        }),
      })
    );
    expect(titleDiv.textContent).toBe('New Dynamic Title');
  });
});
