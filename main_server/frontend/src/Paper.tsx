import "./Paper.css";

import type { CSSProperties, ReactNode } from "react";

type PaperProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function Paper({ children, className, style }: PaperProps) {
  return (
    <div className={className !== undefined && className !== "" ? `paper ${className}` : "paper"} style={style}>
      {children}
    </div>
  );
}
