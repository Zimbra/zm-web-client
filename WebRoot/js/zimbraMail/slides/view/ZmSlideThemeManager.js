/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmSlideThemeManager = 	function() {
};

ZmSlideThemeManager.prototype.getMasterSlideContent =
function(isTitleSlide){

    if(isTitleSlide && this._currentTitleSlideContent!=null) {
        return this._currentTitleSlideContent;
    }

    if( this._currentNotesSlideContent != null) {
        return this._currentNotesSlideContent;
    }
    return '<img src="/public/slides/themes/green/img/slide.jpg" width="100%" height="100%">';
    //return '<div style="background-color:purple; position:absolute; left: 0%; top:15%; width:100%; height:1%;"></div>';
};

ZmSlideThemeManager.prototype.setNotesSlideContent =
function(content) {
    this._currentNotesSlideContent = content;    
};

ZmSlideThemeManager.prototype.setTitleSlideContent =
function(content) {
    this._currentTitleSlideContent = content;    
};

ZmSlideThemeManager.prototype.parseSlideTheme =
function(div) {

    this._currentNotesSlideContent = "";
    this._currentTitleSlideContent = "";

    var node = div.firstChild;
    while(node) {
        var isTitleSlide = (node.className == "titlemaster");
        if(isTitleSlide) {
            this._currentTitleSlideContent = node.innerHTML;
        }
        var isNotesSlide = (node.className == "slidemaster");
        if(isNotesSlide) {
            this._currentNotesSlideContent = node.innerHTML;
        }
        node = node.nextSibling;
    }

    if(!this._currentTitleSlideContent) {
        this._currentTitleSlideContent = this._currentNotesSlideContent;
    }
};


ZmSlideThemeManager.prototype.getThemeCSSPath =
function(themeName) {
     return  "/public/slides/themes/" + themeName + "/css/slide.css";
};


ZmSlideThemeManager.prototype.getThemeSlidePath =
function(themeName) {
    return "/public/slides/themes/" + themeName + "/slide.html";
};

ZmSlideThemeManager.prototype.loadThemeCSS =
function(themeName) {
    var themePath = this.getThemeCSSPath(themeName);
    this.loadCSS(themePath);
};

ZmSlideThemeManager.prototype.loadCSS =
function(themePath) {
    var cssNode = document.createElement('link');
    cssNode.type = 'text/css';
    cssNode.rel = 'stylesheet';
    cssNode.href = themePath;
    cssNode.media = 'screen';
    cssNode.title = 'dynamicLoadedSheet';
    document.getElementsByTagName("head")[0].appendChild(cssNode);
};

ZmSlideLayoutManager = function(){

};

ZmSlideLayoutManager.prototype.getSlideLayout =
function(themeName, titleOnly, titleContent){
    var content = [];
    var idx = 0;
    var title = titleContent || 'Click here to edit title';
    content[idx++] = '<div class="slide_object_title" style="position: absolute; left: 4%; top: 3%; width: 92%; height: 9%;">'  + title + '</div>'
    if(!titleOnly) {
        content[idx++] = '<div class="slide_object_notes" style="position: absolute; left: 4%; top: 23%; width: 92%; height: 72%;">Click here to edit slide contents <br> </div>';
    }
    return content.join("");
};



