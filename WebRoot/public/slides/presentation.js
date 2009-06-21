var currentSlide = null;
var prevSlide = null;
var nextSlide = null;
var firstSlide = null;
var parentView = null;

function addSlideEvent (el, evname, func) {
    if (el.attachEvent) {
        el.attachEvent("on" + evname, func);
    } else {
        el.addEventListener(evname, func, true);
    }
};

function initSlides() {
    if(!document.body) { return; }
    currentSlide = document.body.firstChild;

    while(currentSlide && currentSlide.className != "slide") {
        currentSlide = currentSlide.nextSibling;
    }

    if(!firstSlide) {
        firstSlide = currentSlide;
    }

    //todo: change this
    document.body.style.fontSize = "32px";

    //change slide on click
    addSlideEvent(document, "click", slidesHandler);

    if(!currentSlide) { return; }

    var n = currentSlide;

    //resize all the slides and master slides
    while(n) {
        if(n.className == "slide" || n.className == "slidemaster") {
            resizeSlide(n);
        }
        n = n.nextSibling;
    }

    resizeSlide(currentSlide);
}

function resizeSlide(currentSlide) {

    //no need for resize in embed mode
    if(window.presentationMode == "embed") {
        return;
    }

    var size = getSlideWindowSize();
    var ht = size.y;
    var wd = size.x;
    var newWidth = (ht/wd)*(4/3)*100;
    //resize slide in 4:3 aspect ratio
    if(currentSlide) {
        currentSlide.style.width =  newWidth + "%";
        currentSlide.style.height = '100%';
        currentSlide.style.left = (100-newWidth)/2 + "%";
    }
}

function slidesHandler(ev) {
    var target = getTarget(ev);
    if(isTargetValid(target)) {
        goNextSlide();
    }
}

function isTargetValid(target) {
    return (target.className != "slideShowNavToolbar") && (target.className != "navBtns") && (target.className != "navImg"); 
}

function goNextSlide() {

    if(currentSlide == null) currentSlide = firstSlide;

    if(currentSlide && currentSlide.className == "endslide") {
        if(firstSlide && window.presentationMode == "embed") {
            prevSlide = currentSlide;
            firstSlide = getNextSlide(firstSlide, true);
            currentSlide = firstSlide;
            prevSlide.style.display = "none";
            currentSlide.style.display = "block";
        }else {
            window.close();
        }
    }

    if(currentSlide) {
        prevSlide = currentSlide;
        currentSlide = getNextSlide(currentSlide.nextSibling, true);

        if(currentSlide && ( currentSlide.className == 'slide' || currentSlide. className == "endslide")) {
            prevSlide.style.display = "none";
            resizeSlide(currentSlide);
            currentSlide.style.display = "block";
        }

    }
}

function goPrevSlide() {

    if(currentSlide) {
        nextSlide = currentSlide;
        currentSlide = getPreviousSlide(currentSlide.previousSibling, true);

        if(currentSlide && ( currentSlide.className == 'slide' || currentSlide. className == "endslide")) {
            nextSlide.style.display = "none";
            resizeSlide(currentSlide);
            currentSlide.style.display = "block";
        }

    }
}

function getNextSlide(currentSlide, includeEndSlide) {

    while(currentSlide && (currentSlide.className != "slide" && (currentSlide.className != "endslide")) ) {
        currentSlide = currentSlide.nextSibling;
    }

    return currentSlide;
}

function getPreviousSlide(currentSlide) {

    while(currentSlide && (currentSlide.className != "slide") ) {
        currentSlide = currentSlide.previousSibling;
    }

    return currentSlide;
}

function getEvent(ev) {
    return ev || window.event;
}

function getTarget(ev, useRelatedTarget)  {
	ev = getEvent(ev);

    if (!ev) { return null; }

	if (!useRelatedTarget) {
		if (ev.target) {
			// if text node (like on Safari) return parent
			return (ev.target.nodeType == 3) ? ev.target.parentNode : ev.target;
		} else if (ev.srcElement) {		// IE
			return ev.srcElement;
		}
	} else {
		if (ev.relatedTarget) {
			return ev.relatedTarget;
		} else if (ev.toElement) {		// IE
			return ev.toElement;
		} else if (ev.fromElement) {	// IE
			return ev.fromElement;
		}
	}
	return null;
}

function getSlideWindowSize () {
    if( typeof( window.innerWidth ) == 'number' ) {
        return {x: window.innerWidth, y: window.innerHeight};
    } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
        return {x: document.documentElement.clientWidth, y: document.documentElement.clientHeight};
    } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
        return {x: document.body.clientWidth, y: document.body.clientHeight };
    }
    return {};
}


window.onloadListeners=new Array();

window.addOnLoadListener = function (listener) {
    window.onloadListeners[window.onloadListeners.length]=listener;
}




window.onload=function(){
    for(var i=0;i<window.onloadListeners.length;i++){
        func = window.onloadListeners[i];
        func.call();
    }
}

window.addOnLoadListener(initSlides);


