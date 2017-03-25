var level_load = {
  Background:null,
  bullets:null,
  EnemyCollision:null, 
  EndDoor:null,
  explosion:null,
  death:null,
  demon:null,
  demons:null,
  demonDeaths:false,
  fireRate:700, 
  Foreground:null,
  invulnerable:0,
  imp:null,
  imps:null,
  impDeaths: false,
  nextFire: 0,
  map:null,
  pDeath:null,
  player:null,
  PlayerObjects:null,
  rand:null,
  self:null, 
  score:0,
  start:null,
  state:null,
  scoreText:null,

    preload: function () {
      //Only loading in general things that are used across all levels
      game.load.spritesheet("rockExplode", "Pics/rockExplode.png", 80, 86);
      game.load.spritesheet("demon", "Pics/cacodemon.png", 144, 148);
      game.load.spritesheet("DoomGuy", "Pics/doomguy.png", 130, 165);
      game.load.image("bullet", "pics/bullet.png");
      game.load.image("doom", "Pics/doom.png");
      game.load.spritesheet("imp", "Pics/imp.png", 46.8, 59);
      game.load.spritesheet("pFire", "Pics/fire.png", 169, 160);
      game.load.spritesheet("pDeath", "Pics/pDeath.png", 148, 160);
      
      game.load.audio("gurgle", "audio/gurgle.mp3");
      game.load.audio("cacoDeath", "audio/cacodeath.mp3");
      game.load.audio("wFire", "audio/fire.mp3");
      game.load.audio("impDeath", "audio/impdeath.mp3");
      game.load.audio("pain", "audio/pain.wav");
      game.load.audio("start", "audio/start.mp3");
      game.load.audio("jump", "audio/jump.wav");
      this.endLoad();
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
      }); 
    },
    
    spawnPlayer: function() {   
      //"Main" Player
      player = game.add.sprite(-40, game.world.height - 97, "DoomGuy");
      player.animations.add("walk");
      player.animations.play("walk", 3, true);
      player.anchor.setTo(0.7, 0.6);
      player.scale.setTo(0.7, 0.7);
      game.camera.follow(player);
      game.physics.arcade.enable(player);
      player.body.gravity.y = 900;
      player.body.collideWorldBounds = true;
      player.health = 3;  
      //Player Death
      pDeath = game.add.sprite(-1000, -1000, "pDeath");
      pDeath.anchor.setTo(0.7, 0.6);
      pDeath.scale.setTo(0.6, 0.7);
      game.physics.arcade.enable(pDeath);
      pDeath.body.gravity.y = 130;
      pDeath.animations.add("pDeath");
      //Player Fire
      pFire = game.add.sprite(player.x, player.y, "pFire");
      pFire.anchor.setTo(0.7, 0.6);
      pFire.scale.setTo(0.75, 0.7);
      pFire.animations.add("fire");
    },
    
    dieRoll: function () {
       return rand = Math.floor(Math.random() * 6);
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
          jump = game.add.audio("jump");
          jump.play();
        }
      } else if ((game.input.keyboard.isDown(Phaser.Keyboard.S)) && (player.alive === true)) {
        player.body.velocity.y += 25;
      }
      //Allows user to fire using mouse1
      if (game.input.activePointer.isDown && (player.alive === true)) {
        player.alpha = 0;
        pFire.alpha = 1;
        this.fire();
      } else {
        player.alpha = 1;
        pFire.alpha = 0;
      }
    },
    
    firingPlayer: function() {
      pFire.x = player.x;
      pFire.y = player.y;
    },
    
    flipPlayer: function () {
      if (game.input.activePointer.x < player.x - game.camera.x) {
        player.scale.x = -0.8; 
      } else {
        player.scale.x = 0.8; 
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
    
    killCaco: function (bullets) {
      bullets.kill();
      level_load.explosions(bullets);
      var cacoDeath = game.add.audio("cacoDeath");
      demon.kill();
      cacoDeath.volume = 0.4;
      cacoDeath.play();
      level_load.score += 100;         
    },
    
    killImp: function (bullets) {
      bullets.kill();
      level_load.explosions(bullets);
      var impDeath = game.add.audio("impDeath");
      imp.kill();
      impDeath.volume = 0.4;
      impDeath.play();
      level_load.score += 80;
    },
    
    bossHealth: function () {
      var bossHurt = game.add.audio("bossHurt");
      var bossDeath = game.add.audio("bossDeath"); 
      if (boss.health > 0 && !(bossHurt.play())/*Prevents overlap of bossHurt sound FX*/) {
        boss.health -= 0.05;
        bossHurt.volume = 0.2;
        bossHurt.play();
      } else {
          bossDeath.volume = 0.4;
          bossDeath.play();
          boss.kill();
          level_load.score += 1000;
        }
    },

    killPlayer: function () {
      pain = game.add.audio("pain");
      death = game.add.audio("gurgle");
      if (player.health > 0 ) {
        if (game.time.now - level_load.invulnerable > 1300)  {
          player.health -= 0.5;
          pain.play();
          level_load.invulnerable = game.time.now;
        }
      } else {
        //Should play animation and kill player once complete
        death.play();
        pDeath.x = player.x;
        pDeath.y = player.y;
        pDeath.animations.play("pDeath", 1.9, false, true);
        level_load.end();
      }
    },

    initializeFiring: function() {
      //Bullets
      bullets = game.add.group();
      bullets.enableBody = true;
      bullets.createMultiple(1, "bullet");
      bullets.checkWorldBounds = true;
      bullets.outOfBoundsKill = true;
      
      //EXPLOOOOOOOSIONS!
      explosions = game.add.group();
      explosions.enableBody = true;
      explosions.physicsBodyType = Phaser.Physics.ARCADE;
      explosions.createMultiple(30, "rockExplode");
      explosions.setAll('anchor.x', 0.5);
      explosions.setAll('anchor.y', 0.5);
      explosions.forEach(function(explosion) {
        explosion.animations.add('explosion');
      });
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
          pFire.x = player.x;
          pFire.y = player.y;
          pFire.scale.x = 0.8;
          pFire.animations.play("fire", 4, true, true);
          
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
          pFire.x = player.x;
          pFire.y = player.y;
          pFire.scale.x = -0.8;
          pFire.animations.play("fire", 4, true, true);
        }

        bullet.lifespan = 200;
        var wFire = game.add.audio("wFire");
        wFire.volume = 0.1;
        wFire.play();
      }
    },
    
    explosions: function(bullets) {
      explosion = explosions.getFirstExists(false);
      explosion.reset(bullets.body.x , bullets.body.y + bullets.body.halfHeight);
      explosion.play('explosion', 3, false, true);
    },
    
    endLevel: function () {
      level_load.score += 1000;
      game.sound.stopAll();
      //Resets player and displays their final score and stops the script
      game.camera.reset(0, 0);
      if (state=="Hell") {
        game.state.start("City");
      }
    },
    
    end: function () {
      player.kill();
      //Displays their final score and stops the script
      scoreText = game.add.text(0, 0, "Score: " + level_load.score , {fontSize: "48px", fontType: "Comic Sans MS", fill: "#FFF" });
      scoreText.fixedToCamera = true;
      levelComplete = game.add.text(150, 200, "Game Over", {fontSize: "80px", fontType: "Comic Sans MS", fill: "#FFF" });
      levelComplete.fixedToCamera = true;
      game.input.onDown.add(function unpause() {
        game.paused = true;
        game.sound.stopAll();

        var reply = confirm("Would you like to try again?");
        if (reply) {
          location.reload();
        } else {
          location.reload();
          location.assign("https://www.google.com"); 
        }
        });
    },

    endLoad: function () {
      game.state.start("Hell");
    },
};