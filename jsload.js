/**
 * JSLoad
 * Copyright (C) 2007 Eric Nguyen
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * Contact information:
 *   Eric Nguyen <ericn at instructables dot com>
 *
 * @version  0.4
 * @url      http://www.instructables.com
 */

function JSLoad(tags, path, version) {
  // convert the tags array into a hash and keep a separate tagOrder array.
  if (!tags) return;
  var objectHash = {};
  var ordering = [];
  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i];
    objectHash[tag.name] = tag;
    ordering.push(tag.name);
  }
  this.tags = objectHash;
  this.tagOrder = ordering;

  // set flags and one-time data
  this.path = path ? path : "";
  this.version = version;
  this.setsLoaded = {}; // for Safari when using scripts.jsp

  // Initialize "Private" attributes
  this.tagsLoaded = {};
  this.sourceFileSetQueue = [];
  this.sourceFilesLoaded = {};
  this.ALLJS = true; // a constant
}

JSLoad.prototype.load = function(tagNames, callback, path, version) {
  if (!tagNames) return; // tagNames required
  if (!path) var path = this.path;
  if (!version) var version = this.version;  

  // Keep track of all the source files that we are about to load
  // This allows us to skip repeat calls to load a file, if it is pending.
  var srcToLoad = this.getSrcToLoad(tagNames, path);
  this.sourceFileSetQueue.push({
    srcToLoad: srcToLoad,
    callback: callback,
    version: version
  })

  // Finally, load all the source files. Only run loadScript if it's
  // not running.
  if (!this.sourceFileSetQueue.isRunning)
    this.loadScript(this.sourceFileSetQueue[0]);
}

JSLoad.prototype.getSrcToLoad = function(tagNames, path) {
  if (!path) var path = this.path;

  // for closures in markDependentTags()
  var tags = this.tags;
  var dependentTags = {};
  
  // private function, to be called recursively
  function markDependentTags(tagName) {
    var tag = tags[tagName];
    if (!tag) return;    
    dependentTags[tagName] = true;      
    if (!tag.requires) return;
    for (var i = 0; i < tag.requires.length; i++) {
      var requiredTagName = tag.requires[i];
      // only load if not already loaded
      if (!dependentTags[requiredTagName]) { 
        markDependentTags(requiredTagName);
      }
    }
  }

  // create the full set of dependent tags
  for (var i = 0; i < tagNames.length; i++) {
    markDependentTags(tagNames[i]);
  }

  // Using the tag order, figure out what source files to load.
  // Don't load a source file if any of the following is true:
  //  - the tag is not linked to a source file ("tagOnly")
  //  - the tag isn't marked for loading
  //  - the tag has an isLoaded test and that test returns true
  //  - the tag's source file has already been loaded
  //  - the tag's source file is in the queue for loading
  var srcToLoad = [];
  for (var i = 0; i < this.tagOrder.length; i++) {
    var tagName = this.tagOrder[i];
    var tag = this.tags[tagName];


    if (tag.tagOnly ||
        !dependentTags[tagName] ||
        (tag.isLoaded && tag.isLoaded())) continue; 
    var filePath = (path ? path : "") + tagName + '.js';
    if (this.sourceFilesLoaded[filePath] || this.isQueued(filePath)) continue;

    srcToLoad.push(filePath);
  }

  return srcToLoad;
}

JSLoad.prototype.loadScript = function(srcSetObj, iteration) {
  if (!iteration) iteration = 0;
  var url = srcSetObj.srcToLoad[iteration];

  // last iteration
  if (!url) {
    if (srcSetObj.callback) srcSetObj.callback();
    this.sourceFileSetQueue.shift();
    if (this.sourceFileSetQueue.length > 0) {
      this.loadScript(this.sourceFileSetQueue[0]);
    }
    return;
  }

	var script = document.createElement("script");
	var thisObj = this;
	var thisFn = arguments.callee;
	script.type = "text/javascript";
	script.onload = script.onreadystatechange = function() {
		if (script.readyState && script.readyState != "loaded" && 
		    script.readyState != "complete")
			return;
		script.onreadystatechange = script.onload = null;

    // next iteration
    thisFn.call(thisObj, srcSetObj, iteration+1);
	};
	script.src = url + (srcSetObj.version ? "?" + srcSetObj.version : "");

	// Mark the script loaded and load it.
	this.sourceFilesLoaded[url] = true;		
	document.getElementsByTagName("head")[0].appendChild(script);
}  

JSLoad.prototype.isQueued = function(url) {
  for (var i = 0; i < this.sourceFileSetQueue.length; i++) {
    var set = this.sourceFileSetQueue[i];
    for (var j = 0; j < set.srcToLoad.length; j++) {
      if (url == set.srcToLoad[j]) return true;
    }
  }
  return false;
}
