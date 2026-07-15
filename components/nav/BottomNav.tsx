"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CircleUser } from "lucide-react";
import Logo from "@/components/ui/Logo" 

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/connects", label: "Connects", icon: Users },
  { href: "/profile", label: "Profile", icon: CircleUser },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav glass-nav">
        <div className= "bottom-nav-tabs">
            {TABS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;

                return (
                    <Link
                        key={href}
                        href={href}
                        className={`bottom-nav-item ${active ? "active" : ""}`}
                    >
                    <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                    <span>{label}</span>
                    </Link>
                );
            })}
        </div>
        <div className= "bottom-nav-divider"/>
        <Logo />
    </nav>
  );
}