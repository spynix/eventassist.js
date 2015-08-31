/*    File: eventassist.js
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
 *       down: function() {},
 *       up: function() {}
 *     }, {
 *       label: "down",
 *       code: 40,
 *       down: function() {},
 *       up: function() {}
 *     }
 *   ];
 * 
 * Currently the only config options is the debug setting, for console logging
 * keystrokes.  The example:
 * 
 *   config = {
 *     debug: true
 *   };
 */


function EventAssist(initial, options) {
  var i, l;
  
  this.config = options;
  this.debug = (this.config.debug ? true : false);
  this.events = [];
  this.pressing = [];
  
  for (i = 0, l = initial.length; i < l; i++)
    this.events.push(initial[i]);
  
  document.addEventListener("keydown", this.down, true);
  document.addEventListener("keyup", this.up, true);  
}


EventAssist.prototype.up = function(event) {
  var i, l, index;
  
  for (i = 0, l = this.events.length; i < l; i++) {
    if (this.events[i].code == event.which) {
      if (this.debug)
        console.log("EventAssist->up(" + this.events[i].label + ")");
      
      if ((index = this.pressing.indexOf(event.which)) == -1) { /* event wasn't already in a pressing state */
        if (this.debug)
          console.log("  Warning: attempt to remove non-existant pressing state (label: " + this.events[i].label + "code: " + event.which.toString() + ")");
        
        /* do nothing */
      } else {
        event.preventDefault();
        this.pressing.splice(index, 1);
        this.events[i].up();
      }
    }
  }
};


EventAssist.prototype.down = function(event) {
  var i, l;
  
  for (i = 0, l = this.events.length; i < l; i++) {
    if (this.events[i].code == event.which) {
      if (this.debug)
        console.log("EventAssist->down(" + this.events[i].label + ")");
      
      if (this.pressing.indexOf(event.which) != -1) { /* event was already in a pressing state */
        if (this.debug)
          console.log("  Warning: attempt to reassign pressing state (label: " + this.events[i].label + "code: " + event.which.toString() + ")");
        
        /* do nothing */
      } else {
        event.preventDefault();
        this.pressing.push(event.which);
        this.events[i].down();
      }
    }
  }
};


/* add():
 *   adds a single or multiple keying events
 *   
 *   additions are added against the key code
 */
EventAssist.prototype.add = function(additions) {
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
EventAssist.prototype.remove = function(labels) {
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
 *   manually trigger a key press via label
 */
EventAssist.prototype.press = function(label, duration) {
  var i, l;
  
  for (i = 0, l = this.events.length; i < l; i++)
    if (this.events[i].label == label)
      break;
  
  if (this.debug)
    console.log("EventAssist->press(): simulated down (label: " + this.events[i].label + ")");
  
  this.events[i].down();
  
  setTimeout(function(debug, label, f) {
    if (debug)
      console.log("EventAssist->press(): simulated up (label: " + label + ")");
    
    f();
  }(this.debug, this.events[i].label, this.events[i].up), ((duration && !isNaN(duration)) ? duration : 0));
};


/* config():
 *   update the configuration
 *   
 *   currently only for the debug option
 */
EventAssist.prototype.config = function(new_config) {
  this.config = new_config;
  
  this.debug = (this.config.debug ? true : false);
};