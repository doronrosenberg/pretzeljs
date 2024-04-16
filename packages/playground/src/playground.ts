import { Component, renderComponent, destroyComponent } from '@pretzeljs/pretzeljs';
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

const PretzelJSPlayGround = {
  "SimpleTestComponent": SimpleTestComponent,
  "VirtualListPlayground": VirtualListPlayground
}
let gCurrent = null;

function loadPlayground(event) {
  if (!event.target.hasAttribute("data-type")) {
    return;
  }

  const type = event.target.getAttribute("data-type");

  if (PretzelJSPlayGround[type]) {
    if (gCurrent !== null) {
      destroyComponent(gCurrent);
      gCurrent = null;
    }

    gCurrent = new PretzelJSPlayGround[type]();
    renderComponent(document.getElementById('playground'), gCurrent);

    const currentUrl = new URL(window.location.href);
    const path = currentUrl.pathname.split("/").slice(0, -1)
    path.push(type);
    currentUrl.pathname = path.join("/");
    //PretzelJS.Router.navigateTo(currentUrl.toString())
  }
}

document.getElementById("left-nav-content").addEventListener("click", loadPlayground);
