import { render, screen } from '@/test-utils';
import User, { UserPageData } from './User';
import { AuthContextUser, useAuth } from '@/auth/AuthContext';

jest.mock('@/auth/AuthContext');
const useAuthMock = useAuth as jest.Mock;

const mockUserData: UserPageData = {
  user: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatarUrl: 'https://example.com/avatar.png',
  },
  contributions: [
    {
      id: 'contrib-1',
      amount: 100,
      date: new Date().toISOString(),
      preemBrief: {
        name: 'Test Preem 1',
        raceBrief: {
          name: 'Test Race 1',
        },
      },
    },
    {
      id: 'contrib-2',
      amount: 50,
      date: new Date().toISOString(),
      preemBrief: {
        name: 'Test Preem 2',
        raceBrief: {
          name: 'Test Race 2',
        },
      },
    },
  ],
};

describe('User component', () => {
  it('renders user details and contributions correctly', () => {
    useAuthMock.mockReturnValue({ authUser: null });
    render(<User data={mockUserData} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('$150')).toBeInTheDocument();

    expect(screen.getByText('Test Race 1')).toBeInTheDocument();
    expect(screen.getByText('Test Preem 1')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();

    expect(screen.getByText('Test Race 2')).toBeInTheDocument();
    expect(screen.getByText('Test Preem 2')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  it('shows "Go to My Account" button for own profile', () => {
    const authUser: AuthContextUser = {
      uid: 'user-1',
      email: 'john.doe@example.com',
      emailVerified: true,
    };
    useAuthMock.mockReturnValue({ authUser });
    render(<User data={mockUserData} />);
    expect(screen.getByText('Go to My Account')).toBeInTheDocument();
  });

  it('shows "Edit Profile" button for other users profile', () => {
    const authUser: AuthContextUser = {
      uid: 'user-2',
      email: 'jane.doe@example.com',
      emailVerified: true,
    };
    useAuthMock.mockReturnValue({ authUser });
    render(<User data={mockUserData} />);
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });
});
