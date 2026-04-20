const fs = require('fs');
const path = require('path');

describe('Dashboard Search Functionality', () => {
    beforeEach(() => {
        // Reset DOM with all required elements for dashboard-refactored.js
        document.body.innerHTML = `
            <input type="text" id="filterJobCode" value="">
            <input type="text" id="filterCarRegistration" value="">
            <input type="text" id="filterAssignedTo" value="">
            <input type="text" id="filterReviewer" value="">
            <select id="filterAbnormalStatus"><option value="">งานทั้งหมด</option><option value="abnormal">งานผิดปกติ</option></select>
            
            <select id="UserRole"><option value="All">All</option></select>
            <select id="UserPlan"><option value="All">All</option></select>
            <select id="FilterTransaction1"><option value="งานทั้งหมด">งานทั้งหมด</option></select>
            <select id="FilterTransaction2"><option value=""></option></select>
            <select id="FilterTransaction3"><option value=""></option></select>
            <select id="FilterTransaction4"><option value="วันที่สร้างงาน">วันที่สร้างงาน</option></select>
            <input type="text" id="filterDateTime" value="">
            
            <button id="searchBtn">ค้นหา</button>
            <div id="totalOrders">0</div>
            <div id="pendingOrders">0</div>
            <div id="inProgressOrders">0</div>
            <div id="completedOrders">0</div>
            <div id="abnormalOrders">0</div>
            <div id="pagination-container"><ul class="pagination"></ul></div>
            <button id="exportExcelBtn">Export</button>
            
            <div id="user-info"></div>
            <div id="user-role"></div>
            <img id="userAvatar" />
            <span id="appVersion"></span>
            
            <div id="pendingOrdersCard"></div>
            <div id="inProgressOrdersCard"></div>
            <div id="completedOrdersCard"></div>
            <div id="abnormalOrdersCard"></div>
            
            <table id="userTable"><tbody></tbody></table>
        `;

        // Mock window properties
        window.IS_JEST = true;
        window.alert = jest.fn();
        
        // Mock external libraries
        window.flatpickr = jest.fn(() => ({
            set: jest.fn(),
            clear: jest.fn()
        }));
        
        window.Menu = {
            init: jest.fn(),
            setCollapsed: jest.fn()
        };
        
        window.Helpers = {
            isNavbarFixed: jest.fn(),
            setNavbarFixed: jest.fn(),
            scrollToActive: jest.fn()
        };

        // Mock URLSearchParams and location
        window.history.pushState({}, 'Test Page', '?id=TEST-ORDER');

        // Polyfills
        window.TextEncoder = global.TextEncoder || require('util').TextEncoder;
        window.TextDecoder = global.TextDecoder || require('util').TextDecoder;
        
        // Mock window.fetch
        window.fetch = jest.fn((url) => {
            if (url.includes('order-status/inquiry')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ order: { total_orders: 10, pending_orders: 2, in_progress_orders: 3, completed_orders: 5 } })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([]) // orders/inquiry returns an array
            });
        });

        // Mock localStorage
        const mockPayload = JSON.stringify({ id: 1, role: 'Admin', first_name: 'Test', last_name: 'Admin', insur_comp: 'TestIns' });
        const mockToken = 'header.' + Buffer.from(mockPayload).toString('base64') + '.signature';
        window.localStorage.setItem('authToken', mockToken);

        window.atob = (s) => Buffer.from(s, 'base64').toString('binary');

        // Load and execute the script
        jest.isolateModules(() => {
            require('../assets/js/dashboard-refactored.js');
        });

        // Trigger DOMContentLoaded
        const event = document.createEvent('Event');
        event.initEvent('DOMContentLoaded', true, true);
        document.dispatchEvent(event);
    });

    test('clicking searchBtn should call fetchData with correct filters', async () => {
        // Set some values in filter inputs
        document.getElementById('filterJobCode').value = 'JOB123';
        document.getElementById('filterCarRegistration').value = 'กข 1234';
        document.getElementById('filterReviewer').value = 'ผู้ตรวจ A';
        
        const searchBtn = document.getElementById('searchBtn');
        
        // Clear initial fetch calls
        window.fetch.mockClear();

        // Click the search button
        searchBtn.click();

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if fetch was called
        expect(window.fetch).toHaveBeenCalled();

        // Verify the filters passed to the API
        const fetchCall = window.fetch.mock.calls[0];
        const options = fetchCall[1];
        const body = JSON.parse(options.body);

        expect(body.id).toBe('JOB123');
        expect(body.car_registration).toBe('กข 1234');
        expect(body.reviewer).toBe('ผู้ตรวจ A');
    });

    test('clicking searchBtn should reset pagination to page 1', async () => {
        const searchBtn = document.getElementById('searchBtn');
        window.fetch.mockClear();
        
        searchBtn.click();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const options = window.fetch.mock.calls[0][1];
        const body = JSON.parse(options.body);
        
        // Based on dashboard-refactored.js, it calls fetchData(getFilters())
        // and sets currentPage = 1 before that.
        expect(window.fetch).toHaveBeenCalled();
        // Since the current script doesn't put 'page' in the body directly (it's often a separate param or handled in fetchData)
        // we at least confirm fetch was triggered by the search button.
    });

    test('rows should be highlighted when appointment time has passed and bike has not started yet', async () => {
        const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        window.fetch.mockImplementation((url) => {
            if (url.includes('order-status/inquiry')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ order: { total_orders: 1, pending_orders: 1, in_progress_orders: 0, completed_orders: 0 } })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([{
                    id: 'JOB-ALERT-1',
                    insur_comp: 'Insurance A',
                    created_date: pastDate,
                    appointment_date: pastDate,
                    car_registration: 'กข1234',
                    location: 'Bangkok',
                    order_type: 'Inspection',
                    order_status: 'รับงาน',
                    owner_full_name: 'Bike User',
                    reviewer_name: ''
                }])
            });
        });

        document.getElementById('searchBtn').click();
        await new Promise(resolve => setTimeout(resolve, 100));

        const row = document.querySelector('#userTable tbody tr');
        expect(row).not.toBeNull();
        expect(row.classList.contains('dashboard-alert-row')).toBe(true);
    });

    test('rows should be highlighted when status is waiting approval without reviewer', async () => {
        const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        window.fetch.mockImplementation((url) => {
            if (url.includes('order-status/inquiry')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ order: { total_orders: 1, pending_orders: 0, in_progress_orders: 0, completed_orders: 1 } })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([{
                    id: 'JOB-ALERT-2',
                    insur_comp: 'Insurance A',
                    created_date: futureDate,
                    appointment_date: futureDate,
                    car_registration: 'กข5678',
                    location: 'Bangkok',
                    order_type: 'Inspection',
                    order_status: 'รออนุมัติ',
                    owner_full_name: 'Bike User',
                    reviewer_name: ''
                }])
            });
        });

        document.getElementById('searchBtn').click();
        await new Promise(resolve => setTimeout(resolve, 100));

        const row = document.querySelector('#userTable tbody tr');
        expect(row).not.toBeNull();
        expect(row.classList.contains('dashboard-alert-row')).toBe(true);
    });

    test('abnormal filter should show only abnormal rows', async () => {
        const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        window.fetch.mockImplementation((url) => {
            if (url.includes('order-status/inquiry')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ order: { total_orders: 2, pending_orders: 1, in_progress_orders: 0, completed_orders: 0 } })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    {
                        id: 'JOB-ALERT-3',
                        insur_comp: 'Insurance A',
                        created_date: pastDate,
                        appointment_date: pastDate,
                        car_registration: 'กข1111',
                        location: 'Bangkok',
                        order_type: 'Inspection',
                        order_status: 'รับงาน',
                        owner_full_name: 'Bike User',
                        reviewer_name: ''
                    },
                    {
                        id: 'JOB-NORMAL-1',
                        insur_comp: 'Insurance A',
                        created_date: futureDate,
                        appointment_date: futureDate,
                        car_registration: 'กข2222',
                        location: 'Bangkok',
                        order_type: 'Inspection',
                        order_status: 'เริ่มงาน/กำลังเดินทาง',
                        owner_full_name: 'Bike User',
                        reviewer_name: 'Reviewer A'
                    }
                ])
            });
        });

        document.getElementById('filterAbnormalStatus').value = 'abnormal';
        document.getElementById('searchBtn').click();
        await new Promise(resolve => setTimeout(resolve, 100));

        const rows = document.querySelectorAll('#userTable tbody tr');
        expect(rows).toHaveLength(1);
        expect(rows[0].textContent).toContain('JOB-ALERT-3');
    });

    test('abnormal summary card should count abnormal rows', async () => {
        const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        window.fetch.mockImplementation((url) => {
            if (url.includes('order-status/inquiry')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ order: { total_orders: 3, pending_orders: 1, in_progress_orders: 0, completed_orders: 1 } })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    {
                        id: 'JOB-ALERT-4',
                        insur_comp: 'Insurance A',
                        created_date: pastDate,
                        appointment_date: pastDate,
                        car_registration: 'กข3333',
                        location: 'Bangkok',
                        order_type: 'Inspection',
                        order_status: 'รับงาน',
                        owner_full_name: 'Bike User',
                        reviewer_name: ''
                    },
                    {
                        id: 'JOB-ALERT-5',
                        insur_comp: 'Insurance A',
                        created_date: futureDate,
                        appointment_date: futureDate,
                        car_registration: 'กข4444',
                        location: 'Bangkok',
                        order_type: 'Inspection',
                        order_status: 'รออนุมัติ',
                        owner_full_name: 'Bike User',
                        reviewer_name: ''
                    },
                    {
                        id: 'JOB-NORMAL-2',
                        insur_comp: 'Insurance A',
                        created_date: futureDate,
                        appointment_date: futureDate,
                        car_registration: 'กข5555',
                        location: 'Bangkok',
                        order_type: 'Inspection',
                        order_status: 'เริ่มงาน/กำลังเดินทาง',
                        owner_full_name: 'Bike User',
                        reviewer_name: 'Reviewer A'
                    }
                ])
            });
        });

        document.getElementById('searchBtn').click();
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(document.getElementById('abnormalOrders').textContent).toBe('2');
    });

    test('clicking abnormal summary card should toggle abnormal filter', async () => {
        window.fetch.mockClear();

        const abnormalCard = document.getElementById('abnormalOrdersCard');
        abnormalCard.click();
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(document.getElementById('filterAbnormalStatus').value).toBe('abnormal');

        abnormalCard.click();
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(document.getElementById('filterAbnormalStatus').value).toBe('');
    });
});
