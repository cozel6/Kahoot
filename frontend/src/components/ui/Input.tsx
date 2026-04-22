import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className, ...rest }: InputProps) {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className={`input ${className ?? ""}`} {...rest} />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
