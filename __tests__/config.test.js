const config = require('../assets/js/config.js');

describe('Config', () => {
  it('should have a config object defined', () => {
    expect(config).toBeDefined();
  });

  it('should have primary color defined', () => {
    expect(config.colors.primary).toBeDefined();
    expect(config.colors.primary).toEqual('#696cff');
  });
});