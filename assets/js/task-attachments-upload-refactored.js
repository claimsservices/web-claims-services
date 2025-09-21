// Check if the user has a valid token and the required role
    const accessToken = localStorage.getItem('authToken'); // Check if token is available
    const RETURN_LOGIN_PAGE = '../index.html';

    // If there's no token, redirect to login
    if (!accessToken) {
      window.location.href = RETURN_LOGIN_PAGE;
    }

const API_BASE_URL = 'http://localhost:8181';
    document.addEventListener('DOMContentLoaded', () => {

      const container = document.getElementById('other-image-row');
  
  // เริ่ม index ที่ 13 เพราะกล่องแรกชื่อ interior_13
  let currentIndex = 14;
  
  container.addEventListener('change', async (e) => {
    const input = e.target;
    if (input.type === 'file' && input.files.length > 0) {
      const label = input.closest('label');
      const img = label.querySelector('img');
      const icon = label.querySelector('i');
      const titleDiv = label.querySelector('.title');
      const file = input.files[0];

      // แสดง preview รูป
      const reader = new FileReader();
      reader.onload = function (e) {
        img.src = e.target.result;
        img.style.display = 'block';
        icon.style.display = 'none';
      };
      reader.readAsDataURL(file);

      // เปลี่ยน <div class="title"> → <input type="text">
      if (titleDiv) {
        const inputTitle = document.createElement('input');
        inputTitle.type = 'text';
        inputTitle.className = 'form-control form-control-sm text-center mt-2 title-input';
        inputTitle.placeholder = 'ชื่อภาพ';
        titleDiv.replaceWith(inputTitle);
      }

      // ป้องกันสร้างกล่องใหม่ซ้ำ
      if (label.dataset.generated === 'true') return;
      label.dataset.generated = 'true';

      // เพิ่ม index ไป 1
      currentIndex++;

      // สร้างกล่องใหม่ "อื่นๆ" พร้อมชื่อ name เพิ่มทีละ 1
const newBox = document.createElement('div');
newBox.className = 'col-md-4 col-lg-3 mb-3 text-center custom-other-upload';
newBox.innerHTML = `
  <label class="image-gallery w-100" style="cursor:pointer;">
    <img alt="Preview" class="preview-img" style="display:none;       width:100%; height:150px; object-fit:cover;"       />
    <i class="bi bi-camera fs-1"></i>
    <div class="title">อื่นๆ</div>
          <input type="file" name="interior_${currentIndex}" accept="image/*" capture="environment" hidden>
  </label>
`;
container.appendChild(newBox);

// ผูก event upload กับ input ใหม่
const newInput = newBox.querySelector('input[type="file"]');
bindFileInput(newInput);
uploadingStatus.set(newInput, false);

    }
  });

  document.querySelectorAll('section.upload-section label.image-gallery input[type="file"]').forEach(input => {
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const label = e.target.closest('label');
    const img = label.querySelector('img');
    const icon = label.querySelector('i');
    const titleDiv = label.querySelector('.title');

    // แสดงรูป preview
    const reader = new FileReader();
    reader.onload = function(evt) {
      img.src = evt.target.result;
      img.style.display = 'block';
      icon.style.display = 'none';
    };
    reader.readAsDataURL(file);

    // ถ้าเจอ div.title ให้แปลงเป็น input สำหรับแก้ชื่อ
    if (titleDiv) {
      const currentTitle = titleDiv.innerText;
      const inputTitle = document.createElement('input');
      inputTitle.type = 'text';
      inputTitle.className = 'form-control form-control-sm mt-2 title-input text-center';
      inputTitle.value = currentTitle;
      inputTitle.placeholder = 'แก้ไขชื่อภาพ...';

      // แทนที่ div.title ด้วย input
      titleDiv.replaceWith(inputTitle);
    }
  });
});



      const UPLOAD_API_URL = `${API_BASE_URL}/api/upload/image/transactions`;
      const LOGIN_PAGE = '/index.html';
      const RETURN_LOGIN_PAGE = '/index.html';

      // CSS skeleton loading style
      const skeletonStyle = `
    .skeleton {
      background-color: #e0e0e0;
      border-radius: 0.375rem;
      width: 120px;
      height: 120px;
      animation: pulse 1.5s infinite ease-in-out;
      display: inline-block;
    }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
  `;

      // ใส่ style ลงใน <head> ถ้ายังไม่มี
      if (!document.getElementById('skeleton-style')) {
        const styleTag = document.createElement('style');
        styleTag.id = 'skeleton-style';
        styleTag.innerHTML = skeletonStyle;
        document.head.appendChild(styleTag);
      }

      const uploadingStatus = new Map();

      // อัปโหลดหลายไฟล์พร้อม preview
      async function uploadMultipleFiles(input) {
        if (uploadingStatus.get(input)) return;
        uploadingStatus.set(input, true);

        const files = Array.from(input.files);
        if (!files.length) {
          uploadingStatus.set(input, false);
          return;
        }

        const label = input.closest('label');
        const previewContainer = label.querySelector('.multiple-preview');
        const icon = label.querySelector('i');

        if (!previewContainer || !icon) {
          console.warn('ไม่พบ .multiple-preview หรือ icon ใน label');
          uploadingStatus.set(input, false);
          return;
        }

        icon.style.display = 'none';

        // ล้าง preview เดิม แล้วแสดง skeleton
        previewContainer.innerHTML = '';
        for (let i = 0; i < files.length; i++) {
          const skeleton = document.createElement('div');
          skeleton.classList.add('skeleton');
          skeleton.style.marginRight = '8px';
          previewContainer.appendChild(skeleton);
        }

        try {
          for (const file of files) {
            const formData = new FormData();
            const orderId = document.getElementById('job-code').value
            formData.append('folder', orderId);
            formData.append('images', stampedFile);

            const res = await fetch(UPLOAD_API_URL, {
              method: 'POST',
              body: formData
            });

            if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);

            const data = await res.json();
            console.log('Upload response:', data); // DEBUG

            if (data.uploaded && data.uploaded.length > 0) {
              const firstSkeleton = previewContainer.querySelector('.skeleton');
              if (firstSkeleton) firstSkeleton.remove();

              const img = document.createElement('img');
              img.src = data.uploaded[0].url;
              img.alt = 'Uploaded Damage Image';
              img.style.width = '120px';
              img.style.height = '120px';
              img.style.objectFit = 'cover';
              img.style.borderRadius = '0.375rem';
              img.style.border = '1px solid #ccc';
              img.style.marginRight = '8px';
              img.style.display = 'inline-block'; // ✅ สำคัญ!

              previewContainer.appendChild(img);
            } else {
              alert('อัปโหลดไม่สำเร็จ: ไม่มี URL กลับมาสำหรับไฟล์ ' + file.name);
            }
          }
        } catch (error) {
          alert('เกิดข้อผิดพลาดในการอัปโหลด: ' + error.message);
        } finally {
          previewContainer.querySelectorAll('.skeleton').forEach(skel => skel.remove());
          icon.classList.remove('spinner-border');
          icon.style.display = 'none';
          uploadingStatus.set(input, false);
        }
      }

      // 🔧 ฝัง timestamp ลงในภาพ
      async function addTimestampToImage(file) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

              canvas.width = img.width;
              canvas.height = img.height;

              ctx.drawImage(img, 0, 0);

              const timestamp = new Date().toLocaleString('th-TH', {
                dateStyle: 'short',
                timeStyle: 'short'
              });

              const fontSize = Math.floor(canvas.width * 0.035);
              ctx.font = `${fontSize}px Arial`;
              const textWidth = ctx.measureText(timestamp).width;

              ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
              ctx.fillRect(20, canvas.height - 60, textWidth + 20, 40);

              ctx.fillStyle = 'white';
              ctx.fillText(timestamp, 30, canvas.height - 30);

              canvas.toBlob((blob) => {
                const newFile = new File([blob], file.name, { type: 'image/jpeg' });
                resolve(newFile);
              }, 'image/jpeg', 0.9);
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        });
      }


      // อัปโหลดไฟล์เดียว (ใช้กรณี input ไม่ได้เป็น multiple)
      // อัปโหลดไฟล์เดียว (ฝังวันที่ก่อนอัปโหลด)
      async function uploadSingleFile(input) {
        if (uploadingStatus.get(input)) return;
        uploadingStatus.set(input, true);

        const file = input.files[0];
        if (!file) {
          uploadingStatus.set(input, false);
          return;
        }

        const label = input.closest('label');
        const img = label.querySelector('img');
        const icon = label.querySelector('i');

        if (!img || !icon) {
          console.warn('ไม่พบ img หรือ icon ใน label');
          uploadingStatus.set(input, false);
          return;
        }

        icon.style.display = 'none';
        img.style.display = 'none';

        let skeleton = label.querySelector('.skeleton');
        if (!skeleton) {
          skeleton = document.createElement('div');
          skeleton.classList.add('skeleton');
          label.appendChild(skeleton);
        }

        // ✅ ฝังวันที่ลงในภาพก่อนอัปโหลด
        let stampedFile;
        try {
          stampedFile = await addTimestampToImage(file);
        } catch (err) {
          alert('ไม่สามารถฝังวันที่ลงในภาพได้');
          if (skeleton) skeleton.remove();
          uploadingStatus.set(input, false);
          return;
        }

        const formData = new FormData();
        const orderId = document.getElementById('job-code').value
        formData.append('folder', orderId);
        const inputName = input.name || 'uploaded'; // fallback เผื่อไม่มี name
        const renamedFile = new File(
          [stampedFile],
          `${inputName}-${Date.now()}.jpg`,
          { type: stampedFile.type }
        );
        formData.append('images', renamedFile);


        try {
          const res = await fetch(UPLOAD_API_URL, {
            method: 'POST',
            body: formData
          });
          if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);

          const data = await res.json();
          if (data.uploaded && data.uploaded.length > 0) {
            img.src = data.uploaded[0].url;
            img.style.display = 'block';
            if (skeleton) skeleton.remove();
            icon.style.display = 'none';
          } else {
            alert('อัปโหลดไม่สำเร็จ: ไม่มี URL กลับมา');
            if (skeleton) skeleton.remove();
            icon.style.display = 'inline-block';
            img.style.display = 'none';
          }
        } catch (error) {
          alert('เกิดข้อผิดพลาดในการอัปโหลด: ' + error.message);
          if (skeleton) skeleton.remove();
          icon.style.display = 'inline-block';
          img.style.display = 'none';
        } finally {
          icon.classList.remove('spinner-border');
          uploadingStatus.set(input, false);
        }
      }


      // ผูก event ให้ input ทุกตัว
      function bindFileInput(input) {
        if (input._uploadHandler) {
          input.removeEventListener('change', input._uploadHandler);
        }

        const handler = (e) => {
          e.preventDefault();
          if (uploadingStatus.get(input)) return;
          if (input.multiple) {
            uploadMultipleFiles(input);
          } else {
            uploadSingleFile(input);
          }
        };

        input.addEventListener('change', handler);
        input._uploadHandler = handler;
      }

      document.querySelectorAll('input[type="file"]').forEach(input => {
        uploadingStatus.set(input, false);
        bindFileInput(input);
      });

      // --- JWT & PROFILE ---
      function decodeJWT(token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          return JSON.parse(atob(base64));
        } catch (e) {
          console.error('Failed to decode JWT:', e);
          return null;
        }
      }

      function isTokenExpired(decodedToken) {
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken && decodedToken.exp && decodedToken.exp < currentTime;
      }

      async function loadUserProfile() {
        const token = localStorage.getItem('authToken');

        if (!token) {
          window.location.href = LOGIN_PAGE;
          return;
        }

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

        const decoded = parseJwt(token);

        const id = decoded.id;
        const userName = decoded.username;
        const fname = decoded.first_name;
        const lname = decoded.last_name;
        const email = decoded.email;
        const role = decoded.role;
        const myPicture = decoded.myPicture;

        document.getElementById('user-info').innerText = fname + ' ' + lname;
        document.getElementById('user-role').innerText = role;

        const imageUrl = myPicture;  // Extract the image URL from the response
        const imgElement = document.getElementById('userAvatar');
        imgElement.src = imageUrl;  // Update the image src dynamically



        const decodedToken = decodeJWT(token);
        if (!decodedToken || isTokenExpired(decodedToken)) {
          localStorage.removeItem('authToken');
          alert('Session expired. Please login again.');
          window.location.href = RETURN_LOGIN_PAGE;
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: { Authorization: token },
          });
          if (response.ok) {
            const userProfile = await response.json();
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          localStorage.removeItem('authToken');
          window.location.href = RETURN_LOGIN_PAGE;
        }
      }

      loadUserProfile();

      const logoutBtn = document.getElementById('logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('authToken');
          window.location.href = RETURN_LOGIN_PAGE;
        });
      }
    });


    async function loadOrderData(orderId) {
      const token = localStorage.getItem('authToken') || '';

      try {
        const response = await fetch(`${API_BASE_URL}/api/order-detail-agent/inquiry`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({ order_id: orderId })
        });

        const result = await response.json();
        if (!response.ok) {
          alert('❌ ไม่พบข้อมูล: ' + result.message);
          return;
        }

        const { order, order_details } = result;
        renderOrderDetails(order, order_details);
        handleOrderStatus(order.order_status || "เปิดงาน");

      } catch (err) {
        alert('❌ ไม่สามารถโหลดข้อมูลได้');
        console.error('Inquiry Error:', err);
      }
    }

    function renderOrderDetails(order, details) {
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.location)}`;

      // Order Info
      document.getElementById('job-code').value = order.id;
      document.getElementById('insurance-company').value = order.insur_comp;
      document.getElementById('car-plate').value = order.car_registration;
      document.getElementById('customer-address').value = order.location;
      document.getElementById('open-map').href = mapUrl;

      // Customer Details
      if (details) {
        document.getElementById('phone').value = details.full_phone;
        document.getElementById('province-category').value = details.c_car_province;
        document.getElementById('car-brand').value = details.c_brand;
        document.getElementById('car-model').value = details.c_version;
        document.getElementById('vin').value = details.c_number;
        document.getElementById('customer-name').value = details.c_name;
      }
    }

    // ========== Status & UI Control ==========
    const statusStepMap = {
      "เปิดงาน": 1,
      "รับเรื่องแล้ว": 2,
      "รับงาน": 3,
      "เริ่มงาน/กำลังเดินทาง": 4,
      "ถึงที่เกิดเหตุ/ปฏิบัติงาน": 5,
      "ปฏิเสธงาน": -1
    };

    function handleOrderStatus(status) {
      updateProgressVisual(status);
      toggleActionButtons(status);
      toggleUploadSection(status);
    }

    function updateProgressVisual(status) {
      let activeSteps = 0;

      switch (status) {
        case "รับงาน":
          activeSteps = 1;
          break;
        case "เริ่มงาน/กำลังเดินทาง":
          activeSteps = 2;
          break;
        case "ถึงที่เกิดเหตุ/ปฏิบัติงาน":
          activeSteps = 3;
          break;
        case "ส่งงาน/ตรวจสอบเบื้องต้น":
          activeSteps = 4;
          break;
        default:
          activeSteps = 0; // ถ้า status ไม่ตรงกับที่กำหนด จะไม่ไฮไลท์เลย
      }

      const percent = ((activeSteps - 1) / 3) * 100; // progress bar มี 4 step รวม 3 ช่วง

      document.getElementById('progressFill').style.width = percent + '%';

      for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`step${i}`);
        stepEl.classList.remove('active');
        if (i <= activeSteps) stepEl.classList.add('active');
      }
    }



    function toggleActionButtons(status) {
      const allButtons = ['btn-accept', 'btn-reject', 'btn-start', 'btn-arrived'];
      allButtons.forEach(id => document.getElementById(id).style.display = 'none');

      switch (status) {
        case "เปิดงาน":
        case "รับเรื่องแล้ว":
          show(['btn-accept', 'btn-reject']);
          break;
        case "รับงาน":
          show(['btn-start']);
          break;
        case "เริ่มงาน/กำลังเดินทาง":
          show(['btn-arrived']);
          break;
      }

      function show(ids) {
        ids.forEach(id => document.getElementById(id).style.display = 'inline-block');
      }
    }

    function toggleUploadSection(status) {
      const uploadSections = document.querySelectorAll('.upload-section'); // ดึงทุกอัน
      const isVisible = status === "ถึงที่เกิดเหตุ/ปฏิบัติงาน";

      uploadSections.forEach(section => {
        section.style.display = (status === "ถึงที่เกิดเหตุ/ปฏิบัติงาน") ? 'block' : 'none';
      });

      const uploadActions = document.querySelector('.upload-actions');
      if (uploadActions) {
        uploadActions.style.display = isVisible ? 'block' : 'none';
      }
    }

    // ========== Status Button Event ==========
    function setStatusFromClick(newStatus) {
      console.log('🟢 อัปเดตสถานะเป็น:', newStatus);
      // TODO: ส่ง newStatus ไป backend (เช่น fetch API เพื่ออัปเดต)
      handleOrderStatus(newStatus);
    }

    async function setStatusFromClick(newStatus) {
      console.log('🟢 อัปเดตสถานะเป็น:', newStatus);

      const token = localStorage.getItem('authToken') || '';
      const orderId = new URLSearchParams(window.location.search).get('id');
      if (!orderId) return alert('ไม่พบรหัสงาน');

      try {
        const response = await fetch(`${API_BASE_URL}/api/order-status/update/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({
            order_status: newStatus,
            order_hist: [
              {
                icon: 'check',
                task: newStatus,
                detail: 'อัปเดตสถานะโดยพนักงานภาคสนาม',
                created_by: 'FieldAgent' // หรือดึงชื่อจาก token ถ้ามี
              }
            ]
          })
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('❌ Error:', result.message || result);
          return alert('อัปเดตสถานะไม่สำเร็จ');
        }

        // ✅ สำเร็จ: อัปเดต UI
        alert('✅ อัปเดตสถานะเรียบร้อย');
        handleOrderStatus(newStatus);

      } catch (err) {
        console.error('❌ API Error:', err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }
    }


    async function uploadOrderPics(status, updated_by) {
      const orderId = new URLSearchParams(window.location.search).get('id');
      if (!orderId) return alert('ไม่พบรหัสงาน');

      const orderPic = [];
      const sections = document.querySelectorAll('.upload-section');

      sections.forEach(section => {
        const imgTags = section.querySelectorAll('img');

        imgTags.forEach(img => {
          // ถ้ารูปถูกลบไปแล้ว ไม่ต้องเอาไป push
          if (!img.src || img.style.display === 'none' || !img.src.startsWith('http')) return;

          const input = img.closest('label')?.querySelector('input[type="file"]');
          const picType = input?.name || 'unknown';
          const label = input.closest('label');

          // ถ้าเจอ div.title ให้ใช้ innerText  
          // ถ้าไม่เจอ ให้ลองหา input.title-input แทน (กรณีแก้ชื่อแล้ว)
          const titleDiv = label.querySelector('.title');
          const titleInput = label.querySelector('.title-input');

const title = titleInput ? titleInput.value : (titleDiv ? titleDiv.innerText : '');

          if (imgUrl && imgUrl.startsWith('http')) {
            orderPic.push({
              pic: imgUrl, // ✅ ใช้ URL แทน base64
              pic_type: picType,
              pic_title: title,
              created_by: updated_by
            });
          }
        });
      });

      const payload = {
        order_status: status,
        updated_by: updated_by,
        order_pic: orderPic,
        order_hist: [
          {
            icon: 'check',
            task: status,
            detail: 'อัปโหลดภาพแล้ว',
            created_by: updated_by
          }
        ]
      };

      try {
        const token = localStorage.getItem('authToken') || '';
        const response = await fetch(`${API_BASE_URL}/api/order-pic/update/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) {
          alert('อัปโหลดไม่สำเร็จ: ' + (result.message || ''));
          return;
        }

        alert('📸 ส่งข้อมูลภาพสำเร็จแล้ว!');
      } catch (err) {
        alert('❌ เกิดข้อผิดพลาดขณะส่งข้อมูล');
        console.error(err);
      }
    }


    document.getElementById('uploadBtn').addEventListener('click', async () => {
      await uploadOrderPics('รออนุมัติ', 'FieldAgent');
      setTimeout(() => window.location.reload(), 1000); // หน่วง 1 วิให้ผู้ใช้เห็น alert
    });

    const uploadedPicCache = new Set();
    document.getElementById('callBtn').addEventListener('click', function () {
      const phoneInput = document.getElementById('phone');
      const number = phoneInput.value.trim();

      if (number) {
        window.location.href = 'tel:' + number;
        uploadedPicCache.add(number);
      } else {
        alert('⚠️ ไม่พบเบอร์ติดต่อ');
      }
    });


    // ========== Page Init ==========
    window.addEventListener('DOMContentLoaded', async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('id');
      if (orderId) {
        await loadOrderData(orderId); // ✅ รอโหลดข้อมูลให้เสร็จก่อน
      }
      document.body.classList.remove('loading'); // ✅ แล้วค่อยแสดง content
    });

    document.querySelectorAll('.image-gallery input[type="file"]').forEach(input => {
      input.addEventListener('change', event => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
          const img = new Image();
          img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            // วาดภาพ
            ctx.drawImage(img, 0, 0);

            // เขียนวันที่
            const now = new Date().toLocaleString("th-TH", {
              dateStyle: "short", timeStyle: "short"
            });
            ctx.font = `${Math.floor(canvas.width * 0.03)}px Arial`;
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(20, canvas.height - 60, ctx.measureText(now).width + 30, 40);
            ctx.fillStyle = "white";
            ctx.fillText(now, 30, canvas.height - 30);

            // preview ภาพลง img
            const dataURL = canvas.toDataURL("image/jpeg", 0.9);
            const previewImg = input.closest('label').querySelector('img');
            previewImg.src = dataURL;
            previewImg.style.display = 'block';

            // ส่ง image base64 ไปเซิร์ฟเวอร์ก็ได้ (optional)
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });

      
    });

