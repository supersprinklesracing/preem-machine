import { renderHook, waitFor } from '@testing-library/react';
import { useBreadcrumbs } from './useBreadcrumbs';
import * as firestore from '@/datastore/firestore';
import * as navigation from 'next/navigation';
import {
  OrganizationBrief,
  SeriesBrief,
  EventBrief,
  RaceBrief,
  PreemBrief,
} from '@/datastore/types';

jest.mock('@/datastore/firestore');
jest.mock('next/navigation');

describe('useBreadcrumbs', () => {
  const org1: OrganizationBrief = {
    id: 'org1',
    path: 'organizations/org1',
    name: 'Test Organization 1',
  };

  const series1: SeriesBrief = {
    id: 'series1',
    path: 'organizations/org1/series/series1',
    name: 'Test Series 1',
    organizationBrief: org1,
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return an empty array for paths with less than 2 parts', async () => {
    (navigation.usePathname as jest.Mock).mockReturnValue('/');
    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current).toEqual([]);
  });

  it('should return breadcrumbs for an organization', async () => {
    (navigation.usePathname as jest.Mock).mockReturnValue(org1.path);
    (firestore.getDoc as jest.Mock).mockResolvedValue(org1);
    const { result } = renderHook(() => useBreadcrumbs());
    await waitFor(() => {
      expect(result.current).toHaveLength(1);
      expect(result.current[0].props.children).toBe('Test Organization 1');
    });
  });

  it('should return breadcrumbs for a series', async () => {
    (navigation.usePathname as jest.Mock).mockReturnValue(series1.path);
    (firestore.getDoc as jest.Mock).mockResolvedValue(series1);
    const { result } = renderHook(() => useBreadcrumbs());
    await waitFor(() => {
      expect(result.current).toHaveLength(2);
      expect(result.current[0].props.children).toBe('Test Organization 1');
      expect(result.current[1].props.children).toBe('Test Series 1');
    });
  });
});
