import type { SVGProps } from "react";

export function ChevronUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      {...props}
    >
      <title>Expand</title>
      <path
        fill="currentColor"
        d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z"
      />
    </svg>
  );
}
