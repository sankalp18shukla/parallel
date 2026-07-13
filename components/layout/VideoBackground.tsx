export default function VideoBackground({ children }: { children: React.ReactNode }) {
    return (
        <div className = "video-bg-wrap">
            <video
                className="video-bg"
                src="/cloudspace-1.mp4"
                autoPlay
                muted
                loop
                playsInline
            />
            <div className="video-bg-tint"/>
            {children}
        </div>
    );
}
