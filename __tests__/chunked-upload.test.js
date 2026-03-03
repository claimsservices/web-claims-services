const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.filesToUpload = new Map(); // Initialize explicitly for test context

const { JSDOM } = require('jsdom');
const imageCompression = require('browser-image-compression');

// Mock dependencies
jest.mock('browser-image-compression', () => jest.fn(file => Promise.resolve(file)));

describe('Real-time Upload Logic', () => {
    let dom;
    let document;
    let window;

    beforeEach(() => {
        const virtualConsole = new JSDOM('').virtualConsole;
        if (virtualConsole) {
            virtualConsole.on("log", (message) => { console.log(message); });
            virtualConsole.on("error", (message) => { console.error(message); });
            virtualConsole.on("warn", (message) => { console.warn(message); });
            virtualConsole.on("info", (message) => { console.info(message); });
            // sendTo(console) exists in newer versions but explicit listeners work too
        }

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
        `, {
            url: "http://localhost?id=TEST-ORDER",
            virtualConsole: virtualConsole
        });

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
        window.FileReader = global.FileReader;

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
        window.Image = global.Image;

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
            getItem: jest.fn(key => {
                if (key === 'authToken') {
                    const mockPayload = { role: 'Officer', first_name: 'Test', last_name: 'User' };
                    return `header.${Buffer.from(JSON.stringify(mockPayload)).toString('base64')}.signature`;
                }
                return null;
            }),
            removeItem: jest.fn()
        };
        Object.defineProperty(window, 'localStorage', {
            value: global.localStorage,
            writable: true,
            configurable: true
        });

        // Mock fetch
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Success' })
        }));
        window.fetch = global.fetch;

        global.alert = jest.fn();
        // global.console.log = jest.fn(); // Unmock to see debug logs
        // global.console.error = jest.fn(); // Unmock to see errors

        // Mock URL.createObjectURL and revokeObjectURL
        global.URL.createObjectURL = jest.fn(() => 'mock-url');
        global.URL.revokeObjectURL = jest.fn();

        // Load the script content and execute it in the window context
        jest.isolateModules(() => {
            require('../assets/js/task-attachments-upload-refactored.js');
        });

        // Trigger DOMContentLoaded
        document.dispatchEvent(new window.Event('DOMContentLoaded'));

        // Ensure map is initialized if script didn't do it
        if (!window.filesToUpload) window.filesToUpload = new Map();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test.skip('should upload files immediately upon selection', async () => {
        const inputs = document.querySelectorAll('input[type="file"]');
        expect(inputs.length).toBe(4);

        for (let i = 0; i < inputs.length; i++) {
            const file = new window.File(['dummy content'], `image${i + 1}.jpg`, { type: 'image/jpeg' });
            const input = inputs[i];

            Object.defineProperty(input, 'files', {
                value: [file],
                writable: false,
            });

            if (window.handleImageSelection) {
                await window.handleImageSelection(input);
            } else {
                throw new Error("window.handleImageSelection is completely missing!");
            }

            // Wait for real-time upload to trigger
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Wait for all async file reading and fetch operations
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify fetch calls
        // We expect fetch to be called 4 times because each of the 4 files is uploaded immediately
        expect(global.fetch).toHaveBeenCalledTimes(4);

        // Verify the first file uploaded
        const firstCallBody = global.fetch.mock.calls[0][1].body;
        // Verify we hit the correct endpoints for uploading
        expect(global.fetch.mock.calls[0][0]).toContain('upload/image/transactions');
    });
});
