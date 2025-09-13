import React from 'react';

jest.mock('react-timezone-select', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockTimezoneSelect({ value, onChange }: any) {
    return (
      <input
        data-testid="timezone-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});
