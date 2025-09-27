import { render, screen, act } from '@/test-utils';
import AnimatedNumber from './AnimatedNumber';

describe('AnimatedNumber', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render the initial value immediately', () => {
    render(<AnimatedNumber value={100} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should animate to a new value when the prop changes', () => {
    const { rerender } = render(<AnimatedNumber value={100} />);
    expect(screen.getByText('100')).toBeInTheDocument();

    rerender(<AnimatedNumber value={200} />);

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText('200')).toBeInTheDocument();
  });
});