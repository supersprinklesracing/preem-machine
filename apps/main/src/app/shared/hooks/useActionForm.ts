'use client';

import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { z } from 'zod';

interface UseActionFormProps<T extends z.ZodType<any, any, any>, TResult> {
  schema: T;
  initialValues: z.infer<T>;
  action: (values: z.infer<T>) => Promise<TResult>;
  onSuccess?: (result: TResult) => void;
  validate?: (values: z.infer<T>) => Record<string, any>;
}

export function useActionForm<T extends z.ZodType<any, any, any>, TResult>({
  schema,
  initialValues,
  action,
  onSuccess,
  validate,
}: UseActionFormProps<T, TResult>) {
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<z.infer<T>>({
    initialValues,
    validate: (values) => {
      const zodErrors = zod4Resolver(schema)(values);
      const customErrors = validate ? validate(values) : {};
      return { ...zodErrors, ...customErrors };
    },
  });

  const handleSubmit = async (values: z.infer<T>) => {
    setIsLoading(true);
    setSubmissionError(null);

    try {
      const result = await action(values);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : 'An unknown error occurred.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    handleSubmit,
    isLoading,
    submissionError,
  };
}
