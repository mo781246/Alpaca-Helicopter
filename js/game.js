(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';


var BootState = require('./states/boot');
var MenuState = require('./states/menu');
var PlayState = require('./states/play');
var PreloadState = require('./states/preload');



var game = new Phaser.Game(864, 505, Phaser.AUTO, 'alpaca-helicopter');

// Game States
game.state.add('boot', BootState);
game.state.add('menu', MenuState);
game.state.add('play', PlayState);
game.state.add('preload', PreloadState);


game.state.start('boot');

  
},{"./states/boot":7,"./states/menu":8,"./states/play":9,"./states/preload":10}],2:[function(require,module,exports){
'use strict';

var Alpaca = function(game, x, y, frame) {
  Phaser.Sprite.call(this, game, x, y, 'alpaca', frame);
  this.anchor.setTo(0.5, 0.5);
  this.animations.add('fly');
  this.animations.play('fly', 12, true);

  this.propellerSound = this.game.add.audio('propeller');

  this.name = 'alpaca';
  this.alive = false;
  this.onGround = false;

  // enable physics on the alpaca
  // and disable gravity on the alpaca
  // until the game is started
  this.game.physics.arcade.enableBody(this);
  this.body.allowGravity = false;
  this.body.collideWorldBounds = true;


  this.events.onKilled.add(this.onKilled, this);
  
};

Alpaca.prototype = Object.create(Phaser.Sprite.prototype);
Alpaca.prototype.constructor = Alpaca;

Alpaca.prototype.update = function() {
  // check to see if our angle is less than 90
  // if it is rotate the alpaca towards the ground by 2.5 degrees
  if(this.angle < 90 && this.alive) {
    this.angle += .25;
  } 

  if(!this.alive) {
    this.body.velocity.x = 0;
  }
};

Alpaca.prototype.fly = function() {
  if(!!this.alive) {
    this.propellerSound.play();
    //cause our alpaca to "jump" upward
    this.body.velocity.y = -400;
    // rotate the alpaca to -40 degrees
    this.game.add.tween(this).to({angle: -5}, 100).start();
  }
};

Alpaca.prototype.revived = function() { 
};

Alpaca.prototype.onKilled = function() {
  this.exists = true;
  this.visible = false;
  this.animations.stop();
  var dead = this.game.add.sprite(this.x - 50 , this.y -54, 'death', 9);
  var anim = dead.animations.add('walk');
  anim.play(9, false, true);
};

module.exports = Alpaca;


},{}],3:[function(require,module,exports){
'use strict';

var Ground = function(game, x, y, width, height) {
  Phaser.TileSprite.call(this, game, x, y, width, height, 'ground');
  // start scrolling our ground
  this.autoScroll(-200,0);
  
  this.game.physics.arcade.enableBody(this);
      
  this.body.allowGravity = false;
  this.body.immovable = true;


};

Ground.prototype = Object.create(Phaser.TileSprite.prototype);
Ground.prototype.constructor = Ground;

Ground.prototype.update = function() {
  
};

module.exports = Ground;
},{}],4:[function(require,module,exports){
'use strict';

var Cat = function(game, x, y, frame) {
  Phaser.Sprite.call(this, game, x, y, 'cat', frame);
  this.anchor.setTo(0.5, 0.5);
  this.game.physics.arcade.enableBody(this);

  this.body.allowGravity = true;
  this.body.immovable = true;
  
};

Cat.prototype = Object.create(Phaser.Sprite.prototype);
Cat.prototype.constructor = Cat;

Cat.prototype.update = function() {
  // write your prefab's specific update code here
  
};

module.exports = Cat;
},{}],5:[function(require,module,exports){
'use strict';

var Cat = require('./cat');

var CatGroup = function(game, parent) {

  Phaser.Group.call(this, game, parent);

  this.topCat = new Cat(this.game, 0, 0, 0);
  this.add(this.topCat);
  this.hasScored = false;

  this.setAll('body.velocity.x', -200);
};

CatGroup.prototype = Object.create(Phaser.Group.prototype);
CatGroup.prototype.constructor = CatGroup;

CatGroup.prototype.update = function() {
  this.checkWorldBounds(); 
};

CatGroup.prototype.checkWorldBounds = function() {
  if(!this.topCat.inWorld) {
    this.exists = false;
  }
};


CatGroup.prototype.reset = function(x, y) {
  this.topCat.reset(0,0);
  this.x = x;
  this.y = y;
  this.setAll('body.velocity.x', -400);
  this.hasScored = false;
  this.exists = true;
};




CatGroup.prototype.stop = function() {
  this.setAll('body.velocity.x', 0);
};

module.exports = CatGroup;
},{"./cat":4}],6:[function(require,module,exports){
'use strict';

function tweetscore(){
//share score on twitter
var scr = localStorage.getItem('score'); 
var tweetbegin = 'http://twitter.com/home?status=';
var tweettxt = 'I survived '+ scr +' seconds in Alpaca Helicopter! How long can you? -' + window.location.href + '. #AlpacaHelicopter';
var finaltweet = tweetbegin +encodeURIComponent(tweettxt);
window.open(finaltweet,'_blank');
}

var Scoreboard = function(game) {
  
  var gameover;
  
  Phaser.Group.call(this, game);

  this.scoreboard = this.create(this.game.width / 2, 175, 'scoreboard');
  this.scoreboard.anchor.setTo(0.5, 0.5);
  
  this.scoreText = this.game.add.bitmapText(this.game.width/2 - 60, 210, 'font', '', 18);
  this.add(this.scoreText);
  
  this.bestText = this.game.add.bitmapText(this.game.width/2 + 50, 210, 'font', '', 18);
  this.add(this.bestText);

  this.twitter = this.game.add.button(this.game.width/2 + 55, 285, 'twitter', tweetscore, this);
  this.twitter.anchor.setTo(0.5,0.5);
  this.add(this.twitter);

  // add our start button with a callback
  this.startButton = this.game.add.button(this.game.width/2 - 55, 285, 'startButton', this.startClick, this);
  this.startButton.anchor.setTo(0.5,0.5);

  this.add(this.startButton);

  this.y = this.game.height;
  this.x = 0;
  
};

Scoreboard.prototype = Object.create(Phaser.Group.prototype);
Scoreboard.prototype.constructor = Scoreboard;

Scoreboard.prototype.show = function(score) {
  var coin, bestScore;
  this.scoreText.setText(score.toString());
  if(!!localStorage) {
    bestScore = localStorage.getItem('bestScore');
    localStorage.setItem('score', score);
    if(!bestScore || bestScore < score) {
      bestScore = score;
      localStorage.setItem('bestScore', bestScore);
    }
  } else {
    bestScore = 'N/A';
  }

  this.bestText.setText(bestScore.toString());

 this.game.add.tween(this).to({y: 0}, 1000, Phaser.Easing.Bounce.Out, true);

};

Scoreboard.prototype.startClick = function() {
  this.game.state.start('play');
};


Scoreboard.prototype.update = function() {
};

module.exports = Scoreboard;

},{}],7:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],8:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {
    // add the background sprite
    this.background = this.game .add.sprite(0,0,'background');
    
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.maxWidth = 864;
    this.scale.maxHeight = 505;

    this.scale.setScreenSize(true);
	
    // add the ground sprite as a tile
    // and start scrolling in the negative x direction
    this.ground = this.game.add.tileSprite(0,this.game.height -86, this.game.width,86,'ground');
    this.ground.autoScroll(-200,0);

    // create a group to put the title assets in 
    // so they can be manipulated as a whole
    this.titleGroup = this.game.add.group()
      
    // create the title sprite
    // and add it to the group
    this.title = this.add.sprite(0,0,'title');
    this.titleGroup.add(this.title);
    
    // create the alpaca sprite 
    // and add it to the title group
    this.alpaca = this.add.sprite(300,-25,'alpaca');
    this.titleGroup.add(this.alpaca);

    // add an animation to the alpaca
    // and begin the animation
    this.alpaca.animations.add('fly');
    this.alpaca.animations.play('fly', 12, true);
    
    // Set the originating location of the group
    this.titleGroup.x = (this.game.width/2) - 228;
    this.titleGroup.y = 100;

    //  create an oscillating animation tween for the group
    this.game.add.tween(this.titleGroup).to({y:115}, 350, Phaser.Easing.Linear.NONE, true, 0, 1000, true);

    // add our start button with a callback
    this.startButton = this.game.add.button(this.game.width/2, 300, 'startButton', this.startClick, this);
    this.startButton.anchor.setTo(0.5,0.5);
  },
  startClick: function() {
    // start button click handler
    // start the 'play' state
    this.game.state.start('play');
  }
};

module.exports = Menu;

},{}],9:[function(require,module,exports){

'use strict';
var Alpaca = require('../prefabs/alpaca');
var Ground = require('../prefabs/ground');
var Cat = require('../prefabs/cat');
var CatGroup = require('../prefabs/catGroup');
var Scoreboard = require('../prefabs/scoreboard');

function Play() {
}
Play.prototype = {
  create: function() {

    // start the phaser arcade physics engine
    this.game.physics.startSystem(Phaser.Physics.ARCADE);


    // give our world an initial gravity of 1500
    this.game.physics.arcade.gravity.y = 50;

    // add the background sprite
    this.background = this.game.add.sprite(0,0,'background');

    // create and add a group to hold our catGroup prefabs
    this.cats = this.game.add.group();
    
    // create and add a new Alpaca object
    this.alpaca = new Alpaca(this.game, 100, this.game.height/2);
    this.game.add.existing(this.alpaca);

    // create and add a new Ground object
    this.ground = new Ground(this.game, 0, this.game.height- 86, this.game.width, 86);
    this.game.add.existing(this.ground);
    

    // add keyboard controls
    this.flyKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.flyKey.onDown.addOnce(this.startGame, this);
    this.flyKey.onDown.add(this.alpaca.fly, this.alpaca);
    

    // add mouse/touch controls
    this.game.input.onDown.addOnce(this.startGame, this);
    this.game.input.onDown.add(this.alpaca.fly, this.alpaca);
    

    // keep the spacebar from propogating up to the browser
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

    

    this.score = 0;
    this.scoreText = this.game.add.bitmapText(this.game.width/2, 10, 'font',this.score.toString(), 24);

    this.instructionGroup = this.game.add.group();
    this.instructionGroup.add(this.game.add.sprite(this.game.width/2, 100,'getReady'));
    this.instructionGroup.setAll('anchor.x', 0.5);
    this.instructionGroup.setAll('anchor.y', 0.5);

    this.catGenerator = null;

    this.gameover = false;

    this.catHitSound = this.game.add.audio('catHit');
    this.groundHitSound = this.game.add.audio('groundHit');
    this.scoreSound = this.game.add.audio('score');
    
  },
  update: function() {
    // enable collisions between the alpaca and the ground
    this.game.physics.arcade.collide(this.alpaca, this.ground, this.deathHandler, null, this);

    if(!this.gameover) {    
        // enable collisions between the alpaca and each group in the cats group
        this.cats.forEach(function(catGroup) {
            this.game.physics.arcade.collide(this.alpaca, catGroup, this.deathHandler, null, this);
        }, this);
    }



    
  },
  shutdown: function() {
    this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
    this.alpaca.destroy();
    this.cats.destroy();
    this.scoreboard.destroy();
  },
  startGame: function() {
    if(!this.alpaca.alive && !this.gameover) {
        this.alpaca.body.allowGravity = true;
        this.alpaca.alive = true;
		this.alpaca.body.gravity.y = 1200;
        // add a timer
        this.catGenerator = this.game.time.events.loop(Phaser.Timer.SECOND * 0.5, this.generateCats, this);
        this.catGenerator.timer.start();
		
        this.instructionGroup.destroy();
		
		this.game.time.events.loop(Phaser.Timer.SECOND, this.checkScore, this);
    }
  },
  
  checkScore: function(catGroup) {

  this.score++;
  this.scoreText.setText(this.score.toString());
  this.scoreSound.play();

  },
  deathHandler: function(alpaca, enemy) {
    if(!this.alpaca.onGround) {
        this.groundHitSound.play();
        this.scoreboard = new Scoreboard(this.game);
        this.game.add.existing(this.scoreboard);
        this.scoreboard.show(this.score);
        this.alpaca.onGround = true;
    } else if (enemy instanceof Cat){
        this.catHitSound.play();
    }

    if(!this.gameover) {
        this.gameover = true;
        this.alpaca.kill();
        this.cats.callAll('stop');
        this.catGenerator.timer.stop();
        this.ground.stopScroll();
    }
    
  },

  generateCats: function() {
    var catY = this.game.rnd.integerInRange(0, 400);
    var catX = 864;
    var catGroup = this.cats.getFirstExists(false);
    if(!catGroup) {
        catGroup = new CatGroup(this.game, this.cats);  
    }
    catGroup.reset(catX, catY);
    

  }
};

module.exports = Play;

},{"../prefabs/alpaca":2,"../prefabs/ground":3,"../prefabs/cat":4,"../prefabs/catGroup":5,"../prefabs/scoreboard":6}],10:[function(require,module,exports){

'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('title', 'assets/title.png');
    this.load.image('cat', 'assets/enemy3.png');
    this.load.spritesheet('alpaca', 'assets/player.png', 109,100,3);
    this.load.spritesheet('death', 'assets/playerDeath.png', 109,100,9);
    this.load.image('startButton', 'assets/start-button.png');
    
    this.load.image('getReady', 'assets/get-ready.png');
    
    this.load.image('scoreboard', 'assets/scoreboard.png');
    this.load.image('twitter', 'assets/twitter-button.png');

    this.load.image('particle', 'assets/particle.png');

    this.load.audio('propeller', 'assets/propeller.wav');
    this.load.audio('catHit', 'assets/cat-hit.wav');
    this.load.audio('groundHit', 'assets/ground-hit.wav');
    this.load.audio('score', 'assets/score.wav');
    this.load.audio('ouch', 'assets/ouch.wav');

    this.load.bitmapFont('font', 'assets/fonts/font/font.png', 'assets/fonts/font/font.fnt');

  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('menu');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}]},{},[1])