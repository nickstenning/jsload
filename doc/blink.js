var Blinker = Base.extend({
  
  constructor : function( init ) {
    var init = Object.extend({
      "duration" : 100,
      "color" : "#00aa00",
      "iterations" : 5
    }, init || {} );
    
    this.init = init;
    this.element = $(init.element);
    this.originalColor = this.element.getStyle("background-color");
    this.itRemaining = init.iterations;
  },
  
  blink : function() {
    this.element.setStyle( {"background-color":this.init.color} );
    var thisObj = this; // for closures
    setTimeout( function() {
      thisObj.element.setStyle( {"background-color":thisObj.originalColor} );
      if (thisObj.itRemaining) {
        setTimeout( function() {
          thisObj.blink();
        }, thisObj.init.duration);
        thisObj.itRemaining--;
      } else {
        thisObj.element.innerHTML = "Done flashing."
      }
    }, this.init.duration);
  }
  
});

var RedBlinker = Blinker.extend({
  constructor : function(init) {
    // the "super()" method
    this.base(init);
    this.init.color = "#f00";
  }
});

var BlueBlinker = Blinker.extend({
  constructor : function(init) {
    // the "super()" method
    this.base(init);
    this.init.color = "#00f";
  }
});