import Link from "next/link";
import { ReactNode } from "react";

const LinkButton = ({ href, text, className = "",children}:{href:string,text:string,className?:string,children:ReactNode}) => {
    return (
        <Link

            href={href}
            className={`bg-primary text-white hover:bg-primary/80 font-medium px-5 py-2 rounded-md inline-flex ${className}`}
        >
            {children}{text}
        </Link>
    );
};

export default LinkButton;
