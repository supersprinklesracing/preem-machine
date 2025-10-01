/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @eslint-react/no-unnecessary-use-prefix */
export const usePathname = jest.fn().mockReturnValue('/');
export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  refresh: () => {},
});
export const useSearchParams = () => ({
  get: () => {},
});
