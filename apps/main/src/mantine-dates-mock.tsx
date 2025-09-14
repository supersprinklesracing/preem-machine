import React from 'react';

export const DatePicker = (props: any) => {
  const { value, onChange, type, ...rest } = props;

  const handleDateChange =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = new Date(event.target.value);
      if (type === 'range') {
        const newValue = [...(value || [null, null])];
        newValue[index] = newDate;
        onChange(newValue);
      } else {
        onChange(newDate);
      }
    };

  if (type === 'range') {
    const [startDate, endDate] = value || [null, null];
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
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={handleDateChange(0)}
      data-testid="date-picker"
    />
  );
};

export const DatePickerInput = (props: any) => {
  const { value, onChange, type, ...rest } = props;

  const handleDateChange =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = new Date(event.target.value);
      if (type === 'range') {
        const newValue = [...(value || [null, null])];
        newValue[index] = newDate;
        onChange(newValue);
      } else {
        onChange(newDate);
      }
    };

  if (type === 'range') {
    const [startDate, endDate] = value || [null, null];
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
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={handleDateChange(0)}
      data-testid="date-picker"
    />
  );
};

export const DateTimePicker = (props: any) => {
  const { value, onChange, ...rest } = props;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value);
    onChange(newDate);
  };

  return (
    <input
      type="datetime-local"
      value={value ? new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
      onChange={handleChange}
      {...rest}
    />
  );
};
