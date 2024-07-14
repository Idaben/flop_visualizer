let angle = 0;
let x = 0, y = 0, n = 0;
let time = 0.05;
let radius = 5;

let g_time = 0;
let sample_time = null;
let freeze_time = 0;
let time_2 = 0;

let size = 500;

let osc_freq = 500;
let hold_time = 100;

function setup() {
  // put setup code here
  createCanvas(1850, 900);
  background(200);
}

function draw() {
  // clear();
  background(200);
  translate(200, 350);
  
  // DRAW???
  strokeWeight(5);
  stroke("black");
  noFill();
  beginShape();

  // if (time_2 == 1) {
    for (let i = 0; i <= 1000; i++) {
      // HIGH
      if (y < 1) {
        // sample entry time
        if (sample_time == null) {
          sample_time = g_time;
          freeze_time = time;
        } else {
          if (g_time - sample_time <= hold_time) {
            y = 0;
          } else {
            y = 1;
            time = freeze_time;
            sample_time = null;
          }
        }
      } else if (y >= 1 && y <= osc_freq - 1) {
        y += radius*sin(angle);
        angle += time;
      }
      // LOW
      if (y > osc_freq - 1) {
        // sample entry time
        if (sample_time == null) {
          sample_time = g_time;
          freeze_time = time;
        } else {
          if (g_time - sample_time <= hold_time) {
            y = osc_freq;
          } else {
            y = osc_freq - 1;
            time = freeze_time;
            sample_time = null;
          }
        }
      } else if (y <= osc_freq - 1 && y >= 1) {
        y += radius*sin(angle);
        angle += time;
      }
      g_time += 0.01;
      vertex(i , y);
    } // END OF FOR LOOP
    time_2 = 0;
  // }
  time_2 += 1;

  endShape();
  // noLoop();
}

