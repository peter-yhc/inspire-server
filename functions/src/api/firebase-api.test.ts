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

xdescribe('api test', () => {
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
              { data: () => ({ projectUid: 'abc' }) },
              { data: () => ({ projectUid: 'def' }) },
            ],
          }),
        };
      },
    })).mockImplementationOnce(() => ({
      where: (fieldPath: string, opStr: string, value: string) => {
        expect(fieldPath).toBe('uid');
        expect(opStr).toBe('in');
        expect(value).toStrictEqual(['abc', 'def']);
        return {
          get: () => Promise.resolve({
            docs: [
              { data: () => ({ uid: 'abc', name: 'test 1', collections: [] } as IProject) },
              { data: () => ({ uid: 'def', name: 'test 2', collections: [] } as IProject) },
            ],
          }),
        };
      },
    }));

    const result = await getProjects('fake-user-id');
    expect(result).toStrictEqual([{
      uid: 'abc',
      name: 'test 1',
      collections: [],
    }, {
      uid: 'def',
      name: 'test 2',
      collections: [],
    }]);
  });
});
