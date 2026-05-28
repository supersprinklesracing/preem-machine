import { InvalidPathError } from './errors';
export type DocPath = string;
export type UrlPath = string;
export type CollectionPath = string;

const COLLECTION_IDS = [
  'organizations',
  'series',
  'events',
  'races',
  'preems',
  'contributions',
];

export const isDocPath = (path: string): path is DocPath => {
  if (!path) return false;
  const segments = path.split('/');
  if (segments.length !== 2) return false;
  if (segments.some((s) => !s)) return false;

  const validCollections = [...COLLECTION_IDS, 'users', 'invites'];
  return validCollections.includes(segments[0]);
};

export const asDocPath = (path: string): DocPath => {
  if (!isDocPath(path)) {
    throw new InvalidPathError(`Invalid DocPath: ${path}`);
  }
  return path;
};

// Converts URL path like 'o1/s1/e1' to DocPath 'events/e1'
export const toDocPath = (path: UrlPath): DocPath => {
  const urlSegments = path.split('/');
  if (urlSegments[0] === 'view' && urlSegments[1] === 'user') {
    return `users/${urlSegments[2]}`;
  }
  if (urlSegments[0] === 'user') {
    return `users/${urlSegments[1]}`;
  }

  if (urlSegments.length > COLLECTION_IDS.length || urlSegments.length === 0) {
    throw new InvalidPathError(`Invalid UrlPath to convert: ${path}`);
  }

  const collection = COLLECTION_IDS[urlSegments.length - 1];
  const id = urlSegments[urlSegments.length - 1];
  return `${collection}/${id}`;
};

export const isCollectionPath = (path: string): path is CollectionPath => {
  if (!path) return false;
  const segments = path.split('/');
  if (segments.length !== 1) return false;
  if (segments.some((s) => !s)) return false;

  const validCollections = [...COLLECTION_IDS, 'users', 'invites'];
  return validCollections.includes(segments[0]);
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

export const getUrlPath = (
  base: string,
  docPath: string,
  suffix = '',
): string => {
  if (!docPath) return '#';
  const segments = docPath.split('/');
  if (segments[0] === 'users') {
    return `${base}/user${suffix}?path=${docPath}`;
  }
  const collectionName = segments[0];
  const singular = collectionName.endsWith('s')
    ? collectionName.slice(0, -1)
    : collectionName;
  return `${base}/${singular}${suffix}?path=${docPath}`;
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
