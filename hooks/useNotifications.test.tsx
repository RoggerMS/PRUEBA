import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications } from './useNotifications';
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('useNotifications', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({ data: { user: { id: '1' } } });
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        notifications: [],
        unreadCount: 0,
        pagination: { page: 1, pages: 1 },
      }),
    });
    (global as any).fetch = fetchMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches notifications on mount', async () => {
    const { rerender } = renderHook(() => useNotifications());

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    rerender();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });
});
