class LoaderScene extends Phaser.Scene {

    preload() {
        this.load.image('arrow', 'src/assets/itg-arrow.png');
        console.warn("Initializing the Game");
    }

    create() {
        let arrow = this.add.image(100, 100, "arrow");
        arrow.setScale(0.05);

        this.add.text(100, 600, "WebITG");
    }

}

export default LoaderScene;