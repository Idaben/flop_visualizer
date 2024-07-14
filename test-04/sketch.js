const APPROACH_LENGTH = 100;
const APPROACH_DELTA = 3;
const APPROACH_SCALE = 200;

let time = 0;

let start_val = 1;
let end_val = 0;





function setup() {
  // put setup code here
  createCanvas(1850, 900);
  background(200);
}

function draw() {
  clear();
  background(200);
  translate(500, 250);

  strokeWeight(5);
  stroke("black");
  noFill();
  beginShape();
  for (let i = 0; i <= APPROACH_LENGTH; i += 3) {
    strokeWeight(5);
    stroke("black");
    vertex(i, approach_value(random([0, 1]), random([0, 1]), i, time, APPROACH_SCALE, APPROACH_DELTA));
    time += 0.1;
  }
  endShape();
  noLoop();
}


function approach_value(start_val, end_val, input, time, scale, delta) {
  let curr_val = 0;

  if (input == 0 && input <= delta) {
    curr_val = start_val*scale;
  }
  if (input > APPROACH_LENGTH - (APPROACH_LENGTH - delta) && input < APPROACH_LENGTH - delta) {
    curr_val = noise(time)*scale;
  }
  if (input >= APPROACH_LENGTH - delta) {
    curr_val = end_val*scale;
  }

  return curr_val;
}

