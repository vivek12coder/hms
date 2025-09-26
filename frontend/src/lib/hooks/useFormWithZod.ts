'use client';

import { useState, useEffect } from 'react';
import { useFormValidation } from './useFormValidation';
import { toast } from 'sonner';
import { ZodSchema } from 'zod';

/**
 * A hook that combines Form component with Zod validation
 * Use this for forms that need client-side validation
 */
export function useFormWithZod<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  successMessage,
}: {
  initialValues: Partial<T>;
  validationSchema: ZodSchema<T>;
  onSubmit: (values: T) => Promise<any> | void;
  successMessage?: string;
}) {
  const form = useFormValidation({
    initialValues,
    validationSchema,
    onSubmit,
    successMessage,
  });

  // Show error toast if there are validation errors
  useEffect(() => {
    const errorCount = Object.keys(form.errors).length;
    if (errorCount > 0 && Object.values(form.touched).some(Boolean)) {
      toast.error(`Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''}`);
    }
  }, [form.errors, form.touched]);

  const formProps = {
    onSubmit: form.handleSubmit,
  };

  const formState = {
    isLoading: form.loading,
    isValid: form.isValid,
    errors: form.errors,
    apiError: form.error,
  };

  const fieldProps = (name: string) => ({
    name,
    value: form.values[name] || '',
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.touched[name] ? form.errors[name] : undefined,
    disabled: form.loading,
  });

  return {
    form,
    formProps,
    formState,
    fieldProps,
  };
}