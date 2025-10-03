import { InvalidPathError } from './errors';
export type DocPath = string;
export type UrlPath = string;
export type CollectionPath = string;

export const organizationPath = (path: DocPath): DocPath => {
  const segments = path.split('/');
  if (segments.length < 2) {
    throw new InvalidPathError('Invalid path for organizationPath');
  }
  return asDocPath(segments.slice(0, 2).join('/'));
};

export const seriesPath = (path: DocPath): DocPath => {
  const segments = path.split('/');
  if (segments.length < 4) {
    throw new InvalidPathError('Invalid path for seriesPath');
  }
  return asDocPath(segments.slice(0, 4).join('/'));
};

export const eventPath = (path: DocPath): DocPath => {
  const segments = path.split('/');
  if (segments.length < 6) {
    throw new InvalidPathError('Invalid path for eventPath');
  }
  return asDocPath(segments.slice(0, 6).join('/'));
};

export const racePath = (path: DocPath): DocPath => {
  const segments = path.split('/');
  if (segments.length < 8) {
    throw new InvalidPathError('Invalid path for racePath');
  }
  return asDocPath(segments.slice(0, 8).join('/'));
};

export const preemPath = (path: DocPath): DocPath => {
  const segments = path.split('/');
  if (segments.length < 10) {
    throw new InvalidPathError('Invalid path for preemPath');
  }
  return asDocPath(segments.slice(0, 10).join('/'));
};

export const contributionPath = (path: DocPath): DocPath => {
  const segments = path.split('/');
  if (segments.length < 12) {
    throw new InvalidPathError('Invalid path for contributionPath');
  }
  return asDocPath(segments.slice(0, 12).join('/'));
};

const COLLECTION_IDS = [
  'organizations',
  'series',
  'events',
  'races',
  'preems',
  'contributions',
];

export const isDocPath = (path: string): path is DocPath => {
  if (!path) {
    console.debug('isDocPath: path is empty');
    return false;
  }
  const segments = path.split('/');
  if (segments.length === 0 || segments.some((s) => !s)) {
    return false;
  }

  if (segments[0] === 'users') {
    const isValid = segments.length === 2;
    if (!isValid) {
      console.debug(
        `isDocPath: (${path}): invalid users path segment length: ${segments.length}`,
      );
    }
    return isValid;
  }

  if (segments[0] === 'invites') {
    const isValid = segments.length === 2;
    if (!isValid) {
      console.debug(
        `isDocPath: (${path}): invalid invites path segment length: ${segments.length}`,
      );
    }
    return isValid;
  }

  if (segments[0] !== 'organizations') {
    console.debug(
      `isDocPath: (${path}): must start with "organizations" or "users": ${segments[0]}`,
    );
    return false;
  }
  if (segments.length % 2 !== 0) {
    console.debug(
      `isDocPath: (${path}): invalid segment length for organization-prefixed: ${segments.length}`,
    );
    return false;
  }

  for (let i = 0; i < segments.length; i += 2) {
    const collectionSegment = segments[i];
    const expectedCollectionId = COLLECTION_IDS[i / 2];
    if (collectionSegment !== expectedCollectionId) {
      console.debug(
        `isDocPath: (${path}): collection segment mismatch`,
        `found: ${collectionSegment}`,
        `expected: ${expectedCollectionId}`,
      );
      return false;
    }
  }

  return true;
};

export const asDocPath = (path: string): DocPath => {
  if (!isDocPath(path)) {
    throw new InvalidPathError(`Invalid DocPath: ${path}`);
  }
  return path;
};

export const toDocPath = (path: UrlPath): DocPath => {
  const urlSegments = path.split('/');
  if (urlSegments[0] === 'user') {
    return `users/${urlSegments[1]}`;
  }
  const docSegments: string[] = [];
  for (let i = 0; i < urlSegments.length; i++) {
    docSegments.push(COLLECTION_IDS[i]);
    docSegments.push(urlSegments[i]);
  }
  return docSegments.join('/');
};

export const isCollectionPath = (path: string): path is CollectionPath => {
  if (!path) {
    console.debug('isCollectionPath: path is empty');
    return false;
  }
  const segments = path.split('/');
  if (segments.length === 0 || segments.some((s) => !s)) {
    return false;
  }

  if (segments[0] === 'users') {
    const isValid = segments.length === 1;
    if (!isValid) {
      console.debug(
        'isCollectionPath: invalid users path segment length',
        segments.length,
      );
    }
    return isValid;
  }

  if (segments[0] !== 'organizations') {
    console.debug(
      'isCollectionPath: path must start with "organizations" or "users"',
      segments[0],
    );
    return false;
  }

  if (segments.length % 2 === 0) {
    console.debug(
      'isCollectionPath: invalid segment length for organizations path',
      segments.length,
    );
    return false;
  }

  for (let i = 0; i < segments.length; i += 2) {
    const collectionSegment = segments[i];
    const expectedCollectionId = COLLECTION_IDS[i / 2];
    if (collectionSegment !== expectedCollectionId) {
      console.debug(
        'isCollectionPath: collection segment mismatch',
        `found: ${collectionSegment}`,
        `expected: ${expectedCollectionId}`,
      );
      return false;
    }
  }

  return true;
};

export const asCollectionPath = (path: string): CollectionPath => {
  if (!isCollectionPath(path)) {
    throw new InvalidPathError(`Invalid CollectionPath: ${path}`);
  }
  return path;
};

export const getDocPathFromSearchParams = (searchParams: {
  path?: string | string[] | undefined;
}): DocPath => {
  const path = searchParams.path;
  if (typeof path !== 'string') {
    throw new InvalidPathError('Path is missing or invalid in searchParams');
  }
  return asDocPath(path);
};

export const isUrlPath = (path: string): path is UrlPath => {
  const urlSegments = path.split('/');
  if (urlSegments.length === 0 || urlSegments.some((s) => !s)) {
    return false;
  }
  if (urlSegments[0] === 'user') {
    return urlSegments.length === 2;
  }
  if (urlSegments.length > COLLECTION_IDS.length) {
    return false;
  }
  return true;
};

export const asUrlPath = (path: string): UrlPath => {
  if (!isUrlPath(path)) {
    throw new InvalidPathError(`Invalid UrlPath: ${path}`);
  }
  return path;
};

export const toUrlPath = (path: DocPath): UrlPath => {
  const segments = path.split('/');
  if (segments[0] === 'users') {
    return `user/${segments[1]}`;
  }
  return segments.filter((_, i) => i % 2 !== 0).join('/');
};

export const getParentPath = (path: string): string => {
  const segments = path.split('/');
  if (segments.length < 2) {
    throw new InvalidPathError(`Path is too short to have a parent: ${path}`);
  }
  return segments.slice(0, -1).join('/');
};

export const getParentPathAsCollectionPath = (
  path: DocPath,
): CollectionPath => {
  return path.split('/').slice(0, -1).join('/');
};

export const getSubCollectionPath = (
  path: DocPath,
  child: string,
): CollectionPath => {
  return path + (child.startsWith('/') ? '' : '/') + child;
};

export const getCollectionGroup = (path: DocPath) => {
  const segments = path.split('/');
  return segments[segments.length - 2];
};

export const docId = (path: DocPath): string => {
  const segments = path.split('/');
  const id = segments.pop();
  if (!id) {
    throw new InvalidPathError(`Invalid path for docId: ${path}`);
  }
  return id;
};

export const getCollectionPathFromSearchParams = (searchParams: {
  path?: string | string[] | undefined;
}): CollectionPath => {
  const path = searchParams.path;
  if (typeof path !== 'string') {
    throw new InvalidPathError('Path is missing or invalid in searchParams');
  }
  return asCollectionPath(path);
};
