import '@/matchMedia.mock';
import { render, screen, setupMockDb } from '@/test-utils';
import BigScreenPage from './page';

setupMockDb();

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('BigScreenPage', () => {
  it('should render the race data from the mock db', async () => {
    const params = { id: 'race-giro-sf-2025-masters-women' };
    const PageComponent = await BigScreenPage({ params });
    render(PageComponent);

    expect(await screen.findByText('Live Contributions')).toBeInTheDocument();
  });
});
