import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});