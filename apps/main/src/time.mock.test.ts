import { MOCK_DATE, setupTimeMocking } from './test-utils/time';

describe('setupTimeMocking', () => {
  describe('when called with no arguments', () => {
    setupTimeMocking();

    it('should mock the date to the default mock date', () => {
      expect(new Date()).toEqual(MOCK_DATE);
    });
  });

  describe('when called with a specific date', () => {
    const specificDate = new Date('2025-01-01T00:00:00.000Z');
    setupTimeMocking(specificDate);

    it('should mock the date to the specific date', () => {
      expect(new Date()).toEqual(specificDate);
    });
  });
});