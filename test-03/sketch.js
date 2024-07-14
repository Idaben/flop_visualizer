const APPROACH_LENGTH = 230;
const APPROACH_DELTA = 3;
const APPROACH_SCALE = 40;
const graph_size = 500;
const voffset = 25;
const overshoot = 15;
const delta_time = 2;
const meta_ratio = 0.0625;
const propagation_delay = 10;

let temp_array;

let inj_glitch = 1;
let posedge_flag = 0;
let err_stretch = 0;

let global_time = 0;

// CLK 1
let clk_graph = [];
let clk_hold_time = 74;
// let clk_hold_time = 90;
let clk_skew_time = -1;
let clk_time = 0;
let clk_ttime = null;
let clk_state = 1;
let clk_pstate = 0;

// DATA
let osc_graph = [];
let osc_hold_time = 240;
let osc_skew_time = -1;
let osc_time = 0;
let osc_ttime = null;
let osc_state = 1;
let osc_pstate = 0;

// FLOP 1
let flop1_graph = [];
let flop1_pclk = 0;
let flop1_state = 1;
let flop1_pstate = 0; // this is the prev_data_in
let flop1_hstate = null; // used for storing the next state while flop is in hold
let flop1_hold_val = 0; // flop holds this value (used for propagation delay)
let flop1_postime = 0;
let flop1_datatime = 0;
let flop1_sample_flag = 0;
let flop1_delay = 0;
let flop1_skewed_val = 0;
let flop1_approach_flag = 0;


let gtemp = 0;


let meta_time = 0;
let meta_entry_state = 0;




// CLK 2
let clk2_graph = [];
let clk2_hold_time = 74;
let clk2_skew_time = -1;
let clk2_time = 0;
let clk2_ttime = null;
let clk2_state = 1;
let clk2_pstate = 0;


// FLOP 2
let flop2_graph = [];
let flop2_pclk = 0;
let flop2_state = 1;
let flop2_pstate = 0;
let flop2_hstate = null;
let flop2_hold_val = 0;
let flop2_postime = 0;
let flop2_datatime = 0;
let flop2_sample_flag = 0;
let flop2_delay = 0;

// FLOP 3
let flop3_graph = [];
let flop3_pclk = 0;
let flop3_state = 1;
let flop3_pstate = 0;
let flop3_hstate = null;
let flop3_hold_val = 0;
let flop3_postime = 0;
let flop3_datatime = 0;
let flop3_sample_flag = 0;
let flop3_delay = 0;

function setup() {
  // put setup code here
  createCanvas(1850, 900);
  background(200);

  // assign initial values of all graphs to be zero
  for (let i = 0; i <= graph_size; i++) {
    clk_graph[i] = 0;
    osc_graph[i] = 0;
    flop1_graph[i] = 0;
    clk2_graph[i] = 0;
    flop2_graph[i] = 0;
    flop3_graph[i] = 0;
  }
}

function draw() {
  // BACKGROUND STUFFS
  clear();
  background(200);

  // CLK 1
  translate(200, 150);
  scale(2, 2, 1); // TEMP CODE FOR MAKING THINGS LARGER
  strokeWeight(1);
  stroke("black");
  noFill();
  beginShape();
  // DRAW
  for (let i = 0; i <= clk_graph.length; i++) {
    vertex(i , clk_graph[i]);
  }
  endShape();

  // DATA
  translate(0, 80);
  strokeWeight(1);
  stroke("black");
  noFill();
  beginShape();
  // DRAW
  for (let i = 0; i <= osc_graph.length; i++) {
    vertex(i , osc_graph[i]);
  }
  endShape();
  
  // FLOP 1
  translate(0, 80);
  strokeWeight(1);
  stroke("black");
  noFill();
  beginShape();
  // DRAW
  for (let i = 0; i <= flop1_graph.length; i++) {
    vertex(i , flop1_graph[i]);
  }
  endShape();
  
  translate(0, 100); // separator

  // // CLK 2
  // translate(0, 80);
  // // scale(2, 2, 1);
  // strokeWeight(1);
  // stroke("black");
  // noFill();
  // beginShape();
  // // DRAW
  // for (let i = 0; i <= clk_graph.length; i++) {
  //   vertex(i , clk2_graph[i]);
  // }
  // endShape();


  // // FLOP 2
  // translate(0, 80);
  // strokeWeight(1);
  // stroke("black");
  // noFill();
  // beginShape();
  // // DRAW
  // for (let i = 0; i <= flop2_graph.length; i++) {
  //   vertex(i , flop2_graph[i]);
  // }
  // endShape();
  // 
  // // FLOP 3
  // translate(0, 80);
  // strokeWeight(1);
  // stroke("black");
  // noFill();
  // beginShape();
  // // DRAW
  // for (let i = 0; i <= flop3_graph.length; i++) {
  //   vertex(i , flop3_graph[i]);
  // }
  // endShape();
  
  
  
  
  // CLK A 1
  temp_array = inst_signal(clk_graph, clk_time, clk_ttime, clk_state, clk_pstate, clk_hold_time, clk_skew_time);
  [clk_graph, clk_time, clk_ttime, clk_state, clk_pstate] = temp_array;

  // DATA 1
  // temp_array = inst_signal(osc_graph, osc_time, osc_ttime, osc_state, osc_pstate, osc_hold_time, osc_skew_time);
  temp_array = inj_signal(osc_graph, osc_time, osc_ttime, osc_state, osc_pstate, osc_hold_time, osc_skew_time);
  [osc_graph, osc_time, osc_ttime, osc_state, osc_pstate] = temp_array;
  
  // FLOP 1
  temp_array = inst_flop(flop1_graph,          clk_state,    flop1_pclk,     osc_state,        flop1_pstate, 
                         flop1_state,          flop1_hstate, flop1_hold_val, flop1_postime,    flop1_datatime, 
                         flop1_sample_flag,    flop1_delay,  10,             flop1_skewed_val, clk_hold_time,
                         flop1_approach_flag,  );
  

  [flop1_graph,      flop1_state,   flop1_hstate,   flop1_hold_val,    flop1_pclk, 
   flop1_pstate,     flop1_postime, flop1_datatime, flop1_sample_flag, flop1_delay, 
   flop1_skewed_val, flop1_approach_flag] = temp_array;

  //      // CLK 2
  //      temp_array = inst_signal(clk2_graph, clk2_time, clk2_ttime, clk2_state, clk2_pstate, clk2_hold_time, clk2_skew_time);
  //      [clk2_graph, clk2_time, clk2_ttime, clk2_state, clk2_pstate] = temp_array;
  //      
  //      // FLOP 2
  //      temp_array = inst_flop(flop2_graph, clk2_state, flop2_pclk, flop1_state, flop2_pstate, flop2_state, flop2_hstate, flop2_hold_val, flop2_postime, flop2_datatime, flop2_sample_flag, flop2_delay, 5);
  //      [flop2_graph, flop2_state, flop2_hstate, flop2_hold_val, flop2_pclk, flop2_pstate, flop2_postime, flop2_datatime, flop2_sample_flag, flop2_delay] = temp_array;
  //      
  //      // FLOP 3
  //      temp_array = inst_flop(flop3_graph, clk2_state, flop3_pclk, flop2_state, flop3_pstate, flop3_state, flop3_hstate, flop3_hold_val, flop3_postime, flop3_datatime, flop3_sample_flag, flop3_delay, 5);
  //      [flop3_graph, flop3_state, flop3_hstate, flop3_hold_val, flop3_pclk, flop3_pstate, flop3_postime, flop3_datatime, flop3_sample_flag, flop3_delay] = temp_array;


  global_time += delta_time;
}








// randomization in the way the skew values are generated
function skewer() {
  let val = 0;
  
  val = random();
  val = val - 0.5;
  return val*2;
}


// function to generate y-values over time, controlled by various parameters
function inst_signal(graph, time, ttime, curr_state, prev_state, hold_time, skew_time) {
  if (time > 0 && time < hold_time) {
    // console.log("TIME : ", time, "TTIME : ", ttime, "STATE : ", curr_state);
  } else {
    if (ttime == null) {
      ttime = time;
      prev_state = curr_state;
      // console.log("GET TTIME");
    }
    if (time - ttime >= skew_time) {
      curr_state = prev_state*-1
      time = 0;
      ttime = null;
      // console.log("SKEW");
    } else {
      curr_state = 0;
      // console.log("RELEASE");
    }
  }
  graph.pop();
  if (curr_state > 0) {
    graph.unshift(voffset*-1);
  } else if (curr_state < 0) {
    graph.unshift(voffset);
  } else if (curr_state == 0) {
    graph.unshift(skewer()*voffset+overshoot);
  }
  time += delta_time;

  // destructured return (destructuring assignments)
  return [graph, time, ttime, curr_state, prev_state];
}


// function to generate y-values over time, controlled by various parameters
function inj_signal(graph, time, ttime, curr_state, prev_state, hold_time, skew_time) {
  if (time > 0 && time < hold_time) {
    // console.log("TIME : ", time, "TTIME : ", ttime, "STATE : ", curr_state);
  } else {
    if (ttime == null) {
      ttime = time;
      prev_state = curr_state;
      // console.log("GET TTIME");
    }
    if (time - ttime >= skew_time) {
      curr_state = prev_state*-1
      time = 0;
      ttime = null;
      // console.log("SKEW");
    } else {
      curr_state = 0;
      // console.log("RELEASE");
    }
  }

  // console.log("FLOP1 POSEDGE : ", flop1_pclk);
  if (inj_glitch == 1) {
    if (posedge_flag == 0) {
      curr_state = 1;
    } else {
      if (err_stretch <= 500) {
        curr_state = -1;
        err_stretch += delta_time;
      } else {
        err_stretch = 0;
        posedge_flag = 0;
      }
    }
  }

  graph.pop();
  if (curr_state > 0) {
    graph.unshift(voffset*-1);
  } else if (curr_state < 0) {
    graph.unshift(voffset);
  } else if (curr_state == 0) {
    graph.unshift(skewer()*voffset+overshoot);
  }
  time += delta_time;

  // destructured return (destructuring assignments)
  return [graph, time, ttime, curr_state, prev_state];
}




// flip flop function
function inst_flop(graph,       clk_in,     prev_clk_in, data_in,    prev_data_in, 
                   curr_state,  prev_state, hold_val,    postime,    datatime, 
                   sample_flag, delay,      shtime,      skewed_val, clk_hold_time,
                   approach_flag) {

  if (clk_in < 0) {
    sample_flag = 1;
    postime = null;
  }
  
  if (clk_in > 0 && sample_flag == 1) {
    // CAPTURE POSEDGE TIME
    if (postime == null) {
      postime = global_time;
      meta_time = 0;
      // FOR ERROR INJECTION???
      posedge_flag = 1;
      approach_flag = 1;
      console.log("POSEDGE : ", global_time);
    }

    if (hold_val == null) { hold_val = curr_state; }

    if (postime - datatime > 0 && postime - datatime <= shtime) {
      // HANDLES SAMPLE TIME
      curr_state = 0;
      console.log("METASTABLE SAMPLE", "clk posedge time : ", postime, "\ndata edge time : ", datatime);
      console.log("METASTABLE DELTA : ", postime - datatime, "shtime : ", shtime);
    } else {
      // console.log("METASTABLE SAMPLE", "clk posedge time : ", postime, "\ndata edge time : ", datatime);
      // console.log("METASTABLE DELTA : ", postime - datatime, "shtime : ", shtime);
      if (gtemp == 1) {
        console.log("DO NOT SAMPLE THIS POSEDGE");
        curr_state = skewed_val;
        gtemp = 0;
      } else {
        console.log("SAMPLE THIS");
        curr_state = data_in;
      }
    }
    delay = 0;
    sample_flag = 0;
    // console.log("ASSIGN VAL : ", curr_state);
  }

  // use to monitor data edges, for handling hold time violations
  // prev_data_in IS NOT the previous output or the current output of the flop
  if (data_in != prev_data_in) {
    datatime = global_time;
    // console.log("DATA EDGE : ", datatime, " = ", data_in);
    // HANDLES HOLD TIME
    if (global_time - postime <= shtime) {
      curr_state = 0;
      prev_state = 0; // ideally this happens after the posedge, thus we need to set this variable here also
      console.log("METASTABLE HOLD?", "last posedge : ", postime, "dtime : ", datatime);
      console.log("METASTABLE DELTA : ", datatime - postime, "shtime : ", shtime);
    }
  }
  prev_data_in = data_in;
  // console.log("CURR STATE AFTER HOLD VIO : ", curr_state);
  // console.log("PREV STATE AFTER HOLD VIO : ", prev_state);

  // console.log("CURR STATE BEFORE SHIFTING : ", curr_state);
  //
  if (curr_state == 0 && meta_time < clk_hold_time*1.7) {
    meta_time += delta_time;
    [skewed_val] = approach_value(curr_state, meta_time, global_time+50, APPROACH_DELTA, clk_hold_time*1.7, approach_flag, skewed_val);
  // } else if (curr_state == 0 && meta_time == clk_hold_time*1) { 
  } else if (approach_flag == 1 && meta_time >= clk_hold_time*1.7) { 
    approach_flag = 0;
    console.log("APPROACH EXIT : ", global_time);
    gtemp = 1;
    // curr_state = skewed_val;
  }


  graph.pop();
  if (curr_state > 0) {
    graph.unshift(voffset*-1);
  } else if (curr_state < 0) {
    graph.unshift(voffset);
  } else if (curr_state == 0) {
    // graph.unshift(skewer()*voffset+overshoot);
    graph.unshift(skewed_val*voffset);
  }

  // destructured return (destructuring assignments)
  return [graph,        curr_state,   prev_state, hold_val,    prev_clk_in, 
          prev_data_in, postime,      datatime,   sample_flag, delay, 
          skewed_val,   approach_flag];
}



function approach_value(start_val, input, time, delta, metastable_length, flag, prev_val) {
  let curr_val = 0;


  if (input >= 0 && input <= delta) {
    console.log("ENTRY");
    curr_val = start_val;
  } else if (input > metastable_length - (metastable_length - delta) && input < metastable_length) {
    curr_val = noise(time) - 0.5;
    console.log("MID");
  } else if (input > metastable_length && flag == 1) {
    curr_val = -1;
    console.log("ENDING : ", global_time);
  }
  // if (input > metastable_length && flag == 1) {
  //   console.log("PREV VAL : ", prev_val);
  //   curr_val = -1;
  //   // if (prev_val > 0) {
  //   //   curr_val = -1;
  //   // } else if (prev_val < 0) {
  //   //   curr_val = 1;
  //   // }
  //   // curr_val = random([-1 , 1]);
  //   flag = 0;
  //   console.log("STABILIZED INTO : ", curr_val);
  //   console.log("CLK STATE : ", clk_state);
  // }
  return [curr_val];
}
