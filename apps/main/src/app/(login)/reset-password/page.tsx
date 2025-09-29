import { Metadata } from 'next';

import { CommonLayout } from '@/components/layout/CommonLayout';

import { ResetPasswordPage } from './ResetPasswordPage';

export function generateMetadata(): Metadata {
  return {
    title: 'Reset Password',
  };
}

export default function ResetPassword() {
  return (
    <CommonLayout>
      <ResetPasswordPage />
    </CommonLayout>
  );
}
