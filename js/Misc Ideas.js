// Try to get a missile from the missileGroup
// If a missile isn't available, create a new one and add it to the group.
GameState.prototype.launchMissile = function(x, y) {
    // // Get the first dead missile from the missileGroup
    var missile = this.missileGroup.getFirstDead();

    // If there aren't any available, create a new one
    if (missile === null) {
        missile = new Missile(this.game);
        this.missileGroup.add(missile);
    }

    // Revive the missile (set it's alive property to true)
    // You can also define a onRevived event handler in your explosion objects
    // to do stuff when they are revived.
    missile.revive();

    // Move the missile to the given coordinates
    missile.x = x;
    missile.y = y;

    return missile;
};

// Missile constructor
var Missile = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'rocket');

    // Set the pivot point for this sprite to the center
    this.anchor.setTo(0.5, 0.5);

    // Enable physics on the missile
    this.game.physics.enable(this, Phaser.Physics.ARCADE);

    // Define constants that affect motion
    this.SPEED = 250; // missile speed pixels/second
    this.TURN_RATE = 5; // turn rate in degrees/frame
    this.AVOID_DISTANCE = 30; // pixels
};

// Missiles are a type of Phaser.Sprite
Missile.prototype = Object.create(Phaser.Sprite.prototype);
Missile.prototype.constructor = Missile;

Missile.prototype.update = function() {   
    // Calculate the angle from the missile to the mouse cursor game.input.x
    // and game.input.y are the mouse position; substitute with whatever
    // target coordinates you need.
    var targetAngle = this.game.math.angleBetween(
        this.x, this.y,
        this.game.input.activePointer.x, this.game.input.activePointer.y
    );
    // Make each missile steer away from other missiles.
    // Each missile knows the group that it belongs to (missileGroup).
    // It can calculate its distance from all other missiles in the group and
    // steer away from any that are too close. This avoidance behavior prevents
    // all of the missiles from bunching up too tightly and following the
    // same track.
    var avoidAngle = 0;
    this.parent.forEachAlive(function(m) {
        // Don't calculate anything if the other missile is me
        if (this == m) return;

        // Already found an avoidAngle so skip the rest
        if (avoidAngle !== 0) return;

        // Calculate the distance between me and the other missile
        var distance = this.game.math.distance(this.x, this.y, m.x, m.y);

        // If the missile is too close...
        if (distance < this.AVOID_DISTANCE) {
            // Chose an avoidance angle of 90 or -90 (in radians)
            avoidAngle = Math.PI/2; // zig
            if (this.game.math.chanceRoll(50)) avoidAngle *= -1; // zag
        }
    }, this);

    // Add the avoidance angle to steer clear of other missiles
    targetAngle += avoidAngle;

    // Gradually (this.TURN_RATE) aim the missile towards the target angle
    if (this.rotation !== targetAngle) {
        // Calculate difference between the current angle and targetAngle
        var delta = targetAngle - this.rotation;

        // Keep it in range from -180 to 180 to make the most efficient turns.
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;

        if (delta > 0) {
            // Turn clockwise
            this.angle += this.TURN_RATE;
        } else {
            // Turn counter-clockwise
            this.angle -= this.TURN_RATE;
        }

        // Just set angle to target angle if they are close
        if (Math.abs(delta) < this.game.math.degToRad(this.TURN_RATE)) {
            this.rotation = targetAngle;
        }
    }

    // Calculate velocity vector based on this.rotation and this.SPEED
    this.body.velocity.x = Math.cos(this.rotation) * this.SPEED;
    this.body.velocity.y = Math.sin(this.rotation) * this.SPEED;
};