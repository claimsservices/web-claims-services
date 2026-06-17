/**
 * Unit Tests: Categorized ZIP Download Logic
 * 
 * ครอบคลุมกรณี:
 * 1. folder names ใช้ ASCII (ไม่ใช่ Unicode/Thai) เพื่อให้ unzip ได้บน Windows
 * 2. การ detect category จาก `.dynamic-image-slot[data-category]`
 * 3. การ detect category จาก h5 heading ใน Tab 7 (download-images-container)
 * 4. fallback เป็น '07_other' เมื่อหา category ไม่เจอ
 * 5. การ deduplicate รูปภาพโดย URL
 */

// ============================================================
// Logic Unit Under Test (extracted from task-detail-refactored.js)
// ============================================================

/**
 * สร้าง folder name จาก rawCategory key (ASCII-safe)
 * ต้องเป็น ASCII เพื่อให้ Windows Explorer และ unzip apps ทำงานได้
 */
function getCategoryFolderName(rawCategory) {
    const mainCategoryFolderNames = {
        around: '01_ภาพถ่ายรอบคัน',
        accessories: '02_ภาพถ่ายภายในรถ และอุปกรณ์ตกแต่ง',
        inspection: '03_ภาพถ่ายความเสียหาย',
        fiber: '04_เอกสารใบตรวจสภาพรถ',
        documents: '05_เอกสารอื่นๆ',
        signature: '06_ลายเซ็น',
        other: '07_อื่นๆ'
    };
    return mainCategoryFolderNames[rawCategory] || mainCategoryFolderNames.other;
}

/**
 * หา rawCategory จาก img element
 * สำหรับ .dynamic-image-slot: ใช้ data-category attribute
 * สำหรับ Tab 7 cards: ค้นหา h5 จาก sibling elements
 */
function detectImageCategory(imgElement, mainCategoryDisplayNames) {
    let rawCategory = 'other';

    const dynamicSlot = imgElement.closest('.dynamic-image-slot');
    if (dynamicSlot) {
        rawCategory = dynamicSlot.dataset.category || 'other';
    } else {
        const colContainer = imgElement.closest('[class*="col-"]');
        if (colContainer) {
            let sibling = colContainer.previousElementSibling;
            while (sibling) {
                const h5 = sibling.querySelector('h5');
                if (h5) {
                    const name = (h5.textContent || h5.innerText || '').trim();
                    const foundKey = Object.keys(mainCategoryDisplayNames).find(
                        key => mainCategoryDisplayNames[key] === name
                    );
                    if (foundKey) { rawCategory = foundKey; break; }
                }
                sibling = sibling.previousElementSibling;
            }
        }
    }
    return rawCategory;
}

// ============================================================
// Tests
// ============================================================

describe('Categorized ZIP Download - Folder Name Logic', () => {

    describe('getCategoryFolderName - Thai folder names', () => {
        test('should return Thai folder name for all known categories', () => {
            expect(getCategoryFolderName('around')).toBe('01_ภาพถ่ายรอบคัน');
            expect(getCategoryFolderName('accessories')).toBe('02_ภาพถ่ายภายในรถ และอุปกรณ์ตกแต่ง');
            expect(getCategoryFolderName('inspection')).toBe('03_ภาพถ่ายความเสียหาย');
            expect(getCategoryFolderName('fiber')).toBe('04_เอกสารใบตรวจสภาพรถ');
            expect(getCategoryFolderName('documents')).toBe('05_เอกสารอื่นๆ');
            expect(getCategoryFolderName('signature')).toBe('06_ลายเซ็น');
            expect(getCategoryFolderName('other')).toBe('07_อื่นๆ');
        });

        test('should return 07_อื่นๆ for unknown category (fallback)', () => {
            expect(getCategoryFolderName('unknown')).toBe('07_อื่นๆ');
            expect(getCategoryFolderName('')).toBe('07_อื่นๆ');
            expect(getCategoryFolderName(null)).toBe('07_อื่นๆ');
            expect(getCategoryFolderName(undefined)).toBe('07_อื่นๆ');
        });

        test('folder names should contain Unicode/Thai characters as requested', () => {
            const categories = ['around', 'accessories', 'inspection', 'fiber', 'documents', 'signature', 'other'];
            categories.forEach(cat => {
                const folderName = getCategoryFolderName(cat);
                // Verify that there is at least one non-ASCII character (code point >= 128)
                let hasNonAscii = false;
                for (let i = 0; i < folderName.length; i++) {
                    if (folderName.charCodeAt(i) >= 128) {
                        hasNonAscii = true;
                        break;
                    }
                }
                expect(hasNonAscii).toBe(true);
            });
        });

        test('folder names should be valid ZIP path segments (no special characters except spaces/Unicode)', () => {
            const categories = ['around', 'accessories', 'inspection', 'fiber', 'documents', 'signature', 'other'];
            const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1f]/;
            categories.forEach(cat => {
                const folderName = getCategoryFolderName(cat);
                expect(invalidCharsRegex.test(folderName)).toBe(false);
            });
        });
    });
});

describe('Categorized ZIP Download - Image Category Detection', () => {
    const mainCategoryDisplayNames = {
        around: 'ภาพถ่ายรอบคัน',
        accessories: 'ภาพถ่ายภายในรถ และอุปกรณ์ตกแต่ง',
        inspection: 'ภาพถ่ายความเสียหาย',
        fiber: 'เอกสารใบตรวจสภาพรถ',
        documents: 'เอกสารอื่นๆ',
        signature: 'ลายเซ็น'
    };

    test('should detect category from .dynamic-image-slot data-category attribute', () => {
        document.body.innerHTML = `
            <div class="dynamic-image-slot" data-category="around">
                <img src="http://example.com/img1.jpg">
            </div>
        `;
        const img = document.querySelector('img');
        const category = detectImageCategory(img, mainCategoryDisplayNames);
        expect(category).toBe('around');
    });

    test('should detect category "accessories" from .dynamic-image-slot', () => {
        document.body.innerHTML = `
            <div class="dynamic-image-slot" data-category="accessories">
                <img src="http://example.com/img2.jpg">
            </div>
        `;
        const img = document.querySelector('img');
        expect(detectImageCategory(img, mainCategoryDisplayNames)).toBe('accessories');
    });

    test('should fallback to "other" when dynamic-image-slot has no data-category', () => {
        document.body.innerHTML = `
            <div class="dynamic-image-slot">
                <img src="http://example.com/img3.jpg">
            </div>
        `;
        const img = document.querySelector('img');
        expect(detectImageCategory(img, mainCategoryDisplayNames)).toBe('other');
    });

    test('should detect category from h5 heading in Tab 7 (download-images-container)', () => {
        // Simulates the DOM structure produced by renderDownloadableImages()
        document.body.innerHTML = `
            <div id="download-images-container" class="row">
                <div class="col-12 mt-4">
                    <h5 class="text-primary border-bottom pb-2 mb-3">ภาพถ่ายรอบคัน</h5>
                </div>
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card h-100">
                        <a href="http://example.com/img1.jpg" target="_blank">
                            <img src="http://example.com/img1.jpg" class="card-img-top">
                        </a>
                        <div class="card-body text-center">
                            <p class="card-text">Front View</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const img = document.querySelector('img.card-img-top');
        const category = detectImageCategory(img, mainCategoryDisplayNames);
        expect(category).toBe('around');
    });

    test('should detect "inspection" category from h5 in Tab 7', () => {
        document.body.innerHTML = `
            <div id="download-images-container" class="row">
                <div class="col-12 mt-4">
                    <h5>ภาพถ่ายความเสียหาย</h5>
                </div>
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card h-100">
                        <img src="http://example.com/damage.jpg" class="card-img-top">
                    </div>
                </div>
            </div>
        `;
        const img = document.querySelector('img.card-img-top');
        expect(detectImageCategory(img, mainCategoryDisplayNames)).toBe('inspection');
    });

    test('should NOT use h6 for category detection (regression: was using h6 before fix)', () => {
        // Before the fix, the code looked for h6 but renderDownloadableImages uses h5
        // This test verifies h6 does NOT affect the result
        document.body.innerHTML = `
            <div class="row">
                <div class="col-12 mt-4">
                    <h6>ภาพถ่ายรอบคัน</h6>
                </div>
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card h-100">
                        <img src="http://example.com/img.jpg" class="card-img-top">
                    </div>
                </div>
            </div>
        `;
        const img = document.querySelector('img.card-img-top');
        // h6 should NOT be found, should fallback to 'other'
        const category = detectImageCategory(img, mainCategoryDisplayNames);
        expect(category).toBe('other');
    });

    test('should fallback to "other" when no category heading found in Tab 7', () => {
        document.body.innerHTML = `
            <div class="row">
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card h-100">
                        <img src="http://example.com/img.jpg" class="card-img-top">
                    </div>
                </div>
            </div>
        `;
        const img = document.querySelector('img.card-img-top');
        expect(detectImageCategory(img, mainCategoryDisplayNames)).toBe('other');
    });

    test('multiple images in same category should each detect correct category', () => {
        document.body.innerHTML = `
            <div id="download-images-container" class="row">
                <div class="col-12 mt-4">
                    <h5>ภาพถ่ายรอบคัน</h5>
                </div>
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card h-100">
                        <img src="http://example.com/img1.jpg" class="card-img-top">
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card h-100">
                        <img src="http://example.com/img2.jpg" class="card-img-top">
                    </div>
                </div>
                <div class="col-12 mt-4">
                    <h5>ภาพถ่ายความเสียหาย</h5>
                </div>
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card h-100">
                        <img src="http://example.com/damage.jpg" class="card-img-top">
                    </div>
                </div>
            </div>
        `;
        const imgs = document.querySelectorAll('img.card-img-top');
        expect(detectImageCategory(imgs[0], mainCategoryDisplayNames)).toBe('around');
        expect(detectImageCategory(imgs[1], mainCategoryDisplayNames)).toBe('around');
        expect(detectImageCategory(imgs[2], mainCategoryDisplayNames)).toBe('inspection');
    });
});

describe('Categorized ZIP Download - Full Integration Logic', () => {
    test('should produce Thai folder path for each image category', () => {
        const mainCategoryDisplayNames = {
            around: 'ภาพถ่ายรอบคัน',
            accessories: 'ภาพถ่ายภายในรถ และอุปกรณ์ตกแต่ง',
            inspection: 'ภาพถ่ายความเสียหาย',
            fiber: 'เอกสารใบตรวจสภาพรถ',
            documents: 'เอกสารอื่นๆ',
            signature: 'ลายเซ็น'
        };

        document.body.innerHTML = `
            <div class="dynamic-image-slot" data-category="around">
                <input class="image-title-input" value="Front View">
                <img src="http://example.com/img1.jpg">
            </div>
            <div class="dynamic-image-slot" data-category="inspection">
                <input class="image-title-input" value="Damage Detail">
                <img src="http://example.com/img2.jpg">
            </div>
        `;

        const imgs = document.querySelectorAll('img');
        
        const img1 = imgs[0];
        const cat1 = detectImageCategory(img1, mainCategoryDisplayNames);
        const folder1 = getCategoryFolderName(cat1);
        expect(folder1).toBe('01_ภาพถ่ายรอบคัน');

        const img2 = imgs[1];
        const cat2 = detectImageCategory(img2, mainCategoryDisplayNames);
        const folder2 = getCategoryFolderName(cat2);
        expect(folder2).toBe('03_ภาพถ่ายความเสียหาย');
    });

    test('image from Tab7 with h5 heading should map to correct Thai folder', () => {
        const mainCategoryDisplayNames = {
            around: 'ภาพถ่ายรอบคัน',
            accessories: 'ภาพถ่ายภายในรถ และอุปกรณ์ตกแต่ง',
            inspection: 'ภาพถ่ายความเสียหาย',
            fiber: 'เอกสารใบตรวจสภาพรถ',
            documents: 'เอกสารอื่นๆ',
            signature: 'ลายเซ็น'
        };

        document.body.innerHTML = `
            <div class="row">
                <div class="col-12 mt-4">
                    <h5>เอกสารอื่นๆ</h5>
                </div>
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card h-100">
                        <img src="http://example.com/doc.jpg" class="card-img-top">
                    </div>
                </div>
            </div>
        `;

        const img = document.querySelector('img.card-img-top');
        const cat = detectImageCategory(img, mainCategoryDisplayNames);
        const folder = getCategoryFolderName(cat);

        expect(cat).toBe('documents');
        expect(folder).toBe('05_เอกสารอื่นๆ');
        // Verify that there is at least one non-ASCII character
        let hasNonAscii = false;
        for (let i = 0; i < folder.length; i++) {
            if (folder.charCodeAt(i) >= 128) {
                hasNonAscii = true;
                break;
            }
        }
        expect(hasNonAscii).toBe(true);
    });
});
