import {
  ENV_STRIPE_ENABLED,
  getNextPublicProjectId,
  getNextPublicStripeEnabled,
} from './browser/env-next-public';

describe('env', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('getNextPublicProjectId', () => {
    it('should return the project ID from environment', () => {
      process.env.NEXT_PUBLIC_PROJECT_ID = 'test-proj';
      expect(getNextPublicProjectId()).toBe('test-proj');
    });

    it('should return empty string if not set', () => {
      delete process.env.NEXT_PUBLIC_PROJECT_ID;
      expect(getNextPublicProjectId()).toBe('');
    });
  });

  describe('getNextPublicStripeEnabled', () => {
    it('should be true if NEXT_PUBLIC_STRIPE_ENABLED is true', () => {
      process.env.NEXT_PUBLIC_STRIPE_ENABLED = 'true';
      expect(getNextPublicStripeEnabled()).toBe(true);
    });

    it('should be false if NEXT_PUBLIC_STRIPE_ENABLED is false', () => {
      process.env.NEXT_PUBLIC_STRIPE_ENABLED = 'false';
      expect(getNextPublicStripeEnabled()).toBe(false);
    });

    it('should be false if NEXT_PUBLIC_STRIPE_ENABLED is not set', () => {
      delete process.env.NEXT_PUBLIC_STRIPE_ENABLED;
      expect(getNextPublicStripeEnabled()).toBe(false);
    });
  });

  describe('ENV_STRIPE_ENABLED', () => {
    it('should match getNextPublicStripeEnabled()', () => {
      expect(ENV_STRIPE_ENABLED).toBe(getNextPublicStripeEnabled());
    });
  });
});
