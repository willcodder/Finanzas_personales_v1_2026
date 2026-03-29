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
        <label className="text-sm font-medium text-[#3A3A3C] dark:text-[#EBEBF5]/80 px-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 text-[#8E8E93] font-medium select-none">
            {prefix}
          </span>
        )}
        <input
          className={`
            w-full bg-[#F2F2F7] dark:bg-[#2C2C2E]
            text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]
            rounded-xl px-4 py-3
            text-base font-normal
            transition-colors duration-150
            focus:bg-white dark:focus:bg-[#3A3A3C]
            ${prefix ? 'pl-8' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {hint && (
        <p className="text-xs text-[#8E8E93] px-1">{hint}</p>
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
        <label className="text-sm font-medium text-[#3A3A3C] dark:text-[#EBEBF5]/80 px-1">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-[#F2F2F7] dark:bg-[#2C2C2E]
          text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]
          rounded-xl px-4 py-3
          text-base font-normal resize-none
          transition-colors duration-150
          focus:bg-white dark:focus:bg-[#3A3A3C]
          ${className}
        `}
        rows={3}
        {...props}
      />
    </div>
  );
}
