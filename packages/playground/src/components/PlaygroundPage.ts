import { Component, destroyComponent, renderComponent } from "@pretzeljs/pretzeljs";
import { jsx } from "nano-jsx";
import { JSXComponent } from "./JSXComponent";
import { SimpleComponent } from "./SimpleComponent";
import { VirtualListPlayground } from "./VirtualList";

const PretzelJSPlayGround = {
  "SimpleComponent": SimpleComponent,
  "JSXComponent": JSXComponent,
  "VirtualList": VirtualListPlayground
}

export class PlaygroundPage extends Component {
  #currentComponent: Component | null = null;
  #select: HTMLSelectElement | null = null;

  onBuildClick(event: Event) {
    const component = this.#select?.value;
    if (component && PretzelJSPlayGround[component]) {
      if (this.#currentComponent) {
        destroyComponent(this.#currentComponent);
      }
      this.#currentComponent = new PretzelJSPlayGround[component]();
      renderComponent(this.getNode()?.querySelector(".content"), this.#currentComponent);
    }
  }

  public render() {
    return jsx`
      <div class="container">
        <div class="controls">
          <select ref="${(el) => this.#select = el}">
            ${Object.keys(PretzelJSPlayGround).map((key) => {
              return jsx`<option value=${key}>${key}</option>`;
            })}
          </select>
          <button onClick="${(e) => this.onBuildClick(e)}">Build</button>
        </div>
        <div class="content">
          Select an component to render.
        </div>
      </div>  
    `;
  }
}