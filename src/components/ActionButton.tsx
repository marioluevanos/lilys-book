import { FC } from "react";
import { Button, ButtonProps } from "./Button/Button";
import { PlusIcon } from "./Icon";

export const ActionButton: FC<Partial<ButtonProps>> = (props) => {
  const { onClick } = props;
  return (
    <Button
      {...props}
      className="action-button"
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
      <PlusIcon />
    </Button>
  );
};
