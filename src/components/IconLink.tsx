import { SVGProps, ComponentType } from 'react';

interface IconLinkProps {
  href: string;
  text: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
}

export default function IconLink({ href, text, icon: Icon, className }: IconLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium 
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
        dark:focus:ring-offset-slate-900
        ${className}
      `}
    >
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </a>
  );
} 