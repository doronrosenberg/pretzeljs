import { Component } from "./component";

export const ID_ATTRIBUTE = "data-pjs-id";

/*
  Having a global map of id:component is iffy since we can end up holding on to a component if it wasn't properly
  destroyed.  One option (old school) is to have a custom property on the DOM node point to the component instance,
  but that would be a circular dependency (since components hold a ref to their DOM node).

  TODO: figure out what is the best approach
 */
const componentHash: { [key: string]: Component } = {};

export function getComponentById(id: string): Component {
  return componentHash[id];
}

export function renderComponent(parentNode: HTMLElement, component: Component) {
  const node = component.render();
  component.__init(node);
  node.setAttribute(ID_ATTRIBUTE, component.getId());

  componentHash[component.getId()] = component;

  parentNode.appendChild(node);
}

export function destroyComponent(component: Component) {
  // get all child components
  const filter: NodeFilter = {
    acceptNode(node: Node): number {
      if (node instanceof Element) {
        return node.hasAttribute(ID_ATTRIBUTE) ? 1 : 0;
      }

      return 0;
    }
  }

  const node = component.getNode();
  if (!node) {
    throw new Error("destroyComponent called on component with no domNode.");
  }

  const childComponents = node.querySelectorAll(`[${ID_ATTRIBUTE}]`);
  childComponents.forEach((childNode) => {
    const id = childNode.getAttribute(ID_ATTRIBUTE);

    if (!id) {
      throw new Error("Could not find id attribute on component.");
    }

    if (id == component.getId()) {
      return;
    }

    // TODO: handle errors
    const childComponent = getComponentById(id);
    childComponent.destroy();
    childComponent.__cleanup(false);
  })

  component.destroy();
  component.__cleanup(true);
  delete componentHash[component.getId()];
}