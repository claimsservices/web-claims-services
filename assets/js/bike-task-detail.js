document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = 'https://be-claims-service.onrender.com';
    const LOGIN_PAGE = '../index.html';
    const DASHBOARD_PAGE = 'bike-dashboard.html';
    const token = localStorage.getItem('authToken');

    // --- Auth Check ---
    if (!token) {
        window.location.href = LOGIN_PAGE;
        return;
    }

    // --- Element Selectors ---
    const acceptView = document.getElementById('accept-view');
    const workingView = document.getElementById('working-view');

    // Accept View Elements
    const acceptClaimId = document.getElementById('accept-claim-id');
    const acceptCustomerName = document.getElementById('accept-customer-name');
    const acceptCustomerPhone = document.getElementById('accept-customer-phone');
    const acceptLocation = document.getElementById('accept-location');
    const acceptBtn = document.getElementById('accept-btn');
    const rejectBtn = document.getElementById('reject-btn');
    const callBtn1 = document.getElementById('call-btn-1');

    // --- Get Order ID from URL ---
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (!orderId) {
        alert('ไม่พบรหัสงาน (Order ID)');
        window.location.href = DASHBOARD_PAGE;
        return;
    }

    let currentOrderData = null;

    // --- Main Function to Load Task Details ---
    async function loadTaskDetails() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/order-detail/inquiry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ order_id: orderId })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'ไม่สามารถโหลดข้อมูลงานได้');
            }

            const result = await response.json();
            currentOrderData = result;

            // Populate Accept View Details
            if (result.order) {
                acceptClaimId.textContent = result.order.id;
                acceptLocation.textContent = result.order.location;
            }
            if (result.order_details) {
                acceptCustomerName.textContent = result.order_details.c_name;
                acceptCustomerPhone.textContent = result.order_details.tell_1;
            }

            // Switch views based on status
            const status = result.order.order_status;
            const workingStates = ['รับงาน', 'เริ่มงาน/กำลังเดินทาง', 'ถึงที่เกิดเหตุ/ปฏิบัติงาน'];
            const acceptStates = ['รับเรื่องแล้ว', 'แก้ไข'];

            if (acceptStates.includes(status)) {
                showAcceptView();
            } else if (workingStates.includes(status)) {
                showWorkingView();
            } else {
                // For other statuses, just show details in a read-only like mode
                showAcceptView();
                acceptBtn.style.display = 'none';
                rejectBtn.style.display = 'none';
            }

        } catch (error) {
            console.error('Error loading task details:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
            window.location.href = DASHBOARD_PAGE;
        }
    }

    // --- View Switching Functions ---
    function showAcceptView() {
        acceptView.style.display = 'block';
        workingView.style.display = 'none';
    }

    function showWorkingView() {
        acceptView.style.display = 'none';
        workingView.style.display = 'block';
        renderPhotoCategories();
    }

    // --- Photo Rendering Logic ---
    const photoCategories = {
        around: {
            title: 'ภาพถ่ายรอบคัน',
            containerId: 'around-car-pics',
            items: ['ด้านหน้ารถ', 'ด้านซ้ายส่วนหน้า', 'ด้านซ้ายตรง', 'ด้านซ้ายส่วนหลัง', 'ด้านท้ายรถ', 'ด้านขวาส่วนหลัง', 'ด้านขวาตรง', 'ด้านขวาส่วนหน้า', 'หลังคา']
        },
        interior: {
            title: 'ภาพถ่ายภายในรถและอุปกรณ์ตกแต่ง',
            containerId: 'interior-pics',
            items: ['ล้อรถ 4 ล้อ ด้านหน้าขวา', 'ล้อรถ 4 ล้อ ด้านหน้าซ้าย', 'ล้อรถ 4 ล้อ ด้านหลังขวา', 'ล้อรถ 4 ล้อ ด้านหลังซ้าย', 'ปียาง/ขนาดยาง', 'ห้องเครื่อง', 'วิทยุ', 'จอไมล์', 'กระจกมองหน้า', 'ฟิล์ม', 'กล้องหน้ารถ', 'แผงหน้าปัดหน้า', 'อื่นๆ']
        },
        damage: {
            title: 'ภาพถ่ายความเสียหาย',
            containerId: 'damage-pics',
            items: ['ความเสียหาย 1', 'ความเสียหาย 2', 'ความเสียหาย 3', 'ความเสียหาย 4', 'ความเสียหาย 5', 'ความเสียหาย 6', 'ความเสียหาย 7', 'ความเสียหาย 8', 'ความเสียหาย 9', 'ความเสียหาย 10']
        },
        documents: {
            title: 'เอกสาร',
            containerId: 'document-pics',
            items: ['ใบขับขี่', 'บัตรประชาชน', 'รายการจดทะเบียนรถ', 'เลขตัวถังหรือเลขคัสซี', 'ใบตรวจสภาพ', 'ลายเซ็น']
        }
    };

    function renderPhotoCategories() {
        for (const categoryKey in photoCategories) {
            const category = photoCategories[categoryKey];
            const container = document.getElementById(category.containerId);
            if (container) {
                container.innerHTML = ''; // Clear existing items
                category.items.forEach(itemText => {
                    const col = document.createElement('div');
                    col.className = 'col-6 col-md-4 mb-2';
                    
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'photo-item p-2';
                    itemDiv.innerHTML = `<i class="bx bx-camera bx-sm d-block mb-1"></i><span>${itemText}</span>`;
                    
                    itemDiv.addEventListener('click', () => {
                        // Placeholder for taking a picture
                        alert(`เปิดกล้องเพื่อถ่ายรูป: ${itemText}`);
                        itemDiv.style.backgroundColor = '#e7f2ff';
                        itemDiv.style.borderColor = '#03c3ec';
                    });

                    col.appendChild(itemDiv);
                    container.appendChild(col);
                });
            }
        }
    }

    // --- Event Listeners ---
    async function updateStatus(newStatus) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/order-status/update/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ order_status: newStatus })
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'ไม่สามารถอัปเดตสถานะได้');
            }
            return true;
        } catch (error) {
            console.error('Status update error:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
            return false;
        }
    }

    acceptBtn.addEventListener('click', async () => {
        const success = await updateStatus('รับงาน');
        if (success) {
            showWorkingView();
        }
    });

    rejectBtn.addEventListener('click', async () => {
        const success = await updateStatus('ปฏิเสธงาน');
        if (success) {
            alert('คุณได้ปฏิเสธงานเรียบร้อยแล้ว');
            window.location.href = DASHBOARD_PAGE;
        }
    });

    callBtn1.addEventListener('click', () => {
        const phoneNumber = currentOrderData?.order_details?.tell_1;
        if (phoneNumber) {
            window.location.href = `tel:${phoneNumber}`;
        } else {
            alert('ไม่พบเบอร์โทรศัพท์ลูกค้า');
        }
    });

    const saveWorkBtn = document.getElementById('save-work-btn');
    if (saveWorkBtn) {
        saveWorkBtn.addEventListener('click', async () => {
            const confirmSubmit = confirm('คุณต้องการส่งงานเพื่อตรวจสอบใช่หรือไม่?');
            if (confirmSubmit) {
                // Note: The backend will automatically change this to 'รออนุมัติ'
                const success = await updateStatus('ส่งงาน/ตรวจสอบเบื้องต้น');
                if (success) {
                    alert('ส่งงานเรียบร้อยแล้ว');
                    window.location.href = DASHBOARD_PAGE;
                }
            }
        });
    }

    // --- Initial Load ---
    loadTaskDetails();
});
