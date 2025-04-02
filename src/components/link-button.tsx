import Link from "next/link";

const LinkButton = ({ href, text, className = ""}:{href:string,text:string,className?:string}) => {
    return (
        <Link

            href={href}
            className={`bg-primary text-foreground hover:bg-primary/80 px-4 py-2 rounded inline-flex ${className}`}
        >
            {text}
        </Link>
    );
};

export default LinkButton;
