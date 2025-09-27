import { POST } from './route';
import { getStripeServer } from '@/stripe/server';
import { processAccountUpdate } from '@/stripe-datastore/organizations';
import { processContribution } from '@/stripe-datastore/contributions';
import { headers } from 'next/headers';
import { getSecrets } from '@/secrets';
import Stripe from 'stripe';

jest.mock('@/stripe/server');
jest.mock('@/stripe-datastore/organizations');
jest.mock('@/stripe-datastore/contributions');
jest.mock('next/headers');
jest.mock('@/secrets');
jest.mock('@/env/env', () => ({
  __esModule: true,
  ENV_STRIPE_ENABLED: true,
  orThrow: (v: unknown) => v,
}));
jest.mock('next/server', () => {
  const NextResponse = function (body: unknown, init: ResponseInit) {
    return {
      status: init?.status ?? 200,
      json: async () => Promise.resolve(body),
    };
  };
  NextResponse.json = (body: unknown, init: ResponseInit) => {
    return {
      status: init?.status ?? 200,
      json: async () => Promise.resolve(body),
    };
  };
  return {
    __esModule: true,
    NextResponse: NextResponse,
  };
});

const mockGetStripeServer = getStripeServer as jest.Mock;
const mockProcessAccountUpdate = processAccountUpdate as jest.Mock;
const mockProcessContribution = processContribution as jest.Mock;
const mockHeaders = headers as jest.Mock;
const mockGetSecrets = getSecrets as jest.Mock;

describe('/api/stripe/webhook', () => {
  let mockStripe: { webhooks: { constructEvent: jest.Mock } };

  beforeEach(() => {
    jest.resetAllMocks();

    mockStripe = {
      webhooks: {
        constructEvent: jest.fn(),
      },
    };
    mockGetStripeServer.mockResolvedValue(mockStripe);
    mockHeaders.mockReturnValue(
      new Map([['stripe-signature', 'test_signature']]),
    );
    mockGetSecrets.mockResolvedValue({
      stripeSecrets: { webhookSecret: 'test_secret' },
    });
  });

  it('should handle account.updated event', async () => {
    const mockAccount = { id: 'acct_123', object: 'account' } as Stripe.Account;
    const mockEvent = {
      type: 'account.updated',
      data: { object: mockAccount },
    } as Stripe.Event;
    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

    const mockRequest = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify(mockEvent),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);

    expect(mockProcessAccountUpdate).toHaveBeenCalledWith(mockAccount);
    expect(mockProcessContribution).not.toHaveBeenCalled();
  });

  it('should handle payment_intent.succeeded event', async () => {
    const mockPaymentIntent = {
      id: 'pi_123',
      object: 'payment_intent',
      status: 'succeeded',
    } as Stripe.PaymentIntent;
    const mockEvent = {
      type: 'payment_intent.succeeded',
      data: { object: mockPaymentIntent },
    } as Stripe.Event;
    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

    const mockRequest = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify(mockEvent),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);

    expect(mockProcessContribution).toHaveBeenCalledWith(mockPaymentIntent);
    expect(mockProcessAccountUpdate).not.toHaveBeenCalled();
  });

  it('should return 400 if signature is missing', async () => {
    mockHeaders.mockReturnValue(new Map());

    const mockRequest = new Request('http://localhost', { method: 'POST' });
    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
  });

  it('should return 500 if webhook secret is not configured', async () => {
    mockGetSecrets.mockResolvedValue({});

    const mockRequest = new Request('http://localhost', { method: 'POST' });
    const response = await POST(mockRequest);

    expect(response.status).toBe(500);
  });

  it('should return 400 on webhook construction error', async () => {
    const error = new Error('test error');
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw error;
    });

    const mockRequest = new Request('http://localhost', {
      method: 'POST',
      body: 'invalid',
    });
    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
  });
});