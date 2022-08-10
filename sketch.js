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
            // if(block.contains(next)){
            //     POINTS.push(new Point(this.position.x, this.position.y, this.size));
            //     // BLOCKS.push(new Block(this.position.x-2, this.position.y-2, 4, 4));
            //     POINTS.push(new Point(next.x, next.y, 2, "red"));
            //     // BALLS.push(new Ball(next.x, next.y, this.size));

            //     if(choice == top){
            //         this.velocity.y *= -1;
            //         this.position.y = block.position.y - this.size / 2;
            //     }
            //     else if(choice == bottom){
            //         this.velocity.y *= -1;
            //         this.position.y = block.position.y + block.depth + this.size / 2;
            //     }
            //     else{
            //         this.velocity.x *= -1;
            //     }
            // }


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

// Given three collinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
function onSegment(p, q, r)
{
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
    return true;

    return false;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r)
{

    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    let val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);

    if (val == 0) return 0; // collinear

    return (val > 0)? 1: 2; // clock or counterclock wise
}

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function doIntersect(p1, q1, p2, q2)
{

    // Find the four orientations needed for general and
    // special cases
    let o1 = orientation(p1, q1, p2);
    let o2 = orientation(p1, q1, q2);
    let o3 = orientation(p2, q2, p1);
    let o4 = orientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4)
        return true;

    // Special Cases
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
}

