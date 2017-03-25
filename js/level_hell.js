var level_hell = {
    preload: function() {
      game.load.tilemap("Doom_Map", "js/Doom_Map.json", null, Phaser.Tilemap.TILED_JSON);
      game.load.image("Heck", "Pics/Heck.gif");
      game.load.image("dirt", "Pics/dirt.png");
      game.load.image("door", "Pics/door.jpg");
      game.load.image("ledge", "Pics/ledge.gif");
      game.load.image("death", "Pics/death.png");
      game.load.image("light", "Pics/light.png");
      
      game.load.audio("Sandman", "audio/Sandman.mp3");
    },
    
    create: function () {
      var enemiesTotal = 25;
      var music;
      state = "Hell";
      //Map
      map = game.add.tilemap("Doom_Map");
      map.addTilesetImage("Heck");
      map.addTilesetImage("dirt");
      map.addTilesetImage("door");
      map.addTilesetImage("ledge");
      map.addTilesetImage("death");
      map.addTilesetImage("light");
      
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
      music = game.add.audio("Sandman");
      music.loopFull(0.6);
      music.volume = 0.65;
      
      //Player
      level_load.spawnPlayer();
      level_load.initializeFiring();
      
      //Need a "null" boss in order to keep enemy movement function satisfied
      boss = game.add.sprite(0);
      game.physics.arcade.enable(boss);
      
      //Allows for multiple imps to be created
      imps = game.add.group();
      imps.enableBody = true;
      //imps.physicsBodyType = Phaser.Physics.ARCADE; Unsure if needed, research
      
      //Loops and adds enemies as long as their number is lower than the total given
      for (var i = 0; i < enemiesTotal/2; i++) {
        //Spawns imps at random points in the world (away from the player)
        imp = imps.create((game.world.randomX + 500), (-200), "imp");
        imp.killable = true;  
        //Imp animations
        imp.animations.add("walk");
        imp.animations.play("walk", 4, true);
        //Anchors imps hitboxes
        imp.scale.setTo(2, 2);
        imp.anchor.setTo(0.4, 0.3);
        imp.body.gravity.y = 200;
        imp.body.collideWorldBounds = true;
        enemiesTotal--;
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
        demon.killable = true;
               
        //Sets demons at random angles, anchors their hitboxes
        demon.scale.setTo(0.85, 0.85);
        demon.anchor.setTo(0.5, 0.5);
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
      game.physics.arcade.collide(demons, EnemyCollision);
      game.physics.arcade.collide(demons, demons);
      game.physics.arcade.collide(imps, EnemyCollision);
      game.physics.arcade.collide(player, EnemyCollision);
      game.physics.arcade.collide(pDeath, EnemyCollision);
      //Enables bullets to hit and kill enemies
      game.physics.arcade.collide(demons, bullets, level_load.killCaco, null, this);
      game.physics.arcade.collide(imps, bullets, level_load.killImp, null, this);
      //If sprites collide pass it to their respective function
      game.physics.arcade.collide(player, demons, level_load.killPlayer, null, this);
      game.physics.arcade.collide(player, imps, level_load.killPlayer, null, this);
      game.physics.arcade.collide(player, EndDoor, level_load.endLevel, null, this);
      
      //Lets enemies occasionally phase thru walls for an extra challenge!
      if (level_load.dieRoll() < 4) {
          demon.body.checkCollision.left = false;
      }
      level_load.flipPlayer();
      level_load.playerUtilities();
    },
};