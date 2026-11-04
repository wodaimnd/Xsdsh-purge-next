/** @jsx h */
import React, { h } from "../host/react";

export interface SecretInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

/**
 * Password field with an inline reveal toggle. The toggle only switches the input
 * type; the value never leaves the controlled draft, so nothing is logged or copied.
 */
export function SecretInput(props: SecretInputProps) {
  const [shown, setShown] = React.useState(false);
  return <span className={"purge-secret" + (props.className ? " " + props.className : "")}>
    <input id={props.id} className={"purge-secret-input" + (props.inputClassName ? " " + props.inputClassName : "")}
      type={shown ? "text" : "password"} value={props.value} placeholder={props.placeholder}
      aria-label={props["aria-label"]} disabled={props.disabled}
      autoComplete="new-password" spellCheck={false}
      onChange={event => props.onChange(event.target.value)} />
    <button type="button" className="purge-secret-eye" aria-label={shown ? "隐藏内容" : "显示内容"}
      aria-pressed={shown} title={shown ? "隐藏内容" : "显示内容"}
      onMouseDown={event => event.preventDefault()}
      onClick={() => setShown(value => !value)}>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        {shown
          ? <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="2.6" />
            <path d="M4 4l16 16" />
          </g>
          : <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="2.6" />
          </g>}
      </svg>
    </button>
  </span>;
}
