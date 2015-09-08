# EventAssist

This is a set of classes aimed at streamlining web game eventing.  Currently
the only class written is KeyAssist.


### KeyAssist:
KeyAssist is a class that helps to manage key events for web gaming.

##### API:
- new KeyAssist(initial, options)  
  Creates the KeyAssist object.  It will start listening immeadiately.

- listen()  
  Hooks KeyAssist into the document's controls.

- halt()  
  Stops KeyAssist from listening to key events.

- add(additions)  
  Add more keying events.

- remove(labels)  
  Remove keying events.

- press(label, duration)  
  Simulates a key press.

- activate(labels)  
  Activates keys by label.

- deactivate(labels)  
  Deactivates keys by label.

- enable(labels) -- alias to activate
- disable(labels) -- alias to deactivate

- config(new_config)  
  Changes the configuration.

- set(label or code, handler, function)  
  Sets a new executed function for a particular handler for a particular label or code.

- up(event)  
  This is what handles up events.  This should not be called directly.

- down(event)  
  This is what handles down events.  This should not be called directly.