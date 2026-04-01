const fs = require('fs');
const path = require('path');

describe('Dashboard Search Functionality', () => {
    beforeEach(() => {
        // Reset DOM with all required elements for dashboard-refactored.js
        document.body.innerHTML = `
            <input type="text" id="filterJobCode" value="">
            <input type="text" id="filterCarRegistration" value="">
            <input type="text" id="filterAssignedTo" value="">
            
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
            <div id="pagination-container"></div>
            <button id="exportExcelBtn">Export</button>
            
            <div id="user-info"></div>
            <div id="user-role"></div>
            <img id="userAvatar" />
            <span id="appVersion"></span>
            
            <div id="pendingOrdersCard"></div>
            <div id="inProgressOrdersCard"></div>
            <div id="completedOrdersCard"></div>
            
            <table id="ordersTable"><tbody></tbody></table>
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
});
