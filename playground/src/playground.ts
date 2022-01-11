import { Component, renderComponent, destroyComponent } from '../../src/index';
import { VirtualListPlayground } from './components/VirtualList';

class TestComponent extends Component {
  render() {
    const div = document.createElement("div");
    div.innerText = "This is a simple component with some text.";
    return div;
  }
}

class SimpleTestComponent extends Component {
  #component: Component | null = null;

  render() {
    const div = document.createElement("div");

    const controlDiv = document.createElement("div");

    const createButton = document.createElement("button");
    createButton.innerText = "Create Component";
    this.attachListener(createButton, "click", this.create.bind(this));
    controlDiv.appendChild(createButton);

    const destroyButton = document.createElement("button");
    destroyButton.innerText = "Destroy Component";
    this.attachListener(destroyButton, "click", this.destroyComponent.bind(this));

    controlDiv.appendChild(destroyButton);

    div.appendChild(controlDiv)

    const contentDiv = document.createElement("div");
    contentDiv.className = "component-content";
    div.appendChild(contentDiv);
    return div;
  }

  create() {
    if (this.#component === null) {
      this.#component = new TestComponent();
      renderComponent(this.getNode()?.querySelector(".component-content"), this.#component);
    }
  }

  destroyComponent() {
    if (this.#component !== null) {
      destroyComponent(this.#component);
      this.#component = null;
    }
  }
}

export {
  VirtualListPlayground,
  SimpleTestComponent,
  TestComponent
}