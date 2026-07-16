export function showGlobalToast(message: string, type: "loading" | "success" | "error" = "success", duration: number = 5000) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("show-global-toast", { detail: { message, type, duration } }));
  }
}

export function clearGlobalToast() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("clear-global-toast"));
  }
}
