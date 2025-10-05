'use client';

export const RichTextEditor = ({
  value,
  onChange,
  'data-testid': dataTestId,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  'data-testid'?: string;
  [key: string]: unknown;
}) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    data-testid={dataTestId}
    {...props}
  />
);
