import '@testing-library/jest-dom';
import React from 'react';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  })
) as jest.Mock;

// Mock wouter
jest.mock('wouter', () => ({
  useLocation: () => ['/', jest.fn()],
  Link: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children)
}));

// Mock react-markdown
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: function MockMarkdown({ children }: { children: React.ReactNode }) {
    return React.createElement('div', { 'data-testid': 'markdown-content' }, children);
  }
}));