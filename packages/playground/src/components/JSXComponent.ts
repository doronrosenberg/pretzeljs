import { Component } from "@pretzeljs/pretzeljs";
import { jsx } from "nano-jsx";

export class JSXComponent extends Component {
  render() {
    return jsx`<div>JSX!</div>`;
  }
}
