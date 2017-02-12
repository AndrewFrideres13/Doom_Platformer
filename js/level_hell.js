var level_hell = {
  Background:null,
  bullets:null,
  EnemyCollision:null, 
  EndDoor:null,
  death:null,
  demon:null,
  demons:null,
  demonDeaths:false,
  fireRate:700, 
  Foreground:null,
  imp:null,
  imps:null,
  impDeaths: false,
  nextFire: 0,
  map:null,
  player:null,
  PlayerObjects:null,
  rand:null,
  self:null, 
  score:0,
  start:null,
  scoreText:null,

    preload: function () {
      game.load.tilemap("Doom_Map", "js/Doom_Map.json", null, Phaser.Tilemap.TILED_JSON);
      game.load.image("Heck", "Pics/Heck.gif");
      game.load.image("dirt", "Pics/dirt.png");
      game.load.image("door", "Pics/door.jpg");
      game.load.image("ledge", "Pics/ledge.gif");
      game.load.image("death", "Pics/death.png");
      game.load.image("light", "Pics/light.png");
      
      game.load.spritesheet("rockExplode", "Pics/rockExplode.png", 270, 86);
      game.load.spritesheet("demon", "Pics/cacodemon.png", 144, 148);
      game.load.spritesheet("DoomGuy", "Pics/doomguy.png", 130, 165);
      game.load.image("bullet", "pics/bullet.png");
      game.load.image("doom", "Pics/doom.png");
      game.load.spritesheet("imp", "Pics/imp.png", 46.8, 59);
      
      game.load.audio("Sandman", "audio/Sandman.mp3");
      game.load.audio("gurgle", "audio/gurgle.mp3");
      game.load.audio("cacoDeath", "audio/cacodeath.mp3");
      game.load.audio("wFire", "audio/fire.mp3");
      game.load.audio("impDeath", "audio/impdeath.mp3");
      game.load.audio("start", "audio/start.mp3");
    },
    
    levelStart: function() {
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
    },
    
    spawnPlayer: function() {
      player = game.add.sprite(-40, game.world.height - 97, "DoomGuy");
      player.animations.add("walk");
      player.animations.play("walk", 4, true);
      player.anchor.setTo(0.5, 0.6);
      player.scale.setTo(0.7, 0.7);
      game.camera.follow(player);
      game.physics.arcade.enable(player);
      player.body.gravity.y = 680;
      player.body.collideWorldBounds = true;
      player.health = 3;  
    },

    create: function () {
      var enemiesTotal = 25;
      var music;
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
      
      this.levelStart();
      
      //Music
      music = game.add.audio("Sandman");
      music.loopFull(0.6);
      music.volume = 0.65;
      
      //Player
      this.spawnPlayer();
      
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
      game.physics.arcade.collide(bullets, EnemyCollision, this.killEnemies, null, this);
      game.physics.arcade.collide(bullets, Foreground, this.killEnemies, null, this);
      //Enables bullets to hit and kill enemies
      game.physics.arcade.collide(demons, bullets, this.killCaco, null, this);
      game.physics.arcade.collide(imps, bullets, this.killImp, null, this);
      //If sprites collide pass it to their respective function
      //game.physics.arcade.collide(player, demons, this.killPlayer, null, this);
      //game.physics.arcade.collide(player, imps, this.killPlayer, null, this);
      game.physics.arcade.collide(player, EndDoor, this.endLevel, null, this);
      
      //Lets enemies occasionally phase thru walls for an extra challenge!
      if (this.dieRoll() < 4) {
          demon.body.checkCollision.left = false;
      }
      
      this.flipPlayer();
      this.playerUtilities();
    },
    
    playerUtilities: function () {
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
        this.fire();
      }
    },
    
    dieRoll: function () {
       return rand = Math.floor(Math.random() * 6);
    },
    
    flipPlayer: function () {
      if (game.input.activePointer.x < player.x - game.camera.x) {
        player.scale.x = -0.8; 
      } else {
        player.scale.x = 0.8; 
      }
    },

    killCaco: function (bullets) {
      bullets.kill();
      level_hell.bulletTrail(bullets);
      var cacoDeath = game.add.audio("cacoDeath");
      demon.kill();
      cacoDeath.volume = 0.4;
      cacoDeath.play();
      this.score += 100;         
    },
    
    killImp: function (bullets) {
      bullets.kill();
      level_hell.bulletTrail(bullets);
      var impDeath = game.add.audio("impDeath");
      imp.kill();
      impDeath.volume = 0.4;
      impDeath.play();
      this.score += 80;
      
    },
    
    bulletTrail: function (bullets) {
      var explode = game.add.sprite(bullets.x, bullets.y, "rockExplode");
      explode.animations.add("explosion");
      explode.animations.play("explosion", 3, true);
      explode.kill();
    },

    endLevel: function () {
      var levelComplete;
      this.score += 1000;
      game.sound.stopAll();
      //Resets player and displays their final score and stops the script
      game.camera.reset(0, 0);
      game.state.start("City");
      //Game over text
      /*scoreText = game.add.text(0, 0, "Score: " + score , { fontSize: "48px", fontType: "Comic Sans MS", fill: "#FFF" });
      levelComplete = game.add.text(150, 200, "Level Complete!", {fontSize: "80px", fontType: "Comic Sans MS", fill: "#FFF" });
      game.input.onDown.add(function unpause() {
        game.paused = true;
        pauseGame();
      }, self);*/
    },

    killPlayer: function () {
      if (player.health > 0) {
        player.health -= 1;
      } else {
        var gameOver;
        //Game over text and death gurgle
        death = game.add.audio("gurgle");
        death.play();
        //Resets and kills player and pauses game on click
        game.camera.reset(0, 0);
        player.kill();
        scoreText = game.add.text(0, 0, "Score: " + score ,{fontSize: "48px", fontType: "Comic Sans MS", fill: "#FFF"});
        gameOver = game.add.text(200, 200, "Game Over", {fontSize: "80px", fontType: "Comic Sans MS", fill: "#FFF" });
        game.input.onDown.add(function unpause() {
          game.paused = true;
          pauseGame();
        }, self);
      }
    },

    fire: function () {
      var bullet;
      if (game.time.now > this.nextFire && bullets.countDead() > 0) {
        this.nextFire = game.time.now + this.fireRate;
        bullet = bullets.getFirstDead();
        
        if (player.scale.x == 0.8 && !(game.input.keyboard.isDown(Phaser.Keyboard.E)) && !(game.input.keyboard.isDown(Phaser.Keyboard.Q))) { //Fire right
          bullet.reset(player.body.x - (-65), player.body.y - (-30));
          bullet.body.velocity.x = 1100;
          bullet.angle = 0;
          
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.E)){ //Fire up
          if (player.scale.x == 0.8) {
            bullet.reset(player.body.x - (-75), player.body.y - 30);
          } else {
            bullet.reset(player.body.x, player.body.y - 30);
          }
          bullet.body.velocity.y = -1100;
          bullet.angle = 270;
          
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.Q)){ //Fire down
          if (player.scale.x == 0.8) {
            bullet.reset(player.body.x - (-95), player.body.y - (-20));
          } else {
            bullet.reset(player.body.x, player.body.y - (-20));
          }
          bullet.body.velocity.y = 1100;
          bullet.angle = 90;
          
        } else { // Fire left
          bullet.reset(player.body.x - (-35), player.body.y - (-30));
          bullet.body.velocity.x = -1100;
          bullet.angle = 180;
        }

        bullet.lifespan = 200;
        var wFire = game.add.audio("wFire");
        wFire.volume = 0.1;
        wFire.play();
      }
    },
    
    pauseGame: function () {
      var reply = confirm("Would you like to try again?");
      if (reply) {
        location.reload();
      } else {
        location.reload();
        location.assign("https://www.google.com"); 
      }
    },
};