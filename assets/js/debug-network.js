(function () {
    // Configuration
    const TIMEOUT_MS = 120000; // 120 seconds threshold for slow requests
    const IGNORE_URLS = ['/version.json', 'livereload']; // URLs to ignore

    // Create Overlay UI
    const overlay = document.createElement('div');
    overlay.id = 'debug-network-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); color: #fff; z-index: 99999;
        display: none; font-family: monospace; padding: 20px; overflow: auto;
    `;
    overlay.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
            <h2 style="color: #ff4444;">⚠️ System Diagnosis / ตรวจพบปัญหาการเชื่อมต่อ</h2>
            <p style="font-size: 1.2em; margin-bottom: 20px;">
                ระบบพบข้อผิดพลาดในการดึงข้อมูล หากหน้านี้ค้าง หรือข้อมูลไม่ขึ้น<br>
                โปรด <strong>Capture หน้าจอนี้</strong> ส่งให้ผู้ดูแลระบบ
            </p>
            <div id="debug-log-list" style="border: 1px solid #555; padding: 10px; background: #222; min-height: 200px;"></div>
            <button onclick="document.getElementById('debug-network-overlay').style.display='none'" 
                style="margin-top: 20px; padding: 10px 20px; background: #666; border: none; color: white; cursor: pointer; font-size: 16px;">
                ปิดหน้าต่างนี้ (Close)
            </button>
        </div>
    `;
    // Buffer for early logs
    const logBuffer = [];

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!document.getElementById('debug-network-overlay')) {
                document.body.appendChild(overlay);
            }
            // Flush buffer
            logBuffer.forEach(item => logError(item.title, item.detail));
            logBuffer.length = 0;
        });
    } else {
        document.body.appendChild(overlay);
    }

    function logError(title, detail) {
        let list = document.getElementById('debug-log-list');
        // Fallback to overlay in memory if not in DOM
        if (!list) list = overlay.querySelector('#debug-log-list');

        if (list) {
            const entry = document.createElement('div');
            entry.style.cssText = 'border-bottom: 1px solid #444; padding: 8px 0; margin-bottom: 5px; color: #ffadad;';
            entry.innerHTML = `<strong>${title}</strong><br><small>${detail}</small><br><small style="color: #888;">${new Date().toLocaleTimeString()}</small>`;
            list.appendChild(entry);

            // Show overlay automatically if attached to body
            if (document.body.contains(overlay)) {
                overlay.style.display = 'block';
            }
        } else {
            // Buffer if overlay not ready
            logBuffer.push({ title, detail });
        }
        console.error(`[DEBUG-TRAP] ${title}: ${detail}`);
    }

    // Intercept Fetch
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;

        if (IGNORE_URLS.some(u => url.includes(u))) {
            return originalFetch.apply(this, args);
        }

        const timeoutId = setTimeout(() => {
            logError('Network Timeout (120s+)', `Response timed out for: ${url}`);
        }, TIMEOUT_MS);

        try {
            const response = await originalFetch.apply(this, args);
            clearTimeout(timeoutId);

            if (!response.ok) {
                // Try to read error message if json
                try {
                    const clone = response.clone();
                    const errBody = await clone.text();
                    logError(`HTTP Error ${response.status}`, `URL: ${url}<br>Body: ${errBody.substring(0, 200)}`);
                } catch (e) {
                    logError(`HTTP Error ${response.status}`, `URL: ${url}`);
                }
            }
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            logError('Network Fail (Fetch)', `URL: ${url}<br>Error: ${error.message}`);
            throw error;
        }
    };

    // Global Error Handler
    window.onerror = function (msg, url, lineNo, columnNo, error) {
        if (msg === 'ResizeObserver loop limit exceeded') return false; // Ignore harmless warning
        logError('Javascript Error', `${msg}<br>${url}:${lineNo}`);
        return false;
    };

    window.addEventListener('unhandledrejection', function (event) {
        if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver')) return;
        logError('Unhandled Promise Rejection', event.reason ? (event.reason.message || event.reason) : 'Unknown reason');
    });

    console.log("✅ Debug Network Trap Installed");
})();
