const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const imageCompression = require('browser-image-compression');

// Mock API_BASE_URL
jest.mock('../assets/js/api-config.js', () => 'http://localhost:8181', { virtual: true });

// Mock navigation functions
jest.mock('../assets/js/navigation.js', () => ({
    getQueryParam: jest.fn(() => 'test-order-id'),
    navigateTo: jest.fn(),
}), { virtual: true });

// Mock imageCompression library
jest.mock('browser-image-compression', () => jest.fn(file => Promise.resolve(file)));

describe('Task Detail - Create Template', () => {

    // We don't need to create JSDOM manually as Jest is configured with testEnvironment: 'jsdom'

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = `
            <section class="upload-section mb-4" id="around-images-section">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>ภาพถ่ายรอบคัน</h5>
                    <button type="button" class="btn btn-sm btn-outline-primary create-template-btn" data-category="around">สร้างรูปแบบ</button>
                </div>
                <div class="row"></div>
            </section>

            <section class="upload-section mb-4" id="accessories-images-section">
                <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5>ภาพถ่ายภายในรถ</h5>
                        <button type="button" class="btn btn-sm btn-outline-primary create-template-btn" data-category="accessories">สร้างรูปแบบ</button>
                </div>
                <div class="row"></div>
                </section>
        `;

        global.localStorage = {
            getItem: jest.fn(),
            removeItem: jest.fn()
        };
        global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));

        // Mock staticImageConfig globally for the test context
        global.staticImageConfig = {
            around: [
                { name: "exterior_front", defaultTitle: "ภาพถ่ายรอบคัน - ด้านหน้ารถ" },
                { name: "exterior_left_front", defaultTitle: "ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหน้า" },
                { name: "exterior_left_center", defaultTitle: "ภาพถ่ายรอบคัน - ด้านซ้ายตรง" },
                { name: "exterior_left_rear", defaultTitle: "ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหลัง" },
                { name: "exterior_rear", defaultTitle: "ภาพถ่ายรอบคัน - ด้านท้ายรถ" },
                { name: "exterior_right_rear", defaultTitle: "ภาพถ่ายรอบคัน - ด้านขวาส่วนหลัง" },
                { name: "exterior_right_center", defaultTitle: "ภาพถ่ายรอบคัน - ด้านขวาตรง" },
                { name: "exterior_right_front", defaultTitle: "ภาพถ่ายรอบคัน - ด้านขวาส่วนหน้า" },
                { name: "exterior_roof", defaultTitle: "ภาพถ่ายรอบคัน - หลังคา" }
            ],
            accessories: Array(20).fill({ name: "test", defaultTitle: "test" }) // Mock 20 items
        };

        // Isolate modules to ensure a fresh load of the script for each test
        jest.isolateModules(() => {
            require('../assets/js/task-detail-refactored.js');
        });

        // Trigger DOMContentLoaded manually if the script relies on it logic
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    test('should generate image slots when "Create Template" button is clicked for "around" category', () => {
        const createBtn = document.querySelector('.create-template-btn[data-category="around"]');
        expect(createBtn).not.toBeNull();

        // Simulate click
        createBtn.click();

        // Check if slots are created
        const aroundSection = document.getElementById('around-images-section');
        const slots = aroundSection.querySelectorAll('.dynamic-image-slot');

        // "around" category has 9 items in staticImageConfig
        expect(slots.length).toBe(9);

        // Check labels/titles of the first slot
        const firstSlotTitle = slots[0].querySelector('.image-title-input').value;
        // The default title in config is "ภาพถ่ายรอบคัน - ด้านหน้ารถ"
        expect(firstSlotTitle).toBe("ภาพถ่ายรอบคัน - ด้านหน้ารถ");
    });

    test('should NOT disable the button and allow multiple sets to be created', () => {
        const createBtn = document.querySelector('.create-template-btn[data-category="around"]');

        // First Click
        createBtn.click();
        let slots = document.getElementById('around-images-section').querySelectorAll('.dynamic-image-slot');
        expect(slots.length).toBe(9);
        expect(createBtn.disabled).toBe(false);

        // Second Click
        createBtn.click();
        slots = document.getElementById('around-images-section').querySelectorAll('.dynamic-image-slot');
        expect(slots.length).toBe(18); // 9 + 9
    });

    test('should generate slots for "accessories" category', () => {
        const createBtn = document.querySelector('.create-template-btn[data-category="accessories"]');
        createBtn.click();

        const section = document.getElementById('accessories-images-section');
        const slots = section.querySelectorAll('.dynamic-image-slot');

        // "accessories" has 20 items in staticImageConfig
        expect(slots.length).toBe(20);
    });
});
