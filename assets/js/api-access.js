/**
 * API Access - Self-Service Portal JS
 */

'use strict';

(function () {
  const token = localStorage.getItem('authToken');
  const LOGIN_PAGE = '../index.html';

  if (!token) {
    window.location.href = LOGIN_PAGE;
    return;
  }

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
      return null;
    }
  }

  const decoded = parseJwt(token);
  if (!decoded) {
    window.location.href = LOGIN_PAGE;
    return;
  }

  // Update User Info in Header
  const fname = decoded.first_name || '';
  const lname = decoded.last_name || '';
  const role = decoded.role || '';
  const myPicture = decoded.myPicture;

  const userInfoEl = document.getElementById('user-info');
  const userRoleEl = document.getElementById('user-role');
  const userAvatarEl = document.getElementById('userAvatar');

  if (userInfoEl) userInfoEl.innerText = `${fname} ${lname}`;
  if (userRoleEl) userRoleEl.innerText = role;
  if (userAvatarEl && myPicture) userAvatarEl.src = myPicture;

  // Logout logic
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      localStorage.removeItem('authToken');
      window.location.href = LOGIN_PAGE;
    });
  }

  const logoutMenuBtn = document.getElementById('logout-menu');
  if (logoutMenuBtn) {
    logoutMenuBtn.addEventListener('click', function (e) {
      e.preventDefault();
      localStorage.removeItem('authToken');
      window.location.href = LOGIN_PAGE;
    });
  }

  // ==========================================
  // SELF-SERVICE API PORTAL CORE LOGIC
  // ==========================================

  const tokenListTableBody = document.getElementById('tokenListTableBody');
  const btnConfirmCreateToken = document.getElementById('btnConfirmCreateToken');
  const tokenNameInput = document.getElementById('tokenNameInput');
  const allowedIpsInput = document.getElementById('allowedIpsInput');

  const editTokenId = document.getElementById('editTokenId');
  const editTokenNameInput = document.getElementById('editTokenNameInput');
  const editAllowedIpsInput = document.getElementById('editAllowedIpsInput');
  const btnConfirmEditToken = document.getElementById('btnConfirmEditToken');

  // ฟังก์ชันดึงรายการ Tokens ทั้งหมดและแสดงในตาราง
  async function fetchAndRenderTokens() {
    if (!tokenListTableBody) return;
    
    tokenListTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">กำลังโหลด...</span>
          </div>
          <span class="ms-2">กำลังโหลดข้อมูลโทเคน...</span>
        </td>
      </tr>
    `;

    try {
      // **กฎพิเศษ: ใช้ HARDCODED URL เสมอตาม GEMINI.md**
      const response = await fetch('https://be-claims-service.onrender.com/api/user-tokens', {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลโทเคนได้');
      }

      const tokens = await response.json();
      renderTokenTable(tokens);

    } catch (error) {
      console.error('Error fetching tokens:', error);
      tokenListTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-danger">
            <i class="bx bx-error-circle me-1"></i> เกิดข้อผิดพลาดในการโหลดข้อมูลโทเคน
          </td>
        </tr>
      `;
    }
  }

  // เรนเดอร์ตาราง
  function renderTokenTable(tokens) {
    if (tokens.length === 0) {
      tokenListTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-muted">
            <i class="bx bx-info-circle me-1"></i> ยังไม่มี API Token ในระบบ คลิกสร้างเพื่อเริ่มต้นใช้งาน
          </td>
        </tr>
      `;
      return;
    }

    tokenListTableBody.innerHTML = tokens.map(t => {
      const createdDate = new Date(t.created_at).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // จัดการแสดงผล IP Whitelist
      let ipDisplay = '';
      if (t.allowed_ips && t.allowed_ips.length > 0) {
        ipDisplay = t.allowed_ips.map(ip => `<span class="badge bg-label-secondary me-1" style="font-family: monospace;">${ip}</span>`).join('');
      } else {
        ipDisplay = '<span class="badge bg-label-success">🌍 ไม่จำกัด IP (Any IP)</span>';
      }

      const allowedIpsString = t.allowed_ips ? t.allowed_ips.join(', ') : '';

      // ส่วนจัดการเรนเดอร์ช่อง Token พร้อมปุ่ม Copy (ตามคำแนะนำ UX ที่ยอดเยี่ยม)
      const tokenInputHtml = `
        <div class="input-group input-group-sm" style="max-width: 250px;">
          <input type="text" class="form-control form-control-sm font-monospace" value="${t.token_value}" readonly style="font-size: 0.7rem; background-color: #f5f5f5;">
          <button class="btn btn-outline-primary btn-copy-row-token" type="button" data-token="${t.token_value}">
            <i class="bx bx-copy"></i>
          </button>
        </div>
      `;

      return `
        <tr>
          <td>
            <div class="d-flex align-items-center">
              <i class="bx bx-key text-primary me-2 fs-4"></i>
              <span class="fw-semibold">${escapeHtml(t.token_name)}</span>
            </div>
          </td>
          <td>${tokenInputHtml}</td>
          <td>${ipDisplay}</td>
          <td><small class="text-muted">${createdDate}</small></td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1 btn-edit-token" 
                    data-id="${t.id}" 
                    data-name="${escapeHtml(t.token_name)}" 
                    data-ips="${escapeHtml(allowedIpsString)}">
              <i class="bx bx-edit-alt me-1"></i> ตั้งค่า IP
            </button>
            <button class="btn btn-sm btn-outline-danger btn-delete-token" data-id="${t.id}">
              <i class="bx bx-trash-alt me-1"></i> ลบ
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // ผูก Event Listeners สำหรับปุ่มจัดการต่างๆ หลังเรนเดอร์เสร็จ
    bindTableActionEvents();
  }

  // ผูก Event สำหรับปุ่ม ลบ และ แก้ไข ในตาราง
  function bindTableActionEvents() {
    // 1. ปุ่มคัดลอก Token ในตาราง (ดึงจากแถวตรงๆ ได้เลยเพื่อความพรีเมียม!)
    const copyRowBtns = document.querySelectorAll('.btn-copy-row-token');
    copyRowBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tokenVal = btn.getAttribute('data-token');
        if (!tokenVal) return;

        navigator.clipboard.writeText(tokenVal).then(() => {
          // เปลี่ยนไอคอนและสไตล์ชั่วคราวเพื่อตอบสนองการกด (Micro-interaction)
          const iconEl = btn.querySelector('i');
          iconEl.className = 'bx bx-check text-success';
          btn.classList.remove('btn-outline-primary');
          btn.classList.add('btn-outline-success');

          setTimeout(() => {
            iconEl.className = 'bx bx-copy';
            btn.classList.remove('btn-outline-success');
            btn.classList.add('btn-outline-primary');
          }, 1500);
        }).catch(err => {
          // Fallback ในกรณีสิทธิ์การเข้าถึง clipboard บนเบราว์เซอร์ติดขัด
          const inputEl = btn.previousElementSibling;
          if (inputEl) {
            inputEl.select();
            document.execCommand('copy');
            alert('คัดลอก Token เรียบร้อยแล้ว');
          }
        });
      });
    });

    // 2. ปุ่มลบ Token
    const deleteBtns = document.querySelectorAll('.btn-delete-token');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const tokenId = btn.getAttribute('data-id');
        if (!confirm('🛑 คำเตือน: คุณแน่ใจว่าต้องการลบและยกเลิกสิทธิ์โทเคนนี้ใช่หรือไม่? ระบบภายนอกที่เชื่อมต่อด้วยโทเคนนี้จะไม่สามารถใช้งานได้ทันที!')) return;

        btn.disabled = true;
        try {
          // **กฎพิเศษ: ใช้ HARDCODED URL เสมอตาม GEMINI.md**
          const response = await fetch(`https://be-claims-service.onrender.com/api/user-tokens/${tokenId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': token
            }
          });

          const data = await response.json();
          if (response.ok) {
            alert('ยกเลิกสิทธิ์และลบโทเคนเรียบร้อยแล้ว');
            fetchAndRenderTokens();
          } else {
            alert('Error: ' + data.message);
            btn.disabled = false;
          }
        } catch (error) {
          console.error('Error deleting token:', error);
          alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
          btn.disabled = false;
        }
      });
    });

    // 3. ปุ่มเปิดหน้าต่างแก้ไข IP
    const editBtns = document.querySelectorAll('.btn-edit-token');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const ips = btn.getAttribute('data-ips');

        editTokenId.value = id;
        editTokenNameInput.value = name;
        editAllowedIpsInput.value = ips;

        // เรียกใช้งาน Modal ผ่าน jQuery เพื่อความเสถียร
        $('#editTokenModal').modal('show');
      });
    });
  }

  // บันทึกการแก้ไข Token (Edit IPs)
  if (btnConfirmEditToken) {
    btnConfirmEditToken.addEventListener('click', async () => {
      const tokenId = editTokenId.value;
      const tokenName = editTokenNameInput.value.trim();
      const allowedIps = editAllowedIpsInput.value.trim();

      if (!tokenName) {
        alert('กรุณากรอกชื่อโทเคน');
        return;
      }

      btnConfirmEditToken.disabled = true;
      btnConfirmEditToken.innerText = 'กำลังบันทึก...';

      try {
        // **กฎพิเศษ: ใช้ HARDCODED URL เสมอตาม GEMINI.md**
        const response = await fetch(`https://be-claims-service.onrender.com/api/user-tokens/${tokenId}`, {
          method: 'PUT',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token_name: tokenName,
            allowed_ips: allowedIps
          })
        });

        const data = await response.json();
        if (response.ok) {
          // ปิด Modal
          $('#editTokenModal').modal('hide');
          
          alert('ปรับปรุงข้อมูลโทเคนเรียบร้อยแล้ว');
          fetchAndRenderTokens();
        } else {
          alert('Error: ' + data.message);
        }
      } catch (error) {
        console.error('Error updating token:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลโทเคน');
      } finally {
        btnConfirmEditToken.disabled = false;
        btnConfirmEditToken.innerText = 'บันทึกการแก้ไข';
      }
    });
  }

  // สร้าง Token ใหม่ (Create/Generate Token)
  if (btnConfirmCreateToken) {
    btnConfirmCreateToken.addEventListener('click', async () => {
      const tokenName = tokenNameInput.value.trim();
      const allowedIps = allowedIpsInput.value.trim();

      if (!tokenName) {
        alert('กรุณากรอกชื่อโทเคน (เช่น Server หลัก)');
        return;
      }

      btnConfirmCreateToken.disabled = true;
      btnConfirmCreateToken.innerText = 'กำลังสร้าง...';

      try {
        // **กฎพิเศษ: ใช้ HARDCODED URL เสมอตาม GEMINI.md**
        const response = await fetch('https://be-claims-service.onrender.com/api/user-tokens', {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token_name: tokenName,
            allowed_ips: allowedIps
          })
        });

        const data = await response.json();
        if (response.ok) {
          // ปิด Modal การสร้าง ผ่าน jQuery
          $('#createTokenModal').modal('hide');

          // ล้างค่าอินพุต
          tokenNameInput.value = '';
          allowedIpsInput.value = '';

          // แจ้งเตือนความสำเร็จ และโหลดตารางใหม่เพื่อคัดลอกจากตารางได้ทันที!
          alert('สร้าง API Token สำเร็จแล้ว! คุณสามารถคัดลอก Token ตัวเต็มไปใช้งานได้ทันทีจากตารางรายการโทเคนด้านล่างได้เลยครับ');
          
          // โหลดรายการใหม่
          fetchAndRenderTokens();
        } else {
          alert('Error: ' + data.message);
        }
      } catch (error) {
        console.error('Error generating token:', error);
        alert('เกิดข้อผิดพลาดในการส่งข้อมูลสร้างโทเคน');
      } finally {
        btnConfirmCreateToken.disabled = false;
        btnConfirmCreateToken.innerText = 'สร้าง Token';
      }
    });
  }

  // Helper: ป้องกัน XSS
  function escapeHtml(string) {
    if (!string) return '';
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // เริ่มต้นทำงานดึงข้อมูล Token
  document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderTokens();
  });

})();
