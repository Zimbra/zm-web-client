// Text elements should not gain keyboard focus
skin.classListener("DwtText",function(){
	DwtText.prototype._noFocus = true;
});
