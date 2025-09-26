'use client';

import { useState, useEffect, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';
import { useFormFeedback } from './useFormFeedback';

interface ValidationState<T> {
  values: Partial<T>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
}

interface UseFormValidationOptions<T> {
  initialValues: Partial<T>;
  validationSchema?: ZodSchema<T>;
  onSubmit?: (values: T) => Promise<any> | void;
  successMessage?: string;
}

export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  successMessage,
}: UseFormValidationOptions<T>) {
  // Form state
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Use form feedback for API integration
  const { loading, error, execute } = useFormFeedback();

  // Validate form values
  const validateForm = useCallback(() => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  }, [values, validationSchema]);

  // Update isValid state when values or errors change
  useEffect(() => {
    const valid = validateForm();
    setIsValid(valid);
  }, [values, validateForm]);

  // Handle field change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;

    setValues((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  // Handle field blur
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateForm();
  }, [validateForm]);

  // Handle form reset
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<string, string>);
    setTouched({} as Record<string, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>);
      
      setTouched(allTouched);

      const isFormValid = validateForm();
      if (!isFormValid || !onSubmit) return;

      setIsSubmitting(true);

      try {
        await execute(
          async () => {
            const result = onSubmit(values as T);
            return result instanceof Promise ? result : Promise.resolve(result);
          },
          { successMessage }
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit, execute, successMessage]
  );

  // Set a field value programmatically
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Set a field error programmatically
  const setFieldError = useCallback((name: string, errorMessage: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  }, []);

  // Set a field as touched programmatically
  const setFieldTouched = useCallback((name: string, isTouched: boolean = true) => {
    setTouched((prev) => ({
      ...prev,
      [name]: isTouched,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    loading,
    error: error,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    setFieldTouched,
  };
}