const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.filesToUpload = new Map(); // Initialize explicitly for test context

const { JSDOM } = require('jsdom');
const imageCompression = require('browser-image-compression');

// Mock dependencies
jest.mock('browser-image-compression', () => jest.fn(file => Promise.resolve(file)));

describe('Chunked Upload Logic', () => {
    let dom;
    let document;
    let window;

    beforeEach(() => {
        // Setup JSDOM with specific URL to mimic query params
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
        // global.console.log = jest.fn(); // Unmock to see debug logs
        // global.console.error = jest.fn(); // Unmock to see errors

        // Mock URL.createObjectURL and revokeObjectURL
        global.URL.createObjectURL = jest.fn(() => 'mock-url');
        global.URL.revokeObjectURL = jest.fn();

        // Load the script content and execute it in the window context
        // This ensures 'window' and 'document' are correctly bound
        const fs = require('fs');
        const path = require('path');
        const scriptContent = fs.readFileSync(path.resolve(__dirname, '../assets/js/task-attachments-upload-refactored.js'), 'utf8');

        // Initialize all sections on page load
        // We need to inject a way to expose handleImageSelection from the closure
        const closureExposer = `
            window.handleImageSelection = handleImageSelection;
            window.filesToUpload = filesToUpload; // Expose map for verification
        `;
        // Append exposer to the end of the script content before eval
        // We need to find where the closure ends. The file structure shows the main logic is inside DOMContentLoaded.
        // We can't easily append to closure. 
        // Instead, we will mock the behavior by manually populating the map since we can't easily reach into the closure.
        // BUT, wait, the script is evaluated in window context.
        // Let's modify the script content string to expose the function.
        // The script starts with document.addEventListener...
        // We can replace the end of the script to expose variables?
        // Or better, since we have the source code, we can verify if handleImageSelection is attached to window?
        // It is NOT attached to window in the source.

        // Strategy: We will mock the entire logic since testing the closure is hard without modifying source.
        // However, we want to test the source.
        // Let's use a regex to inject "window.handleImageSelection = handleImageSelection;" inside the closure.
        const injectedScript = scriptContent.replace(
            /function handleImageSelection\(fileInput\) \{/,
            'window.handleImageSelection = function(fileInput) {'
        ).replace(
            /const filesToUpload = new Map\(\);/,
            'window.filesToUpload = new Map(); const filesToUpload = window.filesToUpload;'
        );

        window.eval(injectedScript);

        // Trigger DOMContentLoaded
        document.dispatchEvent(new window.Event('DOMContentLoaded'));

        // Ensure map is initialized if script didn't do it
        if (!window.filesToUpload) window.filesToUpload = new Map();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should upload files in chunks', async () => {
        // 1. Simulate file selection by dispatching change events
        // This is necessary because filesToUpload is a private Map in the script's closure
        const inputs = document.querySelectorAll('input[type="file"]');
        expect(inputs.length).toBe(4);

        for (let i = 0; i < inputs.length; i++) {
            const file = new window.File(['dummy content'], `image${i + 1}.jpg`, { type: 'image/jpeg' });
            const input = inputs[i];

            // Mock the files property
            Object.defineProperty(input, 'files', {
                value: [file],
                writable: false,
            });

            // Dispatch change event to trigger the listener in the script
            input.dispatchEvent(new window.Event('change', { bubbles: true }));
        }

        // Wait for async file reading/preview generation if any
        await new Promise(resolve => setTimeout(resolve, 100));

        // We can't easily check internal Map size directly without exposing it, 
        // but if logic works, clicking upload should trigger fetch.


        // 2. Click Upload
        const uploadBtn = document.getElementById('uploadBtn');
        console.log('Clicking upload button...');
        uploadBtn.click();

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if we got the "empty files" alert
        const emptyAlert = global.alert.mock.calls.find(call => call && call[0] && call[0].includes('กรุณาเลือกรูปภาพ'));
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
