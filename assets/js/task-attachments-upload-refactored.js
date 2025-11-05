document.addEventListener('DOMContentLoaded', () => {

    const LOGIN_PAGE = '../index.html';
    const token = localStorage.getItem('authToken');

    // --- Auth & Profile --- //
    if (!token) {
        window.location.href = LOGIN_PAGE;
        return;
    }

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    function loadUserProfile() {
        const decoded = parseJwt(token);
        if (decoded) {
            document.getElementById('user-info').innerText = `${decoded.first_name} ${decoded.last_name}`;
            document.getElementById('user-role').innerText = decoded.role;
            if(decoded.myPicture) {
                document.getElementById('userAvatar').src = decoded.myPicture;
            }
        }
    }

    // --- Main Data Loading --- //
    async function loadOrderData(orderId) {
        try {
            const response = await fetch(`https://be-claims-service.onrender.com/api/order-detail/inquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ order_id: orderId })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'ไม่พบข้อมูลงาน');
            }

            const result = await response.json();
            renderOrderDetails(result.order, result.order_details);
            
            if (result.order_pic && result.order_pic.length > 0) {
                renderExistingImages(result.order_pic);
            }

            handleOrderStatus(result.order.order_status || "เปิดงาน");

        } catch (err) {
            alert(`❌ ไม่สามารถโหลดข้อมูลได้: ${err.message}`);
            console.error('Inquiry Error:', err);
        }
    }

    function renderOrderDetails(order, details) {
        if (!order) return;
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.location)}`;
        document.getElementById('job-code').value = order.id;
        document.getElementById('insurance-company').value = order.insur_comp;
        document.getElementById('car-plate').value = order.car_registration;
        document.getElementById('customer-address').value = order.location;
        document.getElementById('open-map').href = mapUrl;

        if (details) {
            document.getElementById('phone').value = details.full_phone;
            document.getElementById('province-category').value = details.c_car_province;
            document.getElementById('car-brand').value = details.c_brand;
            document.getElementById('car-model').value = details.c_version;
            document.getElementById('vin').value = details.c_number;
            document.getElementById('customer-name').value = details.c_name;
        }
    }

    function renderExistingImages(images) {
        images.forEach(image => {
            if (!image.pic_title || !image.pic) return;

            const titleDivs = document.querySelectorAll('div.title');
            let found = false;
            titleDivs.forEach(div => {
                const targetLabel = div.closest('label.image-gallery');
                // Find the first unfilled div that includes the image title
                if (!found && targetLabel && !targetLabel.hasAttribute('data-filled') && div.innerText.trim().includes(image.pic_title.trim())) {
                    
                    // Mark as filled to prevent multiple assignments
                    targetLabel.setAttribute('data-filled', 'true');

                    const imgTag = targetLabel.querySelector('img');
                    const icon = targetLabel.querySelector('i');

                    // Display the image
                    if (imgTag && icon) {
                        imgTag.src = image.pic;
                        imgTag.style.display = 'block';
                        icon.style.display = 'none';
                    }

                    // Create and append download button
                    const downloadUrl = createDownloadUrl(image.pic);
                    const downloadBtn = document.createElement('a');
                    downloadBtn.href = downloadUrl;
                    downloadBtn.setAttribute('download', '');
                    downloadBtn.className = 'btn btn-sm btn-outline-primary position-absolute top-0 end-0 m-2';
                    downloadBtn.innerHTML = '<i class="bx bx-download"></i>';
                    downloadBtn.title = 'ดาวน์โหลดรูปภาพ';
                    targetLabel.style.position = 'relative'; // Ensure parent is relative for absolute positioning
                    targetLabel.appendChild(downloadBtn);

                    found = true; // Move to the next image
                }
            });
        });
    }

    function createDownloadUrl(cloudinaryUrl) {
        if (!cloudinaryUrl.includes('/upload/')) {
            return cloudinaryUrl; // Not a standard Cloudinary URL, return as is
        }
        return cloudinaryUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    // --- Status & UI Control --- //
    function handleOrderStatus(status) {
        updateProgressVisual(status);
        toggleActionButtons(status);
        toggleUploadSection(status);
    }

    function updateProgressVisual(status) {
        let activeSteps = 0;
        switch (status) {
            case "รับงาน": activeSteps = 1; break;
            case "เริ่มงาน/กำลังเดินทาง": activeSteps = 2; break;
            case "ถึงที่เกิดเหตุ/ปฏิบัติงาน": activeSteps = 3; break;
            case "ส่งงาน/ตรวจสอบเบื้องต้น": case "รออนุมัติ": case "ผ่าน": activeSteps = 4; break;
        }
        const percent = activeSteps > 1 ? ((activeSteps - 1) / 3) * 100 : 0;
        document.getElementById('progressFill').style.width = `${percent}%`;
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`step${i}`).classList.toggle('active', i <= activeSteps);
        }
    }

    function toggleActionButtons(status) {
        const buttons = ['btn-accept', 'btn-reject', 'btn-start', 'btn-arrived'];
        buttons.forEach(id => { 
            const btn = document.getElementById(id);
            if(btn) btn.style.display = 'none';
        });

        let buttonsToShow = [];
        switch (status) {
            case "เปิดงาน": case "รับเรื่องแล้ว": buttonsToShow = ['btn-accept', 'btn-reject']; break;
            case "รับงาน": buttonsToShow = ['btn-start']; break;
            case "เริ่มงาน/กำลังเดินทาง": buttonsToShow = ['btn-arrived']; break;
        }
        buttonsToShow.forEach(id => { 
            const btn = document.getElementById(id);
            if(btn) btn.style.display = 'inline-block';
        });
    }

    function toggleUploadSection(status) {
        const isVisible = status === "ถึงที่เกิดเหตุ/ปฏิบัติงาน";
        document.querySelectorAll('.upload-section').forEach(section => {
            section.style.display = isVisible ? 'block' : 'none';
        });
        const uploadActions = document.querySelector('.upload-actions');
        if (uploadActions) {
            uploadActions.style.display = isVisible ? 'block' : 'none';
        }
    }

    // --- Event Listeners --- //
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        window.location.href = LOGIN_PAGE;
    });

    // --- Page Init --- //
    loadUserProfile();
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    if (orderId) {
        loadOrderData(orderId);
    } else {
        alert('ไม่พบรหัสงานใน URL');
    }
    document.body.classList.remove('loading');
});