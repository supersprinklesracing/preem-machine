import React from 'react';

type CommonDatePickerProps = {
  value: Date | null | [Date | null, Date | null];
  onChange: (value: Date | (Date | null)[]) => void;
  type?: 'range';
} & Omit<
  React.HTMLAttributes<HTMLDivElement> &
    React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
>;

export const DatePicker = (props: CommonDatePickerProps) => {
  const { value, onChange, type, ...rest } = props;

  const handleDateChange =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = new Date(event.target.value);
      if (type === 'range') {
        const newValue = [
          ...((value as [Date | null, Date | null]) || [null, null]),
        ];
        newValue[index] = newDate;
        onChange(newValue);
      } else {
        onChange(newDate);
      }
    };

  if (type === 'range') {
    const [startDate, endDate] = (value as [Date | null, Date | null]) || [
      null,
      null,
    ];
    return (
      <div {...rest}>
        <input
          type="date"
          value={startDate ? startDate.toISOString().split('T')[0] : ''}
          onChange={handleDateChange(0)}
          data-testid="start-date-input"
        />
        <input
          type="date"
          value={endDate ? endDate.toISOString().split('T')[0] : ''}
          onChange={handleDateChange(1)}
          data-testid="end-date-input"
        />
      </div>
    );
  }

  return (
    <input
      type="date"
      value={
        value && !Array.isArray(value)
          ? (value as Date).toISOString().split('T')[0]
          : ''
      }
      onChange={handleDateChange(0)}
      data-testid="date-picker"
      {...rest}
    />
  );
};

export const DatePickerInput = (props: CommonDatePickerProps) => {
  const { value, onChange, type, ...rest } = props;

  const handleDateChange =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = new Date(event.target.value);
      if (type === 'range') {
        const newValue = [
          ...((value as [Date | null, Date | null]) || [null, null]),
        ];
        newValue[index] = newDate;
        onChange(newValue);
      } else {
        onChange(newDate);
      }
    };

  if (type === 'range') {
    const [startDate, endDate] = (value as [Date | null, Date | null]) || [
      null,
      null,
    ];
    return (
      <div {...rest}>
        <input
          type="date"
          value={startDate ? startDate.toISOString().split('T')[0] : ''}
          onChange={handleDateChange(0)}
          data-testid="start-date-input"
        />
        <input
          type="date"
          value={endDate ? endDate.toISOString().split('T')[0] : ''}
          onChange={handleDateChange(1)}
          data-testid="end-date-input"
        />
      </div>
    );
  }

  return (
    <input
      type="date"
      value={
        value && !Array.isArray(value)
          ? (value as Date).toISOString().split('T')[0]
          : ''
      }
      onChange={handleDateChange(0)}
      data-testid="date-picker"
      {...rest}
    />
  );
};

type DateTimePickerProps = {
  value: Date | null;
  onChange: (date: Date) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>;

export const DateTimePicker = (props: DateTimePickerProps) => {
  const { value, onChange, ...rest } = props;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value);
    onChange(newDate);
  };

  return (
    <input
      type="datetime-local"
      value={
        value
          ? new Date(value.getTime() - value.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16)
          : ''
      }
      onChange={handleChange}
      {...rest}
    />
  );
};
