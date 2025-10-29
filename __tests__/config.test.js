
const fs = require('fs');
const path = require('path');

describe('Config', () => {
  beforeAll(() => {
    // Manually load and execute the config.js script content
    const configPath = path.resolve(__dirname, '../assets/js/config.js');
    const scriptContent = fs.readFileSync(configPath, 'utf8');
    // Execute the script content in the JSDOM global scope
    window.eval(scriptContent);
  });
  it('should have a config object defined', () => {
    expect(window.config).toBeDefined();
  });

  it('should have primary color defined', () => {
    expect(window.config.colors.primary).toBeDefined();
    expect(window.config.colors.primary).toEqual('#696cff');
  });
});