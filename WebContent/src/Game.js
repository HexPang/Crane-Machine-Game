BasicGame.Game = function(game) {
	// When a State is added to Phaser it automatically has the following
	// properties set on it, even if they already exist:
	this.game; // a reference to the currently running game
	this.add; // used to add sprites, text, groups, etc
	this.camera; // a reference to the game camera
	this.cache; // the game cache
	this.input; // the global input manager (you can access this.input.keyboard,
	// this.input.mouse, as well from it)
	this.load; // for preloading assets
	this.math; // lots of useful common math operations
	this.sound; // the sound manager - add a sound, play one, set-up markers,
	// etc
	this.stage; // the game stage
	this.time; // the clock
	this.tweens; // the tween manager
	this.world; // the game world
	this.particles; // the particle manager
	this.physics; // the physics manager
	this.rnd; // the repeatable random number generator
	// You can use any of these from any function within this State.
	// But do consider them as being 'reserved words', i.e. don't create a
	// property for your own game called "world" or you'll over-write the world
	// reference.
};
BasicGame.Game.prototype = {
	dropRate:0.2,
	catchAssist:false,
	claw : null,
	claw_length : 720,
	claw_state : 0,
	claw_speed : 5,
	claw_rope:null,
    claw_pip:null,
    claw_box:null,
	zero_point : [100,100],
	gifts : null,
	layer : null,
	sfx_win : null,
	sfx_lose : null,
	bgm : null,
	sfx_claw : [],
    giftCollisionGroup:null,
    clawCollisionGroup:null,
    tilesCollisionGroup:null,
	score_text:null,
	max_doll:5,
	score:0,
    coin:0,
    timer:null,
    tileObjects:null,
    checkGifts: function(){
        if (this.gifts.children.length < this.max_doll) {
            this.spawnDoll();
        }
    },
	claw_sfx : function(index) {
		for ( var i in this.sfx_claw) {
			var sfx = this.sfx_claw[i];
			if (i == index) {
				sfx.loopFull();
			} else {
				sfx.stop();
			}
		}
	},
	click : function() {
		if (this.claw_state === 0 && this.gifts.children.length == this.max_doll) {
			if(this.coin > 0){
				this.coin--;
                this.claw_state = 1;
                this.claw_sfx(0);
			}
		}
	},
	release : function() {
		if (this.claw_state === 1) {
			this.claw_state = 2;
			this.claw_sfx(1);
		}
	},
	spawnDoll: function(){
		var index = Math.round(Math.random()*9+3);
        var gift = this.gifts.create(this.game.world.centerX + Math.random() * 100 * 1.5, 0, 'sprites',index + ".png");
        gift.body.debug = false;
        gift.body.clearShapes();
        gift.body.loadPolygon('spritePhysics', index);
        gift.body.setCollisionGroup(this.giftCollisionGroup);
        gift.body.collides([ this.giftCollisionGroup, this.clawCollisionGroup,
            this.tilesCollisionGroup ]);
        //gift.body.velocity.x = this.claw_speed * 20;
    },
	closeClaw : function(isClose) {
		this.claw.body.clearShapes();
		if (isClose) {
			this.claw.loadTexture('claw_closed');
			this.claw.body.loadPolygon('physicsData', "claw_closed");
		} else {
			this.claw.loadTexture('claw');
			this.claw.body.loadPolygon('physicsData', "claw_open");
		}
        this.claw.body.setCollisionGroup(this.clawCollisionGroup);
        this.claw.body.collides([ this.tilesCollisionGroup, this.giftCollisionGroup ],
            this.clawHitHandler, this);
	},
	clawHitHandler : function(body1, body2,hit) {
        var dx = Math.abs(body1.x - body2.x);
        var dy = Math.abs(body1.sprite.centerY - body2.sprite.centerY);
        if(hit.boundingRadius >= 1.8 && this.claw_state == 2){
            this.claw_state = 3;
            this.closeClaw(true);
        }
	},
	checkOverlap:function(){
		var tiles = this.layer.getTiles(0,0,this.game.world.width,this.game.world.height);
        for(var i in tiles){
        	if(tiles[i].index > -1){
                for(var j in this.gifts.children) {
                    var sprite = this.gifts.children[j];
                    var boundsA = new Phaser.Rectangle(sprite.centerX,sprite.centerY,sprite.width,sprite.height);
                    var tile = tiles[i];
                    var boundsB = new Phaser.Rectangle(tile.worldX,tile.worldY,tile.width,tile.height);

                    var overlap = Phaser.Rectangle.intersects(boundsA, boundsB);
                    if(overlap){
                    	var t1 = (boundsA.y - boundsB.y) + sprite.height / 2;
                    	if(t1 >= sprite.height / 2){
                            sprite.body.y -= sprite.height / 2;
						}
                    }
                }
			}
        }
		return false;
	},
	create : function() {
		this.game.stage.backgroundColor = '#82abba';
		this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.physics.p2.gravity.y = 1500;
		this.game.physics.p2.setImpactEvents(true);
		this.score_text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, " 分数 : " + this.score, {
            font: "65px Arial",
            fill: "#ff0044",
            align: "center"
        });
        this.score_text.anchor.setTo(0.5, 0.5);
		
		this.giftCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.clawCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.tilesCollisionGroup = this.game.physics.p2.createCollisionGroup();
		var map = this.game.add.tilemap('level1');
		var x = 350;
		var y = 350;
		
		
		
		this.bgm = this.game.add.audio('bgm');
		this.bgm.loopFull();
		this.sfx_claw[0] = this.game.add.audio('sfx_claw_0');
		this.sfx_claw[1] = this.game.add.audio('sfx_claw_1');
		this.sfx_claw[2] = this.game.add.audio('sfx_claw_2');
		map.addTilesetImage('world');
		this.sfx_lose = this.game.add.audio('lose');
		this.sfx_win = this.game.add.audio('win');
		this.layer = map.createLayer('Tile Layer 1');
		this.layer.resizeWorld();
		map.setCollisionBetween(1, 99);
		
		this.tileObjects = this.game.physics.p2.convertTilemap(map, this.layer);
		for ( var i in this.tileObjects) {
            this.tileObjects[i].setCollisionGroup(this.tilesCollisionGroup);
            this.tileObjects[i].collides([ this.giftCollisionGroup, this.clawCollisionGroup ]);
		}
		this.claw_length = this.layer.layer.heightInPixels - 140 - 35;
		console.log(this.claw_length);
		this.layer.debug = false;
		this.claw = this.game.add.sprite(this.zero_point[0], this.zero_point[1],
				'claw');
		this.game.physics.p2.enable(this.claw, false);
		this.claw.body.static = true;
		this.claw.body.immovable = true;
		this.closeClaw(false);
        this.claw_rope = this.game.add.sprite(this.zero_point[0] - 4,this.zero_point[1] - this.claw.height / 2 - 
3,'claw_rope');
		this.claw.body.collideWorldBounds = false;
		this.claw_pip = this.game.add.sprite(0,this.claw_rope.y-3,'claw_pip');
        this.claw_pip.width = this.game.width;
		this.claw_box = this.game.add.sprite(this.claw.body.x,this.claw_pip.y,'claw_box');
		this.gifts = this.game.add.group();
		this.gifts.enableBody = true;
		this.gifts.physicsBodyType = Phaser.Physics.P2JS;
		// attach pointer events
		this.game.input.onDown.add(this.click, this);
		this.game.input.onUp.add(this.release, this);
		this.game.physics.p2.updateBoundsCollisionGroup();

        this.timer = this.game.time.create(false);
        this.timer.loop(1000, this.checkGifts, this);
        this.timer.start();

        var overlapTimer = this.game.time.create(false);
        overlapTimer.loop(1000,this.checkOverlap,this);
        overlapTimer.start();
		this.coin = 50;
		console.log("starting play state");
	},
    updateUI:function(){
        this.score_text.setText("硬币:" + this.coin + "\n分数:" + this.score);
	},
    actionOnClick:function(){

	},
	update : function() {
		this.claw.body.setZeroVelocity();
		for ( var i in this.gifts.children) {
			var gift = this.gifts.children[i];
			if (gift.body.y >= this.game.world.height - 70) {
				this.sfx_win.play();
				gift.destroy();
				this.score++;
				if(this.score % 2 == 0){
					this.coin++;
				}
			}
		}
		if (this.claw_state == 1) {
			if(this.claw.body.x + this.claw.width / 2 >= this.game.world.width){
                this.claw_state = 4;
                this.coin++;
			}else{
                this.claw.body.x += this.claw_speed;
                this.claw_rope.x += this.claw_speed;
			}
		} else if (this.claw_state == 2) {
			this.claw.body.y += this.claw_speed;
            this.claw_rope.height += this.claw_speed;
			if (this.claw.body.y >= this.claw_length) {
				this.closeClaw(true);
				this.claw_state = 3;
				this.claw_sfx(2);
			}
		} else if (this.claw_state == 3) {
			this.claw.body.y -= this.claw_speed;
            this.claw_rope.height -= this.claw_speed;
			if (this.hitGift) {
				this.hitGift.y -= this.claw_speed;
			}
			if (this.claw.body.y <= this.zero_point[1]) {
				this.claw.body.y = this.zero_point[1];
				this.claw_state = 4;
			}
		} else if (this.claw_state == 4 || this.claw_state == 5) {
			this.claw.body.x -= this.claw_speed;
            this.claw_rope.x -= this.claw_speed;
			if (this.hitGift) {
				this.hitGift.x -= this.claw_speed;
			}
			if (this.claw.body.x <= this.zero_point[0]) {
				if(this.claw_state == 5){
					this.claw_state = 1;
				}else{
                    this.claw.body.x = this.zero_point[0];
                    this.claw_state = 0;
                    this.claw_sfx(-1);
                    this.closeClaw(false);
                    if (this.hitGift) {
                        this.hitGift.static = false;
                        this.hitGift = null;
                    }
				}
			}
		}
		if (this.hitGift && this.game.time.now % 30 == 0) {
			var seed = Math.random();
			// console.log("SEED:" + seed);
			if (seed <= this.dropRate && seed > 0) {
				this.hitGift.static = false;
				this.hitGift.immovable = false;
                this.claw.body.clearShapes();
				if(this.claw_state == 4){
					this.hitGift.velocity.x = -this.claw_speed * 20;
				}
				this.hitGift = null;
				this.sfx_lose.play();
			}
		}else if((this.claw_state == 3 || this.claw_state == 4) && this.game.time.now % 30 == 0){
            var seed = Math.random();
            if (seed <= this.dropRate && seed > 0) {
                //this.claw.body.clearShapes();
            }
		}
        this.claw_box.x = this.claw.body.x - this.claw_box.width / 2;
        this.claw_box.y = this.claw_pip.y - this.claw_pip.height / 2;

        this.updateUI();
	},
	quitGame : function(pointer) {
		// Here you should destroy anything you no longer need.
		// Stop music, delete sprites, purge caches, free resources, all that
		// good stuff.
		// Then let's go back to the main menu.
		this.state.start('MainMenu');
	}
};

