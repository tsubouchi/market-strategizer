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

// Mock fetch
const createMockResponse = () => {
  const response = {
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    clone: function() { 
      return Promise.resolve(this);
    },
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    redirected: false,
    type: 'basic' as ResponseType,
    url: 'http://localhost',
  };

  return response as unknown as Response;
};

// Define fetch mock
global.fetch = jest.fn().mockImplementation(async () => createMockResponse());

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