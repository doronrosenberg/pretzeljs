// the .js is needed because of ts-node/esm.  Need to find a better way to run these tests.
import { expect } from "chai";
import * as jsdom from "jsdom";
import { jsx } from "nano-jsx";
import { describe, test } from "vitest";
import {
  Component,
  destroyComponent,
  getComponentById,
  getComponentTree,
  renderComponent,
} from "../index";

const { JSDOM } = jsdom;
const { document } = new JSDOM("").window;

describe("Component tests", () => {
  test("Test event listener cleanup", () => {
    const div = document.createElement("div");

    class TestComponent extends Component {
      render(): HTMLElement {
        this.attachListener(div, "click", this.click.bind(this));

        return div;
      }

      click(): void {}
    }

    const component = new TestComponent();
    const handle = renderComponent(document.body, component);
    // there is no DOM api to get event listeners for a node so we have to use an internal method
    expect(component.__getEventHandleCount()).to.equal(1);

    destroyComponent(handle);
    expect(component.__getEventHandleCount()).to.equal(0);
  });

  test("Should correctly destroy child components", () => {
    class TestComponent extends Component {
      render(): HTMLElement {
        const div = document.createElement("div");
        div.appendChild(document.createTextNode("Test"));
        this.attachListener(div, "click", this.click.bind(this));
        return div;
      }

      click(): void {}
    }

    class ParentComponent extends Component {
      render(): HTMLElement {
        const div = document.createElement("div");
        div.appendChild(document.createTextNode("Parent"));
        this.attachListener(div, "click", this.click.bind(this));

        const div2 = document.createElement("div");
        div.appendChild(div2);
        renderComponent(div2, new TestComponent());

        return div;
      }

      click(): void {}
    }

    const parent = document.createElement("div");
    document.body.appendChild(parent);

    const component = new ParentComponent();
    const handle = renderComponent(parent, component);

    const tree = getComponentTree(document.body);
    expect(tree.length).to.equal(1);
    expect(tree[0].children.length).to.equal(1);
    expect(tree[0].id).to.include("ParentComponent:");
    expect(tree[0].children[0].id).to.include("TestComponent:");

    // there is no DOM api to get event listeners for a node so we have to use an internal method
    expect(component.__getEventHandleCount()).to.equal(1);

    const childComponent = getComponentById(
      tree[0].children[0].id,
    ).getRef() as TestComponent;
    expect(childComponent).instanceof(TestComponent);
    expect(childComponent.__getEventHandleCount()).to.equal(1);

    destroyComponent(handle);
    expect(component.__getEventHandleCount()).to.equal(0);
    expect(childComponent.__getEventHandleCount()).to.equal(0);

    const tree2 = getComponentTree(document.body);
    expect(tree2.length).to.equal(0);
    expect(getComponentById(tree[0].id)).to.equal(undefined);
    expect(getComponentById(tree[0].children[0].id)).to.equal(undefined);
  });

  test("Should correctly destroy function components", () => {
    globalThis.document = document;
    function TestFunctionComponent() {
      return jsx`<div>Test</div>`;
    }

    const parent = document.createElement("div");
    document.body.appendChild(parent);

    const handle = renderComponent(parent, TestFunctionComponent);

    let tree = getComponentTree(document.body);
    expect(tree.length).to.equal(1);
    expect(tree[0].id).to.include("FunctionComponent:");

    destroyComponent(handle);
    const tree2 = getComponentTree(document.body);
    expect(tree2.length).to.equal(0);
    expect(getComponentById(tree[0].id)).to.equal(undefined);
  });
});
