var level_city = {
    preload: function () {
      game.load.tilemap("Doom_City", "js/Doom_City.json", null, Phaser.Tilemap.TILED_JSON);
      game.load.image("City", "Pics/city.png");
      game.load.image("metal", "Pics/metal.png");
      game.load.image("door", "Pics/door.jpg");
      game.load.image("mLedge", "Pics/mLedge.gif");
      game.load.image("mutant", "Pics/mutant.png");
      game.load.image("goo", "Pics/goo.png");
      game.load.spritesheet("boss", "Pics/boss.png", 136, 108);
      
      game.load.audio("quake", "audio/quake.mp3");
    },

    create: function () {
      var enemiesTotal = 25;
      var music;
      //Map
      map = game.add.tilemap("Doom_City");
      map.addTilesetImage("City");
      map.addTilesetImage("metal");
      map.addTilesetImage("door");
      map.addTilesetImage("mLedge");
      map.addTilesetImage("mutant");
      map.addTilesetImage("goo");
      
      Background = map.createLayer("Background");
      BackgroundObjects = map.createLayer("BackgroundObjects");
      Background.resizeWorld();
      Foreground = map.createLayer("Foreground");
      EnemyCollision = map.createLayer("EnemyCollision");
      EndDoor = map.createLayer("EndDoor");
      map.setCollisionByExclusion([1],true,"Foreground");
      map.setCollisionByExclusion([780],true, "EnemyCollision");
      map.setCollisionByExclusion([1],true,"EndDoor");
      
      //Start Menu  
      var pauseLogo = game.add.sprite(50, 50, "doom");
      pauseLogo.inputEnabled = true;
      pauseLogo.scale.setTo(1.3, 1);
      game.paused = true;
      
      //Starts game and unleashes horde
      game.input.onDown.add(function unpause() {
        game.paused = false;
        pauseLogo.kill();
          
        if (pauseLogo.inputEnabled !== false) {
          start = game.add.audio("start");
          start.play();
          pauseLogo.inputEnabled = false;
        }
      }, self); 
      
      //Enable Physics
      game.physics.startSystem(Phaser.Physics.ARCADE);
      
      //Music
      music = game.add.audio("quake");
      music.loopFull(0.6);
      music.volume = 0.65;
      
      //Player
      player = game.add.sprite(-40, game.world.height - 97, "DoomGuy");
      player.animations.add("walk");
      player.animations.play("walk", 4, true);
      player.anchor.setTo(0.5, 0.6);
      player.scale.setTo(0.7, 0.7);
      game.camera.follow(player);
      game.physics.arcade.enable(player);
      player.body.gravity.y = 680;
      player.body.collideWorldBounds = true;
      
      //Boss
      boss = game.add.sprite(game.world.width - 500, game.world.height - 150, "boss");
      game.physics.arcade.enable(boss);
      //Animations backwards, splice and fix later
      boss.animations.add("walk");
      boss.animations.play("walk", 4, true);
      boss.anchor.setTo(0.5, 0.6);
      boss.scale.setTo(2.5, 2.5);
      boss.body.bounce.setTo(1, 0);
      
      //Bullets
      bullets = game.add.group();
      bullets.enableBody = true;
      bullets.createMultiple(1, "bullet");
      bullets.checkWorldBounds = true;
      bullets.outOfBoundsKill = true;
      
      //Allows for multiple imps to be created
      imps = game.add.group();
      imps.enableBody = true;
      //imps.physicsBodyType = Phaser.Physics.ARCADE; Unsure if needed, research
      
      //Loops and adds enemies as long as their number is lower than the total given
      for (var i = 0; i < enemiesTotal/2; i++) {
        //Spawns imps at random points in the world (away from the player)
        imp = imps.create((game.world.randomX + 500), (-200), "imp");
          
        //Imp animations
        imp.animations.add("walk");
        imp.animations.play("walk", 4, true);
        //Anchors imps hitboxes
        imp.scale.setTo(2, 2);
        imp.anchor.setTo(0.4, 0.3);
        imp.body.gravity.y = 200;
        imp.body.collideWorldBounds = true;
      }
      
      //Allows for multiple demons to be created
      demons = game.add.group();
      demons.enableBody = true;
      demons.physicsBodyType = Phaser.Physics.ARCADE;
      //Loops and adds enemies as long as their number is lower than the total given
      for (var i = 0; i < enemiesTotal/2; i++) {
        //Spawns demons at random points in the world (away from the player)
        demon = demons.create((game.world.randomX + 1000), (game.world.randomY + -500), "demon");
        demon.animations.add("walk");
        demon.animations.play("walk", 4, true);
               
        //Sets demons at random angles, anchors their hitboxes
        demon.scale.setTo(0.85, 0.85);
        demon.anchor.setTo(0.5, 0.5);
        demon.body.bounce.setTo(1);
        demon.body.gravity.y = 85;
        demon.body.collideWorldBounds = true;
        demon.body.velocity.x = -500;
      }     
    }, 
    
    enemyFollowPlayer: function () {
    imps.forEach(function (imp) {
      game.physics.arcade.accelerateToObject(imp, player, 500, 400, 900); 
      if (player.x < imp.x) {
        imp.scale.x = 2; 
      } else {
        imp.body.bounce.setTo(0, 0.9);
        imp.scale.x = -2; 
      }}, game.physics.arcade);
      
      if (player.y >= imp.y) {
        imp.body.bounce.setTo(0, 0.9);
      } else {
        imp.body.bounce.setTo(0);
      }
    },
    
    update: function () { 
      this.enemyFollowPlayer();
      game.physics.arcade.collide(demons, Foreground);
      game.physics.arcade.collide(player, Foreground);
      game.physics.arcade.collide(imps, Foreground);
      game.physics.arcade.collide(demons, EnemyCollision);
      game.physics.arcade.collide(demons, demons);
      game.physics.arcade.collide(imps, EnemyCollision);
      game.physics.arcade.collide(player, EnemyCollision);
      game.physics.arcade.collide(bullets, EnemyCollision, level_hell.killEnemies, null, this);
      game.physics.arcade.collide(bullets, Foreground, level_hell.killEnemies, null, this);
      //Enables bullets to hit and kill enemies
      if (game.physics.arcade.collide(demons, bullets, level_hell.killEnemies, null, this)) {
        demonDeaths = true;
        impDeaths = false;
      } else if (game.physics.arcade.collide(imps, bullets, level_hell.killEnemies, null, this)) {
        demonDeaths = false;
        impDeaths = true; 
      } 
      //If sprites collide pass it to their respective function
      //game.physics.arcade.collide(player, demons, this.killPlayer, null, this);
      //game.physics.arcade.collide(player, imps, this.killPlayer, null, this);
      game.physics.arcade.collide(player, EndDoor, level_hell.endLevel, null, this);
      
      //Lets enemies occasionally phase thru walls for an extra challenge!
      if (level_hell.dieRoll() < 4) {
          demon.body.checkCollision.left = false;
      }
      
      level_hell.flipPlayer();
      player.body.velocity.x = 0;
      //Assigning Movement keys to WASD And E is setup to let the player aim and Fire upwards
      if ((game.input.keyboard.isDown(Phaser.Keyboard.A)) && (player.alive === true)) {
        player.scale.x = -0.8;  // a little trick.. flips the image to the left
        player.body.velocity.x = -300;
      } else if ((game.input.keyboard.isDown(Phaser.Keyboard.D)) && (player.alive === true)) {
        player.scale.x = 0.8;  // a little trick.. flips the image to the right
        player.body.velocity.x = 300;
      }
      //Allows jumping while running using W
      if ((game.input.keyboard.isDown(Phaser.Keyboard.W)) && (player.alive === true)) {
        if(player.body.onFloor()){
          player.body.velocity.y = -600;
        }
      } else if ((game.input.keyboard.isDown(Phaser.Keyboard.S)) && (player.alive === true)) {
        player.body.velocity.y += 25;
      }
      //Allows user to fire using mouse1
      if (game.input.activePointer.isDown && (player.alive === true)) {
        level_hell.fire();
      }
    },   
};