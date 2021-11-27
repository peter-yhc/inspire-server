import * as admin from 'firebase-admin';
import { getProjects } from './firebase-api';
import { IProject } from './data-interfaces';

jest.mock('firebase-admin', () => {
  const mockCollection = jest.fn();

  return {
    firestore: jest.fn().mockImplementation(() => ({
      collection: mockCollection,
    })),
    credential: {
      cert: jest.fn(),
    },
    initializeApp: jest.fn(),
    mockCollection,
  };
});

describe('api test', () => {
  test('get projects', async () => {
    // @ts-ignore
    admin.mockCollection.mockImplementationOnce(() => ({
      where: (fieldPath: string, opStr: string, value: string) => {
        expect(fieldPath).toBe('userId');
        expect(opStr).toBe('==');
        expect(value).toBe('fake-user-id');
        return {
          get: () => Promise.resolve({
            docs: [
              { data: () => ({ projectUuid: 'abc' }) },
              { data: () => ({ projectUuid: 'def' }) },
            ],
          }),
        };
      },
    })).mockImplementationOnce(() => ({
      where: (fieldPath: string, opStr: string, value: string) => {
        expect(fieldPath).toBe('uuid');
        expect(opStr).toBe('in');
        expect(value).toStrictEqual(['abc', 'def']);
        return {
          get: () => Promise.resolve({
            docs: [
              { data: () => ({ uuid: 'abc', name: 'test 1', collections: [] } as IProject) },
              { data: () => ({ uuid: 'def', name: 'test 2', collections: [] } as IProject) },
            ],
          }),
        };
      },
    }));

    const result = await getProjects('fake-user-id');
    expect(result).toStrictEqual([{
      uuid: 'abc',
      name: 'test 1',
      collections: [],
    }, {
      uuid: 'def',
      name: 'test 2',
      collections: [],
    }]);
  });
});
