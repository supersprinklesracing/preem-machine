import { ENV_STRIPE_ENABLED } from './env';

describe('env', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('ENV_STRIPE_ENABLED', () => {
    it('should be true if NEXT_PUBLIC_STRIPE_API_KEY is set', () => {
      process.env.NEXT_PUBLIC_STRIPE_API_KEY = 'pk_test_123';
      const { ENV_STRIPE_ENABLED } = require('./env');
      expect(ENV_STRIPE_ENABLED).toBe(true);
    });

    it('should be false if NEXT_PUBLIC_STRIPE_API_KEY is not set', () => {
      delete process.env.NEXT_PUBLIC_STRIPE_API_KEY;
      const { ENV_STRIPE_ENABLED } = require('./env');
      expect(ENV_STRIPE_ENABLED).toBe(false);
    });

    it('should be false if NEXT_PUBLIC_STRIPE_API_KEY is an empty string', () => {
      process.env.NEXT_PUBLIC_STRIPE_API_KEY = '';
      const { ENV_STRIPE_ENABLED } = require('./env');
      expect(ENV_STRIPE_ENABLED).toBe(false);
    });
  });
});
