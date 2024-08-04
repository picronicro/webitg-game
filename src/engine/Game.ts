import Phaser from "phaser";
import LoaderScene from "./scenes/LoaderScene.ts";

export default class Game {

    readonly _config = {
        type: Phaser.WEBGL,
        canvas: document.getElementById("game"),
        scale: {
            mode: Phaser.Scale.RESIZE
        },
        backgroundColor: '#4488aa',
        scene: LoaderScene
    }

    game: Phaser.Game = new Phaser.Game(this._config);

}
