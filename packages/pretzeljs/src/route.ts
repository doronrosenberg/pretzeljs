export default class Router {
  static navigateTo(url: string, data: object): void {
    window.history.pushState(data, "", url);
  }
}