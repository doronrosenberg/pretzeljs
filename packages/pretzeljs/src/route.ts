export function navigateTo(url: string, data?: object): void {
  window.history.pushState(data, "", url);
}
