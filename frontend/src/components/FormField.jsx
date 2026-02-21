import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import './FormField.css';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
  icon: Icon,
  rows,
  options,
  disabled,
  hint,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isTextarea = type === 'textarea';
  const isSelect = type === 'select';
  const isCheckbox = type === 'checkbox';
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const shouldFloat = isFocused || hasValue;
  const floatedLabelY = isTextarea ? -18 : -26;
  const floatedLabelScale = 0.84;
  const describedBy = [
    error ? `${name}-error` : null,
    hint ? `${name}-hint` : null,
  ].filter(Boolean).join(' ') || undefined;

  const inputProps = {
    id: name,
    name,
    value: isCheckbox ? undefined : (value ?? ''),
    checked: isCheckbox ? value : undefined,
    onChange,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    disabled,
    className: `form-field__input ${error ? 'form-field__input--error' : ''} ${hasValue ? 'form-field__input--filled' : ''}`,
    'aria-invalid': !!error,
    'aria-describedby': describedBy,
    ...props,
  };

  if (isCheckbox) {
    return (
      <Motion.label
        className={`form-field form-field--checkbox ${disabled ? 'form-field--disabled' : ''}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <input type="checkbox" {...inputProps} />
        <span className="form-field__checkbox-custom">
          <svg viewBox="0 0 12 10" fill="none">
            <Motion.path
              d="M1 5L4.5 8.5L11 1.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: value ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </svg>
        </span>
        <span className="form-field__checkbox-label">
          {Icon && (
            <span className="form-field__checkbox-icon" aria-hidden="true">
              <Icon />
            </span>
          )}
          {label}
        </span>
      </Motion.label>
    );
  }

  return (
    <Motion.div
      className={`form-field ${isFocused ? 'form-field--focused' : ''} ${error ? 'form-field--error' : ''} ${disabled ? 'form-field--disabled' : ''} ${isTextarea ? 'form-field--textarea' : ''} ${isSelect ? 'form-field--select' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="form-field__wrapper">
        {Icon && (
          <Motion.div
            className="form-field__icon"
            animate={{ scale: isFocused ? 1.1 : 1, color: isFocused ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            transition={{ duration: 0.2 }}
          >
            <Icon />
          </Motion.div>
        )}

        {isTextarea ? (
          <textarea {...inputProps} rows={rows || 4} placeholder=" " />
        ) : isSelect ? (
          <select {...inputProps}>
            {placeholder && <option value="">{placeholder}</option>}
            {options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            {...inputProps}
            type={type === 'password' && showPassword ? 'text' : type}
            placeholder=" "
          />
        )}

        <Motion.label
          htmlFor={name}
          className="form-field__label"
          animate={{
            y: shouldFloat ? floatedLabelY : 0,
            scale: shouldFloat ? floatedLabelScale : 1,
            color: isFocused ? 'var(--accent-primary)' : error ? '#ef4444' : 'var(--text-muted)',
          }}
          transition={{ duration: 0.2 }}
        >
          {label} {required && <span className="form-field__required">*</span>}
        </Motion.label>

        {type === 'password' && (
          <button
            type="button"
            className="form-field__toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}

        <Motion.div
          className="form-field__border"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <Motion.span
            id={`${name}-error`}
            className="form-field__error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
            </svg>
            {error}
          </Motion.span>
        )}
        {hint && !error && (
          <Motion.span
            id={`${name}-hint`}
            className="form-field__hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {hint}
          </Motion.span>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}
