import '@testing-library/jest-dom';
import 'whatwg-fetch';
import React from 'react';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock React components
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: function MockMarkdown({ children }: { children: React.ReactNode }) {
    return React.createElement('div', {
      'data-testid': 'markdown-content'
    }, children);
  }
}));

jest.mock('react-syntax-highlighter', () => ({
  PrismLight: function MockSyntaxHighlighter({ children }: { children: React.ReactNode }) {
    return React.createElement('pre', {
      'data-testid': 'syntax-highlighter'
    }, children);
  }
}));

// Mock wouter
jest.mock('wouter', () => ({
  useLocation: () => ['/test', jest.fn()],
  Link: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
}));