import { Component } from "@pretzeljs/pretzeljs";

export class SimpleComponent extends Component {
  render() {
    const div = document.createElement("div");
    div.innerText = "This is a simple component with some text.";
    return div;
  }
}