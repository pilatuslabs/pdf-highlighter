import type { SVGProps } from "react";

interface Props {
    toggleSideBar: () => void;
}

export function OpenIcon({ toggleSideBar, ...props }: Props) {
    return (<div onClick={toggleSideBar}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.7rem"
            height="1.7rem"
            viewBox="0 0 128 128"
            fill="none"
            {...props}
        >

            <rect width="97" height="97" x="15" y="16" stroke="#000" strokeWidth="7" rx="27" />
            <path stroke="#000" strokeLinecap="round" strokeWidth="7" d="M46 17L46 112" />
            <path
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="7"
                d="M85 79L83.0973 77.6569C78.7198 74.5669 74.7866 70.8912 71.4077 66.7326V66.7326C70.5875 65.7231 70.5875 64.2769 71.4077 63.2674V63.2674C74.7866 59.1088 78.7198 55.4331 83.0973 52.3431L85 51"
            />
        </svg>
    </div>);
};