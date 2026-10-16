import type { CSSProperties, ReactNode } from "react";
import "./Paper.css";

type PaperProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function Paper({ children, className, style }: PaperProps) {
  return (
    <div className={className ? `paper ${className}` : "paper"} style={style}>
      {children}
    </div>
  );
}
