var executeAfterLoad = window.location.search === "?eal";

var eventLog = [];
function logEvent(e) {
  eventLog[eventLog.length] = e;
}

// loader with executeAfterLoad
var jsLoader = new JSLoad( [{ name : "A"}], "./", "foo", executeAfterLoad); 

// jsLoad actions
jsLoader.load(["A"], function() {
  logEvent("callback executed");
});

// window.onload should be the last thing to fire no matter what
window.onload = function() {
  logEvent("window loaded");
  if (eventLog[0] === "callback executed" &&
      eventLog[1] === "end of document" &&
      eventLog[2] === "window loaded") {
    window.parent.iFrameTestResult(window.name, "immediate execution");
  } else if (eventLog[0] === "end of document" &&
             eventLog[1] === "callback executed" &&
             eventLog[2] === "window loaded") {
    window.parent.iFrameTestResult(window.name, "execution after load");
  } else {
    window.parent.iFrameTestResult(window.name, "unrecognized ordering");
  }
};
