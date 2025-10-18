fetch('/version.json')
        .then(res => res.json())
        .then(data => {
          document.getElementById("appVersion").textContent = `App Version ${data.version}`;
        })
        .catch(() => {
          document.getElementById("appVersion").textContent = "App Version -";
        });

import { API_BASE_URL } from './api-config.js';
      // Constants for URLs and other fixed strings
      const LOGIN_PAGE = '../index.html';
      const API_URL = `${API_BASE_URL}/api/auth/profile`;

      // Function to decode JWT token and check for expiration
      function decodeJWT(token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          return JSON.parse(atob(base64));  // Decode the token
        } catch (e) {
          console.error('Failed to decode JWT:', e);
          return null;
        }
      }

      // Function to check if the token is expired
      function isTokenExpired(decodedToken) {
        const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
        return decodedToken && decodedToken.exp && decodedToken.exp < currentTime;
      }

      // Main logic
      async function loadUserProfile() {
        const token = localStorage.getItem('authToken'); // Check if token is available

        // If there's no token, redirect to login
        if (!token) {
          window.location.href = LOGIN_PAGE;
          return;
        }

        const decoded = decodeJWT(token);
        if (!decoded) {
          localStorage.removeItem('authToken');
          window.location.href = LOGIN_PAGE;
          return;
        }

        const id = decoded.id;
        const userName = decoded.username;
        const fname = decoded.first_name;
        const lname = decoded.last_name;
        const email = decoded.email;
        const role = decoded.role;
        const myPicture = decoded.myPicture;

        document.getElementById('user-info').innerText = fname + ' ' + lname;
        document.getElementById('ownerName').value = fname + ' ' + lname;
        document.getElementById('user-role').innerText = role;

        const imageUrl = myPicture;
        const imgElement = document.getElementById('userAvatar');
        if (imageUrl) {
          imgElement.src = imageUrl;
        }

        if (decoded && isTokenExpired(decoded)) {
          // Token is expired
          localStorage.removeItem('authToken'); // Clear token
          window.location.href = LOGIN_PAGE; // Redirect to login page
          return;
        }

        // Check user role
        if (decoded.role === 'Operation Manager' || decoded.role === 'Director' || decoded.role === 'Developer') {
          // Show the admin menu
          const adminMenu = document.getElementById('admin-menu');
          if (adminMenu) {
            adminMenu.style.display = 'block';
          }
        } else if (decoded.role === 'Sales Manager') {
          // Redirect Sales Manager
          window.location.href = 'dashboard.html';
          return; // Stop further execution
        } else if (decoded.role === 'Officer') {
          // Redirect Officer
          localStorage.removeItem('authToken');
          window.location.href = LOGIN_PAGE; // Use LOGIN_PAGE constant
          return; // Stop further execution
        }

        // If the token is valid, fetch user profile
        try {
          const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
              'Authorization': `${token}`,
            },
          });
          console.log(response);
          if (!response.ok) {
            //If the response is not OK(e.g., 401 Unauthorized), clear token and redirect
            localStorage.removeItem('authToken');
            window.location.href = LOGIN_PAGE;
            return;
          }
        } catch (error) {
          //Handle fetch errors(network issues, etc.)
          console.error('Error fetching user profile:', error);
          localStorage.removeItem('authToken');
          window.location.href = LOGIN_PAGE; // Redirect to login page on error
        }
      }


      // Call the function to load the user profile
      document.addEventListener('DOMContentLoaded', () => {
        loadUserProfile();
      });



const imageUrls = [];

  const gallery = document.getElementById('gallery-documents');

  imageUrls.forEach((url, index) => {
    const col = document.createElement('div');

    const img = document.createElement('img');
    img.src = url;
    img.alt = `Image ${index + 1}`;
    img.className = 'img-card';
    img.dataset.selected = 'false';

    img.addEventListener('click', () => {
      if (img.dataset.selected === 'true') {
        img.dataset.selected = 'false';
        img.classList.remove('selected');
      } else {
        img.dataset.selected = 'true';
        img.classList.add('selected');
      }
    });

    col.appendChild(img);
    gallery.appendChild(col);
  });

  const downloadSelectedBtn = document.getElementById('downloadSelectedBtn');
  if (downloadSelectedBtn) {
    downloadSelectedBtn.addEventListener('click', async () => {
      const selectedImages = [...document.querySelectorAll('.img-card')].filter(img => img.dataset.selected === 'true');
      if (selectedImages.length === 0) {
        alert('กรุณาเลือกรูปภาพที่ต้องการดาวน์โหลด');
        return;
      }

      const zip = new JSZip();

      await Promise.all(
        selectedImages.map(async (img, i) => {
          const url = img.src;
          const response = await fetch(url);
          const blob = await response.blob();
          zip.file(`image-${i + 1}.jpg`, blob);
        })
      );

      zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, 'selected-images.zip');
      });
    });
  }

  const downloadAllBtn = document.getElementById('downloadAllBtn');
  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', async () => {
      const zip = new JSZip();

      await Promise.all(
        imageUrls.map(async (url, i) => {
          const response = await fetch(url);
          const blob = await response.blob();
          zip.file(`image-${i + 1}.jpg`, blob);
        })
      );

      zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, 'all-images.zip');
      });
    });
  }



document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const taskIdInput = document.getElementById('taskId');
    const uploadBtn = document.getElementById('uploadBtn');
    const progressWrapper = document.getElementById('uploadProgressWrapper');

    if (imageInput) {
      imageInput.addEventListener('change', () => {
        previewContainer.innerHTML = '';
        const files = Array.from(imageInput.files);

        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = function (e) {
            const col = document.createElement('div');
            col.className = 'col-6 col-sm-4 col-md-3';
            col.innerHTML = `
            <div class="card shadow-sm border mb-2">
              <img src="${e.target.result}" class="card-img-top rounded" style="height: 120px; object-fit: cover;">
            </div>
          `;
            previewContainer.appendChild(col);
          };
          reader.readAsDataURL(file);
        });
      });
    }

    if (uploadBtn) {
      uploadBtn.addEventListener('click', async function (e) {
        e.preventDefault();

        const files = imageInput.files;
        const folderName = taskIdInput?.value.trim() || 'default';

        if (!files.length) {
          alert('กรุณาเลือกรูปภาพก่อนอัปโหลด');
          return;
        }

        const formData = new FormData();
        formData.append('folder', folderName);

        for (const file of files) {
          formData.append('images', file);
        }

        // แสดง progress bar ขณะรอ upload เสร็จ
        progressWrapper.classList.remove('d-none');
        uploadBtn.disabled = true;

        try {
          const response = await fetch(`${API_BASE_URL}/api/upload/image/transactions`, {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Uploaded:', result);
            alert('Upload completed successfully!');
            // อัปเดตแกลเลอรีภาพที่นี่
            const gallery_documents = document.getElementById('gallery-documents');

            // วนลูปเพิ่มรูปที่อัปโหลดลง gallery
            if (result.uploaded && result.uploaded.length) {
              result.uploaded.forEach(img => {
                const col = document.createElement('div');
                col.className = 'col-6 col-sm-4 col-md-3 mb-3';
                col.innerHTML = `
              <div class="card shadow-sm border">
                <img src="${img.url}" alt="Uploaded Image" class="card-img-top rounded" style="height: 150px; object-fit: cover;">
              </div>
            `;
                gallery_documents.appendChild(col);
              });
            }
            imageInput.value = '';
            previewContainer.innerHTML = '';
          } else {
            alert('เกิดข้อผิดพลาดในการอัปโหลด');
          }
        } catch (error) {
          console.error('Upload failed:', error);
          alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
        } finally {
          // ซ่อน progress bar หลัง upload เสร็จไม่ว่าจะสำเร็จหรือไม่
          progressWrapper.classList.add('d-none');
          uploadBtn.disabled = false;
        }
      });
    }

    const now = new Date();

    const options = {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };

    const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(now);
    const getPart = (type) => parts.find(p => p.type === type).value;

    const formatted = `${getPart('year')}-${getPart('month')}-${getPart('day')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;

    const transactionDateEl = document.getElementById('transactionDate');
    if(transactionDateEl) {
        transactionDateEl.value = formatted;
    }





    const openMapBtn = document.getElementById('openMap');
    if(openMapBtn) {
        openMapBtn.addEventListener('click', function () {
            const address = document.getElementById('address').value.trim();

            if (!address) {
            alert('กรุณากรอกที่อยู่ก่อนเปิดแผนที่');
            return;
            }

            const query = encodeURIComponent(address);
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

            window.open(mapUrl, '_blank');
        });
    }


  async function loadOrderData(orderId) {
    const token = localStorage.getItem('authToken') || '';

    try {
      const response = await fetch(`${API_BASE_URL}/api/order-detail/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify({ order_id: orderId })
      });

      const result = await response.json();

      if (!response.ok) {
        alert('❌ ไม่พบข้อมูล: ' + result.message);
        return;
      }

      const { order, order_details, order_assign, order_hist, order_pic } = result;

      // ✅ โหลดผู้รับผิดชอบก่อนใส่ค่า owner
      await loadAssignees(order, token);

      // 🔹 orders
      document.getElementById('taskId').value = order.id;
      document.getElementById('jobType').value = order.order_type;
      document.getElementById('orderStatus').value = order.order_status;
      document.getElementById('channel').value = order.channel;
      document.getElementById('processType').value = order.process_type;
      document.getElementById('insuranceCompany').value = order.insur_comp;
      document.getElementById('transactionDate').value = order.order_date?.slice(0, 19).replace('T', ' ');
      document.getElementById('carRegistration').value = order.car_registration;
      document.getElementById('address').value = order.location;

      // 🔹 appointment
      if (order.appointment_date) {
        const dt = new Date(order.appointment_date);
        document.getElementById('appointmentDate').value = dt.toISOString().slice(0, 10);
        document.getElementById('appointmentTime').value = dt.toTimeString().slice(0, 5);
      }

      // 🔹 order_details
      if (order_details) {
        document.getElementById('phone').value = order_details.tell_1;
        document.getElementById('phone2').value = order_details.tell_2;
        document.getElementById('phone3').value = order_details.tell_3;
        document.getElementById('c_insure').value = order_details.c_insure;
        document.getElementById('c_tell').value = order_details.c_tell;
        document.getElementById('carRegistration').value = order_details.c_licent;
        document.getElementById('carProvince').value = order_details.c_car_province;

        document.getElementById('carBrand').value = order_details.c_brand;
        brandSelect.dispatchEvent(new Event('change'));
        document.getElementById('carModel').value = order_details.c_version;

        document.getElementById('carYear').value = order_details.c_year;
        document.getElementById('carChassis').value = order_details.c_number;
        document.getElementById('carEngine').value = order_details.c_engine;
        document.getElementById('c_mile').value = order_details.c_mile;
        document.getElementById('carType').value = order_details.c_type;
        document.getElementById('carColor').value = order_details.c_coller;
        document.getElementById('received-doc').checked = order_details.c_recieve;
        document.getElementById('insuranceBranch').value = order_details.s_branch;
        document.getElementById('reference1').value = order_details.s_ref;
        document.getElementById('reference2').value = order_details.s_ref_2;
        document.getElementById('policyNumber').value = order_details.s_number;
        const startInput = document.getElementById('coverageStartDate');
        const endInput = document.getElementById('coverageEndDate');

        if (startInput && order_details?.s_start) {
          startInput.value = order_details.s_start.slice(0, 10);
        }

        if (endInput && order_details?.s_end) {
          endInput.value = order_details.s_end.slice(0, 10);
        }
        document.getElementById('insuranceType').value = order_details.s_type;
        document.getElementById('s_remark').value = order_details.s_remark;
        document.getElementById('s_ins_remark').value = order_details.s_ins_remark;
        document.getElementById('s_detail').value = order_details.s_detail;
        document.getElementById('fleetCar').checked = order_details.s_fleet;
        document.getElementById('creatorName').value = order_details.c_name;
      }

      // 🔹 order_assign (รายการแรก)
      if (order_assign.length > 0) {
        document.getElementById('contactedCustomer').checked = order_assign[0].is_contact;
      }

      // 🔹 order_hist (แสดงบน timeline)
      const timelineEl = document.getElementById('historyTimeline');
      if(timelineEl) {
        timelineEl.innerHTML = '';

        if (order_hist && order_hist.length > 0) {
            order_hist.forEach(hist => {
            const date = new Date(hist.created_date);
            const formattedDate = date.toLocaleDateString('th-TH', {
                year: 'numeric', month: 'short', day: 'numeric'
            }) + ' - ' + date.toLocaleTimeString('th-TH', {
                hour: '2-digit', minute: '2-digit'
            }) + ' น.';

            const li = document.createElement('li');
            li.className = 'timeline-item';
            li.innerHTML = `
                <span class="timeline-icon bg-secondary">${hist.icon || '🕓'}</span>
                <div class="timeline-content">
                <h6 class="timeline-title">${hist.task}</h6>
                <p class="timeline-description">${hist.detail}</p>
                <small class="text-muted">${formattedDate}</small>
                </div>
            `;
            timelineEl.appendChild(li);
            });
        } else {
            timelineEl.innerHTML = `
            <li class="timeline-item">
                <div class="timeline-content">
                <p class="timeline-description text-muted">ไม่มีประวัติการอัปเดต</p>
                </div>
            </li>`;
        }
      }


      if (order_pic && order_pic.length > 0) {
        console.log('🔹 Found order pictures:', order_pic);
        renderUploadedImages(order_pic);
      }

    } catch (err) {
      alert('❌ ไม่สามารถโหลดข้อมูลได้');
      console.error('Inquiry Error:', err);
    }
  }

  const uploadedPicCache = new Set();

  function renderUploadedImages(orderPics) {
    // เคลียร์ภาพเดิมทั้งหมด และซ่อน .col-4
    document.querySelectorAll('.image-gallery').forEach(label => {
      const img = label.querySelector('img');
      const title = label.querySelector('.title');
      const col = label.closest('.col-4');

      if (img) {
        img.src = '';
        img.alt = '';
        img.style.display = 'none';
      }

      if (title) {
        title.textContent = '';
      }

      if (col) {
        col.style.display = 'none'; // 🔁 ซ่อนไว้ก่อน
      }
    });

    uploadedPicCache.clear();

    for (const pic of orderPics) {
      const inputElem = document.querySelector(`input[name="${pic.pic_type}"]`);
      if (!inputElem) continue;

      const label = inputElem.closest('label.image-gallery');
      if (!label) continue;

      const img = label.querySelector('img');
      const titleDiv = label.querySelector('.title');
      const col = label.closest('.col-4');
      if (!img || !titleDiv || !col) continue;

      img.alt = pic.pic_title || 'uploaded image';
      titleDiv.textContent = pic.pic_title || pic.pic_type;

      img.onload = () => {
        // ถ้าเป็น blob, revoke หลังโหลด
        if (pic.pic.startsWith('blob:')) {
          URL.revokeObjectURL(pic.pic);
        }

        // ถ้าโหลดได้จริง ค่อยแสดงกล่อง
        if (img.naturalWidth > 0) {
          col.style.display = 'block';
          img.style.display = 'block';
        }
      };

      // ถ้ารูปโหลดไม่สำเร็จ จะไม่แสดง img หรือ col
      img.onerror = () => {
        img.style.display = 'none';
        col.style.display = 'none';
      };

      // เพิ่ม timestamp กัน cache
      img.src = pic.pic + '?t=' + new Date().getTime();

      uploadedPicCache.add(pic.pic_type);
    }
  }






  async function loadAssignees(order, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-management/assigners`, {
        method: 'GET',
        headers: {
          'authorization': token
        }
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      const select = document.getElementById('responsiblePerson');

      select.innerHTML = '<option value="">เลือกผู้รับผิดชอบ</option>';
      data.forEach(person => {
        const fullName = `${person.first_name} ${person.last_name}`.trim();
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = fullName;
        select.appendChild(option);
      });

      // ✅ เซ็ตค่าที่ตรงกับ owner
      if (order?.owner) {
        select.value = order.owner;
      }

    } catch (err) {
      console.error('Error loading assigners:', err);
    }
  }

  // This is the main entry point for the page logic
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id');
  if (orderId) {
    loadOrderData(orderId);
  } else {
    // This is a new task, so enable the jobType dropdown
    const jobTypeEl = document.getElementById('jobType');
    if(jobTypeEl) {
        jobTypeEl.disabled = false;
    }
    console.warn('❗ ไม่พบ order ID ใน URL, เปิดโหมดสร้างงานใหม่');
  }

  // --- FORM SUBMISSION LOGIC ---
  const form = document.getElementById('taskForm');
  if (form) {
    const manualSubmitBtn = document.getElementById('submittaskBtn');
    if (manualSubmitBtn) {
        manualSubmitBtn.addEventListener('click', function () {
            console.log('📥 ปุ่ม #submittaskBtn ถูกกด => ส่งฟอร์มด้วย JS');
            form.requestSubmit(); // ทำให้เกิด event 'submit' ตามปกติ
        });
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      console.log('🔥 Submit event triggered');

      // Helper function to safely get value and log error if element is not found
      function getValueById(id, defaultValue = '') {
        const element = document.getElementById(id);
        if (!element) {
          console.error(`❌ Element with ID '${id}' not found!`);
          return defaultValue;
        }
        return element.value;
      }

      // Helper function to safely get checked status
      function getCheckedById(id, defaultValue = false) {
        const element = document.getElementById(id);
        if (!element) {
          console.error(`❌ Element with ID '${id}' not found!`);
          return defaultValue;
        }
        return element.checked;
      }

      const token = localStorage.getItem('authToken') || '';
      const created_by = getValueById('ownerName');
      const date = getValueById('appointmentDate');
      const time = getValueById('appointmentTime');

      let appointment_date = null;
      if (date) {
        appointment_date = time ? new Date(`${date}T${time}`).toISOString() : new Date(date).toISOString();
      }

      const s_start = getValueById('coverageStartDate').trim();
      const s_end = getValueById('coverageEndDate').trim();

      const data = {
        // 🔹 orders
        creator:  created_by,
        owner: getValueById('responsiblePerson'),
        order_type: getValueById('jobType'),
        order_status: getValueById('orderStatus'),
        channel: getValueById('channel'),
        process_type: getValueById('processType'),
        insur_comp: getValueById('insuranceCompany'),
        order_date: getValueById('transactionDate'),
        appointment_date: appointment_date,
        car_registration: getValueById('carRegistration'),
        location: getValueById('address'),
        created_by,

        // 🔹 order_details
        tell_1: getValueById('phone'),
        tell_2: getValueById('phone2'),
        tell_3: getValueById('phone3'),
        c_insure: getValueById('c_insure'),
        c_tell: getValueById('c_tell'),
        c_licent: getValueById('carRegistration'),
        c_car_province: getValueById('carProvince'),
        c_brand: getValueById('carBrand'),
        c_version: getValueById('carModel'),
        c_year: getValueById('carYear'),
        c_number: getValueById('carChassis'),
        c_engine: getValueById('carEngine'),
        c_mile: getValueById('c_mile'),
        c_type: getValueById('carType'),
        c_coller: getValueById('carColor'),
        c_recieve: getCheckedById('received-doc'),
        s_insure: getValueById('insuranceCompany'),
        s_branch: getValueById('insuranceBranch'),
        s_ref: getValueById('reference1'),
        s_ref_2: getValueById('reference2'),
        s_number: getValueById('policyNumber'),
        ...(s_start ? { s_start } : {}),
        ...(s_end ? { s_end } : {}),
        s_type: getValueById('insuranceType'),
        s_remark: getValueById('s_remark'),
        s_ins_remark: getValueById('s_ins_remark'),
        s_detail: getValueById('s_detail'),
        s_fleet: getCheckedById('fleetCar'),
        updated_by: created_by,
        c_name: getValueById('creatorName'),

        // 🔹 order_hist[] (log เริ่มต้น)
        order_hist: [
          {
            icon: "📝",
            task: "สร้างรายการ",
            detail: "สร้างโดยผู้ใช้: " + created_by,
            created_by
          }
        ]
      };

      console.log('Form data:', data);

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Response:', result);

        if (response.ok) {
          alert('✅ สร้างคำสั่งเรียบร้อยแล้ว');
          form.reset();
          window.location.href = 'dashboard.html';
        } else {
          alert('❌ เกิดข้อผิดพลาด: ' + result.message);
        }
      } catch (error) {
        alert('❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
        console.error('Fetch error:', error);
      }
    });
  }
});

// --- CAR MODEL DROPDOWN LOGIC ---
// Moved from DOMContentLoaded to ensure carModels is available globally
const brandSelect = document.getElementById('carBrand');
const modelSelect = document.getElementById('carModel');

if(brandSelect) {
    brandSelect.addEventListener('change', function () {
        // Ensure carModels is available
        if (typeof carModels === 'undefined') {
            console.error('carModels object is not defined. Make sure car-models.js is loaded correctly.');
            return;
        }
        const selectedBrand = this.value;
        const models = carModels[selectedBrand] || [];

        // Clear previous options
        modelSelect.innerHTML = '<option value="" selected disabled>เลือกรุ่น</option>';

        // Add new options
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });

        // Enable or disable the model dropdown
        modelSelect.disabled = models.length === 0;
    });
}

// --- LOGOUT LOGIC ---
const logoutBtn = document.getElementById('logout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('authToken');
    window.location.href = '../index.html';
    });
}

const logoutMenu = document.getElementById('logout-menu');
if (logoutMenu) {
    logoutMenu.addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('authToken');
    window.location.href = '../index.html';
    });
}