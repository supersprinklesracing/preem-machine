import { render, screen, setupMockDb } from '@/test-utils';
import { NotFoundError } from '@/datastore/errors';
import { EditPreem } from './EditPreem';
import EditPreemPage from './page';

// Mock dependencies
jest.mock('./EditPreem', () => ({
  __esModule: true,
  EditPreem: jest.fn(() => <div>Mock EditPreem</div>),
}));
jest.mock('./edit-preem-action', () => ({
  editPreemAction: jest.fn(),
}));

setupMockDb();

describe('EditPreemPage component', () => {
  it('should fetch preem data and render the EditPreem component', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems/first-lap',
    });
    const PageComponent = await EditPreemPage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock EditPreem')).toBeInTheDocument();

    const editPreemCalls = (EditPreem as jest.Mock).mock.calls;
    expect(editPreemCalls[0][0].preem.id).toBe('first-lap');
  });

  it('should throw NotFoundError when the preem does not exist', async () => {
    const searchParams = Promise.resolve({
      path: 'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems/does-not-exist',
    });
    expect(EditPreemPage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
