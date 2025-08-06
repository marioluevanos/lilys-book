import { cn } from "../../utils/cn";
import "./Box.css";
import { BaseSyntheticEvent, CSSProperties, FC } from "react";

type BoxProps = {
  className?: string;
  style?: CSSProperties;
  onClick?: (event: BaseSyntheticEvent) => void;
  boxFace?: CSSProperties;
};

export const Box: FC<BoxProps> = (props) => {
  const { onClick, className, style, boxFace } = props;

  return (
    <div className={cn("box", className)} onClick={onClick} style={style}>
      <div className="box-face box-front" style={boxFace}>
        front
      </div>
      <div className="box-face box-back" style={boxFace}>
        back
      </div>
      <div className="box-face box-right" style={boxFace}>
        right
      </div>
      <div className="box-face box-left" style={boxFace}>
        left
      </div>
      <div className="box-face box-top" style={boxFace}>
        top
      </div>
      <div className="box-face box-bottom" style={boxFace}>
        bottom
      </div>
    </div>
  );
};
