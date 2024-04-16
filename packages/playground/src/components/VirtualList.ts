import { Component, renderComponent, destroyComponent } from '@pretzeljs/pretzeljs';

/**
 * Virtual list widget.
 *
 * viewport - the main dom node that can be styled by the enduser.
 *
 * TODO: docs/tests
 */

enum ScrollDirection {
  DOWN, UP
}

class VirtualList extends Component {
  #viewport: HTMLElement | null = null;
  #container: HTMLElement | null = null;

  // virtualized row pages
  #pageCount = 3;
  #pageSize = 1.2;
  // pages are arranged in visual order
  #pages: Array<HTMLElement> = [];
  #rowsPerPage = 0;
  #pageHeight = 0;

  // scroll handling
  #scrollTickRequested = false;
  #scrollLastHandledYOffset = 0;

  #data: Array<string> = [];

  constructor() {
    super();

    // create some dummy data
    for (let i = 0; i < 1000; i++) {
      this.#data.push(`row ${i}`);
    }
  }

  public render(): HTMLElement {
    this.#viewport = document.createElement("div");
    this.#viewport.classList.add("pjs-vl-viewport");

    this.#container = document.createElement("div");
    this.#container.classList.add("pjs-vl-container");
    this.#viewport.appendChild(this.#container);

    // since our nodes are not added to the DOM yet, wait for next tick which should be after nodes are added
    // TODO: need a better way to do this.
    setTimeout(() => {
      this.resizeContainer();
      this.buildPages();

      this.attachListener(this.#viewport, "scroll",  this.scrollEvent.bind(this));
    }, 0)

    return this.#viewport;
  }

  private scrollUpdate() {
    this.#scrollTickRequested = false;

    if (this.#viewport == null) {
      throw new Error("Attempted to process scroll event without a viewport.");
    }

    // check if any pages need to be moved
    const newScrollYOffset = this.#viewport.scrollTop;
    if (newScrollYOffset == this.#scrollLastHandledYOffset) {
      return;
    }

    // positive - scrolled down, negative - scrolled up
    const velocity = newScrollYOffset - this.#scrollLastHandledYOffset;

    if (Math.abs(velocity) > this.#pageHeight) {
      // if we scrolled more than one page height, rebuild the pages
      // TODO: this probably can be smarter, checking if the virtual pages are out of sync?
      this.rebuildPages();
    } else {
      this.handleSmallScroll(velocity)
    }

    this.#scrollLastHandledYOffset = newScrollYOffset;
  }

  /**
   * Handles a small scroll amount, where the user scrolled to an existing page.
   *
   * @param velocity
   * @private
   */
  private handleSmallScroll(velocity: number) {
    if (velocity > 0) {
      // if we scrolled down, we process the top pages
      let done = false;
      let i = 0;
      while (!done && i < this.#pageCount) {
        done = !this.handlePageScroll(i++, ScrollDirection.DOWN);
      }
    } else {
      // if we scrolled up, we process the bottom pages
      let done = false;
      let i = this.#pageCount - 1;
      while (!done && i > 0) {
        done = !this.handlePageScroll(i--, ScrollDirection.UP);
      }
    }
  }

  private rebuildPages() {
    // calculate where the pages should start from, assuming the user had scrolled normally
    const start = Math.floor(this.#viewport.scrollTop / this.#pageHeight) * this.#pageHeight;

    this.#pages.forEach((page, idx) => {
      page.style.top = start + (idx * this.#pageHeight) + "px";
      this.fillInPage(page);
    });
  }

  /*
    TODO: This works for small scrolls, but for larger scrolls (like jumping to a certain location) this logic will not
    work.

    Possible solution: track the visible page, and if after scrolling the visible page has changed, we rebuild the pages
    back to the expected state.
   */
  private handlePageScroll(index: number, direction: ScrollDirection): boolean {
    let wasMoved = false;
    const page = this.#pages[index];

    // check if page needs to be moved
    if (direction == ScrollDirection.DOWN) {
      if (page.offsetTop + page.offsetHeight < this.#viewport.scrollTop) {
        wasMoved = true;

        // shift the first page out and put it in the end
        this.#pages.push(this.#pages.shift());

        const previousPage = this.#pages[this.#pageCount-2];
        page.style.top = (previousPage.offsetTop + this.#pageHeight) + "px";

        this.fillInPage(page);
      }
    } else {
      if (page.offsetTop > (this.#viewport.scrollTop + this.#pageHeight)) {
        wasMoved = true;

        // pop the last page out and put it in the start
        this.#pages.unshift(this.#pages.pop());

        const previousPage = this.#pages[1];
        page.style.top = (previousPage.offsetTop - this.#pageHeight) + "px";

        this.fillInPage(page);
      }
    }

    return wasMoved;
  }

  private scrollEvent(e: Event) {
    if (!this.#scrollTickRequested) {
      requestAnimationFrame(this.scrollUpdate.bind(this));
      this.#scrollTickRequested = true;
    }
  }

  private fillInPage(pageNode: HTMLElement) {
    const startIndex = (pageNode.offsetTop / this.#pageHeight) * this.#rowsPerPage;

    // row nodes are direct children of the page node
    const children = pageNode.children;

    for (let i = 0; i < children.length; i++) {
      const child = children.item(i);

      if (child instanceof HTMLElement) {
        child.innerText = this.#data[startIndex + i];
      }
    }
  }

  private resizeContainer(): void {
    if (this.#container != null) {
      this.#container.style.height = this.calculateContainerHeight() + "px";
    }
  }

  private buildPages(): void {
    this.#pageHeight = this.calculatePageHeight();

    for (let i = 0; i < this.#pageCount; i++) {
      const page = this.buildPage();
      this.#pages.push(page);
      this.#container?.appendChild(page);

      page.style.height = this.#pageHeight + "px";
      page.style.top = (i * this.#pageHeight) + "px";

      this.fillInPage(page);
    }
  }

  private buildPage(): HTMLElement {
    const page = document.createElement("div");
    page.classList.add("pgs-vl-page");

    for (let i = 0; i < this.#rowsPerPage; i++) {
      const rowNode = document.createElement("div");
      rowNode.classList.add("pgs-vl-page-row");
      page.appendChild(rowNode);
    }

    return page;
  }

  private calculateViewportHeight(): number {
    if (this.#viewport === null) {
      return 0;
    }

    return this.#viewport.offsetHeight;
  }

  private calculatePageHeight(): number {
    const rowHeight = this.calculateRowHeight();
    const height = this.calculateViewportHeight();
    let pageHeight = Math.ceil(height * this.#pageSize);

    // now adjust pageHeight to fit in rows
    this.#rowsPerPage = Math.ceil(pageHeight / rowHeight);
    pageHeight = this.#rowsPerPage * rowHeight;

    return pageHeight;
  }

  private calculateContainerHeight(): number {
    return this.#data.length * this.calculateRowHeight();
  }

  private calculateRowHeight(): number {
    return 60;
  }
}

class VirtualListPlayground extends Component {
  #component: Component | null = null;

  public render() {
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
      this.#component = new VirtualList();
      renderComponent(this.getNode()?.querySelector(".component-content"), this.#component);

      this.#component.getNode()?.classList.add("playgroundVirtualList");
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
  VirtualList,
  VirtualListPlayground,
}