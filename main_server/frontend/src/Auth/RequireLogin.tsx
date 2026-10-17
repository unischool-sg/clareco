import { type ReactNode, useEffect, useState } from "react";

const ME_URL = "/api/auth/me";
const LOGIN_PAGE = "/login/";

type Status = "checking" | "ok" | "error";

type Props = {
  children: ReactNode;
  /** 確認中に表示するもの */
  fallback?: ReactNode;
};

/** ログインしていなければログインページへ飛ばし、ログイン後にこのページへ戻す */
export function RequireLogin({ children, fallback = null }: Props) {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const controller = new AbortController();
    fetch(ME_URL, { signal: controller.signal })
      .then((res) => {
        if (res.status === 401) {
          const next = location.pathname + location.search + location.hash;
          location.replace(`${LOGIN_PAGE}?${new URLSearchParams({ next }).toString()}`);
          return;
        }
        // /api がバックエンドに届かず index.html が 200 で返る場合をログイン済みと誤認しない
        const isJson = res.headers.get("content-type")?.includes("application/json") === true;
        setStatus(res.ok && isJson ? "ok" : "error");
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) {
          console.error(e);
          setStatus("error");
        }
      });
    return () => {
      controller.abort();
    };
  }, []);

  if (status === "error") {
    return <p role="alert">ログイン状態を確認できませんでした。ページを再読み込みしてください。</p>;
  }
  return status === "ok" ? children : fallback;
}
