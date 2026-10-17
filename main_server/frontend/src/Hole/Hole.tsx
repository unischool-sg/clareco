import "./Hole.css";

import { type CSSProperties, useLayoutEffect, useRef } from "react";

type HoleProps = {
  type: "a" | "b" | "c";
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
};

const FIRST_RULE = 16;

export function Hole({ type, src, alt, className, style }: HoleProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const hole = ref.current;
    const paper = hole?.closest<HTMLElement>(".paper");
    if (hole == null || paper == null) {
      return;
    }

    let snap = 0;
    const align = () => {
      const pitch = parseFloat(getComputedStyle(paper).getPropertyValue("--rule"));
      const top = hole.getBoundingClientRect().top - paper.getBoundingClientRect().top - snap;
      const base = top + FIRST_RULE - pitch / 2;
      snap = Math.round(base / pitch) * pitch - base;
      hole.style.setProperty("--snap", `${snap}px`);
    };

    align();
    const observer = new ResizeObserver(align);
    observer.observe(paper);
    observer.observe(hole);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={className !== undefined && className !== "" ? `hole hole-${type} ${className}` : `hole hole-${type}`} style={style}>
      <img className="hole-photo" src={src} alt={alt} />
    </div>
  );
}