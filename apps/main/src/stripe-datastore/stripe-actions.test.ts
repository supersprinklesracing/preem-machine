import { Stripe } from 'stripe';

import { isUserAuthorized } from '@/datastore/server/access';
import { updateOrganizationStripeConnectAccount } from '@/datastore/server/update/update';
import { getStripeServer } from '@/stripe/server';
import { requireLoggedInUserContext } from '@/user/server/user';

import {
  createDashboardLink,
  createOnboardingLink,
  createStripeConnectAccount,
} from './stripe-actions';

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/datastore/server/access', () => ({
  __esModule: true,
  isUserAuthorized: jest.fn(),
}));

jest.mock('@/datastore/server/update/update', () => ({
  __esModule: true,
  updateOrganizationStripeConnectAccount: jest.fn(),
}));

jest.mock('@/user/server/user', () => ({
  __esModule: true,
  requireLoggedInUserContext: jest.fn(),
}));

jest.mock('@/stripe/server');

const mockIsUserAuthorized = isUserAuthorized as jest.Mock;
const mockRequireLoggedInUserContext = requireLoggedInUserContext as jest.Mock;
const mockGetStripeServer = getStripeServer as jest.Mock;
const mockUpdateOrganizationStripeConnectAccount =
  updateOrganizationStripeConnectAccount as jest.Mock;

const mockStripe = {
  accounts: {
    create: jest.fn(),
    createLoginLink: jest.fn(),
  },
  accountLinks: {
    create: jest.fn(),
  },
};

describe('stripe-actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireLoggedInUserContext.mockResolvedValue({
      authUser: { uid: 'test-user' },
    });
    mockGetStripeServer.mockResolvedValue(mockStripe);
  });
  describe('createStripeConnectAccount', () => {
    it('should return success: false when user is not authorized', async () => {
      mockIsUserAuthorized.mockResolvedValue(false);
      const result = await createStripeConnectAccount('unauthorized-org-id');
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authorized');
    });

    it('should return success: false when stripe is not configured', async () => {
      mockIsUserAuthorized.mockResolvedValue(true);
      mockGetStripeServer.mockResolvedValue(null);
      const result = await createStripeConnectAccount('authorized-org-id');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe not configured');
    });

    it('should return success: false when stripe api throws an error', async () => {
      mockIsUserAuthorized.mockResolvedValue(true);
      mockStripe.accounts.create.mockRejectedValue(new Error('Stripe error'));
      const result = await createStripeConnectAccount('authorized-org-id');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe error');
    });

    it('should return success: false with a generic error message for StripeInvalidRequestError', async () => {
      mockIsUserAuthorized.mockResolvedValue(true);
      mockStripe.accounts.create.mockRejectedValue(
        new Stripe.errors.StripeInvalidRequestError({
          message: 'Invalid request',
        }),
      );
      const result = await createStripeConnectAccount('authorized-org-id');
      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'A configuration error occurred. Please contact support for assistance.',
      );
    });

    it('should return success: true when account is created successfully', async () => {
      mockIsUserAuthorized.mockResolvedValue(true);
      mockStripe.accounts.create.mockResolvedValue({ id: 'test-account-id' });
      const result = await createStripeConnectAccount('authorized-org-id');
      expect(result.success).toBe(true);
      expect(result.accountId).toBe('test-account-id');
      expect(mockUpdateOrganizationStripeConnectAccount).toHaveBeenCalledWith(
        'authorized-org-id',
        { id: 'test-account-id' },
        { uid: 'test-user' },
      );
    });
  });

  describe('createDashboardLink', () => {
    it('should return success: false when user is not authorized', async () => {
      mockIsUserAuthorized.mockResolvedValue(false);
      const result = await createDashboardLink(
        'test-account-id',
        'unauthorized-org-id',
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authorized');
    });

    it('should return success: false when stripe is not configured', async () => {
      mockIsUserAuthorized.mockResolvedValue(true);
      mockGetStripeServer.mockResolvedValue(null);
      const result = await createDashboardLink(
        'test-account-id',
        'authorized-org-id',
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe not configured');
    });

    it('should return success: false when stripe api throws an error', async () => {
      mockIsUserAuthorized.mockResolvedValue(true);
      mockStripe.accounts.createLoginLink.mockRejectedValue(
        new Error('Stripe error'),
      );
      const result = await createDashboardLink(
        'test-account-id',
        'authorized-org-id',
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe error');
    });

    it('should return success: true when dashboard link is created successfully', async () => {
      mockIsUserAuthorized.mockResolvedValue(true);
      mockStripe.accounts.createLoginLink.mockResolvedValue({
        url: 'https://dashboard.stripe.com/test-url',
      });
      const result = await createDashboardLink(
        'test-account-id',
        'authorized-org-id',
      );
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://dashboard.stripe.com/test-url');
    });
  });

  describe('createOnboardingLink', () => {
    it('should return success: false when user is not authorized', async () => {
      mockIsUserAuthorized.mockResolvedValue(false);
      const result = await createOnboardingLink(
        'test-account-id',
        'unauthorized-org-id',
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authorized');
    });

    it('should return success: false when stripe is not configured', async () => {
      mockIsUserAuthorized.mockResolvedValue(true);
      mockGetStripeServer.mockResolvedValue(null);
      const result = await createOnboardingLink(
        'test-account-id',
        'authorized-org-id',
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe not configured');
    });

    it('should return success: false when stripe api throws an error', async () => {
      mockIsUserAuthorized.mockResolvedValue(true);
      mockStripe.accountLinks.create.mockRejectedValue(
        new Error('Stripe error'),
      );
      const result = await createOnboardingLink(
        'test-account-id',
        'authorized-org-id',
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe error');
    });

    it('should return success: true when onboarding link is created successfully', async () => {
      mockIsUserAuthorized.mockResolvedValue(true);
      mockStripe.accountLinks.create.mockResolvedValue({
        url: 'https://onboarding.stripe.com/test-url',
      });
      const result = await createOnboardingLink(
        'test-account-id',
        'authorized-org-id',
      );
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://onboarding.stripe.com/test-url');
    });
  });
});
