'use client';

import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = { [key: string]: any };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface UseActionFormProps<T extends z.ZodType<any, any, any>, TResult> {
  schema: T;
  initialValues: z.infer<T>;
  action: (values: Partial<z.infer<T>>) => Promise<TResult>;
  onSuccess?: (result: TResult) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate?: (values: z.infer<T>) => Record<string, any>;
  submitDirtyOnly?: boolean;
}

export function useActionForm<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends z.ZodType<any, any, any>,
  TResult,
>({
  schema,
  initialValues,
  action,
  onSuccess,
  validate,
  submitDirtyOnly = false,
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

  const getDirtyValues = (
    values: AnyObject,
    path: string[] = [],
  ): Partial<z.infer<T>> => {
    const dirtyValues: Partial<z.infer<T>> = {};
    for (const key in values) {
      const currentPath = [...path, key];
      const fieldIsDirty = form.isDirty(currentPath.join('.'));

      if (
        typeof values[key] === 'object' &&
        values[key] !== null &&
        !Array.isArray(values[key])
      ) {
        const nestedDirtyValues = getDirtyValues(values[key], currentPath);
        if (Object.keys(nestedDirtyValues).length > 0) {
          dirtyValues[key] = nestedDirtyValues;
        }
      } else if (fieldIsDirty) {
        dirtyValues[key] = values[key];
      }
    }
    return dirtyValues;
  };

  const handleSubmit = async (values: z.infer<T>) => {
    setIsLoading(true);
    setSubmissionError(null);

    try {
      const parsedValues = schema.parse(values);
      const valuesToSubmit = submitDirtyOnly
        ? getDirtyValues(parsedValues)
        : parsedValues;

      if (Object.keys(valuesToSubmit).length > 0) {
        const result = await action(valuesToSubmit);
        if (onSuccess) {
          onSuccess(result);
        }
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
    isDirty: form.isDirty(),
  };
}
