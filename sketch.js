let C_W = 1000;
let C_H = 800;

const BLOCKS = [];
const BALLS = [];
const POINTS = [];
const LINES = [];
let PREV_MOUSE_X = 0;
let PREV_MOUSE_Y = 0;
let DEBUG_TEXT = false;
let DEBUG = false;
let SKIP = false;
let SIZE = 1;
let BALL_COUNT = 0;

class Point{
    constructor(x, y, size, color) {
        if(!color){
            this.color='white';
        } else{
            this.color = color;
        }

        if(!size){
            this.size = SIZE;
        } else {
            this.size = size;
        }

        this.position = createVector(x, y);
        this.velocity = createVector(0,0);
        this.acceleration = createVector(0, 0);
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

class Line{
    constructor(x1, y1, x2, y2, color){
        if(!color){
            this.color="white";
        } else {
            this.color = color;
        }
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    update(){
    }
    show(){
        stroke(this.color);
        line(this.x1, this.y1, this.x2, this.y2);
    }
}

class Block{
    constructor(x, y, width, depth, corner) {
        if(!corner){
            this.corner = 7;
        } else {
            this.corner = corner;
        }

        if(!corner){
            this.corner = SIZE;
        } else {
            this.corner = corner;
        }

        this.x = x;
        this.y = y;
        this.width = width;
        this.depth = depth;
        this.position = createVector(x, y);
        this.velocity = createVector(0,0);
        // this.velocity.setMag(random(0.5,1.5));
        this.acceleration = createVector(0,0);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
    }

    show() {
        stroke(255);
        fill("green");
        rect(this.x, this.y, this.width, this.depth, this.corner, this.corner, this.corner, this.corner);
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
        this.id = BALL_COUNT;
        BALL_COUNT++;
    }

    update() {

        if(SKIP > 0){

            this.position.add(this.velocity);
            this.velocity.add(this.acceleration);

            this.velocity.mult(.9996);
            SKIP -= 1;
            return;
        }

        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);

        // this.velocity.mult(.9996);

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

        next = createVector(this.position.x + this.velocity.x, this.position.y + this.velocity.y);

        // next = createVector(this.position.x, this.position.y);

        for(let block of BLOCKS){
            // All distances are positive if "outside" the block and negative if "inside"

            // `top` is the ball's (signed) distance from the top of the block
            let top = block.position.y - next.y;

            // `bottom` is the ball's (signed) distance from the bottom of the block
            let bottom = next.y - (block.position.y + block.depth);

            // `left` is the ball's (signed) distance from the left side of the block
            let left = block.position.x - next.x;

            // `right` is the ball's (signed) distance from the right side of the block
            let right = next.x - (block.position.x + block.width);

            // if shortest distance is less than radius of ball, possible collision
            // if(choice < this.size/2){
            if(left < this.size/2 && right < this.size/2 && top < this.size/2 && bottom < this.size/2){
                // recalculate distances from CURRENT position
                top = block.position.y + block.corner - this.position.y;
                bottom = this.position.y - (block.position.y + block.depth - block.corner);
                left = block.position.x + block.corner - this.position.x;
                right = this.position.x - (block.position.x + block.width - block.corner);

                if(top > 0 && bottom < 0 && left < 0 && right < 0){ // top side collision
                    this.velocity.y *= -1;
                } else
                if(bottom > 0 && top < 0 && left < 0 && right < 0){ // bottom side collision
                    this.velocity.y *= -1;
                } else
                if(left > 0 && right < 0 && top < 0 && bottom < 0){ // left side collision
                    this.velocity.x *= -1;
                } else
                if(right > 0 && left < 0 && top < 0 && bottom < 0){ // right side collision
                    this.velocity.x *= -1;
                } else
                if(top > 0 && bottom < 0 && left > 0 && right < 0){ // top left corner collision
                    this.velocity = this.corner_collide(block.position.x+block.corner, block.position.y+block.corner);
                } else
                if(top > 0 && bottom < 0 && right > 0 && left < 0){ // top right corner collision
                    this.velocity = this.corner_collide(block.position.x+block.width-block.corner, block.position.y+block.corner);
                } else
                if(bottom > 0 && top < 0 && left > 0 && right < 0){ // bottom left corner collision
                    this.velocity = this.corner_collide(block.position.x+block.corner, block.position.y+block.depth-block.corner);
                } else
                if(bottom > 0 && top < 0 && right > 0 && left < 0){
                    this.velocity = this.corner_collide(block.position.x+block.width-block.corner, block.position.y+block.depth-block.corner);
                } else {
                    noLoop();
                }
            }
        }



    }

    show() {
        stroke(255);
        fill(255);
        circle(this.position.x, this.position.y, this.size);
        stroke(0);
        fill(0);
        text(`${this.id}`, this.position.x-this.size/4, this.position.y+this.size/4);

    }

    corner_collide(corner_x, corner_y){
        let start = this.velocity.mag()
        let corner = createVector(corner_x, corner_y);
        let normal = createVector(this.position.x, this.position.y).sub(corner);
        let nTn = normal.dot(normal);
        let nTv = normal.dot(this.velocity);
        let v_n = normal.mult(nTv / nTn);
        let v_p = this.velocity - v_n;
        let v2 = v_n.mult(-1).add(v_p)
        let ratio = start / v2.mag();

        if(ratio > 2){
            v2.mult(ratio);
        }

        return this.velocity = v2;
    }

}


function setup() {
    createCanvas(C_W, C_H);
    frameRate(120);
    BALLS.push(new Ball(200, 200, 15, createVector(random(1,5), random(1,5))));

    if(DEBUG){
        for(i=0; i<5; i++){
            BLOCKS.push(new Block(random(100, C_W-100), random(100, C_H-100), random(50,200), random(50, 200)));
        }
    }
    strokeWeight(1);
}

function keyTyped(){
    if(keyCode===32){
        BALLS.push(new Ball(10, 10, 15, createVector(random(1,5), random(1,5))));
    }
}

function mousePressed() {
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
  for(let line of LINES){
    line.update();
    line.show();
  }

  text(`${DEBUG_TEXT}`, C_W-100, 10);
}
