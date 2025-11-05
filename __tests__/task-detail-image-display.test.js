import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock('../assets/js/task-detail-refactored.js', () => ({
    staticImageConfig: {
        around: [{ name: 'exterior_front', defaultTitle: 'Front View' }],
        accessories: [{ name: 'interior_wheels_1', defaultTitle: 'Wheel 1' }],
        inspection: [],
        fiber: [],
        documents: [],
        signature: [],
    },
    populateImageSections: jest.fn(),
    renderUploadedImages: jest.fn(),
    updateDamageDetailField: jest.fn(),
}));

import { staticImageConfig, populateImageSections, renderUploadedImages, updateDamageDetailField } from '../assets/js/task-detail-refactored.js';

jest.mock('../assets/js/navigation.js', () => ({
    getQueryParam: jest.fn(),
    navigateTo: jest.fn(),
}));

jest.mock('browser-image-compression', () => ({
    __esModule: true,
    default: jest.fn((file, options) => Promise.resolve(file)),
}));

describe('Image Display Functionality', () => {
    let aroundSection, accessoriesSection, inspectionSection, fiberSection, documentsSection, signatureSection;
    let sDetailTextArea;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="around-images-section"><div class="row"></div></div>
            <div id="accessories-images-section"><div class="row"></div></div>
            <div id="inspection-images-section"><div class="row"></div></div>
            <div id="fiber-documents-section"><div class="row"></div></div>
            <div id="other-documents-section"><div class="row"></div></div>
            <div id="signature-documents-section"><div class="row"></div></div>
            <textarea id="s_detail"></textarea>
        `;
        aroundSection = document.querySelector('#around-images-section .row');
        accessoriesSection = document.querySelector('#accessories-images-section .row');
        inspectionSection = document.querySelector('#inspection-images-section .row');
        fiberSection = document.querySelector('#fiber-documents-section .row');
        documentsSection = document.querySelector('#other-documents-section .row');
        signatureSection = document.querySelector('#signature-documents-section .row');
        sDetailTextArea = document.getElementById('s_detail');

        jest.clearAllMocks();
        global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    });

    describe('populateImageSections', () => {
        test('should render static placeholder slots and an Add Image button for each category', () => {
            populateImageSections();

            const aroundSlots = aroundSection.querySelectorAll('.dynamic-image-slot');
            expect(aroundSlots.length).toBe(staticImageConfig.around.length);
            expect(aroundSection.querySelector('.add-image-btn[data-category="around"]')).not.toBeNull();

            const firstAroundSlot = aroundSlots[0];
            const firstAroundInput = firstAroundSlot.querySelector('input[type="file"]');
            const firstAroundTitle = firstAroundSlot.querySelector('.title');
            expect(firstAroundInput.name).toBe(staticImageConfig.around[0].name);
            expect(firstAroundTitle.textContent.trim()).toBe(staticImageConfig.around[0].defaultTitle);
            expect(firstAroundSlot.querySelector('label.image-gallery').dataset.filled).toBe('false');
            expect(firstAroundSlot.querySelector('img').style.display).toBe('none');
            expect(firstAroundSlot.querySelector('.delete-btn').style.display).toBe('none');
            expect(firstAroundSlot.querySelector('.edit-title-btn').style.display).toBe('none');
        });
    });

    describe('renderUploadedImages', () => {
        beforeEach(() => {
            populateImageSections();
        });

        test('should fill existing placeholder slots with image data', () => {
            const mockOrderPics = [
                { pic_type: 'exterior_front', pic: 'http://example.com/front.jpg', pic_title: 'Front View' },
                { pic_type: 'interior_wheels_1', pic: 'http://example.com/wheel1.jpg', pic_title: 'Wheel 1' },
            ];

            renderUploadedImages(mockOrderPics);

            const frontSlot = aroundSection.querySelector(`input[name="exterior_front"]`).closest('.dynamic-image-slot');
            const frontImg = frontSlot.querySelector('img');
            const frontTitle = frontSlot.querySelector('.title');
            expect(frontImg.src).toContain('http://example.com/front.jpg');
            expect(frontImg.alt).toBe('Front View');
            expect(frontTitle.textContent.trim()).toBe('Front View');
            expect(frontSlot.querySelector('label.image-gallery').dataset.filled).toBe('true');

            const wheelSlot = accessoriesSection.querySelector(`input[name="interior_wheels_1"]`).closest('.dynamic-image-slot');
            const wheelImg = wheelSlot.querySelector('img');
            const wheelTitle = wheelSlot.querySelector('.title');
            expect(wheelImg.src).toContain('http://example.com/wheel1.jpg');
            expect(wheelImg.alt).toBe('Wheel 1');
            expect(wheelTitle.textContent.trim()).toBe('Wheel 1');
            expect(wheelSlot.querySelector('label.image-gallery').dataset.filled).toBe('true');
        });

        test('should create new dynamic slots if no matching placeholder is found', () => {
            const mockOrderPics = [
                { pic_type: 'non_existent_type', pic: 'http://example.com/new.jpg_1', pic_title: 'New Image 1' },
            ];

            const initialDocumentsSlotsCount = documentsSection.querySelectorAll('.dynamic-image-slot').length;

            renderUploadedImages(mockOrderPics);

            const newDocumentsSlotsCount = documentsSection.querySelectorAll('.dynamic-image-slot').length;
            expect(newDocumentsSlotsCount).toBe(initialDocumentsSlotsCount + 1);

            const newSlot = documentsSection.querySelector('[data-pic-type="non_existent_type"]');
            const newImg = newSlot.querySelector('img');
            const newTitle = newSlot.querySelector('.title');

            expect(newImg.src).toContain('http://example.com/new.jpg_1');
            expect(newImg.alt).toBe('New Image 1');
            expect(newTitle.textContent.trim()).toBe('New Image 1');
            expect(newSlot.querySelector('label.image-gallery').dataset.filled).toBe('true');
        });

        test('should call updateDamageDetailField when orderPics is empty', () => {
            const updateDamageDetailFieldSpy = jest.spyOn(window, 'updateDamageDetailField').mockImplementation(() => {});
            renderUploadedImages([]);
            expect(updateDamageDetailFieldSpy).toHaveBeenCalledTimes(1);
            updateDamageDetailFieldSpy.mockRestore();
        });

        test('should call updateDamageDetailField after rendering images', () => {
            const updateDamageDetailFieldSpy = jest.spyOn(window, 'updateDamageDetailField').mockImplementation(() => {});
            const mockOrderPics = [
                { pic_type: 'exterior_front', pic: 'http://example.com/front.jpg', pic_title: 'Front View' },
            ];
            renderUploadedImages(mockOrderPics);
            expect(updateDamageDetailFieldSpy).toHaveBeenCalledTimes(1);
            updateDamageDetailFieldSpy.mockRestore();
        });
    });
});
