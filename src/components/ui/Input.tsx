import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  prefix?: string;
}

export function Input({ label, hint, prefix, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold text-ink px-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 text-muted font-semibold select-none text-sm">
            {prefix}
          </span>
        )}
        <input
          className={`
            w-full bg-surface border border-border
            text-ink placeholder:text-subtle
            rounded-xl px-4 py-3
            text-sm font-medium
            transition-all duration-150
            focus:border-brand focus:ring-2 focus:ring-brand/10
            ${prefix ? 'pl-9' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {hint && (
        <p className="text-xs text-muted px-1">{hint}</p>
      )}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextArea({ label, className = '', ...props }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold text-ink px-1">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-surface border border-border
          text-ink placeholder:text-subtle
          rounded-xl px-4 py-3
          text-sm font-medium resize-none
          transition-all duration-150
          focus:border-brand focus:ring-2 focus:ring-brand/10
          ${className}
        `}
        rows={3}
        {...props}
      />
    </div>
  );
}
