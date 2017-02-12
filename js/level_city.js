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
      
      level_hell.levelStart();
      
      //Music
      music = game.add.audio("quake");
      music.loopFull(0.6);
      music.volume = 0.65;
      
      //Player
      level_hell.spawnPlayer();
      player.health = 5;
      
      //Boss
      boss = game.add.sprite(game.world.width - 500, game.world.height - 150, "boss");
      game.physics.arcade.enable(boss);
      //Animations backwards, splice and fix later
      boss.animations.add("walk");
      boss.animations.play("walk", 4, true);
      boss.anchor.setTo(0.2, 0.75);
      boss.scale.setTo(3, 3);
      boss.body.velocity.x = -29;
      boss.health = 5.0;
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
      for (var i = 0; i < enemiesTotal/2; i++) {
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
    
    enemyFollowPlayer: function () {
    if (player.x < boss.x) {
        boss.scale.x = -3;
        boss.body.velocity.x = -30;        
    } else {
        boss.scale.x = 3;
        boss.body.velocity.x = 30;        
    }
      
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
    
    bossHealth: function () {
      var bossHurt = game.add.audio("bossHurt");
      var bossDeath = game.add.audio("bossDeath"); 
      if (boss.health > 0) {
        boss.health -= 0.1;
        bossHurt.volume = 0.2;
        bossHurt.play();
      } else {
          bossDeath.volume = 0.4;
          bossDeath.play();
          boss.kill();
          level_hell.score += 1000;
        }
    },
    
    update: function () {
      this.enemyFollowPlayer();
      game.physics.arcade.collide(demons, Foreground);
      game.physics.arcade.collide(player, Foreground);
      game.physics.arcade.collide(imps, Foreground);
      game.physics.arcade.collide(boss, Foreground);
      game.physics.arcade.collide(boss, EnemyCollision);
      game.physics.arcade.collide(demons, EnemyCollision);
      game.physics.arcade.collide(demons, demons);
      game.physics.arcade.collide(imps, EnemyCollision);
      game.physics.arcade.collide(player, EnemyCollision);
      game.physics.arcade.collide(bullets, EnemyCollision, level_hell.killEnemies, null, this);
      game.physics.arcade.collide(bullets, Foreground, level_hell.killEnemies, null, this);
      //Enables bullets to hit and kill enemies
      game.physics.arcade.collide(demons, bullets, level_hell.killCaco, null, this);
      game.physics.arcade.collide(imps, bullets, level_hell.killImp, null, this);
      game.physics.arcade.collide(boss, bullets, this.bossHealth, null, this);

      //If sprites collide pass it to their respective function
      //game.physics.arcade.collide(player, demons, level_hell.killPlayer, null, this);
      //game.physics.arcade.collide(player, imps, level_hell.killPlayer, null, this);
      //game.physics.arcade.collide(player, boss, level_hell.killPlayer, null, this);
      game.physics.arcade.collide(player, EndDoor, this.end, null, this);
      
      //Lets enemies occasionally phase thru walls for an extra challenge!
      if (level_hell.dieRoll() < 4) {
          demon.body.checkCollision.left = false;
      }
      
      level_hell.flipPlayer();
      level_hell.playerUtilities();
    },
  end: function () {
    var levelComplete;
      this.score += 1000;
      game.sound.stopAll();
      //Resets player and displays their final score and stops the script
      game.camera.reset(0, 0);
      //Game over text
      scoreText = game.add.text(0, 0, "Score: " + score , { fontSize: "48px", fontType: "Comic Sans MS", fill: "#FFF" });
      levelComplete = game.add.text(150, 200, "Level Complete!", {fontSize: "80px", fontType: "Comic Sans MS", fill: "#FFF" });
      game.input.onDown.add(function unpause() {
        game.paused = true;
        level_hell.pauseGame();
      }, self);
  }
};