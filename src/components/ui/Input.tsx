import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
}

export function Input({ label, hint, prefix, suffix, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-ink">{label}</label>}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm text-subtle select-none">{prefix}</span>
        )}
        <input
          className={`input-field ${prefix ? 'pl-6' : ''} ${suffix ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-xs text-subtle">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-xs text-subtle">{hint}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextArea({ label, className = '', ...props }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-ink">{label}</label>}
      <textarea
        className={`input-field resize-none ${className}`}
        rows={3}
        {...props}
      />
    </div>
  );
}
