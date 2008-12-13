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




