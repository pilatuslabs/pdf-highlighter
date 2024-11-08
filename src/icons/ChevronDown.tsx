import type { SVGProps } from "react";

export function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      {...props}
    >
      <title>collapse</title>
      <path
        fill="currentColor"
        d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"
      />
    </svg>
  );
}
