import { Component, renderComponent, destroyComponent } from '../../src/index';

class TestComponent extends Component {
  render() {
    const div = document.createElement("div");
    div.innerText = "Container!";
    const textDiv = document.createElement("div");
    div.appendChild(textDiv);
    const button = document.createElement("button");
    button.textContent = "destroy";
    div.appendChild(button);
    return div;
  }
}

class SimpleTestComponent extends Component {
  #component = null;

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
  SimpleTestComponent,
  TestComponent
}