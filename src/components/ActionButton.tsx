import { FC } from "react";
import { Button, ButtonProps } from "./Button/Button";

export const ActionButton: FC<ButtonProps> = (props) => {
  const { children, onClick } = props;
  return (
    <Button
      {...props}
      onClick={onClick}
      style={{
        ...props.style,
        boxShadow: "0 4px 0px var(--accent2)",
        borderRadius: "16px",
        padding: "0",
        lineHeight: "3rem",
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        width: "3rem",
        height: "3rem",
        zIndex: "200",
      }}
    >
      {children}
    </Button>
  );
};
