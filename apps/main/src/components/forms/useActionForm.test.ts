import { act, renderHook } from '@testing-library/react';
import { z } from 'zod';
import { useActionForm } from './useActionForm';

const testSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  address: z.object({
    street: z.string(),
    city: z.string(),
  }),
});

type TestSchema = z.infer<typeof testSchema>;

const initialValues: TestSchema = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  address: {
    street: '123 Main St',
    city: 'Anytown',
  },
};

describe('useActionForm', () => {
  it('should call the action with only dirty values when submitDirtyOnly is true', async () => {
    const action = jest.fn();
    const { result } = renderHook(() =>
      useActionForm({
        schema: testSchema,
        initialValues,
        action,
        submitDirtyOnly: true,
      }),
    );

    act(() => {
      result.current.form.setFieldValue('name', 'Jane Doe');
      result.current.form.setFieldValue('address.city', 'Newville');
    });

    await act(async () => {
      await result.current.handleSubmit(result.current.form.values);
    });

    expect(action).toHaveBeenCalledWith({
      name: 'Jane Doe',
      address: {
        city: 'Newville',
      },
    });
  });

  it('should call the action with all values when submitDirtyOnly is false', async () => {
    const action = jest.fn();
    const { result } = renderHook(() =>
      useActionForm({
        schema: testSchema,
        initialValues,
        action,
        submitDirtyOnly: false,
      }),
    );

    const expectedValues = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      address: {
        street: '123 Main St',
        city: 'Anytown',
      },
    };

    await act(async () => {
      await result.current.handleSubmit(result.current.form.values);
    });

    expect(action).toHaveBeenCalledWith(expectedValues);
  });
});