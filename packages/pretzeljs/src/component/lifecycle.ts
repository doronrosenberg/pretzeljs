import { generateId } from "../utils";
import { Component } from "./component";

export const ID_ATTRIBUTE = "data-pjs-id";

type COMPONENT_TYPES = Component | (() => HTMLElement);

enum ComponentType {
  CLASS,
  FUNCTION
}

export interface ComponentHandle {
  getId(): string;
  getType(): ComponentType;
  getRef(): COMPONENT_TYPES;
}

class ClassComponentHandle implements ComponentHandle {
  constructor(private id: string, private ref: Component) {}

  getId() {
    return this.id;
  }

  getType() {
    return ComponentType.CLASS;
  }

  getRef() {
    return this.ref;
  }
}

class FunctionComponentHandle implements ComponentHandle {
  constructor(private id: string, private ref: () => HTMLElement) {}

  getId() {
    return this.id;
  }

  getType() {
    return ComponentType.FUNCTION;
  }

  getRef() {
    return this.ref;
  }
}

/*
  Having a global map of id:component is iffy since we can end up holding on to a component if it wasn't properly
  destroyed.  One option (old school) is to have a custom property on the DOM node point to the component instance,
  but that would be a circular dependency (since components hold a ref to their DOM node).

  TODO: figure out what is the best approach
 */
const componentHash: { [key: string]: ComponentHandle } = {};

export function getComponentById(id: string): ComponentHandle {
  return componentHash[id];
}

export function renderComponent(parentNode: HTMLElement, component: COMPONENT_TYPES): ComponentHandle {
  if (component instanceof Component) {
    const node = component.render();
    component.__init(node);
    node.setAttribute(ID_ATTRIBUTE, component.getId());

    componentHash[component.getId()] = new ClassComponentHandle(component.getId(), component);

    parentNode.appendChild(node);

    return componentHash[component.getId()];
  }

  if (component instanceof Function) {
    const node = component();
    parentNode.appendChild(node);

    const id = generateId();
    node.setAttribute(ID_ATTRIBUTE, id);

    return new FunctionComponentHandle(id, component);
  }
}

function destroyClassComponent(handle: ClassComponentHandle, processChildren: boolean) {
  const component = handle.getRef();

  const node = component.getNode();
  if (!node) {
    throw new Error("destroyComponent called on component with no domNode.");
  }

  if (processChildren) {
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
      destroyComponent(childComponent, false);
    })
  }

  component.destroy();
  component.__cleanup(processChildren);
}

function destroyFunctionComponent(handle: FunctionComponentHandle) {
  const id = handle.getId()

  const node = document.querySelector(`[${ID_ATTRIBUTE}="${id}"]`);

  if (!node) {
    throw new Error(`Could not find node for function component ${id}.`);
  }

  node.parentNode?.removeChild(node);
}

export function destroyComponent(handle: ComponentHandle, processChildren = true) {
  // get all child components
  const filter: NodeFilter = {
    acceptNode(node: Node): number {
      if (node instanceof Element) {
        return node.hasAttribute(ID_ATTRIBUTE) ? 1 : 0;
      }

      return 0;
    }
  }

  if (handle instanceof ClassComponentHandle) {
    destroyClassComponent(handle, processChildren);
  } else if (handle instanceof FunctionComponentHandle) {
    destroyFunctionComponent(handle);
  }

  delete componentHash[handle.getId()];
}

export type ComponentTreeNode = {
  id: string;
  children: ComponentTreeNode[];
}

export function getComponentTree(node: Element): ComponentTreeNode[] {
  const childComponents = node.querySelectorAll(`[${ID_ATTRIBUTE}]`);
  const foundIds = new Set<string>();

  const struct = [];

  childComponents.forEach((childNode) => {
    const id = childNode.getAttribute(ID_ATTRIBUTE);
    if (!id) {
      throw new Error("Could not find id attribute on component.");
    }

    if (foundIds.has(id)) {
      return;
    }

    foundIds.add(id);

    const comp = {
      id: id,
      children: []
    }

    comp.children = getComponentTree(childNode);

    comp.children.forEach((child) => {
      foundIds.add(child.id);
    });

    struct.push(comp);
  });

  return struct;
}