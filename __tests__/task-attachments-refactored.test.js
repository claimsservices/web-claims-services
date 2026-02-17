
/**
 * @jest-environment jsdom
 */

// 1. Setup global mocks BEFORE importing the module
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

// Fix JSDOM navigation error by mocking window.location properly
delete window.location;
window.location = {
    href: 'http://localhost/',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    origin: 'http://localhost',
    pathname: '/',
    search: '',
    hash: ''
};

// Mock fetch globally
global.fetch = jest.fn();

// Valid-looking mock JWT payload: {"id":1,"username":"test","role":"Officer"}
// Base64URL encoded: eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0Iiwicm9sZSI6Ik9mZmljZXIifQ
const MOCK_TOKEN = 'header.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0Iiwicm9sZSI6Ik9mZmljZXIifQ.signature';

describe('task-attachments-refactored.js', () => {
    let fetchData;
    let renderTableData;

    beforeAll(async () => {
        // 2. Setup initial state to prevent top-level redirect in the module
        mockLocalStorage.getItem.mockReturnValue(MOCK_TOKEN);

        // Mock the version.json fetch that runs at top level
        global.fetch.mockImplementation((url) => {
            if (url === '/version.json') {
                return Promise.resolve({
                    json: () => Promise.resolve({ version: '1.0.0' }),
                    ok: true
                });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        });

        // 3. Dynamic import to ensure mocks apply during module initialization
        const module = await import('../assets/js/task-attachments-refactored.js');
        fetchData = module.fetchData;
        renderTableData = module.renderTableData;
    });

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup DOM for each test
        document.body.innerHTML = `
      <table id="userTable">
        <tbody></tbody>
      </table>
      <div class="pagination"></div>
    `;

        // Ensure token is present for function calls that check it
        mockLocalStorage.getItem.mockReturnValue('mock-token');
    });

    test('should render table with License Plate column', async () => {
        const mockData = [
            {
                id: 'TASK-001',
                appointment_date: '2023-10-27T10:00:00',
                location: 'Bangkok',
                order_status: 'Pending',
                car_registration: '1กก-1234',
                amount: 500
            }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockData),
        });

        // Call fetchData to populate internal allData variable
        await fetchData();

        // Call renderTableData
        renderTableData(1);

        const rows = document.querySelectorAll('#userTable tbody tr');
        expect(rows.length).toBe(1);

        const cells = rows[0].querySelectorAll('td');
        // Verify License Plate column (Index 4, based on previous analysis)
        // 0: ID, 1: Date, 2: Location, 3: Status, 4: License Plate, 5: Amount

        expect(cells[4].textContent).toContain('1กก-1234');
    });

    test('should render dash for missing License Plate', async () => {
        const mockData = [
            {
                id: 'TASK-002',
                car_registration: null,
                order_status: 'Pending'
            }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockData),
        });

        await fetchData();
        renderTableData(1);

        const cells = document.querySelectorAll('#userTable tbody tr td');
        expect(cells[4].textContent).toBe('-');
    });
});
