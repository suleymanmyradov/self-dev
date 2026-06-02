import { useState, useCallback } from 'react';
import { RegisterRequestSchema } from '@/lib/validation';
import type { RegisterRequest } from '@/api';

export type RegisterFieldErrors = Record<string, string[]>;

export function useRegisterForm() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  const reset = useCallback(() => {
    setFullName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setFieldErrors({});
  }, []);

  const validate = useCallback((): RegisterRequest | null => {
    setError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return null;
    }

    const raw = {
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
    };
    const validated = RegisterRequestSchema.safeParse(raw);

    if (!validated.success) {
      const errors: RegisterFieldErrors = {};
      validated.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      setFieldErrors(errors);
      return null;
    }

    return validated.data;
  }, [fullName, username, email, password, confirmPassword]);

  return {
    fullName,
    setFullName,
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    fieldErrors,
    setFieldErrors,
    reset,
    validate,
  };
}
