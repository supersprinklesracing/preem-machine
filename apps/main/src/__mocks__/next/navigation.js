module.exports = {
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn().mockReturnValue('/'),
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    refresh: () => {},
  }),
  useSearchParams: () => ({
    get: () => {},
  }),
};
