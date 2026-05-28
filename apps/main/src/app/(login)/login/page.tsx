import { Metadata } from 'next';

import { CommonLayout } from '@/components/layout/CommonLayout';

import { Login } from './Login';

export function generateMetadata(): Metadata {
  return {
    title: 'Login',
  };
}

export default function LoginPage() {
  return (
    <CommonLayout>
      <Login />
    </CommonLayout>
  );
}
