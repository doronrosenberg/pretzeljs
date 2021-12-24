import { Component } from '../../src/index';

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

export {
  TestComponent
}