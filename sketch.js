let C_W = 1000;
let C_H = 800;

class Point{
    constructor(x, y, size, color) {
        if(!color){
            this.color='white';
        } else{
            this.color = color;
        }
        this.position = createVector(x, y);
        this.velocity = createVector(0,0);
        this.acceleration = createVector(0, 0);
        this.size = size;
    }
    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
    }
    show() {
        stroke(this.color);
        fill(this.color);
        circle(this.position.x, this.position.y, this.size);
    }
}

class Block{
    constructor(x, y, width, depth) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.depth = depth;
        this.position = createVector(x, y);
        this.velocity = createVector(0,0);
        // this.velocity.setMag(random(0.5,1.5));
        this.acceleration = createVector(0,0);
    }

    contains(position_vector) {
        if(DEBUG){
            stroke("red");
            line(this.x, 0, this.x, C_H);
            line(this.x+this.width, 0, this.x+this.width, C_H);
            line(0, this.y, C_W, this.y);
            line(0, this.y+this.depth, C_W, this.y+this.depth);

            stroke("green");
            line(this.x+1, 0, this.x+1, C_H);
            line(0, this.y+1, C_W, this.y+1);
        }

        if(this.x < position_vector.x && position_vector.x < this.x + this.width && this.y < position_vector.y && position_vector.y < this.y + this.depth){
            return true;
        }
        else{
            return false;
        }
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
    }

    show() {
        stroke(255);
        fill("green");
        rect(this.x, this.y, this.width, this.depth);
        fill("white");
    }
}

class Ball{
    constructor(x, y, size, velocity) {
        if(!velocity){
            this.velocity=createVector(0,0);
        } else{
            this.velocity = velocity;
        }
        this.position = createVector(x, y);
        this.acceleration = createVector(0, .1);
        this.size = size;
    }

    update() {

        if(SKIP > 0){

            this.position.add(this.velocity);
            this.velocity.add(this.acceleration);

            this.velocity.mult(.9996);
            SKIP -= 1;
            return;
        }
        // WALL COLLISION
        // VVVVVVVVVVVVVV
        if(this.position.x - this.size / 2 < 0){
            this.position.x = this.size / 2;
            this.velocity.x = this.velocity.x * -1;
        }
        if(this.position.x + this.size / 2 > C_W) {
            this.position.x = C_W-this.size/2;
            this.velocity.x = this.velocity.x * -1;
        }

        if(this.position.y -this.size / 2 < 0){
            this.position.y = this.size/2;
            this.velocity.y = this.velocity.y * -1;
        }
        if(this.position.y + this.size / 2 > C_H){
            this.position.y = C_H-this.size/2;
            this.velocity.y = this.velocity.y * -1;
        }


        // BLOCK COLLISION
        // VVVVVVVVVVVVVVV

        let next;
        // `next` is where the ball will be next frame

        // next = createVector(this.position.x + this.velocity.x, this.position.y + this.velocity.y);

        next = createVector(this.position.x, this.position.y);

        for(let block of BLOCKS){
            // All distances are positive if "outside" the block and negative if "inside"

            // `top` is ball's the distance from the top of the block
            let top = block.position.y - next.y;

            // `bottom` is the ball's distance from the bottom of the block
            let bottom = next.y - (block.position.y + block.depth);

            // `left` is the ball's distance from the left side of the block
            let left = block.position.x - next.x;

            // `right` is the ball's distance from the right side of the block
            let right = next.x - (block.position.x + block.width);

            // `choice` is the shortest distance to one side
            let choice = min([abs(top), abs(bottom), abs(left), abs(right)]);

            // if shortest distance is less than radius of ball, possible collision
            if(choice < this.size/2){
                // if TOP/BOTTOM is shortest, then LEFT AND RIGHT must be NEGATIVE for there to be a collision
                if((abs(choice - abs(top)) < 0.1 )||(abs(choice - abs(bottom)) < 0.1)){
                    if(left < 0 && right < 0){
                        // POINTS.push(new Point(this.position.x, this.position.y, this.size, "red"));
                        if(bottom < top){
                            this.position.y = block.position.y - this.size/2;

                        } else{
                            this.position.y = block.position.y + block.depth + this.size/2;

                        }
                        // POINTS.push(new Point(this.position.x, this.position.y, this.size));

                        this.velocity.y *= -1;
                    }
                } else {
                    if(top < 0 && bottom < 0){
                        // POINTS.push(new Point(this.position.x, this.position.y, this.size, "red"));
                        if(left < right){
                            this.position.x = block.position.x + block.width + this.size/2;
                        } else {
                            this.position.x = block.position.x - this.size/2;
                        }
                        // POINTS.push(new Point(this.position.x, this.position.y, this.size));

                        this.velocity.x *= -1;
                    }

                }

            }
        }

        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);

        this.velocity.mult(.9996);


    }

    show() {
        stroke(255);
        circle(this.position.x, this.position.y, this.size);


    }
}

const BLOCKS = [];
const BALLS = [];
const POINTS = [];
let PREV_MOUSE_X = 0;
let PREV_MOUSE_Y = 0;
let COLLIDE = false;
let DEBUG = false;
let NEXT;
let TOP;
let BOTTOM;
let LEFT;
let RIGHT;
let CHOICE;
let SKIP = false;

function setup() {
    createCanvas(C_W, C_H);
    frameRate(120);
    BALLS.push(new Ball(200, 200, 15, createVector(random(1,5), random(1,5))));
    if(DEBUG){
        BLOCKS.push(new Block(random(100, C_W-100), random(100, C_H-100), random(50,200), random(50, 200)));
        BLOCKS.push(new Block(random(100, C_W-100), random(100, C_H-100), random(50,200), random(50, 200)));
        BLOCKS.push(new Block(random(100, C_W-100), random(100, C_H-100), random(50,200), random(50, 200)));
        BLOCKS.push(new Block(random(100, C_W-100), random(100, C_H-100), random(50,200), random(50, 200)));
    }

    strokeWeight(1);
}


function mousePressed() {
    if(DEBUG){
        COLLIDE = BLOCKS[0].contains(createVector(mouseX, mouseY));
    }

    PREV_MOUSE_X = mouseX;
    PREV_MOUSE_Y = mouseY;
}

function mouseReleased(){
    // size = dist(PREV_MOUSE_X, PREV_MOUSE_Y, mouseX, mouseY);
    // size = max(size, 1);

    loop();

    let left = min(mouseX, PREV_MOUSE_X);
    let top = min(mouseY, PREV_MOUSE_Y);
    let width = abs(mouseX - PREV_MOUSE_X);
    let depth = abs(mouseY - PREV_MOUSE_Y);

    if(!DEBUG){
        BLOCKS.push(new Block(left, top, width, depth));
    }

}

function draw() {
  // put drawing code her
  background(51);
  text(`${COLLIDE}`, C_W-100, 10);
  for (let block of BLOCKS){
    block.update();
    block.show();
  }

  for (let ball of BALLS){
    ball.update();
    ball.show();
  }
  for(let point of POINTS){
    point.update();
    point.show()
  }

}
