import { Check, X } from 'lucide-react';

interface PasswordValidatorProps {
  password: string;
  showChecklist?: boolean;
}

export interface PasswordRequirement {
  regex: RegExp;
  label: string;
  met: boolean;
}

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@&€]).{8,}$/;

export function validatePassword(password: string): {
  isValid: boolean;
  requirements: PasswordRequirement[];
} {
  const requirements: PasswordRequirement[] = [
    {
      regex: /.{8,}/,
      label: 'At least 8 characters',
      met: /.{8,}/.test(password),
    },
    {
      regex: /[A-Z]/,
      label: 'One uppercase letter (A-Z)',
      met: /[A-Z]/.test(password),
    },
    {
      regex: /[a-z]/,
      label: 'One lowercase letter (a-z)',
      met: /[a-z]/.test(password),
    },
    {
      regex: /[@&€]/,
      label: 'One special character (@, &, or €)',
      met: /[@&€]/.test(password),
    },
  ];

  const isValid = PASSWORD_REGEX.test(password);

  return { isValid, requirements };
}

export function PasswordValidator({ password, showChecklist = false }: PasswordValidatorProps) {
  const { requirements } = validatePassword(password);

  if (!showChecklist) {
    return (
      <p className="text-sm text-netflix-text-muted mt-1">
        Password: at least 8 characters, including one uppercase, one lowercase, and one of (@, &, €).
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 text-sm ${
            req.met ? 'text-green-500' : 'text-netflix-text-muted'
          }`}
        >
          {req.met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
}
