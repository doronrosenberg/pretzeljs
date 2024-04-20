import { renderComponent } from '@pretzeljs/pretzeljs';
import { PlaygroundPage } from "./components/PlaygroundPage/PlaygroundPage";

renderComponent(document.getElementById('playground'), new PlaygroundPage());