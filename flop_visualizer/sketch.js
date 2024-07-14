// GLOBAL VARIABLES
let flop_size = 3;
let realtime = 0;
let time = 0;

// for init_clk()
let clk_time = 0;
let clk_state = 0;
let prev_state = null;

let graph_size = 500;

// skew variables ??
let skew_step = 5;
let live_point = 0;
let last_point = null;

let points = new Array(200);


function setup() {
  // put setup code here
  createCanvas(1850, 900);
  background(200);
}

function draw() {
  // TIMING
  realtime = realtime + 1;
  // if (realtime >= 100) {
  //   time = time + 1;
  //   realtime = 0;
  //   clear();
  //   background(200);
  // }

  // put drawing code here
  draw_flop("f1", 400, 120, 0, 0);

  init_clk(realtime);

  draw_graph(clk_state, realtime, 500);
 
  textSize(50);
  text(time, 1700, 850);
}


function init_clk(rtime){
  let clk = [];
  let clk_speed = 70;
  let meta_time = 5;

  if (clk_time <= 2) {
    clk_time = rtime;
  } else {
    // console.log("rtime : ", rtime, "clk_time : ", clk_time, "clk_state : ", clk_state, "clk_delta : ", rtime - clk_time);
  }

  if (rtime - clk_time >= clk_speed) {
    // metastable state
    if (rtime - clk_time <= clk_speed + meta_time) {
      if (prev_state == null) {
        prev_state = clk_state;
      }
      clk_state = 3;
    } else {
      clk_state = prev_state;
      prev_state = null;
      if (clk_state == 0) {
        clk_state = 1;
        prev_state = 1;
      } else {
        clk_state = 0;
        prev_state = 0;
      }
      clk_time = 0;
    }
  } 
}


function draw_graph(i_signal, rtime, p_max) {
  let graph_height = 50;
  let p_min = 0;

  p_min = p_max + graph_height;
  push();
  strokeWeight(3);
  stroke("black");
  beginShape(POINTS);
  switch (i_signal) {
    case 0 :
      if (last_point != null) {
        line(last_point, p_min, p_max + rtime, p_max);
        last_point = null;
      } else {
        vertex(p_max + rtime, p_max);
        live_point = p_max + rtime;
      }
      break;
    case 1 :
      if (last_point != null) {
        line(last_point, p_max, p_max + rtime, p_min);
        last_point = null;
      } else {
        vertex(p_max + rtime, p_min);
        live_point = p_max + rtime;
      }
      break;
    default :
      if (last_point == null) {
        last_point = live_point;
      }
      break;
  }
  endShape();
  pop();
}


// draw a d-flip-flop
function draw_flop(name, x, y, clk, d) {
  let q   = 0;
  let qn  = 0;
  let text_offset;

  push();
  strokeWeight(0.6 * flop_size);
  rect(x, y, (50 * flop_size), (80 * flop_size), 10);

  // text
  textSize(10*flop_size)
  text_offset = 10;
  text_offset = text_offset*0.5*flop_size + 1;
  text(name, x + 25*flop_size - text_offset,  y + 40*flop_size);
  
  // left-side ports
  textSize(6*flop_size)
  text("clk", x + 5*flop_size,  y + 21*flop_size);
  rect(x - 3*flop_size, y + 16*flop_size,  (7 * flop_size), (7 * flop_size), 5);

  // textSize(6*flop_size)
  text("d", x + 5*flop_size,  y + 62*flop_size);
  rect(x - 3*flop_size, y + 57*flop_size,  (7 * flop_size), (7 * flop_size), 5);
  
  // right-side ports
  text("q", x + 41*flop_size,  y + 21*flop_size);
  rect(x + 46*flop_size, y + 16*flop_size,  (7 * flop_size), (7 * flop_size), 5);

  text("qn", x + 37*flop_size,  y + 62*flop_size);
  rect(x + 46*flop_size, y + 57*flop_size,  (7 * flop_size), (7 * flop_size), 5);
  pop();

  // FLOP FUNCTIONS
}

