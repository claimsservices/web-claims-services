const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Basic fetch mock if needed, but most tests mock it again
if (!global.fetch) {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ version: '1.0.0' }),
        })
    );
}
