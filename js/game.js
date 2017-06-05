var game = new Phaser.Game(800, 595, Phaser.CANVAS, "game"); 
game.state.add("Load", level_load);
game.state.add("Hell", level_hell);
game.state.add("City", level_city);
game.state.start("Load");