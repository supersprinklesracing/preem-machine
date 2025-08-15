'use server';

import 'server-only';

import MainAppShell from './MainAppShell';
import Header from './Header';
import SidebarWrapper from './SidebarWrapper';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainAppShell header={<Header />} sidebar={<SidebarWrapper />}>
      {children}
    </MainAppShell>
  );
}
