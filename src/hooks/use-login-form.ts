import { useState, useCallback } from 'react';
import { LoginRequestSchema } from '@/lib/validation';
import type { LoginRequest } from '@/api';

export type LoginFieldErrors = Record<string, string[]>;

export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  const reset = useCallback(() => {
    setEmail('');
    setPassword('');
    setError(null);
    setFieldErrors({});
  }, []);

  const validate = useCallback((): LoginRequest | null => {
    setError(null);
    setFieldErrors({});

    const raw = { email: email.trim(), password };
    const validated = LoginRequestSchema.safeParse(raw);

    if (!validated.success) {
      const errors: LoginFieldErrors = {};
      validated.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      setFieldErrors(errors);
      return null;
    }

    return validated.data;
  }, [email, password]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    fieldErrors,
    setFieldErrors,
    reset,
    validate,
  };
}
