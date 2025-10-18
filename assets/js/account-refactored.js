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

import { API_BASE_URL } from './api-config.js';
      // Constants for URLs and other fixed strings
      const LOGIN_PAGE = '../index.html';

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
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));

        // Extract user info (name and role)
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
        const imgElement2 = document.getElementById('userAvatar');
        const imgElementProfile = document.getElementById('uploadedAvatar');
        imgElement.src = imageUrl;  // Update the image src dynamically
        imgElement2.src = imageUrl;  // Update the image src dynamically
        imgElementProfile.src = imageUrl;  // Update the image src dynamically

        if (decoded && isTokenExpired(decoded)) {
          // Token is expired
          localStorage.removeItem('authToken'); // Clear token
          window.location.href = LOGIN_PAGE; // Redirect to login page
          return;
        }

        // If the token is valid, fetch user profile
        try {
          const response = await fetch(`${API_BASE_URL}/api/user-management/user`, {
            method: 'GET',
            headers: {
              'Authorization': `${token}`,  // Use the token in the Authorization header
            },
          });
          console.log(response);
          if (!response.ok) {
            //If the response is not OK(e.g., 401 Unauthorized), clear token and redirect
            //localStorage.removeItem('authToken');
            //window.location.href = LOGIN_PAGE;
            //return;
            console.log(response);
          }

          const userData = await response.json(); // Parse response JSON
          console.log('User Data:', userData);

          // Extract user info from the response
          const {
            email,
            first_name: firstName,
            last_name: lastName,
            phone,
            address,
            province,
            district,
            sub_district,
            building,
            post_code,
            address_detail
          } = userData.results;

          // Update the HTML with user information
          document.getElementById('firstName').value = firstName || '';
          document.getElementById('lastName').value = lastName || '';
          document.getElementById('email').value = email || '';
          document.getElementById('phoneNumber').value = phone || '';
          document.getElementById('address').value = address || '';
          document.getElementById('state').value = province || '';
          document.getElementById('district').value = district || '';
          document.getElementById('subdistrict').value = sub_district || '';
          document.getElementById('building').value = building || '';
          document.getElementById('postalCode').value = post_code || '';
          document.getElementById('addressDetails').value = address_detail || '';

        } catch (error) {
          //Handle fetch errors(network issues, etc.)
          //console.error('Error fetching user profile:', error);
          //localStorage.removeItem('authToken');
          //window.location.href = LOGIN_PAGE; // Redirect to login page on error
          console.log(error);
        }
      }


      // Call the function to load the user profile
      loadUserProfile();

const uploadInput = document.getElementById('upload');
      const uploadedAvatar = document.getElementById('uploadedAvatar');
      const resetBtn = document.getElementById('resetBtn');
      const uploadStatus = document.getElementById('uploadStatus');
      const defaultAvatar = '../assets/img/avatars/A1.png';
    
      uploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        // Preview
        uploadedAvatar.src = URL.createObjectURL(file);
        uploadStatus.innerText = 'Uploading...';
    
        // Upload
        const formData = new FormData();
        formData.append('image', file);
    
        try {
          const res = await fetch(`${API_BASE_URL}/api/upload/image/users`, {
            method: 'POST',
            headers: {
              'Authorization': token // <== ส่ง token
            },
            body: formData
          });
          const data = await res.json();
    
          if (data.url) {
            uploadedAvatar.src = data.url;
            uploadStatus.innerText = 'Upload successful!';
          } else {
            uploadStatus.innerText = 'Upload failed: ' + (data.message || 'Unknown error');
          }
        } catch (err) {
          uploadStatus.innerText = 'Upload error: ' + err.message;
        }
      });
    
      resetBtn.addEventListener('click', () => {
        uploadedAvatar.src = defaultAvatar;
        uploadInput.value = '';
        uploadStatus.innerText = 'Image reset.';
      });

document.getElementById('formAccountSettings').addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent form from reloading the page
    
        const token = localStorage.getItem('authToken'); // Check if token is available

        // Decode the JWT token (assuming it's a JWT token)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));

        const userName = decoded.username;

        const avatarUrl = document.getElementById('uploadedAvatar').src;
        const userData = {
          username: userName,
          first_name: document.getElementById('firstName').value,
          last_name: document.getElementById('lastName').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phoneNumber').value,
          address: document.getElementById('address').value,
          building: document.getElementById('building').value,
          sub_district: document.getElementById('subdistrict').value,
          district: document.getElementById('district').value,
          province: document.getElementById('state').value,
          post_code: document.getElementById('postalCode').value,
          address_detail: document.getElementById('addressDetails').value,
          profile_picture: avatarUrl 
        };
    
        try {
          const response = await fetch(`${API_BASE_URL}/api/user-management/update-user`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            },
            body: JSON.stringify(userData)
          });
    
          const result = await response.json();
    
          if (response.ok) {
            alert('Profile updated successfully.');
            console.log(result);
          } else {
            alert(`Update failed: ${result.message}`);
            console.error(result);
          }
    
        } catch (err) {
          console.error('Error:', err);
          alert('Something went wrong while updating the profile.');
        }
      });

// Check user role (example assumes role is stored in localStorage)
  const token = localStorage.getItem('authToken');
  if (token) {
    const user = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload

    // Check if the user has the 'admin' role
    if (user.role === 'Operation Manager' || user.role === 'Director' || user.role === 'Developer') {
      // Show the admin menu
      document.getElementById('admin-menu').style.display = 'block';
    }
    if (user.role === 'Officer') {
      localStorage.removeItem('authToken');
      window.location.href = '../index.html';
    }
  }

// Logout function to clear token and redirect
  document.getElementById('logout').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default anchor link behavior

    // Clear the token from localStorage
    localStorage.removeItem('authToken');

    // Optionally, redirect the user to the login page or home page
    window.location.href = '../index.html'; // Modify this if you want to redirect somewhere else
  });

const provinces = [
  { thai: 'กรุงเทพมหานคร', english: 'Bangkok' },
  { thai: 'กระบี่', english: 'Krabi' },
  { thai: 'กาญจนบุรี', english: 'Kanchanaburi' },
  { thai: 'ขอนแก่น', english: 'Khon Kaen' },
  { thai: 'จันทบุรี', english: 'Chanthaburi' },
  { thai: 'ฉะเชิงเทรา', english: 'Chachoengsao' },
  { thai: 'ชลบุรี', english: 'Chon Buri' },
  { thai: 'ชัยภูมิ', english: 'Chaiyaphum' },
  { thai: 'เชียงราย', english: 'Chiang Rai' },
  { thai: 'เชียงใหม่', english: 'Chiang Mai' },
  { thai: 'นครนายก', english: 'Nakhon Nayok' },
  { thai: 'นครปฐม', english: 'Nakhon Pathom' },
  { thai: 'นครราชสีมา', english: 'Nakhon Ratchasima' },
  { thai: 'นครศรีธรรมราช', english: 'Nakhon Si Thammarat' },
  { thai: 'นนทบุรี', english: 'Nonthaburi' },
  { thai: 'นราธิวาส', english: 'Narathiwat' },
  { thai: 'น่าน', english: 'Nan' },
  { thai: 'บึงกาฬ', english: 'Bueng Kan' },
  { thai: 'บุรีรัมย์', english: 'Buriram' },
  { thai: 'ปทุมธานี', english: 'Pathum Thani' },
  { thai: 'ประจวบคีรีขันธ์', english: 'Prachuap Khiri Khan' },
  { thai: 'ปราจีนบุรี', english: 'Prachinburi' },
  { thai: 'ปัตตานี', english: 'Pattani' },
  { thai: 'พะเยา', english: 'Phayao' },
  { thai: 'พังงา', english: 'Phang Nga' },
  { thai: 'พิจิตร', english: 'Phichit' },
  { thai: 'พิษณุโลก', english: 'Phitsanulok' },
  { thai: 'เพชรบุรี', english: 'Phetchaburi' },
  { thai: 'เพชรบูรณ์', english: 'Phetchabun' },
  { thai: 'แม่ฮ่องสอน', english: 'Mae Hong Son' },
  { thai: 'ยโสธร', english: 'Yasothon' },
  { thai: 'ระนอง', english: 'Ranong' },
  { thai: 'ระยอง', english: 'Rayong' },
  { thai: 'ราชบุรี', english: 'Ratchaburi' },
  { thai: 'ลพบุรี', english: 'Lopburi' },
  { thai: 'ลำปาง', english: 'Lampang' },
  { thai: 'ลำพูน', english: 'Lamphun' },
  { thai: 'เลย', english: 'Loei' },
  { thai: 'ศรีสะเกษ', english: 'Sisaket' },
  { thai: 'สงขลา', english: 'Songkhla' },
  { thai: 'สตูล', english: 'Satun' },
  { thai: 'สมุทรปราการ', english: 'Samut Prakan' },
  { thai: 'สมุทรสงคราม', english: 'Samut Songkhram' },
  { thai: 'สมุทรสาคร', english: 'Samut Sakhon' },
  { thai: 'สระแก้ว', english: 'Sa Kaeo' },
  { thai: 'สระบุรี', english: 'Saraburi' },
  { thai: 'สิงห์บุรี', english: 'Sing Buri' },
  { thai: 'สุโขทัย', english: 'Sukhothai' },
  { thai: 'สุพรรณบุรี', english: 'Suphanburi' },
  { thai: 'สุราษฎร์ธานี', english: 'Surat Thani' },
  { thai: 'สุรินทร์', english: 'Surin' },
  { thai: 'สตูล', english: 'Satun' },
  { thai: 'หนองคาย', english: 'Nong Khai' },
  { thai: 'อ่างทอง', english: 'Ang Thong' },
  { thai: 'อำนาจเจริญ', english: 'Amnat Charoen' },
  { thai: 'อุดรธานี', english: 'Udon Thani' },
  { thai: 'อุตรดิตถ์', english: 'Uttaradit' },
  { thai: 'อุบลราชธานี', english: 'Ubon Ratchathani' },
  { thai: 'อำนาจเจริญ', english: 'Amnat Charoen' }
];

  // Get the select element
  const selectElement = document.getElementById('state');

  // Loop through the provinces and add both Thai and English names
  provinces.forEach(province => {
    const option = document.createElement('option');
    option.value = province.english; // Set the value to the English name
    option.textContent = `${province.thai} (${province.english})`; // Display both Thai and English names
    selectElement.appendChild(option);
  });

