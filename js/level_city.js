var level_city = {
    preload: function () {
      game.load.tilemap("Doom_City", "js/Doom_City.json", null, Phaser.Tilemap.TILED_JSON);
      game.load.image("City", "Pics/city.png");
      game.load.image("metal", "Pics/metal.png");
      game.load.image("door", "Pics/door.jpg");
      game.load.image("mLedge", "Pics/mLedge.png");
      game.load.image("mutant", "Pics/mutant.png");
      game.load.image("goo", "Pics/goo.png");
      game.load.spritesheet("boss", "Pics/boss.png", 136, 108);
      
      game.load.audio("bossHurt", "audio/b1hurt.wav");
      game.load.audio("bossDeath", "audio/b1death.wav");
      game.load.audio("quake", "audio/quake.mp3");
    },

    create: function () {
      var enemiesTotal = 25;
      var music;
      state = "City";
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
      
      level_load.levelStart();
      
      //Music
      music = game.add.audio("quake");
      music.loopFull(0.6);
      music.volume = 0.65;
      
      //Player
      level_load.spawnPlayer();
      player.health = 5;
      
      //Boss
      boss = game.add.sprite(game.world.width - 500, game.world.height - 150, "boss");
      game.physics.arcade.enable(boss);
      //Animations backwards, splice and fix later
      boss.animations.add("walk");
      boss.animations.play("walk", 4, true);
      boss.anchor.setTo(0.05, 0.85);
      boss.scale.setTo(3, 3);
      boss.body.velocity.x = -29;
      boss.health = 8.0;
      
      level_load.initializeFiring();
      
      //Allows for multiple imps to be created
      imps = game.add.group();
      imps.enableBody = true;
      
      //Loops and adds enemies as long as their number is lower than the total given
      for (var i = 0; i < enemiesTotal/2; i++) {
        //Spawns imps at random points in the world (away from the player)
        imp = imps.create((game.world.randomX + 500), (-200), "imp");
          
        //Imp animations
        imp.animations.add("walk");
        imp.animations.play("walk", 4, true);
        //Anchors imps hitboxes
        imp.scale.setTo(2, 2);
        imp.anchor.setTo(0.3, 0.3);
        imp.body.gravity.y = 200;
        imp.body.collideWorldBounds = true;
        enemiesTotal--;
      }
      
      //Allows for multiple demons to be created
      demons = game.add.group();
      demons.enableBody = true;
      demons.physicsBodyType = Phaser.Physics.ARCADE;
      //Loops and adds enemies as long as their number is lower than the total given
      for (var j = 0; j < enemiesTotal/2; j++) {
        //Spawns demons at random points in the world (away from the player)
        demon = demons.create((game.world.randomX + 1000), (game.world.randomY + -500), "demon");
        demon.animations.add("walk");
        demon.animations.play("walk", 4, true);
               
        //Sets demons at random angles, anchors their hitboxes
        demon.scale.setTo(0.85, 0.85);
        demon.anchor.setTo(0.4, 0.5);
        demon.body.bounce.setTo(1);
        demon.body.gravity.y = 85;
        demon.body.collideWorldBounds = true;
        demon.body.velocity.x = -500;
        enemiesTotal--;
      }     
    }, 
    
    update: function () {
      level_load.enemyFollowPlayer();
      level_load.firingPlayer();
      game.physics.arcade.collide(demons, Foreground);
      game.physics.arcade.collide(player, Foreground);
      game.physics.arcade.collide(pDeath, Foreground);
      game.physics.arcade.collide(imps, Foreground);
      game.physics.arcade.collide(boss, Foreground);
      game.physics.arcade.collide(boss, EnemyCollision);
      game.physics.arcade.collide(demons, EnemyCollision);
      game.physics.arcade.collide(demons, demons);
      game.physics.arcade.collide(imps, EnemyCollision);
      game.physics.arcade.collide(player, EnemyCollision);
      game.physics.arcade.collide(pDeath, EnemyCollision);
      //Enables bullets to hit and kill enemies
      game.physics.arcade.collide(demons, bullets, level_load.killCaco, null, this);
      game.physics.arcade.collide(imps, bullets, level_load.killImp, null, this);
      game.physics.arcade.collide(boss, bullets, level_load.bossHealth, null, this);

      //If sprites collide pass it to their respective function
      game.physics.arcade.collide(player, demons, level_load.killPlayer, null, this);
      game.physics.arcade.collide(player, imps, level_load.killPlayer, null, this);
      game.physics.arcade.collide(player, boss, level_load.killPlayer, null, this);
      game.physics.arcade.collide(player, EndDoor, level_load.end, null, this);
      
      //Lets enemies occasionally phase thru walls for an extra challenge!
      if (level_load.dieRoll() < 4) {
          demon.body.checkCollision.left = false;
      }
      
      level_load.flipPlayer();
      level_load.playerUtilities();
    },
};