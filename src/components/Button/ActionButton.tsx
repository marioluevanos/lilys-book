import "./Button.css";
import { FC } from "react";
import { Button, ButtonProps } from "./Button";

export const ActionButton: FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <Button onClick={onClick} className="action">
      {children}
    </Button>
  );
};
