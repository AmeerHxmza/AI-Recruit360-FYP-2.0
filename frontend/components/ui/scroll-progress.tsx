"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const currentScroll = window.scrollY;
      setProgress((currentScroll / totalScroll) * 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none bg-black/[0.04]">
      <div
        className="h-full bg-gradient-to-r from-[#FF4F62] via-[#ED3F74] to-[#35C88A] transition-all duration-100 ease-out shadow-[0_0_10px_rgba(255,79,98,0.4)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
