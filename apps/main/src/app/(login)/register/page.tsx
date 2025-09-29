import { Metadata } from 'next';

import { CommonLayout } from '@/components/layout/CommonLayout';

import { Register } from './Register';

export function generateMetadata(): Metadata {
  return {
    title: 'Register',
  };
}

export default function RegisterPage() {
  return (
    <CommonLayout>
      <Register />
    </CommonLayout>
  );
}
