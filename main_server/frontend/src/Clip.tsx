import type { CSSProperties, ReactNode } from "react";
import "./Clip.css";

type ClipProps = {
  children: ReactNode;
  style?: CSSProperties & { "--h"?: string };
};

export function Clip({ children, style }: ClipProps) {
  return (
    <span className="clip" style={style}>
      <span className="clip-part clip-wire" aria-hidden="true" />
      <span className="clip-part clip-l" aria-hidden="true" />
      <span className="clip-part clip-lf" aria-hidden="true" />
      <span className="clip-part clip-c" aria-hidden="true" />
      <span className="clip-part clip-rf" aria-hidden="true" />
      <span className="clip-part clip-r" aria-hidden="true" />
      <span className="clip-label">{children}</span>
    </span>
  );
}
