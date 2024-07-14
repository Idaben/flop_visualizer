const TIME_STEP = 2;
const GRAPH_SIZE = 500; 
const VOFFSET = 25;
const META_VOFFSET = 10;
const OVERSHOOT = 7;

err_inj = 0;

// CLOCK 1
let clk1;
let clk1_graph = [];

// CLOCK 2
let clk2;
let clk2_graph = [];

// OSCILLATOR (acts as data input)
let osc;
let osc_graph = [];

// FLOP 1
let flop1;
let flop1_graph = [];

// FLOP 2
let flop2;
let flop2_graph = [];

// FLOP 3
let flop3;
let flop3_graph = [];


function setup() {
  clk1  = new Clock(170, -1, 0);
  clk2  = new Clock(50, -1, 0);
  osc   = new Clock(250, -1, 0);
  flop1 = new Flop(1, 1);
  flop2 = new Flop(10, 15);
  flop3 = new Flop(10, 15);

  // assign initial values of all graphs to be zero
  for (let i = 0; i <= GRAPH_SIZE; i++) {
    clk1_graph[i] = 0;
    osc_graph[i] = 0;
    flop1_graph[i] = 0;
    clk2_graph[i] = 0;
    flop2_graph[i] = 0;
    flop3_graph[i] = 0;
  }

  // put setup code here
  createCanvas(1850, 900);
  background(200);
  

  frameRate(60);
}

function draw() {
  clear();
  background(200);
  scale(1.5, 1.5, 1); // TEMP CODE FOR MAKING THINGS LARGER
  // scale(2, 2, 1); // TEMP CODE FOR MAKING THINGS LARGER

  // CLOCK 1
  clk1.instantiate();
  clk1.update(clk1_graph);
  clk1_graph = clk1.graph;
  translate(200, 100);
  clk1.draw();

  // OSCILLATOR (ACTS AS DATA)
  osc.fake_clk = err_inj;
  osc.instantiate();
  osc.update(osc_graph);
  osc_graph = osc.graph;
  translate(0, 80);
  osc.draw();


  // FLOP 1
  flop1.instantiate(clk1_graph[0], osc_graph[0], 0);
  flop1.update(flop1_graph);
  flop1_graph = flop1.graph;
  translate(0, 80);
  flop1.draw();
  
  
  // CLOCK 2
  clk2.instantiate();
  clk2.update(clk2_graph);
  clk2_graph = clk2.graph;
  translate(0, 100);
  clk2.draw();

  // FLOP 2
  flop2.instantiate(clk2_graph[0], flop1_graph[0], 1);
  flop2.update(flop2_graph);
  flop2.debug();
  flop2_graph = flop2.graph;
  translate(0, 80);
  flop2.draw();

  // FLOP 3
  flop3.instantiate(clk2_graph[0], flop2_graph[0], 0);
  flop3.update(flop3_graph);
  flop3_graph = flop3.graph;
  translate(0, 80);
  flop3.draw();

}



class Clock {
  constructor(hold_time, skew_time, fake_clk) {
    // parameters
    this.hold_time = hold_time;
    this.skew_time = skew_time;
    this.fake_clk = fake_clk;

    
    // internal variables
    let time, ttime, curr_state, prev_state, real_clk;
    let graph = [];

    this.time  = 0;
    this.ttime = null;
    this.curr_state = 1; 
    this.prev_state = null; 
    this.real_clk = null;
  }

  instantiate() {

    // SO WE CAN REUSE CLOCK AS LIKE CONTROLLABLE OSCILlATORS
    if (this.fake_clk == 1) {
      if (this.real_clk == null) { 
        this.real_clk = this.hold_time;
        this.hold_time = this.hold_time/20;
      }
    } else {
      if (this.real_clk != null) { this.hold_time = this.real_clk; }
      this.real_clk = null;
    }

    if (this.time > 0 && this.time < this.hold_time) {
      // console.log("TIME : ", time, "TTIME : ", ttime, "STATE : ", curr_state);
    } else {
      if (this.ttime == null) {
        this.ttime = this.time;
        this.prev_state = this.curr_state;
        // console.log("GET TTIME : ", this.time);
      }
      if (this.time - this.ttime >= this.skew_time) {
        this.curr_state = this.prev_state*-1
        this.time = 0;
        this.ttime = null;
        // console.log("SKEW");
      } else {
        this.curr_state = 0;
        // console.log("RELEASE : ", this.time);
      }
    }
    // increment internal timer
    this.time += TIME_STEP;
  }

  update(graph) {
    // get value of graphs
    this.graph = graph;
    
    // update graph
    this.graph.pop();
    if (this.curr_state > 0) {
      this.graph.unshift(VOFFSET*-1);
    } else if (this.curr_state < 0) {
      this.graph.unshift(VOFFSET);
    } else if (this.curr_state == 0) {
      this.graph.unshift(VOFFSET*0);
      // this.graph.unshift(skewer()*voffset+overshoot);
      // this.graph.unshift(skewer()*voffset+overshoot);
    }
  }

  draw() {
    strokeWeight(1);
    stroke("black");
    noFill();
    beginShape();
    for (let i = 0; i <= this.graph.length; i++) {
      vertex(i , this.graph[i]);
    }
    endShape();
  }

  debug() {
    console.log("INTERAL TIME : ", this.time);
    console.log("CURR STATE : ", this.curr_state);
  }
} // END OF CLASS CLOCK



class Flop {
  constructor(setup_time, hold_time) {
    this.setup_time = setup_time;
    this.hold_time = hold_time;

    let time, ttime, curr_state, prev_state;
    this.time = 0;
    this.ttime = 0;
    this.curr_state = 1;
    this.prev_state = null;

    let clk_in, data_in, sample_flag;
    this.clk_in = null;
    this.data_in = null;
    this.sample_flag = 0;
    
    //zero since assume, signal toggles from unknown to some value at time 0
    let data_toggle_time = 0;
    let clk_toggle_time  = 0;
    let data_minus_clk_time = 0;

    let stabilization_time;
    // 2.5 just some number I based, based on the ratio of the input clock's period
    this.stabilization_time =  (this.setup_time + this.hold_time)*3

    // use this for randomizing the time it takes for the flop to de-mestabilized
    this.stabilization_delta = null;

    let smoothie;
    this.smoothie = 0;

    let stab_area = (this.stabilization_time / 4);
    let meta_value = 0;
    let meta_ttime = 0;

    let propagation_delay;
    // i want delays to be proportional to the flop's timing, so most of these values are derived
    this.propagation_delay = this.hold_time - this.setup_time;
    let prop_ttime;
    this.prop_ttime = 1;

    let prop_flag;
    this.prop_flag = 1;


    let prop_hold_val;
    let prop_next_val;
    this.prop_hold_val = 0;
    this.prop_next_val = 0;

    let graph = [];
  }

  instantiate(clk, data, debug) {
    // CAPTURE POSEDGE
    if (this.clk_in != clk && clk < 0) {
      // capture initial value, for modelling propagation delay 
      this.prop_flag = 1;
      this.prop_hold_val = this.curr_state; 
      this.prop_next_val = null;
      
      // we need to this piecewise function since the data inputs are no longer normalized to
      // note the reverse stuff, because of graphing...
      // 1 to -1, when it is sampled from outside the class
      if (data > 0 ) { this.curr_state = -1; };
      if (data == 0 ) { this.curr_state = 0; };
      if (data < 0) { this.curr_state = 1; };
      this.sample_flag = 1;
      this.clk_toggle_time = this.time;
      this.prop_ttime = 0;

      if (debug == 1) {
        console.log("POSTIME : ", this.clk_toggle_time);
      }
    }

    // CHECK FOR SETUP TIME
    if (this.sample_flag == 1 && this.clk_toggle_time - this.data_toggle_time <= this.setup_time) {
      this.curr_state = 0;
      console.log("SETUP TIMING VIOLATION : ", this.clk_toggle_time - this.data_toggle_time);
    }
    
    // CAPTURE DATA EDGES
    // important to do this after the sampling time check
    if (this.data_in != data) {
      this.data_toggle_time = this.time;
      if (debug == 1) {
        console.log("DATTIME : ", this.data_toggle_time);
      }
    }

    // CHECK FOR HOLD TIME
    this.data_minus_clk_time = this.data_toggle_time - this.clk_toggle_time; 
    if (this.data_minus_clk_time <= this.hold_time && this.data_minus_clk_time >= 0 && this.prop_flag == 1) {
      this.curr_state = 0;
      console.log("HOLD TIMING VIOLATION : ", this.data_toggle_time - this.clk_toggle_time);
    }

    if (this.sample_flag == 1) {
      this.ttime += TIME_STEP;
      if (this.ttime >= this.hold_time) {
        this.ttime = 0;
        this.sample_flag = 0;
      }
    }

    // PROPAGATION DELAY
    if (this.prop_ttime <= this.propagation_delay) {
      if (this.prop_next_val == null) { 
        this.prop_next_val = this.curr_state; 
      }
      if (this.prop_hold_val == null) { 
          if (this.graph[0] > 0 )  { this.prop_hold_val = -1; };
          if (this.graph[0] == 0 ) { this.prop_hold_val = 0; };
          if (this.graph[0] < 0)   { this.prop_hold_val = 1; };
      }
      this.curr_state = this.prop_hold_val;
      // console.log("HOLD VALUE : ", this.curr_state);
      // console.log("NEXT VALUE : ", this.prop_next_val);
      this.prop_ttime += TIME_STEP;
    }
    if (this.prop_flag == 1 && this.prop_ttime > this.propagation_delay) {
      this.curr_state = this.prop_next_val;
      // METASTABILITY
      if (this.stabilization_delta == null) { this.stabilization_delta = random((this.stabilization_time/2), this.stabilization_time); }
      if (this.curr_state == 0 && this.meta_ttime <= this.stabilization_delta) {
      // if (this.curr_state == 0 && this.meta_ttime <= (this.stabilization_time + random(0, this.stabilization_delta))) {
        // make animations look nicer (remove jagginess and like "random" feel)
        if (this.smoothie <= 1.2) {
          this.smoothie += 0.3;
        } else {
          this.smoothie = 0;
          this.meta_value = noise(this.time);
        }
        this.meta_ttime += TIME_STEP;
      } else {
        // if (this.meta_ttime >= this.stabilization_time) {
        if (this.meta_ttime >= this.stabilization_delta) {
          console.log("BEFORE RANDOM (meta_value) : ", this.graph[0]);
          if (this.graph[0] > 0) { this.curr_state = -1;}
          if (this.graph[0] < 0) { this.curr_state = 1;}
          // if 0.509 = leaning 
          // if 0.78  = leaning LOW
          // this.curr_state = random([1, -1]);
          this.prop_next_val = null;
          this.prop_hold_val = null;
          this.stabilization_delta = null;
          this.prop_flag = 0;
          console.log("APPEAR ONCE?");
        }
        this.meta_ttime = 0;
      }
    }
    this.clk_in = clk;
    this.data_in = data;



    this.sample_flag = 0;

    // increment internal timer
    this.time += TIME_STEP;
  }

  update(graph) {
    // get value of graphs
    this.graph = graph;

    if (this.curr_state == null) {this.curr_state = 0;}
    console.log("STATE GRAPH: ", this.curr_state);
    
    // update graph
    this.graph.pop();
    if (this.curr_state > 0) {
      this.graph.unshift(VOFFSET*-1);
    } else if (this.curr_state < 0) {
      this.graph.unshift(VOFFSET);
    } else if (this.curr_state == 0) {
      // -1 is for normalizing the waveform to be somewhere in the middle
      this.graph.unshift((META_VOFFSET)*(this.meta_value + random() - 1));
    }
  }

  draw() {
    strokeWeight(1);
    stroke("black");
    noFill();
    beginShape();
    for (let i = 0; i <= this.graph.length; i++) {
      vertex(i , this.graph[i]);
    }
    endShape();
  }

  debug() {
    // console.log("SETUP TIMING VIOLATION : ", this.clk_toggle_time - this.data_toggle_time);
    // console.log("HOLD TIMING VIOLATION : ", this.data_toggle_time - this.clk_toggle_time);
  }

} // END OF CLASS FLOP



// SIGNAL GENERATOR


