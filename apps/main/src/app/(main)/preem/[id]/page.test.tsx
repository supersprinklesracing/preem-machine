import { render, screen, setupMockDb } from '@/test-utils';
import React from 'react';
import PreemPage from './page';
import Preem from './Preem';
import { notFound } from 'next/navigation';
import '../../../../matchMedia.mock';

// Mock dependencies
jest.mock('./Preem', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Preem</div>),
}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

setupMockDb();

describe('PreemPage component', () => {
  it('should fetch preem data and render the Preem component', async () => {
    const params = { id: 'preem-giro-sf-2025-masters-women-first-lap' };
    const PageComponent = await PreemPage({ params });
    render(PageComponent);

    expect(screen.getByText('Mock Preem')).toBeInTheDocument();

    const preemCalls = (Preem as jest.Mock).mock.calls;
    expect(preemCalls[0][0].data.preem.id).toBe(
      'preem-giro-sf-2025-masters-women-first-lap',
    );
  });

  it('should call notFound when the preem does not exist', async () => {
    const params = { id: 'non-existent-preem' };
    await PreemPage({ params });

    expect(notFound).toHaveBeenCalled();
  });
});
