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
let SIZE = 100;
let BALL_COUNT = 0;
let BLOCK_FILL = "green"
let PAUSE_FRAME = false
let HOLD_BALL = false

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
        LINES.push(this)
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

        this.corner_top_left = createVector(this.position.x + min(this.corner, this.width/2, this.depth/2), this.position.y + min(this.corner, this.depth/2, this.width/2))
        this.corner_top_right = createVector(this.position.x - min(this.corner, this.width/2, this.depth/2) + this.width, this.position.y + min(this.corner, this.depth/2, this.width/2))
        this.corner_bot_left = createVector(this.position.x + min(this.corner, this.width/2, this.depth/2), this.position.y + this.depth - min(this.corner, this.depth/2, this.width/2))
        this.corner_bot_right = createVector(this.position.x + this.width - min(this.corner, this.width/2, this.depth/2), this.position.y + this.depth - min(this.corner, this.depth/2, this.width/2))
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
    }

    show() {
        stroke(255);
        fill(BLOCK_FILL);
        rect(this.x, this.y, this.width, this.depth, this.corner, this.corner, this.corner, this.corner);
        circle(this.corner_top_left.x, this.corner_top_left.y, 5)
        circle(this.corner_top_right.x, this.corner_top_right.y, 5)
        circle(this.corner_bot_left.x, this.corner_bot_left.y, 5)
        circle(this.corner_bot_right.x, this.corner_bot_right.y, 5)

        circle(this.corner_top_left.x, this.corner_top_left.y, min(this.width/2, this.depth/2, this.corner))
        line(this.corner_top_left.x, this.corner_top_left.y, this.corner_top_left.x, this.y)



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
        this.skip_frame = false
        this.id = BALL_COUNT;
        BALLS.push(this)
        BALL_COUNT++;
    }

    update() {

        if(this.skip_frame){
            this.skip_frame = false
            return
        }

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
        if(this.position.x - this.size < 0){
            this.position.x = this.size;
            this.velocity.x = this.velocity.x * -1;
        }
        if(this.position.x + this.size > C_W) {
            this.position.x = C_W-this.size;
            this.velocity.x = this.velocity.x * -1;
        }

        if(this.position.y -this.size < 0){
            this.position.y = this.size;
            this.velocity.y = this.velocity.y * -1;
        }
        if(this.position.y + this.size > C_H){
            this.position.y = C_H-this.size;
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
            let top_n = block.position.y - next.y;

            // `bottom` is the ball's (signed) distance from the bottom of the block
            let bottom_n = next.y - (block.position.y + block.depth);

            // `left` is the ball's (signed) distance from the left side of the block
            let left_n = block.position.x - next.x;

            // `right` is the ball's (signed) distance from the right side of the block
            let right_n = next.x - (block.position.x + block.width);

            let corner_contact_distance = this.size + block.corner

            // if shortest distance is less than radius of ball, possible collision
            // if(choice < this.size){
            if(FLAG){
                debugger
            }
            if(left_n < this.size && right_n < this.size && top_n < this.size && bottom_n < this.size){
                BLOCK_FILL = "yellow"
                // let corner_top_left = createVector(block.position.x - block.corner, block.position.y - block.corner)
                // let corner_top_right = createVector(block.position.x + block.width - block.corner, block.position.y - block.corner)
                // let block.corner_bot_left = createVector(block.position.x, block.position.y - block.corner + block.depth - block.corner)
                // let block.corner_bot_right = createVector(block.position.x + block.width - block.corner, block.position.y + block.depth - block.corner)

                // recalculate distances from CURRENT position
                let top = block.position.y - this.position.y;
                let bottom = this.position.y - (block.position.y + block.depth);
                let left = block.position.x - this.position.x;
                let right = this.position.x - (block.position.x + block.width);

                let d_top_left = this.position.dist(block.corner_top_left)
                let d_top_right = this.position.dist(block.corner_top_right)
                let d_bot_left = this.position.dist(block.corner_bot_left)
                let d_bot_right = this.position.dist(block.corner_bot_right)

                let closest_corner = min([d_top_left, d_top_right, d_bot_left, d_bot_right])
                // let closest_edge = min([abs(top), abs(bottom), abs(left), abs(right)])
                let closest_edge = max([top, bottom, left, right])


                if(closest_corner < corner_contact_distance){
                    // delta_s is the fraction of a frame/time-step that results in perfect contact
                    let delta_s = (corner_contact_distance - closest_corner) / corner_contact_distance
                    this.position.x += this.velocity.x * delta_s
                    this.position.y += this.velocity.y * delta_s
                    // if(closest_corner == d_top_left && top > -1*(block.corner+this.velocity.mag()) && left > -1*(block.corner+this.velocity.mag())){
                    if(closest_corner == d_top_left && this.position.x < block.corner_top_left.x && this.position.y < block.corner_top_left.y){
                        BLOCK_FILL = "red"
                        debugger
                        this.velocity = this.corner_collide(block.corner_top_left)
                        this.position.x += this.velocity.x * (1-delta_s)
                        this.position.y += this.velocity.y * (1-delta_s)
                        this.skip_frame = true
                        continue
                    }
                    // else if (closest_corner == d_top_right && top > -1*(block.corner+this.velocity.mag())  && right > -1*(block.corner+this.velocity.mag())) {
                    else if(closest_corner == d_top_right && this.position.x > block.corner_top_right.x && this.position.y < block.corner_top_right.y){

                        this.velocity = this.corner_collide(block.corner_top_right)
                        this.position.x += this.velocity.x * (1-delta_s)
                        this.position.y += this.velocity.y * (1-delta_s)
                        this.skip_frame = true
                        continue
                    }
                    // else if (closest_corner == d_bot_left && bottom > -1*(block.corner+this.velocity.mag()) && left > -1*(block.corner+this.velocity.mag())) {
                    if(closest_corner == d_bot_left && this.position.x < block.corner_bot_left.x && this.position.y > block.corner_bot_left.y){
                        this.velocity = this.corner_collide(block.corner_bot_left)
                        this.position.x += this.velocity.x * (1-delta_s)
                        this.position.y += this.velocity.y * (1-delta_s)
                        this.skip_frame = true
                        continue
                    }
                    // else if (closest_corner == d_bot_right && bottom > -1*(block.corner+this.velocity.mag()) && right > -1*(block.corner+this.velocity.mag())) {
                    if(closest_corner == d_bot_right && this.position.x > block.corner_bot_right.x && this.position.y > block.corner_bot_right.y){
                        this.velocity = this.corner_collide(block.corner_bot_right)
                        this.position.x += this.velocity.x * (1-delta_s)
                        this.position.y += this.velocity.y * (1-delta_s)
                        this.skip_frame = true
                        continue
                    }
                    this.position.x -= this.velocity.x * delta_s
                    this.position.y -= this.velocity.y * delta_s
                }
                if(closest_edge < this.size){
                    if((closest_edge==top && left < -block.corner && right < -block.corner) || top * top_n < 1){
                        this.velocity.y *= -1
                        this.position.add(this.velocity)
                        this.skip_frame=true
                    } else
                    if((closest_edge==bottom && left < -block.corner && right < -block.corner) || bottom * bottom_n < 1){
                        this.velocity.y *= -1
                        this.position.add(this.velocity)
                        this.skip_frame=true
                    } else
                    if((closest_edge==left && top < -block.corner && bottom < -block.corner) || left*left_n < 0){
                        this.velocity.x *= -1
                        this.position.add(this.velocity)
                        this.skip_frame=true
                    } else
                    if((closest_edge==right && top < -block.corner && bottom < -block.corner) || right*right_n < 0){
                        this.velocity.x *= -1
                        this.position.add(this.velocity)
                        this.skip_frame=true
                    } else
                    {
                        BLOCK_FILL = "green"
                        // debugger
                    }
                }
                // else
                // {
                //     console.log(`top=${top}\nbottom=${bottom}\nleft=${left}\nright=${right}`)
                //     console.log(`top_n=${top_n}\nbottom_n=${bottom_n}\nleft_n=${left_n}\nright_n=${right_n}`)
                //     console.log(`closest_edge=${closest_edge}`)
                //     console.log(`closest_corner=${closest_corner}`)
                //     console.log(`dist(block.corner_top_left)=${next.dist(block.corner_top_left)}`)
                //     console.log(`dist(block.corner_top_right)=${next.dist(block.corner_top_right)}`)
                //     console.log(`dist(block.corner_bot_left)=${next.dist(block.corner_bot_left)}`)
                //     console.log(`dist(block.corner_bot_right)=${next.dist(block.corner_bot_right)}`)
                //     console.log(`corner_contact_distance=${corner_contact_distance}`)
                //     debugger
                //     noLoop()
                // }


                //DEBUGGING STUFF
                // if(top < this.size && bottom < this.size && left < this.size && right < this.size){
                //     BLOCK_FILL = "red"
                // } else {
                //     BLOCK_FILL = "green"
                // }

                // if(top > 0 && bottom < 0 && left > 0 && right < 0 && next.dist(corner_top_left) < this.size + block.corner){ // top left corner collision
                //     // this.velocity = this.corner_collide(block.position.x+block.corner, block.position.y+block.corner);
                //     this.velocity = this.corner_collide(corner_top_left);
                //     console.log(`${next.dist(corner_top_left)}`)
                // } else
                // if(top > 0 && bottom < 0 && right > 0 && left < 0 && next.dist(corner_top_right) < this.size + block.corner){ // top right corner collision
                //     this.velocity = this.corner_collide(corner_top_right);
                // } else
                // if(bottom > 0 && top < 0 && left > 0 && right < 0 && next.dist(corner_bot_left) < this.size + block.corner){ // bottom left corner collision
                //     this.velocity = this.corner_collide(corner_bot_left);
                // } else
                // if(bottom > 0 && top < 0 && right > 0 && left < 0 && next.dist(corner_bot_right) < this.size + block.corner){
                //     this.velocity = this.corner_collide(corner_bot_right);
                // }
                // else
                // if(top > 0 && bottom < 0 && left < 0 && right < 0){ // top side collision

                //     this.velocity.y *= -1;
                // } else
                // if(bottom > 0 && top < 0 && left < 0 && right < 0){ // bottom side collision
                //     this.velocity.y *= -1;
                // } else
                // if(left > 0 && right < 0 && top < 0 && bottom < 0){ // left side collision
                //     this.velocity.x *= -1;
                // } else
                // if(right > 0 && left < 0 && top < 0 && bottom < 0){ // right side collision
                //     this.velocity.x *= -1;
                // }

                // else {
                //     noLoop();
                //     console.log(`top=${top}\nbottom=${bottom}\nleft=${left}\nright=${right}`)
                //     console.log(`top_n=${top_n}\nbottom_n=${bottom_n}\nleft_n=${left_n}\nright_n=${right_n}`)
                //     console.log(`dist(corner_top_left)=${next.dist(corner_top_left)}`)
                //     console.log(`dist(corner_top_right)=${next.dist(corner_top_right)}`)
                //     console.log(`dist(corner_bot_left)=${next.dist(corner_bot_left)}`)
                //     console.log(`dist(corner_bot_right)=${next.dist(corner_bot_right)}`)

                //     console.log(`ball.size/2 + block.corner=${this.size + block.corner}`)


                // }
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

    // corner_collide(corner_x, corner_y){
    corner_collide(corner){
        let start = this.velocity.mag()
        // let corner = createVector(corner_x, corner_y);
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
    ellipseMode(RADIUS)
    createCanvas(C_W, C_H);
    frameRate(60);
    // BALLS.push(new Ball(200, 200, 15, createVector(random(1,5), random(1,5))));
    new Ball(200, 200, 15, createVector(random(1,5), random(1,5)));


    if(DEBUG){
        for(i=0; i<5; i++){
            BLOCKS.push(new Block(random(100, C_W-100), random(100, C_H-100), random(50,200), random(50, 200)));
        }
    }
    strokeWeight(1);
}
let FLAG = false

function keyTyped(){
    if(keyCode===32){
        new Ball(10, 10, 15, createVector(random(1,5), random(1,5)))
    }
    if(keyCode==113){
        FLAG = true
    }
    if(keyCode==104)
    {
        HOLD_BALL = !HOLD_BALL
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

    if(mouseButton == "left") {

        let left = min(mouseX, PREV_MOUSE_X);
        let top = min(mouseY, PREV_MOUSE_Y);
        let width = abs(mouseX - PREV_MOUSE_X);
        let depth = abs(mouseY - PREV_MOUSE_Y);

        if(!DEBUG){
            BLOCKS.push(new Block(left, top, width, depth));
        }
    }

}

function draw() {
  // put drawing code her
  background(51);
  for (let block of BLOCKS){
    block.update();
    block.show();
  }

  if(HOLD_BALL){
      BALLS[0].velocity.x=0
      BALLS[0].velocity.y=0
      BALLS[0].position.x=mouseX
      BALLS[0].position.y=mouseY
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
