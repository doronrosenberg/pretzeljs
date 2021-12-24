function generateId(): string {
  const dict = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let id = ""
  for (let i = 0; i < 6; i++) {
    id += dict[Math.floor(Math.random() * (dict.length))];
  }

  return id;
}

export const ID_ATTRIBUTE = "data-pjs-id";

/*
  Having a global map of id:component is iffy since we can end up holding on to a component if it wasn't properly
  destroyed.  One option (old school) is to have a custom property on the DOM node point to the component instance,
  but that would be a circular dependency (since components hold a ref to their DOM node).

  TODO: figure out what is the best approach
 */
const componentHash: { [key: string]: Component } = {};

export class Component {
  private id!: string;
  private domNode!: HTMLElement | null;

  public render(): HTMLElement {
    throw new Error("render() method needs to be implemented.");
  }

  public destroy(): void {
  }

  /**
   * Initializes a component by setting its domNode.
   *
   * @param node
   */
  public __init(node: HTMLElement): void {
    if (typeof this.domNode !== "undefined") {
      throw new Error("Component initialized more than once.");
    }

    this.domNode = node;
    this.id = this.constructor.name + ":" + generateId();

    componentHash[this.id] = this;

    this.domNode.setAttribute(ID_ATTRIBUTE, this.id);
  }

  public __cleanup(removeFromDOM: boolean = true): void {
    if (this.domNode === null) {
      throw new Error("Component __cleanup called with unset domNode.");
    }

    if (removeFromDOM) {
      if (!this.domNode.parentNode) {
        throw new Error("Component __cleanup called with parent-less domNode.");
      }
      this.domNode.parentNode.removeChild(this.domNode);
    }

    this.domNode = null;
    delete componentHash[this.id];
  }

  public getNode(): HTMLElement | null {
    return this.domNode;
  }

  public getId(): String {
    return this.id;
  }
}

export function getComponentById(id: string): Component {
  return componentHash[id];
}

export function renderComponent(parentNode: HTMLElement, component: Component) {
  const node = component.render();
  component.__init(node);
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
}