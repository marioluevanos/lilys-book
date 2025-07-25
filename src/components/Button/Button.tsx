import "./Button.css";
import type { BaseSyntheticEvent, CSSProperties, FC, ReactNode } from "react";
import { getDataAttributes } from "../../utils/getDataAttributes";
import { cn } from "../../utils/cn";

export interface ButtonProps {
  href?: string;
  target?: "_blank" | "_self";
  rel?: string;
  type?: "button" | "reset" | "submit";
  name?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  onClick?: (event: BaseSyntheticEvent) => void;
}

export const Button: FC<ButtonProps> = (props) => {
  const { href, children, className, style, type = "button", onClick } = props;

  if (href) {
    return (
      <a
        {...props}
        {...getDataAttributes(props)}
        href={href}
        className={cn("button", className)}
        style={style}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      {...props}
      {...getDataAttributes(props)}
      className={cn("button", className)}
      type={type}
      style={style}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
