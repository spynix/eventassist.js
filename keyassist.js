/*    File: keyassist.js
 *  Author: Jin Savage ("spynix")
 *  
 *  
 * Notes:
 * ----------------------------------------------------------------------------
 * 
 * In general I abhor camel case, but I accept their usage when used in class
 * names, since it visually differentiates them from other functions.
 *  
 * 
 * License - 2-clause ("simplified") BSD
 * ----------------------------------------------------------------------------
 * 
 * Copyright (c) 2015, Jin Savage ("spynix")
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * 
 * Structure
 * ----------------------------------------------------------------------------
 * 
 * initial is an array of key event objects.  Here's an example:
 * 
 *   initial = [
 *     {
 *       label: "up",
 *       code: 38,
 *       active: true,
 *       interval: 100,
 *       down: function() {},
 *       during: null,
 *       up: function() {}
 *     }, {
 *       label: "down",
 *       code: 40,
 *       active: false,
 *       interval: 500,
 *       down: function() {},
 *       during: function() {},
 *       up: function() {}
 *     }
 *   ];
 * 
 * Config options:
 * 
 *   config = {
 *     debug: <boolean>,       - debug enables a bunch of console messages
 *     interval: <number>      - interval sets the default polling speed for
 *                               while pressed handlers.  this can be overridden
 *                               in each entry to designate different polling
 *                               speeds for different keys
 *   };
 */


function KeyAssist(initial, options) {
  var i, l;
  
  this.config = options;
  
  this.debug = (this.config.debug ? true : false);
  this.interval = (this.config.interval ? this.config.interval : 200);
  
  this.events = [];      /* collection of keys and their associated up, during, and down handlers */
  this.pressing = [];    /* keys currently being pressed */
  this.pressors = [];    /* keys that have been pressed and are currently running during handlers */
  this.simulating = [];  /* a key that has been triggered not through direct user interaction */
  
  for (i = 0, l = initial.length; i < l; i++)
    this.events.push(initial[i]);
  
  document.addEventListener("keydown", this.down.bind(this), true);
  document.addEventListener("keyup", this.up.bind(this), true);
}


/* listen():
 *   starts the assister listening for keys
 */
KeyAssist.prototype.listen = function() {
  document.addEventListener("keydown", this.down.bind(this), true);
  document.addEventListener("keyup", this.up.bind(this), true);
};


/* halt():
 *   stops the assister listening for keys
 */
KeyAssist.prototype.halt = function() {
  document.removeEventListener("keydown", this.down.bind(this), true);
  document.removeEventListener("keyup", this.up.bind(this), true);
};


/* down():
 *   this takes care of when a key is pressed
 */
KeyAssist.prototype.down = function(event) {
  var i, l, temp;
  
  for (i = 0, l = this.events.length; i < l; i++) {
    if (this.events[i].code == event.which) {
      if (this.debug)
        console.log("KeyAssist->down(" + this.events[i].label + ")");
      
      event.preventDefault();
      
      if (this.simulating.indexOf(event.which) != -1) /* if its currently being simulated */
        return 1;
      
      if (this.pressing.indexOf(event.which) != -1) { /* event was already in a pressing state */
        if (this.debug)
          console.log("  Warning: attempt to reassign pressing state (label: " + this.events[i].label + ", code: " + event.which.toString() + ")");
        
        /* do nothing */
      } else {
        if (this.events[i].active) {
          this.pressing.push(event.which);
          this.events[i].down();
          
          if (typeof this.events[i].during == "function") {
            temp = setInterval(this.events[i].during, (this.events[i].interval ? this.events[i].interval : this.interval));
            this.pressors.push({
              code: this.events[i].code,
              poller: temp
            });
          } 
        }
      }
    }
  }
  
  return 0;
};


/* up():
 *   this handles everything when a key is released
 */
KeyAssist.prototype.up = function(event) {
  var i, j, k, l, index, pressor;
  
  for (i = 0, j = this.events.length; i < j; i++) {
    if (this.events[i].code == event.which) {
      if (this.debug)
        console.log("KeyAssist->up(" + this.events[i].label + ")");
      
      event.preventDefault();
      
      if (this.simulating.indexOf(event.which) != -1) /* if its currently being simulated */
        return 1;
      
      if ((index = this.pressing.indexOf(event.which)) == -1) { /* event wasn't already in a pressing state */
        if (this.debug)
          console.log("  Warning: attempt to remove non-existant pressing state (label: " + this.events[i].label + ", code: " + event.which.toString() + ")");
        
        /* do nothing */
      } else {
        if (this.events[i].active) {
          this.pressing.splice(index, 1);
          
          for (k = 0, l = this.pressors.length; k < l; k++)
            if (this.pressors[k].code == event.which) {
              clearInterval(this.pressors[k].poller);
              this.pressors.splice(k, 1);
              break;
            }
          
          this.events[i].up();
        }
      }
    }
  }
  
  return 0;
};


/* add():
 *   adds a single or multiple keying events
 *   
 *   additions are added against the key code
 */
KeyAssist.prototype.add = function(additions) {
  var i, j, k, l;
  
  for (i = 0, j = additions.length; i < j; i++) {
    for (k = 0, l = this.events.length; k < l; i++) {
      if (this.events[k].code == additions[i].code)
        return -1;
    }
    
    this.events.push(additions[i]);
  }
};


/* remove():
 *   removes all events with the corresponding label
 */
KeyAssist.prototype.remove = function(labels) {
  var i, j, k, l;
  
  for (i = 0, j = labels.length; i < j; i++) {
    for (k = this.events.length - 1, l = 0; k >= l; k--) {
      if (this.events[k].label == labels[i]) {
        this.events.splice(k, 1);
        break;
      }
    }
  }
};


/* press():
 *   manually trigger a simulated key press via label
 */
KeyAssist.prototype.press = function(label, duration) {
  var i, l;
  
  for (i = 0, l = this.events.length; i < l; i++)
    if (this.events[i].label == label)
      break;
  
  this.simulating.push(this.events[i].code);
  
  if (this.debug)
    console.log("KeyAssist->press(): simulated down (label: " + this.events[i].label + ", code: " + this.events[i].code + ")");
  
  this.events[i].down();
  
  setTimeout((function(debug, label, code, f, p) {
    return function() {
      var index;
      
      if (debug)
        console.log("KeyAssist->press(): simulated up (label: " + label + ", code: " + code + ")");
      
      /* execute the up function for the simulated key */
      f();
      
      /* remove the simulating state for that key so it can be pressed regularly again */
      if ((index = p.simulating.indexOf(code)) != -1)
        p.simulating.splice(index, 1);
    };
  })(this.debug, this.events[i].label, this.events[i].code, this.events[i].up, this), ((duration && !isNaN(duration)) ? duration : 0));
};


/* activate():
 *   activate one or multiple keys via an array of labels
 */
KeyAssist.prototype.activate = function(labels) {
  var i, j, k, l;
  
  if (typeof labels == "object") {
    for (i = 0, j = labels.length; i < j; i++) {
      for (k = 0, l = this.events.length; k < l; k++) {
        if (this.events[k].label == labels[i]) {
          this.events[k].active = true;
          break;
        }
      }
    }
  } else {
    for (k = 0, l = this.events.length; k < l; k++) {
      if (this.events[k].label == labels) {
        this.events[k].active = true;
        break;
      }
    }
  }
};


/* deactivate():
 *   deactivate one or multiple keys via an array of labels
 */
KeyAssist.prototype.deactivate = function(labels) {
  var i, j, k, l;
  
  if (typeof labels == "object") {
    for (i = 0, j = labels.length; i < j; i++) {
      for (k = 0, l = this.events.length; k < l; k++) {
        if (this.events[k].label == labels[i]) {
          this.events[k].active = false;
          break;
        }
      }
    }
  } else {
    for (k = 0, l = this.events.length; k < l; k++) {
      if (this.events[k].label == labels) {
        this.events[k].active = false;
        break;
      }
    }
  }
};


/* enable():
 *   alias for activate()
 */
KeyAssist.prototype.enable = KeyAssist.prototype.activate;


/* disable():
 *   alias for deactivate()
 */
KeyAssist.prototype.disable = KeyAssist.prototype.deactivate;


/* config():
 *   update the configuration
 *   
 *   currently only for the debug option
 */
KeyAssist.prototype.config = function(new_config) {
  this.config = new_config;
  
  this.debug = (this.config.debug ? true : false);
  this.interval = (this.config.interval ? this.config.interval : 200);
};


/* set():
 *   allows you to set the event handlers for a key without recreating the entry
 *   
 *   loc = label or code
 *   handler = up, down, during (type <string>)
 *   f = new function to assign to <loc> specified <handler>
 */
KeyAssist.prototype.set = function(loc, handler, f) {
  var i, j;
  var found = false;
  
  for (i = 0, j = this.events.length; i < j; i++)
    if (typeof loc == "string") {
      if (this.events[i].label == loc) {
        found = true;
        break;
      }
    } else if (typeof loc == "number") {
      if (this.events[i].code == loc) {
        found = true;
        break;
      }
    } else {
      /* shouldn't get here with valid input */
    }
    
  if (!found)
    return -1;
    
  if ((this.events[i])[handler] && (typeof f == "function"))
    (this.events[i])[handler] = f;
};