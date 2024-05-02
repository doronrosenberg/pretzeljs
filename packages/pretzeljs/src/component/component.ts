/**
 * Class based PretzelJS components.
 */
import { generateId } from "../utils";

class EventHandle {
  domNode: HTMLElement;
  type: string;
  listener: EventListener;

  constructor(domNode: HTMLElement, type: string, listener: EventListener) {
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

  public destroy(): void {}

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
  }

  public __cleanup(removeFromDOM: boolean = true): void {
    if (this.domNode === null) {
      throw new Error("Component __cleanup called with unset domNode.");
    }

    // cleanup any managed event listeners.
    this.eventHandles.forEach((handle) => {
      handle.domNode.removeEventListener(handle.type, handle.listener);
    });
    this.eventHandles = [];

    if (removeFromDOM) {
      if (!this.domNode.parentNode) {
        throw new Error("Component __cleanup called with parent-less domNode.");
      }
      this.domNode.parentNode.removeChild(this.domNode);
    }

    this.domNode = null;
  }

  public getNode(): HTMLElement | null {
    return this.domNode;
  }

  public getId(): string {
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
  public attachListener(
    node: HTMLElement,
    type: string,
    listener: EventListener,
  ) {
    node.addEventListener(type, listener, false);

    this.eventHandles.push(new EventHandle(node, type, listener));
  }

  // Visible for testing
  public __getEventHandleCount(): number {
    return this.eventHandles.length;
  }
}
