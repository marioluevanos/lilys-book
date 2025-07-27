import "./LodingProgress.css";
import { FC } from "react";

export const LoadingProgress: FC<{ progress: boolean }> = ({ progress }) => {
  return !progress ? (
    ""
  ) : (
    // `Progress: ${100 * progress}%`
    <div className="loading-progress">Generating {progress}</div>
  );
};
