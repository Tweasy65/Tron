module.exports = Snake;
var LIB = require('./lib.js');
function Snake(snakeName, tailLength, size, speedScale, width, height, GAMEGRIDSCALE){
  this.name = snakeName;

  this.WIDTH = width;
  this.HEIGHT = height;
  this.GAMEGRIDSCALE = GAMEGRIDSCALE;

  //starting position
  this.size = size;
  this.x = this.WIDTH/2 - (this.size/2);
  this.y = this.HEIGHT/2 - (this.size/2);
  this.direction = "Stopped";

  //starting direction and speed
  this.xdir = 0;
  this.ydir = 0;
  this.xspeed = 0;
  this.yspeed = 0;
  this.lastXSpeed = this.xspeed;
  this.lastYSpeed = this.yspeed;
  this.speedScale = speedScale;

  //tail and color stuff
  this.tail = [];
  this.tailColors = [];
  this.currentColor = 0;
  this.startColor = [0,0,0];
  this.endColor = [255,255,255];
  this.colorDirection = true;
  this.currTailLength = 0; //length in pixels
  this.maxTailLength = tailLength;
  this.maxSegmentDist = this.maxTailLength / 40;

  this.intializeTailColor = function(){
    var steps = 100;
    var redDiff = this.endColor[0] - this.startColor[0];
    var greenDiff = this.endColor[1] - this.startColor[1];
    var BlueDiff = this.endColor[2] - this.startColor[2];

    for(var i=0; i<steps; i++){
      var currRed = this.startColor[0] + (redDiff * (i/steps));
      var currGreen = this.startColor[1] + (greenDiff * (i/steps));
      var currBlue = this.startColor[2] + (BlueDiff * (i/steps));
      this.tailColors[i] = [currRed, currGreen, currBlue];
    }
  };


  this.spawn = function(){
        var widthCells = this.WIDTH / this.GAMEGRIDSCALE;
        var heightCells = this.HEIGHT / this.GAMEGRIDSCALE;
        var randomRow = LIB.randomInt(0, heightCells);
        var randomCol = LIB.randomInt(0, widthCells);
        var newXPos = (this.GAMEGRIDSCALE * randomCol) + (this.GAMEGRIDSCALE / 2);
        var newYPos = (this.GAMEGRIDSCALE * randomRow) + (this.GAMEGRIDSCALE / 2);
        //console.log("spawn: ", newXPos, newYPos);
        //this.createPreviousPosition(this.x, this.y, true, false);
        this.x = newXPos;
        this.y = newYPos;
        this.createPreviousPosition(this.x, this.y, false, true);
        this.dir(0, 0);
  };//end spawn

  this.dir = function(x, y) {
    this.xdir = x;
    this.ydir = y;
    this.xspeed = x*this.speedScale;
    this.yspeed = y*this.speedScale;

    if(this.xspeed == 0 && this.yspeed == 0) this.direction = "Stopped";
    else if(this.xspeed == 0 && this.yspeed < 0) this.direction = "N";
    else if(this.xspeed > 0 && this.yspeed < 0) this.direction = "NE";
    else if(this.xspeed > 0 && this.yspeed == 0) this.direction = "E";
    else if(this.xspeed > 0 && this.yspeed > 0) this.direction = "SE";
    else if(this.xspeed == 0 && this.yspeed > 0) this.direction = "S";
    else if(this.xspeed < 0 && this.yspeed > 0) this.direction = "SW";
    else if(this.xspeed < 0 && this.yspeed == 0) this.direction = "W";
    else if(this.xspeed < 0 && this.yspeed < 0) this.direction = "NW";
    else console.log("ERROR in DIRECTION");

    // if(this.lastXSpeed != this.xspeed || this.lastYSpeed != this.yspeed){
    //     this.lastXSpeed = this.xspeed;
    //     this.lastYSpeed = this.yspeed;
    //     SOCKET.changeSnakeDir(this.name, this.x, this.y, this.xspeed, this.yspeed);
    // }

    if(this.direction != "Stopped") this.createPreviousPosition(this.x,this.y,false,true);
    //console.log("Direction: ", this.xspeed,":",this.yspeed, " ==> ", this.direction);
  };

  //currently just for turning and jumping
  this.createPreviousPosition = function(x,y,jump,newSegment){
    // console.log("---------calling function createPreviousPosition(",x,",",y,",",jump,",",newSegment,")");
    var distance = 0;
    if(this.tail.length>0 && !this.tail[0].jump){
      var prevX = this.tail[0].x;
      var prevY = this.tail[0].y;
      distance = LIB.dist(x,y,prevX,prevY);
    }

    var previousPosition = {
      x: x,
      y: y,
      jump: jump,
      dist: distance,
      color: this.tailColors[this.currentColor],
      dir: this.direction,
      newSegment: newSegment
    };


    this.currTailLength = this.currTailLength + distance;
    while(this.currTailLength > this.maxTailLength && this.tail.length > 0){ //remove to meet length restriction
      var removedPoint = this.tail.pop();
      this.currTailLength = this.currTailLength - removedPoint.dist;
    }

    var combine = false;
    if(this.tail.length > 0 &&
      this.tail[0].dist < this.maxSegmentDist &&
      !previousPosition.newSegment &&
      !this.tail[0].newSegment &&
      this.tail[0].dir === previousPosition.dir) combine = true;

    //updateTail with new previousPosition
    //var newSegment = this.newSegment(previousPosition);
    if(combine){
      this.tail[0].x = previousPosition.x;
      this.tail[0].y = previousPosition.y;
      this.tail[0].dist = this.tail[0].dist + previousPosition.dist;
      this.tail[0].jump = previousPosition.jump;
      this.tail[0].color = previousPosition.color;
    }
    else{
      this.tail.unshift(previousPosition);
      if(this.currentColor === 0) this.colorDirection = true;
      else if(this.currentColor === (this.tailColors.length - 1)) this.colorDirection = false;
      if(this.colorDirection) this.currentColor++;
      else this.currentColor--;
    }

  };//end createPreviousPosition

  this.update = function() {
    var nextX = Math.floor(this.x + this.xspeed);
    var nextY = Math.floor(this.y + this.yspeed);

    if(nextX === this.x && nextY === this.y){
      // dont change tail if you havent moved
      return;
    }

    //Wall wrapping code
    var leftWall = -1;
    var rightWall = width + 1;
    var topWall = -1;
    var bottomWall = height + 1;
    if (this.x >= rightWall){ //right wall
      this.createPreviousPosition(this.x,this.y,true,false);
      this.x = 0;
      this.createPreviousPosition(this.x,this.y,false,true);
      return;
    }else if (this.x <= leftWall){ //left wall
      this.createPreviousPosition(this.x,this.y,true,false);
      this.x = width;
      this.createPreviousPosition(this.x,this.y,false,true);
      return;
    }else if (this.y >= bottomWall){ //bottom wall
      this.createPreviousPosition(this.x,this.y,true,false);
      this.y = 0;
      this.createPreviousPosition(this.x,this.y,false,true);
      return;
    }else if (this.y <= topWall){ //top wall
      this.createPreviousPosition(this.x,this.y,true,false);
      this.y = height;
      this.createPreviousPosition(this.x,this.y,false,true);
      return;
    }

    this.createPreviousPosition(this.x,this.y,false,false);

    this.x = nextX;
    this.y = nextY;

    // console.log("dist / currTailLength: ", this.currTailLength, " / ", this.tail.length);

  };//end update

  //increase or decrease tail length
  this.chngTail = function(input){
    this.maxTailLength = this.maxTailLength + input;
    this.maxSegmentDist = this.maxTailLength / 40;
  };

  //increase or decrease size of snake
  this.chngSize = function(input){
    this.size = this.size + input;
  };

  //change increment multiplier for snakes speed up or down
  this.chngSpeed = function(input) {
    if ((s.speedScale + input) > 0){
      s.speedScale = Math.round(s.speedScale + input);
      s.dir(s.xdir,s.ydir);
    } else {
      console.log("cannot reduce speed");
    }
  };//END OF chngSpeed FUNCTION

  //change snake's color to random colors
  this.chngColorRandom = function(){
    var startRed = Math.floor(Math.random() * 255) + 1;
    var startGreen = Math.floor(Math.random() * 255) + 1;
    var startBlue = Math.floor(Math.random() * 255) + 1;

    var r = Math.floor(Math.random() * 255) + 1;
    var g = Math.floor(Math.random() * 255) + 1;
    var b = Math.floor(Math.random() * 255) + 1;

    var diffR = Math.abs(startRed - r);
    var diffG = Math.abs(startGreen - g);
    var diffB = Math.abs(startBlue - b);
    while(Math.max(diffR,diffG,diffB) < 100){
      r = Math.floor(Math.random() * 255) + 1;
      g = Math.floor(Math.random() * 255) + 1;
      b = Math.floor(Math.random() * 255) + 1;

      diffR = Math.abs(startRed-r);
      diffG = Math.abs(startGreen-g);
      diffB = Math.abs(startBlue-b);
    }

    this.startColor = [startRed,startGreen,startBlue];
    this.endColor = [r,g,b];
    this.intializeTailColor();
  };

  //reset to defualt (refresh)
  this.reset = function(tail, size) {
    this.maxTailLength = tail;
    this.size = size;
    this.tail = [];
    this.currTailLength = 0;
    this.intializeTailColor();
    this.spawn();
  };//end reset

  //takes a collision object (returned from tail collision)
  this.cutTail = function(collision){
    if(collision === null) return 0;
    var oldLastPoint = this.tail[collision.tail];
    this.tail = this.tail.slice(0,collision.tail);

    //modify last point to be closer to collision location
    // var diffX = this.tail[this.tail.length-1].x - collision.x;
    // var diffY = this.tail[this.tail.length-1].y - collision.y;
    // var newX = Math.round(this.tail[this.tail.length-1].x - (diffX*0.7));
    // var newY = Math.round(this.tail[this.tail.length-1].y - (diffY*0.7));
    // this.tail[this.tail.length-1].x = newX;
    // this.tail[this.tail.length-1].y = newY;

    var oldTailLength = this.currTailLength;
    this.currTailLength = 0;
    for(var i=0; i<this.tail.length; i++){
      this.currTailLength = this.currTailLength + this.tail[i].dist;
    }
    return Math.abs(this.currTailLength - oldTailLength);
  };//end cutTail

  //returns the index of the tail that you collided width
  //returns -1 if did not collide
  this.checkCollisionWithTail = function(tailInput){
    var tailIndex = 0;
    var lineStartX;
    var lineStartY;
    var lineEndX;
    var lineEndY;
    var collision;
    if(this.tail.length < 1) return null;
    var snakeLineX = this.tail[0].x;
    var snakeLineY = this.tail[0].y;
    while(tailIndex < (tailInput.length - 1)){
      if(!tailInput[tailIndex + 1].jump){
        lineStartX = tailInput[tailIndex].x;
        lineStartY = tailInput[tailIndex].y;
        lineEndX = tailInput[tailIndex + 1].x;
        lineEndY = tailInput[tailIndex + 1].y;
        //hit = collidePointLine(this.x, this.y, lineStartX, lineStartY, lineEndX, lineEndY, this.size)
          collision = LIB.collideLineLine(this.x, this.y, snakeLineX, snakeLineY,
                                lineStartX,lineStartY,lineEndX,lineEndY);
      }
      //console.log("hit: ", hit);
      if(collision && collision.hit){
          collision["tail"] = tailIndex + 1;
          return collision;
      }
      tailIndex++;
    }
    return null;
  };

  this.package = function(){
      var packagedSnake = {
          name: this.name,
          size: this.size,
          x: this.x,
          y: this.y,
          tail: this.tail,
          startColor: this.startColor,
          endColor: this.endColor
      }
      return packagedSnake;
  };
}//end snake class