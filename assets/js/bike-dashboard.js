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

    // 4. Helper function to render a single task card
    function renderTaskCard(task) {
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

        return card;
    }

    // 5. Fetch and Render Task Lists
    async function fetchTasks() {
        const queueContainer = document.getElementById('task-list-container');
        const preApprovedContainer = document.getElementById('pre-approved-task-list-container');
        if (!queueContainer || !preApprovedContainer) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/order-agent/inquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const tasks = await response.json();

            const preApprovedTasks = tasks.filter(task => task.order_status === 'Pre-approved');
            const otherTasks = tasks.filter(task => task.order_status !== 'Pre-approved');

            // Render tasks in the main queue
            queueContainer.innerHTML = '';
            if (otherTasks.length === 0) {
                queueContainer.innerHTML = '<p class="text-center text-muted">ไม่มีงานในคิว</p>';
            } else {
                otherTasks.forEach(task => {
                    const card = renderTaskCard(task);
                    queueContainer.appendChild(card);
                });
            }

            // Render tasks in the pre-approved queue
            preApprovedContainer.innerHTML = '';
            if (preApprovedTasks.length === 0) {
                preApprovedContainer.innerHTML = '<p class="text-center text-muted">ไม่มีงานที่รอ Pre-approved</p>';
            } else {
                preApprovedTasks.forEach(task => {
                    const card = renderTaskCard(task);
                    preApprovedContainer.appendChild(card);
                });
            }

        } catch (error) {
            console.error('Error fetching tasks:', error);
            queueContainer.innerHTML = '<p class="text-center text-danger">ไม่สามารถโหลดข้อมูลงานได้</p>';
            preApprovedContainer.innerHTML = '<p class="text-center text-danger">ไม่สามารถโหลดข้อมูลงานได้</p>';
        }
    }

    fetchTasks();
});
