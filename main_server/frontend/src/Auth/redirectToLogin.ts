export function redirectToLogin(): Promise<never> {
  const next = location.pathname + location.search + location.hash
  location.replace(`/login/?${new URLSearchParams({ next }).toString()}`)
  return new Promise<never>(Boolean)
}
