import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  secondaryfill?: string;
  strokewidth?: number;
  title?: string;
};

export function TestIcon({ title = "Test Icon", ...props }: IconProps) {
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
          d="M12.5.5h-9v3h9Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6,5.5V9L2.589,13.031A1.5,1.5,0,0,0,3.734,15.5h8.532a1.5,1.5,0,0,0,1.145-2.469L10,9V5.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function PlusIcon({ title = "Plus Icon", ...props }: IconProps) {
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

export function ImageAddIcon({
  title = "Image Add Icon",
  ...props
}: IconProps) {
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

export function ArrowLeftIcon({
  title = "Arrow Left Icon",
  ...props
}: IconProps) {
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
          x1="15.5"
          x2="0.5"
          y1="8"
          y2="8"
        />
        <polyline
          fill="none"
          points="5.5 13 0.5 8 5.5 3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function HomeIcon({ title = "Home Icon", ...props }: IconProps) {
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
        <polyline
          fill="none"
          points=" 15.5,7.5 8,0.5 0.5,7.5 "
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          fill="none"
          points="2.5,8.5 2.5,15.5 6.5,15.5 6.5,11.5 9.5,11.5 9.5,15.5 13.5,15.5 13.5,8.5 "
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
