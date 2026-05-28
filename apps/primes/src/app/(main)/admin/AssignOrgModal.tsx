import { Button, Modal, Select, Stack } from '@mantine/core';
import { useState } from 'react';

import { Organization, User } from '@/datastore/schema';

import { assignOrg } from './assign-org-action';

interface AssignOrgModalProps {
  user: User;
  organizations: Organization[];
  onClose: () => void;
}

export function AssignOrgModal({
  user,
  organizations,
  onClose,
}: AssignOrgModalProps) {
  const [selectedOrg, setSelectedOrg] = useState<string>('');

  const handleAssignOrg = async () => {
    if (selectedOrg) {
      await assignOrg(user.id, selectedOrg);
      onClose();
    }
  };

  return (
    <Modal
      opened={true}
      onClose={onClose}
      title={`Assign Organization to ${user.name}`}
    >
      <Stack py="md">
        <Select
          placeholder="Select an organization"
          data={organizations.map((org) => ({
            value: org.id,
            label: org.name || org.id,
          }))}
          value={selectedOrg}
          onChange={(value) => setSelectedOrg(value || '')}
        />
        <Button onClick={handleAssignOrg} disabled={!selectedOrg}>
          Assign
        </Button>
      </Stack>
    </Modal>
  );
}
