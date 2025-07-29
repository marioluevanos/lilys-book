import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  secondaryfill?: string;
  strokewidth?: number;
  title?: string;
};

export function PlusIcon({ title = "Plus", ...props }: IconProps) {
  return (
    <svg
      height="16"
      width="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{title}</title>
      <g fill="currentColor">
        <line
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          x1="8"
          x2="8"
          y1="1.5"
          y2="14.5"
        />
        <line
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          x1="1.5"
          x2="14.5"
          y1="8"
          y2="8"
        />
      </g>
    </svg>
  );
}

export function ImageAddIcon({ title = "ImageAddIcon", ...props }: IconProps) {
  return (
    <svg
      height="16"
      width="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{title}</title>
      <g fill="currentColor">
        <path
          d="M8.5,15.5h-7 c-0.552,0-1-0.448-1-1v-13c0-0.552,0.448-1,1-1h13c0.552,0,1,0.448,1,1v7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          fill="none"
          points="2.5,10.5 9.5,5.5 11.5,7.5 "
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="4.5" cy="4.5" fill="currentColor" r="1.5" stroke="none" />
        <line
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          x1="12.5"
          x2="12.5"
          y1="9.5"
          y2="15.5"
        />
        <line
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          x1="9.5"
          x2="15.5"
          y1="12.5"
          y2="12.5"
        />
      </g>
    </svg>
  );
}
