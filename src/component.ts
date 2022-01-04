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

class EventHandle {
  domNode: HTMLElement;
  type: String;
  listener: Function;

  constructor(domNode: HTMLElement, type: String, listener: Function) {
    this.domNode = domNode;
    this.type = type;
    this.listener = listener;
  }
}

export class Component {
  private id!: string;
  private domNode!: HTMLElement | null;
  private eventHandles: Array<EventHandle> = [];

  /**
   * Returns the DOM structure to use for the component.  Called once when the component is being built.
   */
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

    // cleanup any managed event listeners.
    this.eventHandles.forEach((handle) => {
      handle.domNode.removeEventListener(handle.type, handle.listener);
    })
    this.eventHandles = [];

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

  // TODO: add support for addEventListener options/useCapture
  /**
   * Attaches an event listener to a DOM node owned by the component.  Will get cleaned up properly when the component
   * is destroyed.
   *
   * Should only be called on nodes that are not manually removed from the DOM.
   *
   * @param node
   * @param type
   * @param listener
   */
  public attachListener(node: HTMLElement, type: String, listener: Function) {
    node.addEventListener(type, listener);

    this.eventHandles.push(new EventHandle(node, type, listener));
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