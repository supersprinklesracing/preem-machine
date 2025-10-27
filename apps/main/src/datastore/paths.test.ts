import { InvalidPathError } from './errors';
import {
  asCollectionPath,
  asDocPath,
  asUrlPath,
  getCollectionGroup,
  getCollectionPathFromSearchParams,
  getDocPathFromSearchParams,
  getParentPathAsCollectionPath,
  getSubCollectionPath,
  isCollectionPath,
  isDocPath,
  isUrlPath,
  toDocPath,
  toUrlPath,
} from './paths';

describe('paths', () => {
  beforeEach(() => {
    jest.spyOn(console, 'debug').mockImplementation(() => { /* empty */ });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('isDocPath', () => {
    it('should return true for valid doc paths', () => {
      expect(isDocPath('organizations/org-id')).toBe(true);
      expect(isDocPath('organizations/org-id/series/series-id')).toBe(true);
      expect(isDocPath('users/user-id')).toBe(true);
    });

    it('should return false for invalid doc paths', () => {
      expect(isDocPath('organizations')).toBe(false);
      expect(isDocPath('organizations/org-id/series')).toBe(false);
      expect(isDocPath('')).toBe(false);
      expect(isDocPath('orgs/org-id')).toBe(false);
      expect(isDocPath('organizations/org-id/events/event-id')).toBe(false);
      expect(isDocPath('users/user-id/profile')).toBe(false);
    });

    it('should return false for paths with empty segments', () => {
      // trailing slash
      expect(isDocPath('organizations/')).toBe(false);
      // consecutive slashes
      expect(isDocPath('organizations/org-id/series//events/event-id')).toBe(
        false,
      );
    });
  });

  describe('asDocPath', () => {
    it('should return a DocPath for a valid string', () => {
      const path = 'organizations/org-id';
      expect(asDocPath(path)).toBe(path);
    });

    it('should throw an InvalidPathError for an invalid string', () => {
      const path = 'organizations/org-id/series';
      expect(() => asDocPath(path)).toThrow(InvalidPathError);
    });
  });

  describe('isCollectionPath', () => {
    it('should return true for valid collection paths', () => {
      expect(isCollectionPath('organizations')).toBe(true);
      expect(isCollectionPath('organizations/org-id/series')).toBe(true);
      expect(isCollectionPath('users')).toBe(true);
    });

    it('should return false for invalid collection paths', () => {
      expect(isCollectionPath('organizations/org-id')).toBe(false);
      expect(isCollectionPath('users/user-id')).toBe(false);
    });

    it('should return false for paths with empty segments', () => {
      // trailing slash
      expect(isCollectionPath('organizations/org-id/')).toBe(false);
      // consecutive slashes
      expect(isCollectionPath('organizations//series')).toBe(false);
    });
  });

  describe('asCollectionPath', () => {
    it('should return a CollectionPath for a valid string', () => {
      const path = 'organizations/org-id/series';
      expect(asCollectionPath(path)).toBe(path);
    });

    it('should throw an InvalidPathError for an invalid string', () => {
      const path = 'organizations/org-id';
      expect(() => asCollectionPath(path)).toThrow(InvalidPathError);
    });
  });

  describe('getDocPathFromSearchParams', () => {
    it('should return a DocPath for a valid searchParams', () => {
      const searchParams = { path: 'organizations/org-id' };
      expect(getDocPathFromSearchParams(searchParams)).toBe(
        'organizations/org-id',
      );
    });

    it('should throw an InvalidPathError for an invalid searchParams', () => {
      const searchParams = { path: 'organizations/org-id/series' };
      expect(() => getDocPathFromSearchParams(searchParams)).toThrow(
        InvalidPathError,
      );
    });

    it('should throw an InvalidPathError for missing path', () => {
      const searchParams = {};
      expect(() => getDocPathFromSearchParams(searchParams)).toThrow(
        InvalidPathError,
      );
    });
  });

  describe('getCollectionPathFromSearchParams', () => {
    it('should return a CollectionPath for a valid searchParams', () => {
      const searchParams = { path: 'organizations/org-id/series' };
      expect(getCollectionPathFromSearchParams(searchParams)).toBe(
        'organizations/org-id/series',
      );
    });

    it('should throw an InvalidPathError for an invalid searchParams', () => {
      const searchParams = { path: 'organizations/org-id' };
      expect(() => getCollectionPathFromSearchParams(searchParams)).toThrow(
        InvalidPathError,
      );
    });
  });

  describe('isUrlPath', () => {
    it('should return true for valid url paths', () => {
      expect(isUrlPath('org-id')).toBe(true);
      expect(isUrlPath('org-id/series-id')).toBe(true);
      expect(isUrlPath('user/user-id')).toBe(true);
      expect(isUrlPath('view/user/user-id')).toBe(true);
    });

    it('should return false for invalid url paths', () => {
      expect(isUrlPath('a/b/c/d/e/f/g')).toBe(false);
      expect(isUrlPath('org-id//series-id')).toBe(false);
      expect(isUrlPath('')).toBe(false);
      expect(isUrlPath('user/user-id/profile')).toBe(false);
    });
  });

  describe('asUrlPath', () => {
    it('should return a UrlPath for a valid string', () => {
      const path = 'org-id/series-id';
      expect(asUrlPath(path)).toBe(path);
    });

    it('should throw an InvalidPathError for an invalid string', () => {
      const path = 'a/b/c/d/e/f/g';
      expect(() => asUrlPath(path)).toThrow(InvalidPathError);
    });
  });

  describe('toDocPath', () => {
    it('should convert a URL path to a doc path', () => {
      const urlPath = 'org-super-sprinkles/series-1/event-1';
      const expectedDocPath =
        'organizations/org-super-sprinkles/series/series-1/events/event-1';
      expect(toDocPath(urlPath)).toEqual(expectedDocPath);
    });

    it('should handle a single-segment URL path', () => {
      const urlPath = 'org-super-sprinkles';
      const expectedDocPath = 'organizations/org-super-sprinkles';
      expect(toDocPath(urlPath)).toEqual(expectedDocPath);
    });

    it('should convert a user URL path to a doc path', () => {
      const urlPath = 'user/user-id';
      const expectedDocPath = 'users/user-id';
      expect(toDocPath(urlPath)).toEqual(expectedDocPath);
    });

    it('should convert a view user URL path to a doc path', () => {
      const urlPath = 'view/user/user-id';
      const expectedDocPath = 'users/user-id';
      expect(toDocPath(urlPath)).toEqual(expectedDocPath);
    });
  });

  describe('toUrlPath', () => {
    it('should convert a doc path to a URL path', () => {
      const docPath =
        'organizations/org-super-sprinkles/events/il-giro/races/juniors';
      const expectedUrlPath = 'org-super-sprinkles/il-giro/juniors';
      expect(toUrlPath(docPath)).toEqual(expectedUrlPath);
    });

    it('should handle shorter paths', () => {
      const docPath = 'organizations/org-super-sprinkles';
      const expectedUrlPath = 'org-super-sprinkles';
      expect(toUrlPath(docPath)).toEqual(expectedUrlPath);
    });

    it('should convert a user doc path to a URL path', () => {
      const docPath = 'users/user-id';
      const expectedUrlPath = 'user/user-id';
      expect(toUrlPath(docPath)).toEqual(expectedUrlPath);
    });
  });

  describe('getParentPathAsCollectionPath', () => {
    it('should return the collection path from a doc path', () => {
      const docPath = 'organizations/id/events/eventid';
      const expectedCollectionPath = 'organizations/id/events';
      expect(getParentPathAsCollectionPath(docPath)).toEqual(
        expectedCollectionPath,
      );
    });

    it('should handle longer paths', () => {
      const docPath =
        'organizations/org-super-sprinkles/events/il-giro/races/juniors';
      const expectedCollectionPath =
        'organizations/org-super-sprinkles/events/il-giro/races';
      expect(getParentPathAsCollectionPath(docPath)).toEqual(
        expectedCollectionPath,
      );
    });
  });

  describe('getCollectionGroup', () => {
    it('should return the collection group from a doc path', () => {
      const docPath = 'organizations/id/events/eventid';
      const expectedCollectionGroup = 'events';
      expect(getCollectionGroup(docPath)).toEqual(expectedCollectionGroup);
    });

    it('should return the collection group from a longer doc path', () => {
      const docPath =
        'organizations/org-super-sprinkles/events/il-giro/races/juniors';
      const expectedCollectionGroup = 'races';
      expect(getCollectionGroup(docPath)).toEqual(expectedCollectionGroup);
    });
  });

  describe('getSubCollectionPath', () => {
    it('should throw an InvalidPathError for a multi-segment child', () => {
      const docPath = 'organizations/org-1';
      const child = 'series/series-1';
      expect(() => getSubCollectionPath(docPath, child)).toThrow(
        'Child path cannot contain "/"',
      );
    });
  });
});
