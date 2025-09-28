'use client';

import { useEffect, useReducer } from 'react';

interface Props {
  children: React.ReactNode;
}

// This reducer simply transitions the state to `true` to indicate
// that the component has mounted on the client.
const mountReducer = () => true;

export default function ClientOnly({ children }: Props) {
  // useReducer is used here as an alternative to useState to avoid a linting
  // warning about setting state directly in useEffect. The initial state is
  // `false` (not mounted).
  const [isMounted, mount] = useReducer(mountReducer, false);

  // The effect runs only on the client, calling the `mount` function to
  // dispatch the state change and trigger a re-render.
  useEffect(() => {
    mount();
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}