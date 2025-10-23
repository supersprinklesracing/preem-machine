import { QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

import { converter as firebaseConverter } from './converters';

// Mock Zod schema for testing
const testSchema = z.object({
  id: z.string(),
  path: z.string(),
  name: z.string(),
  date: z.date(),
  nested: z.object({
    value: z.string(),
    nestedDate: z.date(),
  }),
});

type TestType = z.infer<typeof testSchema>;

// Mock Firestore snapshot
const mockSnapshot = (data: Record<string, unknown>) => ({
  id: 'test-id',
  ref: { path: 'test/test-id' },
  data: () => data,
});

describe('converter', () => {
  const converter = firebaseConverter(testSchema);

  it('should convert Firestore data to a Zod object', () => {
    const firestoreData = {
      name: 'Test Name',
      date: Timestamp.fromDate(new Date('2024-01-01T00:00:00Z')),
      nested: {
        value: 'Nested Value',
        nestedDate: Timestamp.fromDate(new Date('2024-01-02T00:00:00Z')),
      },
    };

    const result = converter.fromFirestore(
      mockSnapshot(firestoreData) as QueryDocumentSnapshot,
    );

    expect(result).toEqual({
      id: 'test-id',
      path: 'test/test-id',
      name: 'Test Name',
      date: new Date('2024-01-01T00:00:00Z'),
      nested: {
        value: 'Nested Value',
        nestedDate: new Date('2024-01-02T00:00:00Z'),
      },
    });
  });

  it('should convert a Zod object to Firestore data', () => {
    const zodObject: TestType = {
      id: 'test-id',
      path: 'test/test-id',
      name: 'Test Name',
      date: new Date('2024-01-01T00:00:00Z'),
      nested: {
        value: 'Nested Value',
        nestedDate: new Date('2024-01-02T00:00:00Z'),
      },
    };

    const result = converter.toFirestore(zodObject);

    expect(result).toEqual({
      id: 'test-id',
      path: 'test/test-id',
      name: 'Test Name',
      date: new Date('2024-01-01T00:00:00Z'),
      nested: {
        value: 'Nested Value',
        nestedDate: new Date('2024-01-02T00:00:00Z'),
      },
    });
  });

  it('should handle circular references in the data object', () => {
    const firestoreData: { [key: string]: unknown } = {
      name: 'Test Name',
      date: Timestamp.fromDate(new Date('2024-01-01T00:00:00Z')),
      nested: {
        value: 'Nested Value',
        nestedDate: Timestamp.fromDate(new Date('2024-01-02T00:00:00Z')),
      },
    };
    firestoreData.circular = firestoreData; // Create a circular reference

    const result = converter.fromFirestore(
      mockSnapshot(firestoreData) as QueryDocumentSnapshot,
    );

    expect(result.name).toBe('Test Name');
    expect(result.date).toEqual(new Date('2024-01-01T00:00:00Z'));
    expect(result).not.toHaveProperty('circular');
  });

  it('should handle deeply nested circular references', () => {
    const childSchema = z.object({
      name: z.string(),
    });
    const extendedSchema = testSchema.extend({
      child: childSchema.optional(),
    });
    const converter = firebaseConverter(extendedSchema);

    const firestoreData: { [key: string]: unknown } = {
      name: 'Test Name',
      date: Timestamp.fromDate(new Date('2024-01-01T00:00:00Z')),
      nested: {
        value: 'Nested Value',
        nestedDate: Timestamp.fromDate(new Date('2024-01-02T00:00:00Z')),
      },
    };
    const child = { parent: firestoreData, name: 'child' };
    firestoreData.child = child;

    const result = converter.fromFirestore(
      mockSnapshot(firestoreData) as QueryDocumentSnapshot,
    );

    expect(result.name).toBe('Test Name');
    expect(result.child.name).toBe('child');
    expect(result.child).not.toHaveProperty('parent');
  });

  it('should correctly process DocumentReference objects', () => {
    const docRefSchema = testSchema.extend({
      docRef: z.any(),
    });
    const converter = firebaseConverter(docRefSchema);

    const mockDocRef = {
      id: 'ref-id',
      path: 'collection/ref-id',
      parent: {
        id: 'collection',
        path: 'collection',
      },
    };

    const firestoreData = {
      name: 'Test Name',
      date: Timestamp.fromDate(new Date('2024-01-01T00:00:00Z')),
      nested: {
        value: 'Nested Value',
        nestedDate: Timestamp.fromDate(new Date('2024-01-02T00:00:00Z')),
      },
      docRef: mockDocRef,
    };

    const result = converter.fromFirestore(
      mockSnapshot(firestoreData) as QueryDocumentSnapshot,
    );

    expect(result.name).toBe('Test Name');
    expect(result.docRef).toStrictEqual(mockDocRef);
  });

  it('should handle mutual circular references', () => {
    const personSchema = z.object({
      name: z.string(),
      friend: z.any().optional(),
    });
    const extendedSchema = testSchema.extend({
      person1: personSchema,
      person2: personSchema,
    });
    const converter = firebaseConverter(extendedSchema);

    const person1: { [key: string]: unknown } = { name: 'person1' };
    const person2: { [key: string]: unknown } = { name: 'person2' };
    person1.friend = person2;
    person2.friend = person1;

    const firestoreData = {
      name: 'Test Name',
      date: Timestamp.fromDate(new Date('2024-01-01T00:00:00Z')),
      nested: {
        value: 'Nested Value',
        nestedDate: Timestamp.fromDate(new Date('2024-01-02T00:00:00Z')),
      },
      person1,
      person2,
    };

    const result = converter.fromFirestore(
      mockSnapshot(firestoreData) as QueryDocumentSnapshot,
    );

    expect(result.person1.name).toBe('person1');
    expect(result.person2.name).toBe('person2');
    expect(result.person1.friend.name).toBe('person2');
    expect(result.person2.friend.name).toBe('person1');
  });

  it('should not throw a recursion error with circular references in snapshot', () => {
    const firestoreData = {
      name: 'Test Name',
      date: Timestamp.fromDate(new Date('2024-01-01T00:00:00Z')),
      nested: {
        value: 'Nested Value',
        nestedDate: Timestamp.fromDate(new Date('2024-01-02T00:00:00Z')),
      },
    };

    // Create a mock snapshot with a circular reference
    const circularSnapshot: Partial<QueryDocumentSnapshot> = {
      id: 'circular-id',
      data: () => firestoreData,
    };
    circularSnapshot.ref = {
      path: 'test/circular-id',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parent: circularSnapshot as any, // Circular reference
    };

    let result;
    let error: unknown;

    try {
      result = converter.fromFirestore(
        circularSnapshot as QueryDocumentSnapshot,
      );
    } catch (e) {
      error = e;
    }

    expect(error).toBeUndefined();
    expect(result).toEqual({
      id: 'circular-id',
      path: 'test/circular-id',
      name: 'Test Name',
      date: new Date('2024-01-01T00:00:00Z'),
      nested: {
        value: 'Nested Value',
        nestedDate: new Date('2024-01-02T00:00:00Z'),
      },
    });
  });
});
