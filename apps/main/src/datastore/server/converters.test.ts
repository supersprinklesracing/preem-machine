import { z } from 'zod';
import { converter as firebaseConverter } from './converters';
import { Timestamp } from 'firebase-admin/firestore';

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
const mockSnapshot = (data: any) => ({
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

    const result = converter.fromFirestore(mockSnapshot(firestoreData) as any);

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
    const circularSnapshot: any = {
      id: 'circular-id',
      data: () => firestoreData,
    };
    circularSnapshot.ref = {
      path: 'test/circular-id',
      parent: circularSnapshot, // Circular reference
    };

    let result;
    let error: any;

    try {
      result = converter.fromFirestore(circularSnapshot);
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
