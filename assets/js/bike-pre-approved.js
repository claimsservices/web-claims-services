document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = 'https://be-claims-service.onrender.com';
    const LOGIN_PAGE = '../index.html';
    const token = localStorage.getItem('authToken');

    // 1. Auth Check
    if (!token) {
        window.location.href = LOGIN_PAGE;
        return;
    }

    // 2. Decode JWT for user info
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

    const decodedToken = parseJwt(token);
    if (decodedToken) {
        document.getElementById('userNameDropdown').textContent = `${decodedToken.first_name} ${decodedToken.last_name}`;
        document.getElementById('userRoleDropdown').textContent = decodedToken.role;
        if (decodedToken.myPicture) {
            document.getElementById('userAvatar').src = decodedToken.myPicture;
            document.getElementById('userAvatarDropdown').src = decodedToken.myPicture;
        }
    }

    // 3. Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            window.location.href = LOGIN_PAGE;
        });
    }

    // 4. Fetch and Render Task List
    async function fetchTasks() {
        const container = document.getElementById('task-list-container');
        if (!container) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/order-agent/inquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ order_status: 'Pre-approved' })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const tasks = await response.json();

            if (tasks.length === 0) {
                container.innerHTML = '<p class="text-center text-muted">ไม่มีงาน Pre-approved</p>';
                return;
            }

            container.innerHTML = ''; // Clear loading/placeholder
            tasks.forEach(task => {
                const card = document.createElement('div');
                card.className = 'task-card';
                card.setAttribute('data-id', task.id);

                const statusClass = task.order_status.replace(/\/|\s/g, '-');

                card.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="task-id">${task.id}</span>
                        <span class="task-status status-${statusClass}">${task.order_status}</span>
                    </div>
                    <div class="mb-1">
                        <span class="task-info-label">ผู้แจ้ง:</span>
                        <span>${task.creator || '-'}</span>
                    </div>
                    <div>
                        <span class="task-info-label">สถานที่:</span>
                        <span>${task.location || '-'}</span>
                    </div>
                `;

                card.addEventListener('click', () => {
                    window.location.href = `task-detail.html?id=${task.id}`;
                });

                container.appendChild(card);
            });

        } catch (error) {
            console.error('Error fetching tasks:', error);
            container.innerHTML = '<p class="text-center text-danger">ไม่สามารถโหลดข้อมูลงานได้</p>';
        }
    }

    fetchTasks();
});