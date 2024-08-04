import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Game from "../engine/Game.ts";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App/>
)

// Load the engine
const GAME = new Game()

// TODO: PixiJS debugger
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
globalThis.__PHASER_GAME__ = GAME.game;