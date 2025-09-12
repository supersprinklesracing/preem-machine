describe('secrets-env', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('getStripeSecrets', () => {
    it('should return stripe secrets if stripe is enabled', async () => {
      process.env.STRIPE_API_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123';
      jest.mock('../env/env', () => ({
        ENV_STRIPE_ENABLED: true,
      }));
      const { getStripeSecrets } = require('./secrets-env');
      const secrets = await getStripeSecrets();
      expect(secrets).toEqual({
        apiKey: 'sk_test_123',
        webhookSecret: 'whsec_123',
      });
    });

    it('should return undefined if stripe is disabled', async () => {
      jest.mock('../env/env', () => ({
        ENV_STRIPE_ENABLED: false,
      }));
      const { getStripeSecrets } = require('./secrets-env');
      const secrets = await getStripeSecrets();
      expect(secrets).toBeUndefined();
    });
  });
});
