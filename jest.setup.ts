import '@testing-library/jest-dom';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { jest } from '@jest/globals';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
});

// Mock wouter
jest.mock('wouter', () => ({
  useLocation: () => ['/', jest.fn()],
  Link: ({ children }: { children: ReactNode }) => createElement('div', null, children)
}));

// Mock react-markdown
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: function MockMarkdown({ children }: { children: ReactNode }) {
    return createElement('div', { 'data-testid': 'markdown-content' }, children);
  }
}));

// Add type augmentation for jest-dom
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}