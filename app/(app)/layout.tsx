import BottomNav from "@/components/nav/BottomNav";

export default function AppLayout({ children } : { children: React.ReactNode }) {
    return (
        <div className="app-shell">
            <div className="app-content">{children}</div>
            <BottomNav />
        </div>
    );
}