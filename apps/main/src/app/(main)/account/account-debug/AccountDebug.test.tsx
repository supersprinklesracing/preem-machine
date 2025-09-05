import '@/matchMedia.mock';
import { act, fireEvent, render, screen } from '@/test-utils';
import { AccountDebug } from './AccountDebug';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));
jest.mock('@/actions/refresh-cookies', () => ({
  refreshCookies: jest.fn(),
}));
jest.mock('./user-counters', () => ({
  incrementCounterUsingClientFirestore: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  }),
) as jest.Mock;

const mockAuthUser = {
  uid: 'test-uid',
  customClaims: { admin: true },
  customToken: 'test-token',
};

describe('AccountDebug component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should call the incrementCounter action when the button is clicked', () => {
    const incrementCounter = jest.fn();
    render(<AccountDebug count={0} incrementCounter={incrementCounter} />, {
      authUser: mockAuthUser as any,
    });

    fireEvent.click(screen.getByText('Update counter w/ server action'));

    expect(incrementCounter).toHaveBeenCalledTimes(1);
  });

  it('should call incrementCounterUsingClientFirestore when the button is clicked', async () => {
    const { incrementCounterUsingClientFirestore } = require('./user-counters');
    render(<AccountDebug count={0} incrementCounter={jest.fn()} />, {
      authUser: mockAuthUser as any,
    });
    await act(async () => {
      fireEvent.click(
        screen.getByText('Update counter w/ client firestore sdk'),
      );
    });
    expect(incrementCounterUsingClientFirestore).toHaveBeenCalledWith(
      'test-token',
    );
  });

  it('should call the fetch API when the refresh claims button is clicked', async () => {
    const incrementCounter = jest.fn();
    render(<AccountDebug count={0} incrementCounter={incrementCounter} />, {
      authUser: mockAuthUser as any,
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Refresh custom user claims'));
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/custom-claims',
      expect.any(Object),
    );
  });
});
