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
    it("should be true if NEXT_PUBLIC_STRIPE_ENABLED is 'true'", () => {
      process.env.NEXT_PUBLIC_STRIPE_ENABLED = 'true';
      const { ENV_STRIPE_ENABLED } = require('./env');
      expect(ENV_STRIPE_ENABLED).toBe(true);
    });

    it("should be false if NEXT_PUBLIC_STRIPE_ENABLED is 'false'", () => {
      process.env.NEXT_PUBLIC_STRIPE_ENABLED = 'false';
      const { ENV_STRIPE_ENABLED } = require('./env');
      expect(ENV_STRIPE_ENABLED).toBe(false);
    });

    it('should be false if NEXT_PUBLIC_STRIPE_ENABLED is not set', () => {
      delete process.env.NEXT_PUBLIC_STRIPE_ENABLED;
      const { ENV_STRIPE_ENABLED } = require('./env');
      expect(ENV_STRIPE_ENABLED).toBe(false);
    });

    it('should be false if NEXT_PUBLIC_STRIPE_ENABLED is an empty string', () => {
      process.env.NEXT_PUBLIC_STRIPE_ENABLED = '';
      const { ENV_STRIPE_ENABLED } = require('./env');
      expect(ENV_STRIPE_ENABLED).toBe(false);
    });

    it("should be false if NEXT_PUBLIC_STRIPE_ENABLED is not 'true'", () => {
      process.env.NEXT_PUBLIC_STRIPE_ENABLED = 'other';
      const { ENV_STRIPE_ENABLED } = require('./env');
      expect(ENV_STRIPE_ENABLED).toBe(false);
    });
  });
});
