function Board(){
	//canvas stuff
	this.canvasWidth = window.innerWidth;
	this.canvasHeight = window.innerHeight;
	this.canvas = null;

	//board stuff
	this.paused = false;
	this.background = null;

	//snake stuff
	this.snakes = new Map();


	this.init = function() {
		var setWidth = Math.round((this.canvasWidth - 35)/GAMEGRIDSCALE)*GAMEGRIDSCALE;
		var setHeight = Math.round((this.canvasHeight - 60)/GAMEGRIDSCALE)*GAMEGRIDSCALE;
		this.canvas = createCanvas(setWidth,setHeight);
		this.canvas.parent('CanvasContainer');
	};

	this.startMenuSnakes = function(){
		var snake1Name = BOARD.addSnake("gui1", UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW,
				color(194, 254, 34), color(235, 29, 99), 400, 10);
		var snake2Name = BOARD.addSnake("gui2",87, 83, 65, 68,
				color(28, 20, 242), color(252, 14, 30), 400, 10);
		BOARD.snakes.get(snake1Name).dir(1,1);
		BOARD.snakes.get(snake1Name).chngColor();
		BOARD.snakes.get(snake2Name).chngColor();
		BOARD.snakes.get(snake2Name).dir(-1,1);
	};

	this.boardUpdate = function() {
		this.snakes.forEach(function(s){
			s.update();
            // var snakeUpdate = {
				// x: s.x,
				// y: s.y
            // };
            // SOCKET.sendSnake(snakeUpdate);
		});
		this.checkForCollisions();
	};//end boardUpdate

	this.resetBoard = function() {
		this.deleteSnakes();
		var snake1Name = BOARD.addSnake("Player1", UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW,
				color(194, 254, 34), color(235, 29, 99), 400, 15);
		var snake2Name = BOARD.addSnake("Player2",87, 83, 65, 68,
				color(28, 20, 242), color(252, 14, 30), 400, 15);
	};//end RestBoard

	//function to apply canvas size from input boxes
	this.setCanvasSize = function(inputWidth,inputHeight) {
		console.log("BOARD.setCanvasSize called: ", inputWidth, inputHeight);
			this.canvasWidth = inputWidth;
			this.canvasHeight = inputHeight;
	    this.init();
			BOARD.createBackground();
	};

//pause and un-pause the game
	this.pause = function(){
		if(this.paused){
			console.log("Game Resumed");
			GUI.guiState("gameRunning", false);
			document.getElementById("pauseButton").innerHTML = "Pause";
			this.paused = false;
		}else{
			console.log("Game Paused");
			GUI.guiState("paused", false);
			document.getElementById("pauseButton").innerHTML = "Resume";
			this.paused = true;
		}
		this.snakes.forEach(function(snake,snakeName){
			snake.pause();
		});
	};//end pause

	/*
		Snake related stuff
	*/
	this.addSnake = function(snakeName,upButton, downButton, leftButton, rightButton, startColor, endColor, tailLength, size){
		var s = new Snake(snakeName, upButton, downButton, leftButton, rightButton, startColor, endColor, tailLength, size);
		s.intializeTailColor();
		s.spawn();
		this.snakes.set(snakeName,s);
		return snakeName;
	};

	this.checkControls = function(){
		this.snakes.forEach(function(snake,snakeName){
			snake.checkControls();
		});
	};

	this.showSnakes = function(){
		this.snakes.forEach(function(snake,snakeName){
			snake.show();
		});
	};

	this.resetSnakes = function(){
		this.snakes.forEach(function(snake,snakeName){
			snake.reset();
		});
	};

	this.deleteSnakes = function(){
		this.snakes.clear();
	};


	this.checkForCollisions = function(){
		//check if snakes run into tails (self and others)
		for(var snakeHeadKey of this.snakes.keys()){
			var snakeHead = this.snakes.get(snakeHeadKey);
			for(var snakeTailKey of this.snakes.keys()){
				if(snakeHeadKey != snakeTailKey){ //dont check collision with self
					var snakeTail = this.snakes.get(snakeTailKey);
					var collision = snakeHead.checkCollisionWithTail(snakeTail.tail);
			    if(collision != null){
						// console.log(collision);
						// var amountCut = snakeTail.cutTail(collision);
						// snakeTail.chngTail(-1*amountCut);
						// snakeHead.chngTail(amountCut);
						snakeTail.tail[collision.tail].color = color(255,255,255);
                    	snakeHead.spawn();
			    }
				}//check if itself
		  }//othersnake loop

			if(MAZE){
				var wallHit = MAZE.checkCollisionWithWalls(snakeHead);
				if(wallHit != null){
					 wallHit.color = color(255,255,255);
                    snakeHead.spawn();
					//  console.log("wall Hit");
				 }
		 }//if a maze has beed generated
		}//selfsnake loop
	};// checkForCollisions

	this.createBackground = function(){
	  console.log("createBackground");
	  loadImage('assets/backgroundToRepeat.jpg',function(img){
			console.log("loaded image: ", img);
	    var newImage = new p5.Image(width,height);
	    //newImage.copy(img,0,0,img.width,img.height,0,0,img.width,img.height);

	    var widthRatio = Math.floor(width / img.width);
	    var remainingWidth = (width / img.width) - widthRatio;
	    var heightRatio = Math.floor(height /img.height);
	    var remainingHeight = (height /img.height) - heightRatio;
	    // console.log(widthRatio, heightRatio);

	    //copy(srcImage,sx,sy,sw,sh,
	    //dx,dy,dw,dh)
	    for(var h=0; h<heightRatio; h++){
	      //draw full row
	      for(var w=0; w<widthRatio; w++){
	        //full image
	        newImage.copy(img,0,0,img.width,img.height,
	          img.width*w,img.height*h,img.width,img.height);
	      }
	      //remaing of row
	      if(remainingWidth > 0){
	        newImage.copy(img,0,0,img.width*remainingWidth,img.height,
	          img.width*widthRatio,img.height*h,img.width*remainingWidth,img.height);
	      }
	      //end draw full row
	    }
	    //draw last partial row
	    if(remainingHeight > 0){
	      for(var w=0; w<widthRatio; w++){
	        //full image
	        newImage.copy(img,0,0,img.width,img.height*remainingHeight,
	          img.width*w,img.height*h,img.width,img.height*remainingHeight);
	      }
	      //remaing of row
	      if(remainingWidth > 0){
	        newImage.copy(img,0,0,img.width*remainingWidth,img.height*remainingHeight,
	          img.width*widthRatio,img.height*heightRatio,img.width*remainingWidth,img.height*remainingHeight);
	      }
	    }

	    // stroke(255);
	    // strokeWeight(10);
	    // newImage.line(0,0,500,500);

	    //idea to draw walls onto a canvas and flatten to image.
	    //will be more effecient and allow walls to be a texture
	    // var pPixels;
	    // var sketch = function(p){
	    //   p.x = 100;
	    //   p.y = 100;
	    //   p.setup = function(){
	    //     p.createCanvas(100,100);
	    //     p.noLoop();
	    //   }
	    //   p.draw = function(){
	    //     p.background(p.color(200,30,100));
	    //     p.fill(p.color(30,100,200));
	    //     p.rect(20,20,p.width,p.height);
	    //     p.loadPixels();
	    //     pPixels = p.pixels;
	    //   }
	    //
	    // }
	    // var testP5 = new p5(sketch);
	    // console.log(pPixels);
	    // var testImg = new p5.Image(100,100);
	    // testImg.loadPixels();
	    // testImg.pixels = pPixels;
	    // testImg.updatePixels();
	    // console.log(testImg);
	    // console.log(newImage);

	    // newImage.mask(testImg);

	    this.background = newImage;
	    // BACKGROUNDIMAGE = testImg;
			console.log("Finished createing background: ", this.background);
	  }.bind(this), function(error){
	    console.log("error createing back: ",error);
	  });

	};//end create background

	this.show = function(){
		if(this.background != null){
	    background(this.background);
	  }//if image is loaded
	}


}//end board