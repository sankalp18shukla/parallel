"use client"

import { ReactNode } from "react";
import Link from "next/link";

interface ButtonProps {
    children: ReactNode;
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
    type?: "button" | "submit";
    full?: boolean;
}

export default function Button({ children, icon, href, onClick, type = "button", full = false }: ButtonProps) {
    const className = full ? "btn btn-full" : "btn";
    const content = (
        <>
            <span className = "btn-sizer" aria-hidden = "true">
                {children}{icon}
            </span>
            <span className="btn-row btn-visible">
                <span>{children}</span>
                {icon && <span className="btn-icon">{icon}</span>}
            </span>
            <span className="btn-row btn-ghost" aria-hidden="true">
                <span>{children}</span>
                {icon && <span className="btn-icon">{icon}</span>}
            </span>
        </>
    );

    if(href) {
        if(href.startsWith("/")) {
            return <Link href={href} className={className}>{content}</Link>;
        }
        return <a href={href} className={className}>{content}</a>;    
    }

    return (
        <button type={type} onClick={onClick} className={className}>
            {content}
        </button>
    );

}