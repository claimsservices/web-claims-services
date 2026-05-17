/**
 * API Access JS
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

  // API Token Generation Logic
  const generateApiTokenBtn = document.getElementById('generateApiToken');
  const apiTokenInput = document.getElementById('apiToken');
  const copyApiTokenBtn = document.getElementById('copyApiToken');

  if (generateApiTokenBtn) {
    generateApiTokenBtn.addEventListener('click', async () => {
      if (!confirm('คุณต้องการสร้าง API Token ใหม่ใช่หรือไม่? (Token นี้จะไม่มีวันหมดอายุ)')) return;

      generateApiTokenBtn.disabled = true;
      generateApiTokenBtn.innerText = 'Generating...';

      try {
        const response = await fetch(`https://be-claims-service.onrender.com/api/auth/generate-api-token`, {
          method: 'POST',
          headers: {
            'Authorization': token
          }
        });

        const data = await response.json();
        if (response.ok) {
          apiTokenInput.value = data.token;
          
          // Update documentation examples with the new token
          const codeExamples = document.querySelectorAll('.tab-content code');
          codeExamples.forEach(code => {
            code.innerHTML = code.innerHTML.replace(/YOUR_TOKEN/g, data.token);
          });

          alert('สร้าง API Token สำเร็จ! โปรดคัดลอกและเก็บรักษาให้ปลอดภัย');
        } else {
          alert('Error: ' + data.message);
        }
      } catch (error) {
        console.error('Error generating API token:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      } finally {
        generateApiTokenBtn.disabled = false;
        generateApiTokenBtn.innerText = 'Generate API Token';
      }
    });
  }

  if (copyApiTokenBtn) {
    copyApiTokenBtn.addEventListener('click', () => {
      const tokenValue = apiTokenInput.value;
      if (!tokenValue) {
        alert('ยังไม่มี Token ให้คัดลอก');
        return;
      }

      navigator.clipboard.writeText(tokenValue).then(() => {
        const originalText = copyApiTokenBtn.innerText;
        copyApiTokenBtn.innerText = 'Copied!';
        setTimeout(() => {
          copyApiTokenBtn.innerText = originalText;
        }, 2000);
      }).catch(err => {
        console.error('Could not copy text: ', err);
        apiTokenInput.select();
        document.execCommand('copy');
        alert('คัดลอก Token เรียบร้อยแล้ว');
      });
    });
  }
})();
