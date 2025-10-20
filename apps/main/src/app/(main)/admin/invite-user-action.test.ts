'use server';

import { z } from 'zod';

import { FormActionError } from '@/components/forms/forms';
import { createInvite } from '@/datastore/server/create/create';
import {
  MOCK_ADMIN_AUTH_USER,
  MOCK_AUTH_USER,
  setupValidUserContext,
} from '@/test-utils';
import { hasUserRole, verifyUserContext } from '@/user/server/user';

import { inviteSchema } from './invite-schema';
import { inviteUser } from './invite-user-action';

jest.mock('@/user/server/user');
jest.mock('@/datastore/server/create/create');

describe('inviteUser action', () => {
  const mockedVerifyUserContext = jest.mocked(verifyUserContext);
  const mockedHasUserRole = jest.mocked(hasUserRole);
  const mockedCreateInvite = jest.mocked(createInvite);

  const validInvite: z.infer<typeof inviteSchema> = {
    email: 'test@example.com',
    organizationRefs: [{ id: 'org1', path: 'organizations/org1' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an invite on success', async () => {
    mockedVerifyUserContext.mockResolvedValue({
      authUser: MOCK_ADMIN_AUTH_USER,
      user: null,
    });
    mockedHasUserRole.mockResolvedValue(true);

    await inviteUser({ edits: validInvite });

    expect(mockedCreateInvite).toHaveBeenCalledWith(
      validInvite,
      MOCK_ADMIN_AUTH_USER,
    );
  });

  describe('when user is not an admin', () => {
    setupValidUserContext();

    it('should throw a FormActionError', async () => {
      mockedHasUserRole.mockResolvedValue(false);

      await expect(inviteUser({ edits: validInvite })).rejects.toThrow(
        new FormActionError('Failed to send invitation: Unauthorized'),
      );
    });
  });

  it('should throw a FormActionError on createInvite failure', async () => {
    mockedVerifyUserContext.mockResolvedValue({
      authUser: MOCK_ADMIN_AUTH_USER,
      user: null,
    });
    mockedHasUserRole.mockResolvedValue(true);
    mockedCreateInvite.mockRejectedValue(new Error('Firestore error'));

    await expect(inviteUser({ edits: validInvite })).rejects.toThrow(
      new FormActionError('Failed to send invitation: Firestore error'),
    );
  });

  it('should throw a FormActionError for invalid input data', async () => {
    mockedVerifyUserContext.mockResolvedValue({
      authUser: MOCK_ADMIN_AUTH_USER,
      user: null,
    });
    mockedHasUserRole.mockResolvedValue(true);
    const invalidInvite = { ...validInvite, email: 'not-an-email' };

    await expect(inviteUser({ edits: invalidInvite })).rejects.toThrow(
      /Failed to send invitation/,
    );
  });
});
