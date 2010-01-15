/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

DwtAnimate = function() {
	this._framesPerSecond = 22;
	this._duration = 1000;
	this._interval = this._duration/this._framesPerSecond;	
};

DwtAnimate.prototype.setFramesPerSecond =
function(framesPerSecond) {
	this._framesPerSecond = framesPerSecond;
}; 

DwtAnimate.prototype.setDuration =
function(duration) {
	this._duration = duration;
//	this._noOfFrames  = Math.ceil(this._duration/this._interval);
}; 

DwtAnimate.prototype.calculateInterval =
function() {
this._interval = Math.ceil(1000/this._framesPerSecond);
this._noOfFrames  = Math.ceil(this._duration/this._interval);
};

DwtAnimate.prototype.animate = 
function(obj, elm, begin, end){ 

  begin     = parseFloat(begin);
  end       = parseFloat(end);

  var diff      = end-begin;
  this.calculateInterval();

  var referenceObj = this;
    
  for(i=1;i <= this._noOfFrames; i++) {
    (function() {
        var frame=i;
        function changeProperty() {
			DBG.println('frame:' + frame);
            var increase= (diff*frame/referenceObj._noOfFrames)*(frame/referenceObj._noOfFrames)+begin;			
            var unit=(elm=='opacity') ? '' : 'px';
            if(window.attachEvent && !unit) { 
                increase*=100; 
                obj.style.zoom = 1;
                obj.style.filter = "alpha(opacity=" + increase + ")";
            } else {
                obj.style[elm]  = increase+unit; 
				DBG.println("elm:" + elm + ",increase+unit:" + (increase+unit) + ", style:" +   obj.style[elm]);
            }
       }
       timer = setTimeout(changeProperty,referenceObj._interval*frame);
    })();
  }

}

DwtAnimate.prototype.animateExpansion = 
function(obj, beginParams, endParams, callback){

  this._callback = callback;
    
  var x1      = parseFloat(beginParams.x);
  var y1      = parseFloat(beginParams.y);
  var width1  = parseFloat(beginParams.width);
  var height1 = parseFloat(beginParams.height);

  var x2      = parseFloat(endParams.x);
  var y2      = parseFloat(endParams.y);
  var width2  = parseFloat(endParams.width);
  var height2 = parseFloat(endParams.height);

  this.calculateInterval();

  var referenceObj = this;


  var diff  =  {left: (x2-x1), top: (y2-y1), width: (width2-width1), height: (height2-height1)};
  var begin =  {left: x1, top: y1, width: width1, height: height1};
  var styleProps = ["left", "top", "width", "height"];

  AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._animateExpansion, [obj, diff, begin, styleProps, 1]), this._interval);
};

DwtAnimate.prototype._animateExpansion =
function(obj, diff, begin, styleProps, frame){
    if(frame > this._noOfFrames) {
        if(this._callback) {
            this._callback.run();
        }        
        obj.parentNode.removeChild(obj);
        return;
    }

    var unit = 'px';
    var noOfFrames = this._noOfFrames;
    for(var j in styleProps) {
        var elm = styleProps[j];
        var increase= (diff[elm]*frame/noOfFrames)*(frame/noOfFrames)+begin[elm];
        obj.style[elm]  = increase+unit;
        //DBG.println("elm:" + elm + ",increase+unit:" + (increase+unit) + ", style:" +   obj.style[elm]);
    }

    AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._animateExpansion, [obj, diff, begin, styleProps, frame+1]), this._interval);
};


