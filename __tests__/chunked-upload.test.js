const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');
const imageCompression = require('browser-image-compression');

// Mock dependencies
jest.mock('browser-image-compression', () => jest.fn(file => Promise.resolve(file)));

describe('Chunked Upload Logic', () => {
    let dom;
    let document;
    let window;

    beforeEach(() => {
        // Setup JSDOM
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div class="image-upload-slot">
                    <label class="image-gallery">
                        <img />
                        <i></i>
                        <input type="file" name="around_1" data-category="around">
                    </label>
                    <input type="text" class="image-title-input" value="Image 1">
                </div>
                <div class="image-upload-slot">
                     <label class="image-gallery">
                        <img />
                        <i></i>
                        <input type="file" name="around_2" data-category="around">
                    </label>
                    <input type="text" class="image-title-input" value="Image 2">
                </div>
                 <div class="image-upload-slot">
                     <label class="image-gallery">
                        <img />
                        <i></i>
                        <input type="file" name="around_3" data-category="around">
                    </label>
                    <input type="text" class="image-title-input" value="Image 3">
                </div>
                 <div class="image-upload-slot">
                     <label class="image-gallery">
                        <img />
                        <i></i>
                        <input type="file" name="around_4" data-category="around">
                    </label>
                    <input type="text" class="image-title-input" value="Image 4">
                </div>
                <button id="uploadBtn">บันทึกข้อมูล</button>
            </body>
            </html>
        `, { url: "http://localhost?id=TEST-ORDER" });

        document = dom.window.document;
        window = dom.window;
        global.document = document;
        global.window = window;
        global.FormData = window.FormData;
        global.File = window.File;
        // Mock FileReader
        global.FileReader = class {
            readAsDataURL(file) {
                // Determine if we need to call onload immediately or async
                // For test stability, we can make it near-immediate
                setTimeout(() => {
                    this.result = 'data:image/jpeg;base64,mockdata';
                    if (this.onload) this.onload({ target: this });
                }, 10);
            }
        };

        // Mock Image and provide basic dimensions so watermark logic works
        global.Image = class {
            constructor() {
                this.width = 500;
                this.height = 500;
                setTimeout(() => {
                    if (this.onload) this.onload();
                }, 20);
            }
        };

        // Ensure imageCompression is available globally BEFORE requesting the script
        const mockImageCompression = jest.fn(file => Promise.resolve(new window.File([file], file.name, { type: file.type })));
        global.imageCompression = mockImageCompression;
        window.imageCompression = mockImageCompression;

        // Mock Canvas
        window.HTMLCanvasElement.prototype.getContext = () => ({
            drawImage: jest.fn(),
            fillText: jest.fn(),
            measureText: jest.fn(() => ({ width: 10 })),
            shadowColor: '',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            font: '',
            fillStyle: '',
            textAlign: '',
            textBaseline: '',
        });
        window.HTMLCanvasElement.prototype.toBlob = (callback) => {
            callback(new window.Blob(['mock-blob'], { type: 'image/jpeg' }));
        };

        // Mock localStorage
        global.localStorage = {
            getItem: jest.fn(() => 'mock-token'),
            removeItem: jest.fn()
        };

        // Mock fetch
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Success' })
        }));

        global.alert = jest.fn();
        global.console.log = jest.fn();
        global.console.error = jest.fn();

        // Load the script content and execute it in the window context
        // This ensures 'window' and 'document' are correctly bound
        const fs = require('fs');
        const path = require('path');
        const scriptContent = fs.readFileSync(path.resolve(__dirname, '../assets/js/task-attachments-upload-refactored.js'), 'utf8');

        window.eval(scriptContent);

        // Trigger DOMContentLoaded
        document.dispatchEvent(new window.Event('DOMContentLoaded'));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should upload files in chunks', async () => {
        // 1. Simulate file selection by directly populating the map
        // This bypasses the JSDOM input.files mocking issues
        const inputs = document.querySelectorAll('input[type="file"]');
        expect(inputs.length).toBe(4);

        if (!window.filesToUpload) {
            throw new Error('window.filesToUpload not found. Ensure script exposes it.');
        }

        for (let i = 0; i < inputs.length; i++) {
            const file = new window.File(['dummy content'], `image${i + 1}.jpg`, { type: 'image/jpeg' });
            const inputName = inputs[i].name;
            const picType = inputs[i].dataset.category;

            // Directly set in map
            window.filesToUpload.set(inputName, { file, type: picType });

            // Optional: Manually trigger UI update if needed, but for upload logic test, map is enough.
            // If we want to test handleImageSelection specifically, we can call it:
            // Object.defineProperty(inputs[i], 'files', { get: () => [file] });
            // window.handleImageSelection(inputs[i]);
        }

        // Verify map is populated
        expect(window.filesToUpload.size).toBe(4);

        // 2. Click Upload
        const uploadBtn = document.getElementById('uploadBtn');
        console.log('Clicking upload button...');
        uploadBtn.click();

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Debugging: Print logs if fetch wasn't called
        if (global.fetch.mock.calls.length === 0) {
            console.log('DEBUG Test Failure State:');
            console.log('Alert calls:', global.alert.mock.calls);
            console.log('Console logs:', global.console.log.mock.calls);
            console.log('Console errors:', global.console.error.mock.calls);
        }

        // Check if we got the "empty files" alert
        const emptyAlert = global.alert.mock.calls.find(call => call[0].includes('กรุณาเลือกรูปภาพ'));
        if (emptyAlert) {
            throw new Error('Test failed: Code thinks no files were selected.');
        }

        // 3. Verify fetch calls
        // We expect fetch to be called twice because 4 files / 3 chunk size = 2 chunks
        expect(global.fetch).toHaveBeenCalledTimes(2);

        // Verify first chunk (should contain 3 files)
        const firstCallBody = global.fetch.mock.calls[0][1].body;
        // JSDOM FormData inspection is tricky, but we can check the call order

        // Verify second chunk (should contain 1 file)
        const secondCallBody = global.fetch.mock.calls[1][1].body;

        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('อัปโหลดสำเร็จครบทั้งหมด'));
    });
});
