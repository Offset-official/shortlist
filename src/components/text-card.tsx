import Link from "next/link";

const TextCard = ({
  href,
  text,
  glowColor = "primary",
  ...props
}: { 
  href: string; 
  text: string; 
  glowColor?: string 
}) => {
  return (
    <Link href={href}>
      <div
        className={`p-6 rounded-xl border border-border shadow-lg bg-card 
          transition-all duration-300 transform hover:scale-105
          hover:border-${glowColor} hover:border-2
          relative overflow-hidden group text-center h-40 flex justify-center items-center`}
        {...props}
      >
        {/* Glow effect element that appears on hover */}
        <div 
          className={`absolute inset-0 -z-10 opacity-0 blur-xl group-hover:opacity-15
          transition-opacity duration-300 bg-${glowColor}`} 
          aria-hidden="true"
        />
        
        <div className="font-thin text-xl">{text}</div>
      </div>
    </Link>
  );
};

export default TextCard;