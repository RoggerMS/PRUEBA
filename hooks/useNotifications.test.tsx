import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications } from './useNotifications';
import { useSession } from 'next-auth/react';
import { debugFetch } from '@/lib/debugFetch';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/lib/debugFetch');

describe('useNotifications', () => {
  let eventSourceMock: jest.Mock;

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({ data: { user: { id: '1' } } });
    (debugFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        notifications: [],
        unreadCount: 0,
        pagination: { page: 1, pages: 1 },
      }),
    });
    eventSourceMock = jest.fn(() => ({
      addEventListener: jest.fn(),
      close: jest.fn(),
      onopen: null,
      onerror: null,
      onmessage: null,
    }));
    (global as any).EventSource = eventSourceMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls loadNotifications once and does not recreate EventSource', async () => {
    const { rerender } = renderHook(() => useNotifications());

    await waitFor(() => expect(debugFetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(eventSourceMock).toHaveBeenCalledTimes(1));

    rerender();

    await waitFor(() => expect(debugFetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(eventSourceMock).toHaveBeenCalledTimes(1));
  });
});
