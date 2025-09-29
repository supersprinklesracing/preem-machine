import { Organization } from '@/datastore/schema';
import { fireEvent, render, screen } from '@/test-utils';

import { StripeConnectCard } from './StripeConnectCard';
import { useStripeConnect } from './useStripeConnect';

// Mock the useStripeConnect hook
jest.mock('./useStripeConnect');

// Mock the env
jest.mock('@/env/env', () => ({
  __esModule: true,
  ...jest.requireActual('@/env/env'),
  ENV_STRIPE_ENABLED: true,
}));
const mockEnv = require('@/env/env');

const mockUseStripeConnect = useStripeConnect as jest.Mock;

describe('StripeConnectCard component', () => {
  const handleCreateAccount = jest.fn();
  const handleDashboardLink = jest.fn();
  const handleOnboardingLink = jest.fn();

  beforeEach(() => {
    mockUseStripeConnect.mockReturnValue({
      isCreatingAccount: false,
      isCreatingLink: false,
      error: null,
      handleCreateAccount,
      handleDashboardLink,
      handleOnboardingLink,
    });
    handleCreateAccount.mockClear();
    handleDashboardLink.mockClear();
    handleOnboardingLink.mockClear();
  });

  it('should render the "Create Stripe Account" button when there is no account', () => {
    const mockOrganization: Organization = {
      id: 'org-1',
      path: 'organizations/org-1',
    };
    render(<StripeConnectCard organization={mockOrganization} />);

    const createButton = screen.getByText('Create Stripe Account');
    fireEvent.click(createButton);

    expect(handleCreateAccount).toHaveBeenCalledTimes(1);
  });

  it('should render the "Complete Onboarding" button when details are not submitted', () => {
    const mockOrganization: Organization = {
      id: 'org-1',
      path: 'organizations/org-1',
      stripe: { account: { details_submitted: false } },
    };
    render(<StripeConnectCard organization={mockOrganization} />);

    const onboardingButton = screen.getByText('Complete Onboarding');
    fireEvent.click(onboardingButton);

    expect(handleOnboardingLink).toHaveBeenCalledTimes(1);
  });

  it('should render the "View Dashboard" button when details are submitted', () => {
    const mockOrganization: Organization = {
      id: 'org-1',
      path: 'organizations/org-1',
      stripe: { account: { details_submitted: true } },
    };
    render(<StripeConnectCard organization={mockOrganization} />);

    const dashboardButton = screen.getByText('View Dashboard');
    fireEvent.click(dashboardButton);

    expect(handleDashboardLink).toHaveBeenCalledTimes(1);
  });

  it('should not render if stripe is disabled', () => {
    mockEnv.ENV_STRIPE_ENABLED = false;
    const mockOrganization: Organization = {
      id: 'org-1',
      path: 'organizations/org-1',
    };
    render(<StripeConnectCard organization={mockOrganization} />);
    expect(screen.queryByText('Stripe Connect')).toBeNull();
    mockEnv.ENV_STRIPE_ENABLED = true; // reset for other tests
  });
});
