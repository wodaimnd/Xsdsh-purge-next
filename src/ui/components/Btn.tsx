import type { ButtonHTMLAttributes } from "react";
import { React } from "../host/react";

export interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: string;
  tiny?: boolean;
}

export function Btn(props: BtnProps) {
  const { kind, tiny, children, className, type, ...rest } = props;
  const cls = ["xsdsh-btn", kind ? "xsdsh-btn-" + kind : "xsdsh-btn-ghost", tiny ? "xsdsh-btn-tiny" : "", className || ""].filter(Boolean).join(" ");
  return <button type={type || "button"} className={cls} {...rest}>{children}</button>;
}
