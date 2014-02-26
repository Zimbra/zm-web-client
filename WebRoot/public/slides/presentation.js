/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */
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

function initSlides(container) {
    if(!document.body) { return; }
    container = container || document.body;
    currentSlide = container.firstChild;

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
            if(n.className == "slidemaster") {
                var theme = n.getAttribute("theme");
                if(window.presentationMode == "embed" &&  theme) {
                    loadThemeCSS(theme);
                }
                show(n);
            }
        }
        n = n.nextSibling;
    }

    resizeSlide(currentSlide);
    show(currentSlide);

    var splashscreen = document.getElementById("splashscreen");
    if(splashscreen) {
        splashscreen.parentNode.removeChild(splashscreen);
    }
}

function resizeSlide(currentSlide) {

    //no need for resize in embed mode
    if(window.presentationMode == "embed") {
        resizeFont(currentSlide);
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
        currentSlide.style.position = 'absolute';
        resizeFont(currentSlide);
    }
}

function resizeFont(slide) {

    if(!slide || slide.className != "slide") return;

    var size = getSlideWindowSize();
    var newFontSize = (size.x < 1600) ? size.x*32/1600 : 32;
    slide.style.fontSize = newFontSize + 'px'; 
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
            hide(prevSlide);
            show(currentSlide);
            return;
        }else {
            window.close();
        }
    }

    if(currentSlide) {
        prevSlide = currentSlide;
        currentSlide = getNextSlide(currentSlide.nextSibling, true);

        if(currentSlide && ( currentSlide.className == 'slide' || currentSlide. className == "endslide")) {
            hide(prevSlide);
            resizeSlide(currentSlide);
            show(currentSlide);
        }

    }
}

function goPrevSlide() {

    if(currentSlide) {
        nextSlide = currentSlide;
        currentSlide = getPreviousSlide(currentSlide.previousSibling, true);

        if(currentSlide && ( currentSlide.className == 'slide' || currentSlide. className == "endslide")) {
            hide(nextSlide);
            resizeSlide(currentSlide);
            show(currentSlide);
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

function hide(el) {
    if(el) {
        el.style.display = 'none';
    }
}

function show(el, clearDisplayStyle) {
    if(el) {
        el.style.display = clearDisplayStyle ? '' : 'block';
    }
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

function loadThemeCSS(themeName) {
    var cssNode = document.createElement('link');
    cssNode.type = 'text/css';
    cssNode.rel = 'stylesheet';
    cssNode.href =  getThemeCSSPath(themeName);
    cssNode.media = 'screen';
    cssNode.title = 'dynamicLoadedSheet';
    document.getElementsByTagName("head")[0].appendChild(cssNode);
}

function getThemeCSSPath(themeName) {
     return  window.contextPath + "/public/slides/themes/" + themeName + "/css/slide.css";
}

window.onloadListeners=new Array();

window.addOnLoadListener = function (listener) {
    window.onloadListeners[window.onloadListeners.length]=listener;
}


function _resize() {
    if(currentSlide) {
        resizeSlide(currentSlide);
    }
}

window.onload=function(){
    for(var i=0;i<window.onloadListeners.length;i++){
        func = window.onloadListeners[i];
        func.call();
    }
}

window.addOnLoadListener(initSlides);

window.onresize = _resize;

