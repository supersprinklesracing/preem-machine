import { act, render, screen } from '@testing-library/react';
import React from 'react';

import { AnimatedNumber, useAnimatedValue } from './AnimatedNumber';

// We mock requestAnimationFrame and cancelAnimationFrame to control timing
describe('AnimatedNumber and useAnimatedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();

    // Mock requestAnimationFrame and cancelAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(() => cb(jest.now()), 16) as unknown as number;
    });

    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id as unknown as NodeJS.Timeout);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function TestHookComponent({ value }: { value: number }) {
    const animated = useAnimatedValue(value, 100);
    return <span data-testid="animated">{animated}</span>;
  }

  it('animates value from 0 to target value using the hook', () => {
    render(<TestHookComponent value={100} />);

    const element = screen.getByTestId('animated');
    expect(element.textContent).toBe('0');

    // Advance timer slightly
    act(() => {
      jest.advanceTimersByTime(50);
    });
    // The value should be animating and > 0 but < 100
    const valAtMid = Number(element.textContent);
    expect(valAtMid).toBeGreaterThan(0);
    expect(valAtMid).toBeLessThan(100);

    // Complete the animation
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(element.textContent).toBe('100');
  });

  it('correctly uses the AnimatedNumber component', () => {
    render(<AnimatedNumber value={2500} />);

    // Should render initial value as 0
    expect(screen.getByText('0')).toBeInTheDocument();

    // Fast-forward animation
    act(() => {
      jest.advanceTimersByTime(600);
    });

    // Value should animate to target formatted with commas
    expect(screen.getByText('2,500')).toBeInTheDocument();
  });

  it('cancels the previous animation frame on unmount', () => {
    const cancelSpy = jest.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = render(<AnimatedNumber value={100} />);

    unmount();

    expect(cancelSpy).toHaveBeenCalled();
  });
});
