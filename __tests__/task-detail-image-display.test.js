
import { JSDOM } from 'jsdom';


// Mock the navigation.js functions if they are imported
jest.mock('../assets/js/navigation.js', () => ({
    getQueryParam: jest.fn(),
    navigateTo: jest.fn(),
}));

// Mock imageCompression if it's used in the tested functions
jest.mock('browser-image-compression', () => ({
    __esModule: true,
    default: jest.fn((file, options) => Promise.resolve(file)), // Mock to return the file itself
}));

// Load the functions to be tested
// We need to load the actual file to get the functions and the staticImageConfig
const fs = require('fs');
const path = require('path');
const scriptPath = path.resolve(__dirname, '../assets/js/task-detail-refactored.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Create a JSDOM environment
const dom = new JSDOM(`<!DOCTYPE html><body>
    <div id="around-images-section"><div class="row"></div></div>
    <div id="accessories-images-section"><div class="row"></div></div>
    <div id="inspection-images-section"><div class="row"></div></div>
    <div id="fiber-documents-section"><div class="row"></div></div>
    <div id="other-documents-section"><div class="row"></div></div>
    <div id="signature-documents-section"><div class="row"></div></div>
    <textarea id="s_detail"></textarea>
</body>`);
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
    getItem: jest.fn(() => 'mockAuthToken'),
    removeItem: jest.fn(),
};

global.alert = jest.fn(); // Mock alert
global.console.log = jest.fn(); // Mock console.log
global.console.warn = jest.fn(); // Mock console.warn
global.console.error = jest.fn(); // Mock console.error

// Mock updateDamageDetailField before importing the module to ensure the mocked version is used
global.window.updateDamageDetailField = jest.fn();

// Import the functions after the mock is set up






describe('Image Display Functionality', () => {
    let staticImageConfig, populateImageSections, renderUploadedImages;
    let aroundSection, accessoriesSection, inspectionSection, fiberSection, documentsSection, signatureSection;
    let sDetailTextArea;

    afterEach(() => {
        jest.runOnlyPendingTimers(); // Run any pending timers after each test
        jest.useRealTimers(); // Restore real timers
    });

    describe('populateImageSections', () => {
        test('should render static placeholder slots and an Add Image button for each category', () => {
            populateImageSections();

            // Test 'around' category
            const aroundSlots = aroundSection.querySelectorAll('.dynamic-image-slot');
            expect(aroundSlots.length).toBe(staticImageConfig.around.length);
            expect(aroundSection.querySelector('.add-image-btn[data-category="around"]')).not.toBeNull();

            // Verify first 'around' slot
            const firstAroundSlot = aroundSlots[0];
            const firstAroundInput = firstAroundSlot.querySelector('input[type="file"]');
            const firstAroundTitle = firstAroundSlot.querySelector('.title');
            expect(firstAroundInput.name).toBe(staticImageConfig.around[0].name);
            expect(firstAroundTitle.textContent.trim()).toBe(staticImageConfig.around[0].defaultTitle);
            expect(firstAroundSlot.querySelector('label.image-gallery').dataset.filled).toBe('false');
            expect(firstAroundSlot.querySelector('img').style.display).toBe('none');
            expect(firstAroundSlot.querySelector('.delete-btn').style.display).toBe('none');
            expect(firstAroundSlot.querySelector('.edit-title-btn').style.display).toBe('none');

            // Test 'accessories' category
            const accessoriesSlots = accessoriesSection.querySelectorAll('.dynamic-image-slot');
            expect(accessoriesSlots.length).toBe(staticImageConfig.accessories.length);
            expect(accessoriesSection.querySelector('.add-image-btn[data-category="accessories"]')).not.toBeNull();

            // Test 'inspection' category
            const inspectionSlots = inspectionSection.querySelectorAll('.dynamic-image-slot');
            expect(inspectionSlots.length).toBe(staticImageConfig.inspection.length);
            expect(inspectionSection.querySelector('.add-image-btn[data-category="inspection"]')).not.toBeNull();

            // Test 'fiber' category
            const fiberSlots = fiberSection.querySelectorAll('.dynamic-image-slot');
            expect(fiberSlots.length).toBe(staticImageConfig.fiber.length);
            expect(fiberSection.querySelector('.add-image-btn[data-category="fiber"]')).not.toBeNull();

            // Test 'documents' category
            const documentsSlots = documentsSection.querySelectorAll('.dynamic-image-slot');
            expect(documentsSlots.length).toBe(staticImageConfig.documents.length);
            expect(documentsSection.querySelector('.add-image-btn[data-category="documents"]')).not.toBeNull();

            // Test 'signature' category
            const signatureSlots = signatureSection.querySelectorAll('.dynamic-image-slot');
            expect(signatureSlots.length).toBe(staticImageConfig.signature.length);
            expect(signatureSection.querySelector('.add-image-btn[data-category="signature"]')).not.toBeNull();
        });
    });

    describe('renderUploadedImages', () => {
        beforeEach(() => {
            // Ensure placeholders are rendered before testing renderUploadedImages
            populateImageSections();
        });

        test('should fill existing placeholder slots with image data', () => {
            const mockOrderPics = [
                { pic_type: 'exterior_front', pic: 'http://example.com/front.jpg', pic_title: 'Front View' },
                { pic_type: 'interior_wheels_1', pic: 'http://example.com/wheel1.jpg', pic_title: 'Wheel 1' },
            ];

            renderUploadedImages(mockOrderPics);

            // Verify 'exterior_front' slot
            const frontSlot = aroundSection.querySelector(`input[name="exterior_front"]`).closest('.dynamic-image-slot');
            const frontImg = frontSlot.querySelector('img');
            const frontTitle = frontSlot.querySelector('.title');
            expect(frontImg.getAttribute('src')).toBe('http://example.com/front.jpg');
            expect(frontImg.alt).toBe('Front View');
            expect(frontTitle.textContent.trim()).toBe('Front View');
            expect(frontSlot.querySelector('label.image-gallery').dataset.filled).toBe('true');
            expect(frontImg.style.display).toBe('block');
            expect(frontSlot.querySelector('.delete-btn').style.display).toBe('block');
            expect(frontSlot.querySelector('.edit-title-btn').style.display).toBe('flex');

            // Verify 'interior_wheels_1' slot
            const wheelSlot = accessoriesSection.querySelector(`input[name="interior_wheels_1"]`).closest('.dynamic-image-slot');
            const wheelImg = wheelSlot.querySelector('img');
            const wheelTitle = wheelSlot.querySelector('.title');
            expect(wheelImg.getAttribute('src')).toBe('http://example.com/wheel1.jpg');
            expect(wheelImg.alt).toBe('Wheel 1');
            expect(wheelTitle.textContent.trim()).toBe('Wheel 1');
            expect(wheelSlot.querySelector('label.image-gallery').dataset.filled).toBe('true');
            expect(wheelImg.style.display).toBe('block');
            expect(wheelSlot.querySelector('.delete-btn').style.display).toBe('block');
            expect(wheelSlot.querySelector('.edit-title-btn').style.display).toBe('flex');
        });

        test('should create new dynamic slots if no matching placeholder is found', () => {
            const mockOrderPics = [
                { pic_type: 'non_existent_type', pic: 'http://example.com/new.jpg', pic_title: 'New Image' },
            ];

            const initialDocumentsSlotsCount = documentsSection.querySelectorAll('.dynamic-image-slot').length;

            renderUploadedImages(mockOrderPics);

            // Check if a new slot was added to the documentsSection
            const newDocumentsSlotsCount = documentsSection.querySelectorAll('.dynamic-image-slot').length;
            expect(newDocumentsSlotsCount).toBe(initialDocumentsSlotsCount + 1);

            const newSlot = documentsSection.querySelector(`input[name="dynamic_image"][data-category="non_existent_type"]`).closest('.dynamic-image-slot');
            const newImg = newSlot.querySelector('img');
            const newTitle = newSlot.querySelector('.title');

            expect(newImg.getAttribute('src')).toBe('http://example.com/new.jpg');
            expect(newImg.alt).toBe('New Image');
            expect(newTitle.textContent.trim()).toBe('New Image');
            expect(newSlot.querySelector('label.image-gallery').dataset.filled).toBe('true');
            expect(newImg.style.display).toBe('block');
            expect(newSlot.querySelector('.delete-btn').style.display).toBe('block');
            expect(newSlot.querySelector('.edit-title-btn').style.display).toBe('flex');

            // Ensure the new slot is inserted at the end of the documentsSection
            expect(newSlot.nextElementSibling).toBeNull();
        });

        test('should create new dynamic slots if all matching placeholders are filled', () => {
            // Fill all 'around' placeholders
            const allAroundPics = staticImageConfig.around.map(config => ({
                pic_type: config.name,
                pic: `http://example.com/${config.name}.jpg`,
                pic_title: `Filled ${config.defaultTitle}`
            }));
            renderUploadedImages(allAroundPics);

            // Add one more 'around' image
            const extraAroundPic = { pic_type: 'around', pic: 'http://example.com/extra.jpg', pic_title: 'Extra Around' };
            renderUploadedImages([extraAroundPic]);

            const allAroundSlots = aroundSection.querySelectorAll('.dynamic-image-slot');
            // Expect original placeholders + 1 new dynamic slot
            expect(allAroundSlots.length).toBe(staticImageConfig.around.length + 1);

            const newSlot = allAroundSlots[allAroundSlots.length - 1]; // The last one should be the new dynamic slot
            const newImg = newSlot.querySelector('img');
            const newTitle = newSlot.querySelector('.title');

            expect(newImg.getAttribute('src')).toBe('http://example.com/extra.jpg');
            expect(newTitle.textContent.trim()).toBe('Extra Around');
            expect(newSlot.querySelector('label.image-gallery').dataset.filled).toBe('true');
        });

            expect(window.updateDamageDetailField).toHaveBeenCalledTimes(1);
        });

        test('should call updateDamageDetailField after rendering images', () => {
            const mockOrderPics = [
                { pic_type: 'exterior_front', pic: 'http://example.com/front.jpg', pic_title: 'Front View' },
            ];
            renderUploadedImages(mockOrderPics);
            jest.runAllTimers(); // Advance timers to run setTimeout
            expect(window.updateDamageDetailField).toHaveBeenCalledTimes(1);
        });
    });
});
