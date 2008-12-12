var currentSlide = null;
var prevSlide = null;
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

    addSlideEvent(document, "click", slidesHandler);

    if(!currentSlide) { return; }

    var n = currentSlide;

    while(n) {
        if(n.className == "slide" || n.className == "masterslide") {
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
    currentSlide.style.width = size.y * 4/3;
    currentSlide.style.height = size.y;

    var diff = size.y/3;
    currentSlide.style.left = (diff/2) + 'px';
}

function slidesHandler(ev) {

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

    var ht = window.document.body.innerHeight;
    var wd = window

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


function getNextSlide(currentSlide, includeEndSlide) {

    while(currentSlide && (currentSlide.className != "slide" && (currentSlide.className != "endslide")) ) {
        currentSlide = currentSlide.nextSibling;
    }

    return currentSlide;
}


function getSlideWindowSize () {
    if (window.innerWidth) {
        return { x: window.innerWidth, y:  window.innerHeight } ;
    } else if (document.body && document.body.parentElement) {
        return { x: document.body.parentElement.clientWidth, y: document.body.parentElement.clientHeight };
    } else if (document.body && document.body.clientWidth) {
        return {x: document.body.clientWidth, y:document.body.clientHeight};
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


