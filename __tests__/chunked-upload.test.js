// Polyfills are already in setup.js if using @jest-environment jsdom
const imageCompression = require('browser-image-compression');

// Mock dependencies
jest.mock('browser-image-compression', () => jest.fn(file => Promise.resolve(file)));

describe('Real-time Upload Logic', () => {
    beforeEach(() => {
        // Reset DOM to a clean state for each test
        document.body.innerHTML = `
             <div class="image-upload-slot">
                 <label class="image-gallery">
                    <img />
                    <i></i>
                    <input type="file" name="around_1" data-category="around">
                </label>
                <input type="text" class="image-title-input" value="Image 1">
            </div>
            <button id="uploadBtn">บันทึกข้อมูล</button>
            <div id="user-info"></div>
            <div id="user-role"></div>
            <img id="userAvatar" />
            <div id="progressFill" style="width:0%"></div>
            <div id="step1"></div><div id="step2"></div><div id="step3"></div><div id="step4"></div>
            <div id="around-container"></div>
            <button class="add-image-btn" data-category="around" data-default-title="Test"></button>
            <input type="hidden" id="job-code">
            <input type="hidden" id="insurance-company">
            <input type="hidden" id="car-plate">
            <input type="hidden" id="customer-address">
            <a id="open-map"></a>
            <input type="hidden" id="phone">
            <input type="hidden" id="province-category">
            <select id="car-brand"></select>
            <select id="car-model"></select>
            <input type="text" id="car-brand-custom" class="d-none">
            <input type="text" id="car-model-custom" class="d-none">
            <input type="hidden" id="vin">
            <input type="hidden" id="customer-name">
        `;

        // Mock window properties on the actual global window
        window.IS_JEST = true;
        window.alert = jest.fn();
        window.imageCompression = imageCompression;
        
        // Use history.pushState to set the orderId in URL without triggering navigation error
        window.history.pushState({}, 'Test Page', '?id=TEST-ORDER');

        // Polyfills for Global environment
        global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
        global.TextDecoder = global.TextDecoder || require('util').TextDecoder;
        
        window.fetch = jest.fn((url) => {
            if (url.includes('/api/order-detail/inquiry')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ order: { id: 'TEST-ORDER' }, order_details: {}, order_pic: [] })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'Success', uploaded: [{ url: 'mock-url' }] })
            });
        });

        window.carModels = {
            Toyota: ['Fortuner', 'Hilux Revo'],
            Honda: ['Civic', 'City']
        };

        window.FileReader = class {
            readAsDataURL(file) {
                setTimeout(() => {
                    this.result = 'data:image/jpeg;base64,mockdata';
                    if (this.onload) this.onload({ target: this });
                }, 10);
            }
        };

        window.Image = class {
            constructor() {
                this.width = 500;
                this.height = 500;
            }
            set src(val) {
                setTimeout(() => { if (this.onload) this.onload(); }, 20);
            }
            get src() { return this._src; }
        };

        // Mock canvas methods
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

        // Mock localStorage on the actual window
        const mockPayload = JSON.stringify({ id: 1, username: 'test', role: 'Officer', first_name: 'Test', last_name: 'User' });
        const mockToken = 'header.' + Buffer.from(mockPayload).toString('base64') + '.signature';
        window.localStorage.setItem('authToken', mockToken);

        window.URL.createObjectURL = jest.fn(() => 'mock-url');
        window.URL.revokeObjectURL = jest.fn();
        window.atob = (s) => Buffer.from(s, 'base64').toString('binary');

        // Load and execute the script in the same global context
        jest.isolateModules(() => {
            require('../assets/js/task-attachments-upload-refactored.js');
        });

        // Trigger DOMContentLoaded manually to run initTaskAttachmentsUpload
        const event = document.createEvent('Event');
        event.initEvent('DOMContentLoaded', true, true);
        window.dispatchEvent(event);
    });

    test('should upload files immediately upon selection', async () => {
        // Now window.handleImageSelection should be defined because the script ran in this context
        const input = document.querySelector('input[name="around_1"]');
        const file = new File(['dummy content'], 'image1.jpg', { type: 'image/jpeg' });

        Object.defineProperty(input, 'files', {
            value: [file],
            writable: false,
        });

        // Trigger change event which is picked up by the delegated listener in the script
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);

        // Wait for async operations (compression, watermark, upload)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const uploadCalls = window.fetch.mock.calls.filter(call => call[0].includes('upload/image/transactions'));
        expect(uploadCalls.length).toBe(1);
    });
});
