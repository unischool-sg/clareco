import "./GoogleSignInButton.css";

import type { ButtonHTMLAttributes } from "react";

const GOOGLE_LOGO_SRC = "/google-g.svg";
const LOGIN_URL = "/api/auth/login";

type Theme = "light" | "dark" | "neutral";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  theme?: Theme;
  redirectTo?: string;
};

export function GoogleSignInButton({
  theme = "light",
  children = "Googleでログイン",
  className,
  redirectTo = "/",
  ...rest
}: Props) {
  return (
    <button
      type="button"
      {...rest}
      onClick={() => {
        location.assign(`${LOGIN_URL}?${new URLSearchParams({ next: redirectTo }).toString()}`);
      }}
      className={`google-button is-${theme}${className !== undefined && className !== "" ? ` ${className}` : ""}`}>
      <img src={GOOGLE_LOGO_SRC} alt="" width={20} height={20} />
      <span>{children}</span>
    </button>
  );
}
