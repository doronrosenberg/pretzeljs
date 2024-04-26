import { Component, destroyComponent, renderComponent, ComponentHandle } from "@pretzeljs/pretzeljs";
import { jsx } from "nano-jsx";
import { FunctionComponent } from "../FunctionComponent";
import { JSXComponent } from "../JSXComponent";
import { SimpleComponent } from "../SimpleComponent";
import { VirtualListPlayground } from "../VirtualList";
import style from "./PlaygroundPage.module.css"

const PretzelJSPlayGround = {
  "SimpleComponent": SimpleComponent,
  "JSXComponent": JSXComponent,
  "VirtualList": VirtualListPlayground,
  "FunctionComponent": FunctionComponent,
}

export class PlaygroundPage extends Component {
  #currentComponent: ComponentHandle | null = null;
  #content: HTMLDivElement | null = null;
  #select: HTMLSelectElement | null = null;

  onBuildClick(event: Event) {
    const component = this.#select?.value;
    if (component && PretzelJSPlayGround[component]) {
      if (this.#currentComponent) {
        destroyComponent(this.#currentComponent);
      }

      if (this.#content) {
        this.#content.innerHTML = "";

        const componentDefinition = PretzelJSPlayGround[component];
        // TODO: renderComponent should be able to handle instance or a constructorSim
        if (componentDefinition.prototype instanceof Component) {
          this.#currentComponent = renderComponent(this.#content, new componentDefinition());
        } else if (componentDefinition instanceof Function) {
          this.#currentComponent = renderComponent(this.#content, componentDefinition);
        }
      }
    }
  }

  public render() {
    return jsx`
      <div class="${style.container}">
        <div class="${style.controls}">
          <select ref="${(el: HTMLSelectElement) => this.#select = el}">
            ${Object.keys(PretzelJSPlayGround).map((key) => {
              return jsx`<option value=${key}>${key}</option>`;
            })}
          </select>
          <button onClick="${(e: Event) => this.onBuildClick(e)}">Build</button>
        </div>
        <div class="${style.content}" ref="${(el: HTMLDivElement) => this.#content = el}">
          Select a component to render...
        </div>
      </div>  
    `;
  }
}