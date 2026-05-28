import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MockTimezoneSelect({ value, onChange }: any) {
  return (
    <input
      data-testid="timezone-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
