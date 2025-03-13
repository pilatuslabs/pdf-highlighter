import type { SVGProps } from "react";

interface Props {
  toggleSideBar: () => void;
}

export function CloseIcon({ toggleSideBar, ...props }: Props) {
  return (
    <div onClick={toggleSideBar}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.7rem"
        height="1.7rem"
        viewBox="0 0 128 128"
        fill="none"
        {...props}
      >
      <rect
              width="97"
              height="97"
              x="113"
              y="112"
              stroke="currentColor"
              strokeWidth="7"
              rx="27"
              transform="rotate(-180 113 112)"
            />
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="7" d="M82 111L82 16" />
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="7"
              d="M45 49L46.9027 50.3431C51.2802 53.4331 55.2134 57.1088 58.5923 61.2674V61.2674C59.4125 62.2769 59.4125 63.7231 58.5923 64.7326V64.7326C55.2134 68.8912 51.2802 72.5669 46.9027 75.6569L45 77"
            />
      </svg>
    </div>
  );
}
