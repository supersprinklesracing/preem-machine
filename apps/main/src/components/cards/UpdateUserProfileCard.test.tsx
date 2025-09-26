'use client';

import { render, screen } from '@/test-utils';
import { useForm } from '@mantine/form';
import { userSchema } from '../../app/(main)/account/user-schema';
import UpdateUserProfileCard from './UpdateUserProfileCard';

const TestComponent = () => {
  const form = useForm<typeof userSchema._output>({
    initialValues: {
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://example.com/avatar.png',
      termsAccepted: true,
      affiliation: '',
      raceLicenseId: '',
      address: '',
    },
  });
  return (
    <UpdateUserProfileCard
      {...form.values}
      uploading={false}
      error={null}
      onFileChange={jest.fn()}
      onRemovePhoto={jest.fn()}
    />
  );
};

describe('UpdateUserProfileCard', () => {
  it('renders user information', () => {
    render(<TestComponent />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Test User' })).toHaveAttribute(
      'src',
      'https://example.com/avatar.png',
    );
  });

  it('renders remove photo button', () => {
    render(<TestComponent />);
    expect(
      screen.getByRole('button', { name: 'Remove Photo' }),
    ).toBeInTheDocument();
  });
});
