/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

DwtAnimate = function() {
	this._framesPerSecond = 22;
	this._duration = 1000;
	this._interval = 1000/this._framesPerSecond;	
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




