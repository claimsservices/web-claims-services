// Mock window and document FIRST so scripts can attach to it
global.window = {
  innerWidth: 1920
};
global.document = {
  querySelector: jest.fn(),
  documentElement: {
    classList: {
      contains: jest.fn()
    }
  }
};

// Require scripts after globals are mocked
require('../js/helpers.js');
require('../js/menu.js');

const Helpers = global.window.Helpers;
global.window.Helpers = Helpers; // Ensure it's accessible as window.Helpers just in case

const Menu = global.window.Menu;

describe('Menu static methods', () => {

  describe('Menu._hasClass', () => {
    // Mock element
    const mockElement = {
      classList: {
        contains: jest.fn()
      }
    };

    beforeEach(() => {
      mockElement.classList.contains.mockClear();
    });

    it('should return true if the element has the class', () => {
      mockElement.classList.contains.mockReturnValue(true);
      expect(Menu._hasClass('test-class', mockElement)).toBe(true);
      expect(mockElement.classList.contains).toHaveBeenCalledWith('test-class');
    });

    it('should return false if the element does not have the class', () => {
      mockElement.classList.contains.mockReturnValue(false);
      expect(Menu._hasClass('test-class', mockElement)).toBe(false);
    });

    it('should handle multiple classes check', () => {
      mockElement.classList.contains.mockImplementation(c => c === 'class1');
      expect(Menu._hasClass('class1 class2', mockElement)).toBe(true);
    });
  });

  describe('Menu._promisify', () => {
    it('should return a promise', () => {
      const result = Menu._promisify(() => { });
      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve when function does not return false', async () => {
      const func = () => 'test';
      await expect(Menu._promisify(func)).resolves.toBe(undefined);
    });

    it('should reject if the function returns false', async () => {
      const func = () => false;
      await expect(Menu._promisify(func)).rejects.toBe(undefined);
    });

    it('should handle functions that return a promise', async () => {
      const promise = Promise.resolve('test');
      const func = () => promise;
      expect(Menu._promisify(func)).toBe(promise);
    });

    it('should pass arguments to the function', () => {
      const func = jest.fn();
      Menu._promisify(func, 1, 'a');
      expect(func).toHaveBeenCalledWith(1, 'a');
    });
  });
});
