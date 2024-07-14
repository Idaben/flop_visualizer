let realtime = 0;
let counter = 0;
let current_y = 0;

let hold_time = 500;
let sample_time = null;
let hold_value = null;
let signal_vsize = 5;

let horiman = 0;

function setup() {
  // put setup code here
  createCanvas(1850, 900);
  background(200);
}

function draw() {
  // translate(500, 500);
  // clear();
  // background(200);
  strokeWeight(5);
  stroke("black");

  if (counter < signal_vsize) {
    point(500 + horiman, 500+realtime);
    counter = counter + 1;
  }

  // LOWEST POINT
  if (counter == signal_vsize) {
    if (hold_value == null) {
      hold_value = 500+realtime;
      sample_time = realtime;
    }
    if (realtime - sample_time <= hold_time) {
      point(500 + horiman, hold_value);
    } else {
      counter = signal_vsize * 2;
      current_y = hold_value;
      realtime = 0;
      hold_value = null;
    }
  }

  if (counter < signal_vsize * 3 && counter > signal_vsize) {
    point(500 + horiman, current_y-realtime);
    counter = counter + 1;
  }
  
  // HIGHEST POINT
  if (counter == signal_vsize * 3) {
    if (hold_value == null) {
      hold_value = current_y-realtime;
      sample_time = realtime;
    }
    if (realtime - sample_time <= hold_time) {
      point(500 + horiman, hold_value);
    } else {
      counter = 0;
      current_y = hold_value;
      realtime = 0;
      hold_value = null;
    }
  }

  realtime = realtime + 15;
  horiman = horiman + 1;
}

