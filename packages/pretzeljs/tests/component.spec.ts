// the .js is needed because of ts-node/esm.  Need to find a better way to run these tests.
import { expect } from "chai";
import 'mocha';
import * as jsdom from 'jsdom';
import { Component, destroyComponent, renderComponent } from "../src";

const { JSDOM } = jsdom;
const { document } = (new JSDOM('')).window;

describe('Component tests', () => {
  it('Test event listener cleanup', () => {
    const div = document.createElement("div");

    class TestComponent extends Component {
      render(): HTMLElement {

        this.attachListener(div, "click", this.click.bind(this))

        return div;
      }

      click(): void {}
    }

    const component = new TestComponent();
    renderComponent(document.body, component);
    // there is no DOM api to get event listeners for a node so we have to use an internal method
    expect(component.__getEventHandleCount()).to.equal(1);

    destroyComponent(component);
    expect(component.__getEventHandleCount()).to.equal(0);
  });
});

