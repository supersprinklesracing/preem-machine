'use server';

import { z } from 'zod';

import { FormActionError } from '@/components/forms/forms';
import { createInvite } from '@/datastore/server/create/create';
import {
  MOCK_ADMIN_AUTH_USER,
  setupLoggedInAdminContext,
  setupLoggedInUserContext,
  setupLoggedOutUserContext,
} from '@/test-utils';
import { hasUserRole } from '@/user/server/user';

import { inviteSchema } from './invite-schema';
import { inviteUser } from './invite-user-action';

jest.mock('@/user/server/user');
jest.mock('@/datastore/server/create/create');

describe('inviteUser action', () => {
  const mockedHasUserRole = jest.mocked(hasUserRole);
  const mockedCreateInvite = jest.mocked(createInvite);

  const validInvite: z.infer<typeof inviteSchema> = {
    email: 'test@example.com',
    organizationRefs: [{ id: 'org1', path: 'organizations/org1' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is an admin', () => {
    setupLoggedInAdminContext();
    mockedHasUserRole.mockResolvedValue(true);

    it('should create an invite on success', async () => {
      await inviteUser({ edits: validInvite });

      expect(mockedCreateInvite).toHaveBeenCalledWith(
        validInvite,
        MOCK_ADMIN_AUTH_USER,
      );
    });

    it('should throw a FormActionError on createInvite failure', async () => {
      mockedCreateInvite.mockRejectedValue(new Error('Firestore error'));

      await expect(inviteUser({ edits: validInvite })).rejects.toThrow(
        new FormActionError('Failed to send invitation: Firestore error'),
      );
    });

    it('should throw a FormActionError for invalid input data', async () => {
      const invalidInvite = { ...validInvite, email: 'not-an-email' };

      await expect(inviteUser({ edits: invalidInvite })).rejects.toThrow(
        /Failed to send invitation/,
      );
    });
  });

  describe('when user is not an admin', () => {
    setupLoggedInUserContext();

    it('should throw a FormActionError', async () => {
      mockedHasUserRole.mockResolvedValue(false);

      await expect(inviteUser({ edits: validInvite })).rejects.toThrow(
        new FormActionError('Failed to send invitation: Unauthorized'),
      );
    });
  });

  describe('when user is not logged in', () => {
    const { mockedVerifyUserContext } = setupLoggedOutUserContext();

    beforeEach(() => {
      mockedVerifyUserContext.mockRejectedValue(new Error('Not authenticated'));
    });

    it('should throw an error', async () => {
      await expect(inviteUser({ edits: validInvite })).rejects.toThrow(
        new FormActionError('Failed to send invitation: Not authenticated'),
      );
    });
  });
});
