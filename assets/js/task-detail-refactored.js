// Check if the user has a valid token and the required role
      const accessToken = localStorage.getItem('authToken'); // Check if token is available
      const RETURN_LOGIN_PAGE = '../index.html';

      // If there's no token, redirect to login
      if (!accessToken) {
        window.location.href = RETURN_LOGIN_PAGE;
      }

fetch('/version.json')
        .then(res => res.json())
        .then(data => {
          document.getElementById("appVersion").textContent = `App Version ${data.version}`;
        })
        .catch(() => {
          document.getElementById("appVersion").textContent = "App Version -";
        });

const API_BASE_URL = 'http://localhost:8181'; // สำหรับการทดสอบ Local
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

        // Decode the JWT token (assuming it's a JWT token)
        function parseJwt(token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          return JSON.parse(jsonPayload);
        }

        // ใช้งาน
        const decoded = parseJwt(token);

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

        const imageUrl = myPicture;  // Extract the image URL from the response
        const imgElement = document.getElementById('userAvatar');
        imgElement.src = imageUrl;  // Update the image src dynamically

        if (decoded && isTokenExpired(decoded)) {
          // Token is expired
          localStorage.removeItem('authToken'); // Clear token
          window.location.href = LOGIN_PAGE; // Redirect to login page
          return;
        }

        // If the token is valid, fetch user profile
        try {
          const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
              'Authorization': `${token}`,  // Use the token in the Authorization header
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

// Check user role (example assumes role is stored in localStorage)
  const token = localStorage.getItem('authToken');
  if (token) {
    const user = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload

    // Check if the user has the 'admin' role
    if (user.role === 'Operation Manager' || user.role === 'Director' || user.role === 'Developer') {
      // Show the admin menu
      document.getElementById('admin-menu').style.display = 'block';
    } else if (userRole === 'Admin Officer') {
      document.addEventListener('DOMContentLoaded', function () {
        const orderStatusSelect = document.getElementById('orderStatus');
        if (orderStatusSelect) {
          orderStatusSelect.setAttribute('disabled', 'disabled');
        }
      });
    }
    if (user.role === 'Officer') {
      localStorage.removeItem('authToken');
      window.location.href = '../index.html';
    }
  }

document.getElementById('downloadAllBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    const zip = new JSZip();
    const orderId = document.getElementById('taskId').value.trim();

    // ✅ เลือกเฉพาะ img ที่มี src จริงและมองเห็นได้
    const imageElements = Array.from(document.querySelectorAll('.image-gallery img')).filter(img => {
      const style = getComputedStyle(img);
      return (
        img.src &&
        img.src.startsWith('https') &&
        style.display !== 'none' &&
        img.complete
      );
    });

    if (imageElements.length === 0) {
      alert('ไม่มีภาพให้ดาวน์โหลด');
      return;
    }

    await Promise.all(
      imageElements.map(async (img, i) => {
        const url = img.src;
        const label = img.closest('label');
        const title = label?.querySelector('.title')?.innerText?.trim() || `image-${i + 1}`;

        // ✅ เปลี่ยนชื่อให้ปลอดภัยกับระบบไฟล์ (ตัดอักขระพิเศษออก)
        const safeName = title.replace(/[^\wก-๙\s-]/g, '').replace(/\s+/g, '_');

        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`โหลดภาพไม่ได้: ${url}`);
          const blob = await response.blob();
          zip.file(`${safeName || `image-${i + 1}`}.jpg`, blob);
        } catch (err) {
          console.warn(`ข้ามภาพที่โหลดไม่ได้: ${url}`, err);
        }
      })
    );

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, orderId + '.zip');
  });

document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const taskIdInput = document.getElementById('taskId');
    const uploadBtn = document.getElementById('uploadBtn');
    const progressWrapper = document.getElementById('uploadProgressWrapper');

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
                      const response = await fetch(`${API_BASE_URL}/api/upload/image/transactions`, {          method: 'POST',
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
  });

  // Removed duplicate declaration of brandSelect and modelSelect and their event listener to avoid redeclaration error.

document.addEventListener('DOMContentLoaded', () => {
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

    document.getElementById('transactionDate').value = formatted;
  });

document.getElementById('openMap').addEventListener('click', function () {
    const address = document.getElementById('address').value.trim();

    if (!address) {
      alert('กรุณากรอกที่อยู่ก่อนเปิดแผนที่');
      return;
    }

    const query = encodeURIComponent(address);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    window.open(mapUrl, '_blank');
  });

  const brandSelect = document.getElementById('carBrand');
  const modelSelect = document.getElementById('carModel');

  brandSelect.addEventListener('change', function () {
    const selectedBrand = this.value;
    const models = carModels[selectedBrand] || [];

    modelSelect.innerHTML = '<option selected disabled>เลือกรุ่น</option>';

    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    });

    modelSelect.disabled = models.length === 0;
  });

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

  // ตัวอย่างเรียกใช้ (ตอนโหลดหน้า)
  window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    if (orderId) {
      loadOrderData(orderId);
    }
  });

document.addEventListener('DOMContentLoaded', function () {
    // === Logout button listeners ===
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

    // === Load order data from URL ===
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (orderId) {
      loadOrderData(orderId);
    } else {
      console.warn('❗ ไม่พบ order ID ใน URL');
    }

  });

document.addEventListener('DOMContentLoaded', function () {
    console.log("🔥 DOM Loaded");

    const form = document.getElementById('taskForm');
    if (!form) {
      console.log('❌ ไม่เจอ taskForm');
      return;
    } else {
      console.log('✅ เจอ taskForm แล้ว');
      console.log('Form innerHTML snippet:', form.innerHTML.slice(0, 300));
    }

    // === Logout button listeners ===
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

    // === ตรวจสอบปุ่ม submit ดั้งเดิม (ถ้ามี) ===
    const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
    console.log('All submit buttons in form:', submitButtons);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      console.log('✅ เจอปุ่ม submit แล้ว');
      submitBtn.addEventListener('click', function () {
        console.log('ปุ่ม submit ถูกกด');
      });
    } else {
      console.log('❌ ไม่พบปุ่ม submit');
    }

    // ✅ เพิ่มปุ่มที่ใช้ submit แบบ manual
    const manualSubmitBtn = document.getElementById('submittaskBtn');
    if (manualSubmitBtn) {
      console.log('✅ พบปุ่ม #submittaskBtn แล้ว');
      manualSubmitBtn.addEventListener('click', function () {
        console.log('📥 ปุ่ม #submittaskBtn ถูกกด => ส่งฟอร์มด้วย JS');
        form.requestSubmit(); // ทำให้เกิด event 'submit' ตามปกติ
      });
    } else {
      console.log('❌ ไม่พบปุ่ม #submittaskBtn');
    }

    // ✅ ฟังชั่น submit ฟอร์ม
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      console.log('🔥 Submit event triggered');

      const token = localStorage.getItem('authToken') || '';
      console.log('Token:', token);

      const created_by = document.getElementById('ownerName').value;
      const date = document.getElementById('appointmentDate').value;
      const time = document.getElementById('appointmentTime').value;

      let appointment_date = null;
      if (date) {
        appointment_date = time ? new Date(`${date}T${time}`).toISOString() : new Date(date).toISOString();
      }

      const s_start = document.getElementById('coverageStartDate').value.trim();
      const s_end = document.getElementById('coverageEndDate').value.trim();

      const orderPic = [];
      const sections = document.querySelectorAll('.upload-section');

      sections.forEach(section => {
        const imgTags = section.querySelectorAll('img');

        imgTags.forEach(img => {
          // ถ้ารูปถูกลบไปแล้ว ไม่ต้องเอาไป push
          if (!img.src || img.style.display === 'none' || !img.src.startsWith('http')) return;

          const input = img.closest('label')?.querySelector('input[type="file"]');
          const picType = input?.name || 'unknown';
          const title = img.closest('label')?.querySelector('.title')?.innerText || '';

          orderPic.push({
            pic: img.src,
            pic_type: picType,
            pic_title: title,
            created_by: created_by
          });
        });
      });


      const data = {
        // 🔹 orders
        creator: document.getElementById('ownerName').value,
        owner: document.getElementById('responsiblePerson').value,
        order_type: document.getElementById('jobType').value,
        order_status: document.getElementById('orderStatus').value,
        channel: document.getElementById('channel').value,
        process_type: document.getElementById('processType').value,
        insur_comp: document.getElementById('insuranceCompany').value,
        order_date: document.getElementById('transactionDate').value,
        appointment_date: appointment_date,
        car_registration: document.getElementById('carRegistration').value,
        location: document.getElementById('address').value,
        created_by,

        // 🔹 order_details
        tell_1: document.getElementById('phone').value,
        tell_2: document.getElementById('phone2').value,
        tell_3: document.getElementById('phone3').value,
        c_insure: document.getElementById('c_insure').value,
        c_tell: document.getElementById('c_tell').value,
        c_licent: document.getElementById('carRegistration').value,
        c_car_province: document.getElementById('carProvince').value,
        c_brand: document.getElementById('carBrand').value,
        c_version: document.getElementById('carModel').value,
        c_year: document.getElementById('carYear').value,
        c_number: document.getElementById('carChassis').value,
        c_engine: document.getElementById('carEngine').value,
        c_mile: document.getElementById('c_mile').value,
        c_type: document.getElementById('carType').value,
        c_coller: document.getElementById('carColor').value,
        c_recieve: document.getElementById('received-doc').checked,
        s_insure: document.getElementById('insuranceCompany').value,
        s_branch: document.getElementById('insuranceBranch').value,
        s_ref: document.getElementById('reference1').value,
        s_ref_2: document.getElementById('reference2').value,
        s_number: document.getElementById('policyNumber').value,
        ...(s_start ? { s_start } : {}),
        ...(s_end ? { s_end } : {}),
        s_type: document.getElementById('insuranceType').value,
        s_remark: document.getElementById('s_remark').value,
        s_ins_remark: document.getElementById('s_ins_remark').value,
        s_detail: document.getElementById('s_detail').value,
        s_fleet: document.getElementById('fleetCar').checked,
        updated_by: created_by,
        c_name: document.getElementById('creatorName').value,

        // 🔹 order_assign[] (ใส่ตัวอย่างเดียว)
        /*order_assign: [
          {
            date: appointment_date,
            //pending: document.getElementById('assignPending').checked,
            destination: document.getElementById('address').value,
            owner: document.getElementById('responsiblePerson').value,
            is_contact: document.getElementById('contactedCustomer').checked,
            created_by
          }
        ],
        */

        // 🔹 order_pic[] (รูปภาพที่อัปโหลด)
        order_pic: orderPic,

        // 🔹 order_hist[] (log เริ่มต้น)
        order_hist: [
          {
            icon: "📝",
            task: "สร้างรายการ",
            detail: "อัพเดทรายการโดยผู้ใช้: " + created_by,
            created_by
          }
        ]
      };

      console.log('Form data:', data);

      const orderId = document.getElementById('taskId').value

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/update/ + orderId`, {
          method: 'PUT',
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

    // สมมติใช้ Bootstrap 5 modal ผ่าน JS API
    const imagePreviewModal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
    const previewImage = document.getElementById('previewImage');

    document.querySelectorAll('label.image-gallery').forEach(label => {
      label.addEventListener('click', e => {
        e.preventDefault();  // ป้องกันเปิด input file

        const img = label.querySelector('img');
        if (img && img.src) {
          previewImage.src = img.src;   // เซ็ตรูปใน modal
          imagePreviewModal.show();     // เปิด modal
        }
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation(); // ป้องกันไม่ให้เปิด modal

        // ✅ แสดง popup ยืนยัน
        const confirmDelete = window.confirm('คุณต้องการลบภาพนี้หรือไม่?');
        if (!confirmDelete) return; // ❌ ถ้ากดยกเลิก ให้หยุดการทำงาน

        const label = e.target.closest('.image-gallery');
        if (!label) return;

        // ✅ รีเซ็ต input file
        const input = label.querySelector('input[type="file"]');
        console.log('Resetting input:', input);
        uploadedPicCache.delete(input.name);
        if (input) input.value = '';

        // ✅ ซ่อนรูป
        const img = label.querySelector('img');
        if (img) img.style.display = 'none';

        // ✅ ซ่อนชื่อภาพ (ถ้าต้องการ)
        const title = label.querySelector('.title');
        if (title) title.textContent = '';
      });
    });


    document.querySelectorAll('.edit-title-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation(); // กันคลิก input

        const label = e.target.closest('label.image-gallery');
        const titleDiv = label.querySelector('.title');
        const currentTitle = titleDiv.textContent.trim();

        const newTitle = prompt('แก้ไขชื่อภาพ:', currentTitle);
        if (newTitle && newTitle.trim() !== '') {
          titleDiv.textContent = newTitle.trim();
          titleDiv.setAttribute('data-custom', 'true');
        }
      });
    });

    const categoryConfig = {
      accessories: {
        count: 20,
        labels: ['อุปกรณ์ตกแต่ง 1.', 'อุปกรณ์ตกแต่ง 2.', 'อุปกรณ์ตกแต่ง 3.', 'อุปกรณ์ตกแต่ง 4.', 'อุปกรณ์ตกแต่ง 5.', 'อุปกรณ์ตกแต่ง 6.', 'อุปกรณ์ตกแต่ง 7.', 'อุปกรณ์ตกแต่ง 8.', 'อุปกรณ์ตกแต่ง 9.', 'อุปกรณ์ตกแต่ง 10.', 'อุปกรณ์ตกแต่ง 11.', 'อุปกรณ์ตกแต่ง 12.', 'อุปกรณ์ตกแต่ง 13.', 'อุปกรณ์ตกแต่ง 14.', 'อุปกรณ์ตกแต่ง 15.', 'อุปกรณ์ตกแต่ง 16.', 'อุปกรณ์ตกแต่ง 17.', 'อุปกรณ์ตกแต่ง 18.', 'อุปกรณ์ตกแต่ง 19.', 'อุปกรณ์ตกแต่ง 20.'],
        filenames: [],
        idRender: ['interior_wheels_1', 'interior_wheels_2', 'interior_wheels_3', 'interior_wheels_4', 'interior_dashboard', 'interior_6', 'interior_7', 'interior_8', 'interior_9', 'interior_10', 'interior_11', 'interior_12', 'interior_13', 'interior_14', 'interior_15', 'interior_16', 'interior_17', 'interior_18', 'interior_19', 'interior_20']
      },
      documents: {
        count: 8,
        labels: ['ใบขับขี่', 'บัตรประชาชน', 'เอกสารยืนยันตัวรถ', 'เลขตัวถังและทะเบียนรถ', 'ลายเซ็น', 'อื่นๆ', 'อื่นๆ', 'อื่นๆ'],
        filenames: [],
        idRender: ['license', 'id_card', 'car_doc', 'car_number', 'doc_other_9', 'other_1', 'other_2', 'other_3']
      },
      inspection: {
        count: 10,
        labels: ['รายละเอียดความเสียหาย 1.', 'รายละเอียดความเสียหาย 2.', 'รายละเอียดความเสียหาย 3.', 'รายละเอียดความเสียหาย 4.', 'รายละเอียดความเสียหาย 5.', 'รายละเอียดความเสียหาย 6.', 'รายละเอียดความเสียหาย 7.', 'รายละเอียดความเสียหาย 8.', 'รายละเอียดความเสียหาย 9.', 'รายละเอียดความเสียหาย 10.'],
        filenames: [],
        idRender: ['damage_images_1', 'damage_images_2', 'damage_images_3', 'damage_images_4', 'damage_images_5', 'damage_images_6', 'damage_images_7', 'damage_images_8', 'damage_images_9', 'damage_images_10']
      },
      around: {
        count: 9,
        labels: ['ภาพถ่ายรอบคัน - ด้านหน้ารถ', 'ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหน้า', 'ภาพถ่ายรอบคัน - ด้านซ้ายตรง', 'ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหลัง', 'ภาพถ่ายรอบคัน - ด้านท้ายรถ', 'ภาพถ่ายรอบคัน - ด้านขวาส่วนหลัง', 'ภาพถ่ายรอบคัน - ด้านขวาตรง', 'ภาพถ่ายรอบคัน - ด้านขวาส่วนหน้า', 'ภาพถ่ายรอบคัน - หลังคา'],
        filenames: [],
        idRender: ['exterior_front', 'exterior_left_front', 'exterior_left_center', 'exterior_left_rear', 'exterior_rear', 'exterior_right_rear', 'exterior_right_center', 'exterior_right_front', 'exterior_roof']
      },
      signature: {
        count: 1,
        labels: ['ลายเซ็น'],
        filenames: [],
        idRender: ['doc_other_9']
      },
      fiber: {
        count: 9,
        labels: ['ใบตรวจสภาพรถ', 'ใบตรวจความเสียหาย', 'ใบตรวจอุปกรณ์ตกแต่ง', 'ใบตรวจกล้องหน้ารถ', 'อื่นๆ', 'อื่นๆ', 'อื่นๆ', 'อื่นๆ', 'อื่นๆ'],
        filenames: [],
        idRender: ['doc_identity', 'doc_other_1', 'doc_other_2', 'doc_other_3', 'doc_other_4', 'doc_other_5', 'doc_other_6', 'doc_other_7', 'doc_other_8']
      }
    };

    document.getElementById('categorySelect').addEventListener('change', function () {
      const selected = this.value;
      const area = document.getElementById('dynamicUploadArea');
      area.innerHTML = ''; // ล้างของเก่า

      if (!selected || !categoryConfig[selected]) return;

      const { count, labels, filenames, idRender } = categoryConfig[selected];

      for (let i = 0; i < count; i++) {
        const group = document.createElement('div');
        group.className = 'mb-3 col-md-6';

        const fileInputId = `fileInput-${selected}-${i + 1}`;

        const labelText = (labels && labels[i]) ? labels[i] : `Item ${i + 1}`;
        const inputValue = (filenames && filenames[i]) ? filenames[i] : '';
        const idRenderValue = (idRender && idRender[i]) ? idRender[i] : selected;

        const isUploaded = uploadedPicCache.has(idRenderValue);
        const fileInputHTML = isUploaded
          ? `<div class="text-danger small">📁 ไฟล์อัปโหลดแล้ว</div>`
          : `<input type="file" class="form-control" id="${fileInputId}" accept="image/*" />`;

        group.innerHTML = `
  <label class="form-label d-block mb-1">${labelText}</label>
  <div class="row g-2 align-items-center">
    <div class="col-6">
      <input type="text" class="form-control" placeholder="ระบุชื่อไฟล์" value="${inputValue}" ${isUploaded ? 'disabled' : ''} />
    </div>
    <div class="col-6">
      ${fileInputHTML}
    </div>
  </div>
`;



        area.appendChild(group);

        // เพิ่ม event สำหรับ input[type="file"] เพื่อ upload ทันที
        setTimeout(() => {
          const fileInput = document.getElementById(fileInputId);
          const textInput = group.querySelector('input[type="text"]');

          fileInput.addEventListener('change', async () => {
            const file = fileInput.files[0];
            if (!file) return;

            const customName = textInput.value.trim() || `image_${i}`;
            const folderName = document.getElementById('taskId')?.value.trim() || 'default';
            const category = selected;

            const formData = new FormData();
            formData.append('folder', folderName);
            formData.append('category', category);
            formData.append('images', file, customName + '.' + file.name.split('.').pop());

            // แสดง progress ชั่วคราว
            const progressWrapper = document.getElementById('uploadProgressWrapper');
            progressWrapper.classList.remove('d-none');

            try {
        const response = await fetch(`${API_BASE_URL}/api/upload/image/transactions`, {
                method: 'POST',
                body: formData
              });

              if (response.ok) {
                const result = await response.json();

                // ✅ อัปเดตรูปใน label ด้วย (ถ้ามี input[name] ตรงกับชื่อ category หรือ img.name)
                const inputElem = document.querySelector(`input[name="${idRenderValue}"]`);
                if (inputElem) {
                  const label = inputElem.closest('label.image-gallery');
                  if (label) {
                    const previewImg = label.querySelector('img');
                    const titleDiv = label.querySelector('.title');
                    const col = label.closest('.col-4'); // ✅ เพิ่มตรงนี้ก่อนใช้ col ด้านล่าง

                    if (previewImg) {
                      previewImg.src = result.uploaded[0].url + '?t=' + new Date().getTime(); // ป้องกัน cache
                      previewImg.style.display = 'block';
                      previewImg.alt = customName || 'uploaded image';
                    }

                    if (titleDiv) {
                      titleDiv.textContent = customName || 'Uploaded Image';
                    }
                    if (col) {
                      col.style.display = 'block'; // ✅ แสดงกรอบ ถ้าเคยถูกซ่อนไว้
                    }
                  }
                }

                //fileInput.disabled = true;
                //textInput.disabled = true;

              } else {
                alert('❌ อัปโหลดไม่สำเร็จ');
              }
            } catch (err) {
              console.error(err);
              alert('🚫 ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
            } finally {
              progressWrapper.classList.add('d-none');
            }
          });
        }, 0); // ให้ DOM render ก่อนแล้วค่อย bind event
      }
    });


  });

document.addEventListener('DOMContentLoaded', function () {
    // Function to decode JWT token
    function parseJwt(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (e) {
        console.error('Failed to decode JWT:', e);
        return null;
      }
    }

    // Function to get user role from token
    function getUserRole() {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      const decoded = parseJwt(token);
      return decoded ? decoded.role : null;
    }

    function applyBikeRoleRestrictions() {
      const userRole = getUserRole();
      console.log('Applying restrictions for role:', userRole);

      if (userRole !== 'Bike') {
        return;
      }

      // Disable all form elements inside the main form
      const form = document.getElementById('taskForm');
      if (form) {
        const elements = form.querySelectorAll('input, textarea, select, button');
        elements.forEach(el => {
          // Don't disable the file inputs for image upload
          if (el.type !== 'file') {
            el.disabled = true;
          }
        });
      }

      // Re-enable the specific image upload functionality
      // The image galleries in the 'ข้อมูลรูปภาพ' tab
      document.querySelectorAll('.image-gallery input[type="file"]').forEach(input => {
        input.disabled = false;
        // Also enable the label to allow clicking
        const label = input.closest('.image-gallery');
        if (label) {
            // We can't "enable" a label, but we can make sure it's clickable.
            // The disabling of child buttons might be an issue, let's re-enable them.
            label.querySelectorAll('button').forEach(btn => btn.disabled = false);
        }
      });
      
      // Re-enable the 'Upload Picture' tab functionality
      const uploadTab = document.getElementById('tab-upload');
      if(uploadTab){
        const uploadElements = uploadTab.querySelectorAll('input, select, button');
        uploadElements.forEach(el => {
            el.disabled = false;
        });
      }


      // Disable tab buttons except for 'ข้อมูลรูปภาพ' and 'Upload Picture'
      const tabButtons = document.querySelectorAll('.nav-tabs .nav-link');
      tabButtons.forEach(button => {
        const target = button.getAttribute('data-bs-target');
        if (target !== '#tab-contact' && target !== '#tab-upload') {
          button.disabled = true;
        } else {
          button.disabled = false; // Explicitly enable the allowed tabs
        }
      });
      
      // Ensure the correct tab is shown if others are disabled
        const contactTabButton = document.querySelector('button[data-bs-target="#tab-contact"]');
        const homeTabButton = document.querySelector('button[data-bs-target="#tab-home"]');
        const contactTabPane = document.getElementById('tab-contact');
        const homeTabPane = document.getElementById('tab-home');

        if(contactTabButton && homeTabButton && contactTabPane && homeTabPane){
            homeTabButton.classList.remove('active');
            homeTabPane.classList.remove('active', 'show');
            contactTabButton.classList.add('active');
            contactTabPane.classList.add('active', 'show');
        }


      // Specifically disable the main submit button at the bottom
      const mainSubmitBtn = document.getElementById('submittaskBtn');
      if (mainSubmitBtn) {
        mainSubmitBtn.disabled = true;
        mainSubmitBtn.style.display = 'none'; // Also hide it
      }
    }

    applyBikeRoleRestrictions();
  });

