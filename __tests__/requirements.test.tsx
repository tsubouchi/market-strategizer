import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RequirementsHistory from '../client/src/pages/requirements-history';
import RequirementsDetail from '../client/src/pages/requirements-detail';

// Mock react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock data
const mockRequirement = {
  id: '1',
  title: 'Test Requirement',
  overview: 'Test Overview',
  target_users: 'Test Users',
  features: JSON.stringify([
    {
      name: 'Feature 1',
      priority: 'High',
      description: 'Test Description',
      acceptance_criteria: ['Criteria 1', 'Criteria 2']
    }
  ]),
  tech_stack: JSON.stringify({
    frontend: ['React', 'TypeScript'],
    backend: ['Node.js', 'Express'],
    database: ['PostgreSQL'],
    infrastructure: ['Docker']
  }),
  created_at: new Date().toISOString()
};

// Mock fetch responses
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([mockRequirement]),
    text: () => Promise.resolve('# Test Markdown\n\nTest content'),
  })
) as jest.Mock;

describe('Requirements Workflow Tests', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  describe('Requirements History', () => {
    it('renders requirements list', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <RequirementsHistory />
        </QueryClientProvider>
      );

      // Loading state should be shown initially
      expect(screen.getByText('要件書履歴')).toBeInTheDocument();

      // Wait for the requirements to load
      await waitFor(() => {
        expect(screen.getByText('Test Requirement')).toBeInTheDocument();
      });
    });

    it('shows empty state when no requirements exist', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <RequirementsHistory />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('履歴がありません')).toBeInTheDocument();
        expect(screen.getByText('まだ要件書が生成されていません')).toBeInTheDocument();
      });
    });
  });

  describe('Requirements Detail', () => {
    it('renders requirement details and markdown preview', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <RequirementsDetail params={{ id: '1' }} />
        </QueryClientProvider>
      );

      // Check if the title is rendered
      await waitFor(() => {
        expect(screen.getByText('Test Requirement')).toBeInTheDocument();
      });
    });

    it('handles requirement deletion', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Requirement deleted successfully' }),
        })
      );

      render(
        <QueryClientProvider client={queryClient}>
          <RequirementsDetail params={{ id: '1' }} />
        </QueryClientProvider>
      );

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Test Requirement')).toBeInTheDocument();
      });

      // Click delete button and handle confirmation
      const deleteButton = screen.getByRole('button', { name: /削除/i });
      await user.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /削除/i });
      await user.click(confirmButton);

      // Verify deletion request was made
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/requirements/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('handles markdown download', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <RequirementsDetail params={{ id: '1' }} />
        </QueryClientProvider>
      );

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Test Requirement')).toBeInTheDocument();
      });

      // Click download button
      const downloadButton = screen.getByRole('button', { name: /ダウンロード/i });
      fireEvent.click(downloadButton);

      // Verify download URL was set
      expect(mockLocation.href).toBe('/api/requirements/1/download');
    });

    it('displays loading state while fetching markdown', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          text: () => Promise.resolve('Loading content...')
        }), 100))
      );

      render(
        <QueryClientProvider client={queryClient}>
          <RequirementsDetail params={{ id: '1' }} />
        </QueryClientProvider>
      );

      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });
  });
});