// @ts-ignore
import DOMPurify from 'dompurify';

export const ValidationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  alphanumeric: /^[a-zA-Z0-9_-]*$/,
};

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) return { valid: false, error: 'Email is required' };
  if (!ValidationRules.email.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
};

export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (!ValidationRules.password.test(password)) {
    return {
      valid: false,
      error: 'Password must contain uppercase, lowercase, number, and special character',
    };
  }
  return { valid: true };
};

export const validateRequired = (value: string, fieldName: string): { valid: boolean; error?: string } => {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
};

export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): { valid: boolean; error?: string } => {
  if (value.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  return { valid: true };
};

export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): { valid: boolean; error?: string } => {
  if (value.length > maxLength) {
    return { valid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }
  return { valid: true };
};

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html);
};

export const validateFileSize = (
  file: File,
  maxSizeMB: number
): { valid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must not exceed ${maxSizeMB}MB` };
  }
  return { valid: true };
};

export const validateFileType = (
  file: File,
  allowedTypes: string[]
): { valid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }
  return { valid: true };
};

export const validateForm = (
  formData: Record<string, any>,
  rules: Record<string, ((value: any) => { valid: boolean; error?: string })[]>
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const result = rule(formData[field]);
      if (!result.valid) {
        errors[field] = result.error || `${field} is invalid`;
        break;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
