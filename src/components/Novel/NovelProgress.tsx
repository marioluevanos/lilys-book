import { FC } from "react";

export const NovelProgress: FC<{ progress: number }> = (props) => {
  const { progress } = props;
  return (
    <div
      className="book-progress"
      style={{
        background: "var(--accent)",
        height: "8px",
        width: "100%",
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        transform: `scaleX(${progress})`,
        transition: "0.3s var(--ease-in-out-sine)",
        transformOrigin: "0% 0%",
      }}
    ></div>
  );
};
