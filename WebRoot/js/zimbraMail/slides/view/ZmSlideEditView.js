/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmSlideEditView = function(parent, className, posStyle, controller, dropTgt) {

    if (arguments.length == 0) return;

    className = className || "ZmSlideEditView";//cdebug
    posStyle = posStyle || Dwt.ABSOLUTE_STYLE;
    DwtComposite.call(this, {parent:parent, className:className, posStyle:posStyle});

    this._controller = controller;

	//override the default style set on DwtControl module	
    var el = this.getHtmlElement();
    el.style.overflow = "";


    this._themeManager = new ZmSlideThemeManager();
    this._layoutManager = new ZmSlideLayoutManager();
    this._docMgr = new ZmDocletMgr();

};

ZmSlideEditView.prototype = new DwtComposite;
ZmSlideEditView.prototype.constructor = ZmSlideEditView;

ZmSlideEditView.prototype.toString = function() {
    return "ZmSlideEditView";
};

//xx
ZmSlideEditView.TYPE_DIV = 1;


ZmSlideEditView.TYPE_LEFT_TOP_BOX = 2;
ZmSlideEditView.TYPE_RIGHT_TOP_BOX = 3;
ZmSlideEditView.TYPE_LEFT_BOTTOM_BOX = 4;
ZmSlideEditView.TYPE_RIGHT_BOTTOM_BOX = 5;
ZmSlideEditView.TYPE_TOP_SASH = 6;
ZmSlideEditView.TYPE_BOTTOM_SASH = 7;
ZmSlideEditView.TYPE_LEFT_SASH = 8;
ZmSlideEditView.TYPE_RIGHT_SASH = 9;
ZmSlideEditView.TYPE_DRAG_PROXY_DIV = 10;

ZmSlideEditView.TYPE_PREVIEW = 11;
ZmSlideEditView.DRAG_THRESHOLD = 4;

ZmSlideEditView.APP_ZIMBRA_PPT = "application/x-zimbra-ppt";


ZmSlideEditView.SLIDE_OBJECTS = ["slide_object_notes", "slide_object_title", "slide_object_img", "slide_object_graph"];

ZmSlideEditView.EDITABLE_OBJECTS = {
    "slide_object_notes" : true,
    "slide_object_title" : true
};

ZmSlideEditView.prototype.isEditable =
function(div) {
    if(!div) {
        return false;
    }
    return ZmSlideEditView.EDITABLE_OBJECTS[div.className];
};

ZmSlideEditView.prototype.getCurrentSlideElement =
function() {
    return this._currentSlideDiv;
	//return this.getHtmlElement();
};

ZmSlideEditView.prototype.getCurrentPreviewSlideElement =
function() {
    return this._currentPreviewSlideDiv;
	//return this.getHtmlElement();
};

ZmSlideEditView.prototype._createHTML =
function() {
    var el = this.getHtmlElement();

    this._initIframe();

    var editor = this._editor = new ZmSlideComponentEditor({parent:shell, iframe: this._iframe});
    editor._enableDesignMode(editor._getIframeDoc());
    this._toolbar = editor._createToolBar(this);

    this.createSlideContainer();

    this._createSelectionBoxes();
};

ZmSlideEditView.prototype.createSlideContainer =
function() {

    var size = this.getSize();
    var toolbarSize = this._toolbar.getSize();

    var slideDiv = this._slideContainer = document.createElement("div");
    slideDiv.className = "slidecontainer";

    var slideWidth = 0.19 * size.x;
    slideDiv.style.height = (size.y) + "px";
    slideDiv.style.width = (0.81 * size.x) + "px";


    this.getHtmlElement().appendChild(slideDiv);

    slideDiv = this._previewContainer = document.createElement("div");
    slideDiv.className = "previewcontainer";
    slideDiv.style.height = (size.y) + "px";
    slideDiv.style.width = (0.2 * size.x) + "px";

    this.getHtmlElement().appendChild(slideDiv);
};

ZmSlideEditView.prototype.createSlide =
function(ignorePreview) {

    var cdiv = this._currentSlideDiv;

    if(cdiv) {
        this.convertToPercentage(cdiv);
		//this._currentSlide.setContent(cdiv.innerHTML);
        this._syncPreview();
        Dwt.setVisible(cdiv, false);
        if(this._slideParent) {
            this._slideParent.parentNode.removeChild(this._slideParent);
        }
    }

    var div = document.createElement("div");
    div.className = "slide";

    Dwt.setPosition(div, Dwt.ABSOLUTE_STYLE);

    var bounds = Dwt.getBounds(this._slideContainer);

    var width = bounds.width * 0.72; //70% width
    var x = (bounds.width - width)/2;
    var height = bounds.height*0.72; //80% height
    var y = (bounds.height - height)/2;

    var slideDiv = this._slideParent = document.createElement("div");
    slideDiv.className = "slideparent";
    Dwt.setPosition(slideDiv, Dwt.ABSOLUTE_STYLE);
    Dwt.setBounds(slideDiv, x, y, width, height);
    this._slideContainer.appendChild(slideDiv);
    slideDiv.style.opacity = 0;

    slideDiv.appendChild(div);
	//this._slideContainer.appendChild(div);

    var bgDiv = this._currentSlideThemeDiv = document.createElement("div");
    bgDiv.className = "slidemaster";
    bgDiv.innerHTML = this._themeManager.getMasterSlideContent();
    Dwt.setPosition(bgDiv, Dwt.ABSOLUTE_STYLE);

    slideDiv.appendChild(bgDiv);
	//this._slideContainer.appendChild(bgDiv);

    div.style.zIndex = Dwt.Z_VIEW;
    bgDiv.style.zIndex = Dwt.Z_VIEW-10;

    Dwt.setBounds(div, 0, 0, width, height);
    Dwt.setBounds(bgDiv, 0, 0, width, height);

    this._currentSlideDiv = div;

    div.innerHTML = this._layoutManager.getSlideLayout();

    if(!ignorePreview) {
        this.createPreviewSlide();
    }

    var animate = this._animationMgr;
    if(!this._animationMgr) {
        animate = this._animationMgr = new DwtAnimate();
    }
    animate.setFramesPerSecond(16);
    animate.setDuration(700);
    animate.animate(slideDiv, 'opacity', 0,1);
}

ZmSlideEditView.prototype.getNextPreviewSlideParent =
function() {
    var nextPreviewSlideParent =  this._previewSlideParent.nextSibling;

    while(nextPreviewSlideParent && (nextPreviewSlideParent.className != "previewslideparent")) {
        nextPreviewSlideParent = nextPreviewSlideParent.nextSibling;
    }

    return nextPreviewSlideParent;
};

ZmSlideEditView.prototype.deleteSlide =
function() {
    //this._promptDeleteSlide();
    this._continueDeleteSlide();
}

ZmSlideEditView.prototype._promptDeleteSlide =
function() {
    var deleteSlideCallback = new AjxCallback(this, this._continueDeleteSlide);

    var confirmDialog = new DwtConfirmDialog(this);
    confirmDialog.popup(ZmMsg.confirmDeleteSlide, deleteSlideCallback);
};

ZmSlideEditView.prototype._continueDeleteSlide =
function() {
    this._syncPreview();


    var nextPreviewSlideParent = this.getNextPreviewSlideParent();

    if(this._previewSlideParent && this._previewSlideParent.parentNode) {
        this._previewSlideParent.parentNode.removeChild(this._previewSlideParent);
    }

    if(nextPreviewSlideParent) {
        var div = nextPreviewSlideParent.firstChild;
        this.clearCurrentSelection();
        this._currentSlideDiv.innerHTML = div.innerHTML;
        this._currentPreviewSlideDiv = div;
        this._previewSlideParent = nextPreviewSlideParent;
    }


    if(!nextPreviewSlideParent) {
        this.createSlide();
    }

}


ZmSlideEditView.prototype.createPreviewSlide =
function() {


    var div = this._currentPreviewSlideDiv = document.createElement("div");
    div.className = "preview";

    var bounds = Dwt.getBounds(this._previewContainer);
    var slideBounds = Dwt.getBounds(this._slideParent);

    var width =  slideBounds.width* 0.29; //40% width

    var height = slideBounds.height*0.3; //40% height

    var x = (bounds.width - width)/2;
    var y = (bounds.height - height)/2;

    var slideDiv = this._previewSlideParent = document.createElement("div");
    slideDiv.className = "previewslideparent";
    Dwt.setSize(slideDiv, width, height);
    this._previewContainer.appendChild(slideDiv);

    this.associateItemWithElement(null, div, ZmSlideEditView.TYPE_PREVIEW);

    slideDiv.appendChild(div);

    var bgDiv = this._currentPreviewSlideThemeDiv = document.createElement("div");
    bgDiv.className = "slidemaster";
    Dwt.setPosition(bgDiv, Dwt.ABSOLUTE_STYLE);

    slideDiv.appendChild(bgDiv);

    Dwt.setSize(div, width, height);
    Dwt.setSize(bgDiv, width, height);

    div.innerHTML = this._currentSlideDiv.innerHTML;

    bgDiv.innerHTML = this._currentSlideThemeDiv.innerHTML;

    div.style.zIndex = Dwt.Z_VIEW;
    bgDiv.style.zIndex = Dwt.Z_VIEW-10;

}

ZmSlideEditView.prototype._initializeSlideEditView =
function() {

    this._createHTML();

    var el = this.getCurrentSlideElement();
	
	//xx
    this._setMouseEventHdlrs();

    this._listenerMouseOver = new AjxListener(this, ZmSlideEditView.prototype._mouseOverListener);
    this._listenerMouseOut = new AjxListener(this, ZmSlideEditView.prototype._mouseOutListener);
    this._listenerMouseDown = new AjxListener(this, ZmSlideEditView.prototype._mouseDownListener);
    this._listenerMouseUp = new AjxListener(this, ZmSlideEditView.prototype._mouseUpListener);
    this._listenerMouseMove = new AjxListener(this, ZmSlideEditView.prototype._mouseMoveListener);
    this._listenerDoubleClick = new AjxListener(this, ZmSlideEditView.prototype._doubleClickListener);
    this.addListener(DwtEvent.ONMOUSEOVER, this._listenerMouseOver);
    this.addListener(DwtEvent.ONMOUSEOUT, this._listenerMouseOut);
    this.addListener(DwtEvent.ONMOUSEDOWN, this._listenerMouseDown);
    this.addListener(DwtEvent.ONMOUSEUP, this._listenerMouseUp);
    this.addListener(DwtEvent.ONMOUSEMOVE, this._listenerMouseMove);
    this.addListener(DwtEvent.ONDBLCLICK, this._listenerDoubleClick);
    DBG.println("<b>listener added </b>");

};

ZmSlideEditView.prototype.getTargetItemDiv =
function(ev)  {
    return this.findItemDiv(DwtUiEvent.getTarget(ev));
};

ZmSlideEditView.prototype.findItemDiv =
function(el)  {
    if (!el) { return; }
    while (el && (el.id != this._htmlElId)) {
        if (el.id && this._data[el.id]) {
            return el;
        }
        el = el.parentNode;
    }
    return null;
};


//xx


ZmSlideEditView.prototype.getTitle =
function() {
    return "Zimbra Presentation : Edit Slide";
};

ZmSlideEditView.prototype.getController =
function() {
    return this._controller;
};



ZmSlideEditView.prototype.set =
function(folderId) {
    DBG.println("set:"+folderId);
};

ZmSlideEditView.prototype.setBounds =
function(x, y, width, height) {
    DwtComposite.prototype.setBounds.call(this, x, y, width, height);
};



//xx
ZmSlideEditView.prototype._getItemData =
function(el, field, id) {
    id = id || (el ? el.id : null);
    var data = this._data[id];
    return data ? data[field] : null;
};


ZmSlideEditView.prototype.associateItemWithElement =
function(item, element, type, id, data) {
    id = id || this._getItemId(item);
    if (element) {
        element.id = id;
    }
    this._data[id] = {item:item, id:id, type:type};
    if (data) {
        for (var key in data) {
            this._data[id][key] = data[key];
        }
    }
    return id;
};

ZmSlideEditView.prototype.getItemFromElement =
function(el) {
    return this._getItemData(el, "item");
};

ZmSlideEditView.prototype._getItemId =
function(item) {
    return DwtId.getListViewItemId(DwtId.WIDGET_ITEM, this.id, item ? item.id : Dwt.getNextId());
};

ZmSlideEditView.prototype._createSelectionBoxes =
function() {

    var el = this.getHtmlElement();

    var elementReferenceNames = ["_topSash", "_bottomSash", "_leftSash", "_rightSash", "_dragProxyDiv", "_leftTopSelectionBox", "_rightTopSelectionBox", "_leftBottomSelectionBox", "_rightBottomSelectionBox"];
    var classNames = ["SelectionSash_Top", "SelectionSash_Bottom", "SelectionSash_Left", "SelectionSash_Right", "DragProxy", "SelectionCornerBox", "SelectionCornerBox", "SelectionCornerBox", "SelectionCornerBox"];
    var cursors = ["move", "move", "move", "move", "move", "nw-resize", "ne-resize", "sw-resize", "se-resize"];
    var types = [ZmSlideEditView.TYPE_TOP_SASH, ZmSlideEditView.TYPE_BOTTOM_SASH, ZmSlideEditView.TYPE_LEFT_SASH, ZmSlideEditView.TYPE_RIGHT_SASH, ZmSlideEditView.TYPE_DRAG_PROXY_DIV, ZmSlideEditView.TYPE_LEFT_TOP_BOX, ZmSlideEditView.TYPE_RIGHT_TOP_BOX, ZmSlideEditView.TYPE_LEFT_BOTTOM_BOX, ZmSlideEditView.TYPE_RIGHT_BOTTOM_BOX];

    var div = null;
    for( var i in elementReferenceNames) {
        var id = elementReferenceNames[i];
        div = this[id] = document.createElement("div");
        div.className = classNames[i];
        Dwt.setPosition(div, Dwt.ABSOLUTE_STYLE);
        Dwt.setCursor(div, cursors[i]);
        el.appendChild(div);
        this.associateItemWithElement(null, div, types[i]);
        Dwt.setVisible(div, false);
        div.style.zIndex = Dwt.Z_VIEW + 100;

    }
    //this._initIframe();
};


ZmSlideEditView.prototype._initIframe =
function() {
    var el = this.getHtmlElement();
    var iFrame = this._iframe = document.createElement("iframe");
    iFrame.id = Dwt.getNextId();
    iFrame.style.visibility = "hidden";
    iFrame.setAttribute("border", "0", false);
    iFrame.setAttribute("frameborder", "0", false);
    iFrame.setAttribute("vspace", "0", false);
    iFrame.setAttribute("autocomplete", "off", false);
    iFrame.setAttribute("allowtransparency", "true", false);

    Dwt.setPosition(this._iframe, Dwt.ABSOLUTE_STYLE);
	//Dwt.setBounds(this._iframe, -100, -100, 10, 10);
    Dwt.setBounds(this._iframe, 10, 10, 100, 100);
    el.appendChild(this._iframe);
    var iContentWindow = this._iframe.contentWindow;
    var doc = this._doc = iContentWindow ? iContentWindow.document : null;
    if(doc) {
        doc.open();

        var html = [];
        html.push('<html>');
        html.push('<link href="' + window.contextPath + '/css/skin,slides.css?locale=' + AjxEnv.DEFAULT_LOCALE + '" rel="stylesheet" type="text/css" />');

        html.push('<body></body>');
        html.push('</html>');
        doc.write(html.join(""));
        doc.close();
    }
    iFrame.style.zIndex = Dwt.Z_VIEW + 100;
};

ZmSlideEditView.prototype._doubleClickListener =
function(ev) {
    return true;
};

ZmSlideEditView.prototype._doubleClickAction =
function(ev, div) {
    return true;
}


ZmSlideEditView.prototype._mouseDownListener =
function(ev) {

    var div = DwtUiEvent.getTarget(ev);
    return this._mouseDownAction(ev, div);
};

ZmSlideEditView.prototype._mouseDownAction =
function(ev, div) {

    DBG.println("mouse down :" + this.isPreviewComponent(div)+","+div.parentNode+"::"+div.parentNode.className);

    div = this._getActionDiv(div);

    if(!div) {
        return false;
    }

    if(div.className == "preview" || (div.parentNode && div.parentNode.className == "preview")) {
        if(div.parentNode && div.parentNode.className == "preview") {
            div = div.parentNode;
        }
        this.clearCurrentSelection();
        this._currentSlideDiv.innerHTML = div.innerHTML;
        this._currentPreviewSlideDiv = div;
        this._previewSlideParent = div.parentNode;
        return true;
    }


	//allow item selection only on slide components
    if(this.isSlideObject(div)){
        this._handleItemSelection(div);
        this._recordTargetPosition(ev, div);
        return true;
    }

    var uiElement = this.getTargetItemDiv(ev);
    if(uiElement) {
        this._recordTargetPosition(ev, uiElement);
    }

    this.clearCurrentSelection();

    return false;
};

ZmSlideEditView.prototype.clearCurrentSelection =
function() {
    if(this._selectedDiv != null) {
        if(this.isEditable(this._selectedDiv)) {
            this._replaceEditorContent();
        }
        this._deselectComponent();
        return true;
    }
    return false;
};

ZmSlideEditView.prototype.isPreviewComponent =
function(div) {
    return (div && div.parentNode && ( div.parentNode.className == "preview" || div.parentNode.className ==  "previewslideparent"));
}


ZmSlideEditView.prototype._handleItemSelection =
function(div) {

    if(this.isSlideObject(div)) {
        //restore old selection

        if(this._selectedDiv != null  && this.isEditable(this._selectedDiv)) {
            this._replaceEditorContent();
        }


        if(this.isEditable(div)) {
            this._createEditor(div);
        }
        this._selectedDiv = div;
        this._selectComponent(div);
    }
};

ZmSlideEditView.prototype._createEditor =
function(div) {
    var tmp = div.innerHTML;
    DBG.println("createEditor:" + div + "[" +  tmp +  "]");
    var iframe = this._iframe;
    var bounds = Dwt.getBounds(div);

    //this.convertToPercentage(div);

    var offsetBounds = Dwt.toWindow(this._currentSlideDiv, 0, 0, this.getHtmlElement(), true);

	//var offsetBounds = Dwt.getBounds(this._slideContainer);

    DBG.println("editor bounds: "+  bounds.x + "," + bounds.y + ", " + bounds.width + ", " + bounds.height);
    DBG.println("container bounds: "+ offsetBounds.x +  "," + offsetBounds.y + ", " + offsetBounds.width + ", " + offsetBounds.height);

    DBG.println("iframe location :" + (offsetBounds.x + bounds.x) + " , y:" + (offsetBounds.y + bounds.y));
    Dwt.setBounds(iframe, offsetBounds.x + bounds.x, offsetBounds.y + bounds.y, bounds.width, bounds.height);
    div.innerHTML = "";
	//div.appendChild(iframe);
    iframe.className = "SlideComponentEditor";
    iframe.style.visibility = "visible";
    var iContentWindow = iframe.contentWindow;
    if(iContentWindow != null) {
        var doc = iContentWindow.document;
        if(doc != null) {
            DBG.println("z writing content:"+tmp);
            var content = ["<body>", tmp, "</body>"].join("");
            if(doc.body) {
                doc.body.className = div.className ? div.className : "";
                doc.body.innerHTML = tmp;
            }
            doc.designMode = "on";
        }
    }

    iframe.style.zIndex = Dwt.Z_VIEW + 100;
    div.style.zIndex = Dwt.Z_VIEW - 20;

    if(this._toolbar) {
        this._toolbar.setVisible(true);
        var toolbarSize = this._toolbar.getSize();
        this._toolbar.setBounds(offsetBounds.x, offsetBounds.y-20-3, Dwt.DEFAULT, 25);
        this._toolbar.getHtmlElement().style.zIndex = Dwt.Z_VIEW + 100;
    }


};

ZmSlideEditView.prototype._replaceEditorContent =
function() {
    try {
        if(!this._selectedDiv || !this._iframe) {
            return;
        }
        var iframe = this._iframe;
        var iContentWindow = iframe ? iframe.contentWindow : null;
        var doc = iContentWindow ? iContentWindow.document : null;
        if(!doc) {
            return;
        }

        var content = (doc && doc.body) ? doc.body.innerHTML : "";
        try {
            if (AjxEnv.isGeckoBased || AjxEnv.isSafari) {
                doc.designMode = "off";
            }
        }catch(ex) {
            DBG.println("exception in turning off design mode:" + ex);
        }

        this._iframe.style.visibility = "hidden";
        Dwt.setBounds(this._iframe, -100, -100, 10, 10);
        this._selectedDiv.innerHTML = content;
    }catch(ex) {
        DBG.println("exception in replace editor:"+ex);

    }


    this._syncPreview();

    if(this._toolbar) {
        this._toolbar.setVisible(false);
    }

};

ZmSlideEditView.prototype._recordTargetPosition =
function(ev, div) {
    this._clickDiv = div;
    var elementOffset = Dwt.toWindow(div, 0, 0, this.getCurrentSlideElement(), true);
    DBG.println("<font color=red>mouse down el offset:</font>" + ev.elementX + "," + ev.elementY +" | "+elementOffset.x + "," + elementOffset.y);
    var data = {
        dndStarted: false,
        view: this,
        el: div,
        elementOffset: elementOffset,
        docX: ev.docX,
        docY: ev.docY
    };
    DBG.println("<b>mouse down data:</b>" + ev.docX + "," + ev.docY);
    this._clickDivData = data;
};

ZmSlideEditView.prototype._selectComponent =
function(div) {

    var elementOffset = Dwt.toWindow(div, 0, 0, this.getCurrentSlideElement(), true);
    var size = Dwt.getSize(div);

    var containerOffset = Dwt.toWindow(this.getCurrentSlideElement(), 0, 0, this.getHtmlElement(), true);


    var x = containerOffset.x + elementOffset.x - 4;
    var y = containerOffset.y + elementOffset.y - 4;
    var width = size.x + 8;
    var height = size.y + 8;

    Dwt.setBounds(this._topSash, x, y, width, Dwt.DEFAULT);
    Dwt.setBounds(this._bottomSash, x, y + height - 4, width, Dwt.DEFAULT);
    Dwt.setBounds(this._leftSash, x, y, Dwt.DEFAULT, size.y);
    Dwt.setBounds(this._rightSash, x + width - 4, y, Dwt.DEFAULT, size.y);

    Dwt.setLocation(this._leftTopSelectionBox, x - 4,  y - 4);
    Dwt.setLocation(this._rightTopSelectionBox, x + width - 4,  y - 4);
    Dwt.setLocation(this._leftBottomSelectionBox, x - 4,  y + height - 4);
    Dwt.setLocation(this._rightBottomSelectionBox, x + width - 4,  y + height - 4);

    Dwt.setVisible(this._topSash, true);
    Dwt.setVisible(this._bottomSash, true);
    Dwt.setVisible(this._leftSash, true);
    Dwt.setVisible(this._rightSash, true);

    Dwt.setVisible(this._leftTopSelectionBox, true);
    Dwt.setVisible(this._rightTopSelectionBox, true);
    Dwt.setVisible(this._leftBottomSelectionBox, true);
    Dwt.setVisible(this._rightBottomSelectionBox, true);
};

ZmSlideEditView.prototype._deselectComponent =
function(div) {

    Dwt.setVisible(this._topSash, false);
    Dwt.setVisible(this._bottomSash, false);
    Dwt.setVisible(this._leftSash, false);
    Dwt.setVisible(this._rightSash, false);

    Dwt.setVisible(this._leftTopSelectionBox, false);
    Dwt.setVisible(this._rightTopSelectionBox, false);
    Dwt.setVisible(this._leftBottomSelectionBox, false);
    Dwt.setVisible(this._rightBottomSelectionBox, false);

};

ZmSlideEditView.prototype._mouseMoveListener =
function(ev) {
    if (!this._clickDiv && !this._clickDivData) { return; }

    var mouseEv = DwtShell.mouseEvent;
    mouseEv.setFromDhtmlEvent(ev, true);

    if (!this._clickDiv) { return; }
    var data = this._clickDivData;

    var deltaX = mouseEv.docX - data.docX;
    var deltaY = mouseEv.docY - data.docY;

    DBG.println("mouse move listener:  x=" + (data.elementOffset.x + deltaX) + ",y=" + (data.elementOffset.y + deltaY));
    DBG.println("element offset x:" + data.elementOffset.x + "," + data.elementOffset.y);
    DBG.println("delta:"  + deltaX + "," + deltaY);


    var type = this._getItemData(this._clickDiv, "type");

    if(!this.isEditable(this._clickDiv) && !type) {
        this._handleSashMovement(deltaX, deltaY);
        return false;
    }

    switch(type) {
        case ZmSlideEditView.TYPE_TOP_SASH :
        case ZmSlideEditView.TYPE_BOTTOM_SASH :
        case ZmSlideEditView.TYPE_LEFT_SASH :
        case ZmSlideEditView.TYPE_RIGHT_SASH :
            this._handleSashMovement(deltaX, deltaY);
            break;
        case ZmSlideEditView.TYPE_LEFT_TOP_BOX:
        case ZmSlideEditView.TYPE_LEFT_BOTTOM_BOX:
        case ZmSlideEditView.TYPE_RIGHT_TOP_BOX:
        case ZmSlideEditView.TYPE_RIGHT_BOTTOM_BOX:
            this._handleResize(deltaX, deltaY, type);
            break;
    };


    mouseEv._stopPropagation = true;
    mouseEv._returnValue = false;
    mouseEv.setToDhtmlEvent(ev);
    return false;
};

ZmSlideEditView.prototype._handleResize =
function(deltaX, deltaY, type) {
    var data = this._clickDivData;
    if(this._selectedDiv != null && data != null) {
        this._resizeStarted = true;
        var bounds = Dwt.getBounds(this._selectedDiv);


        var x2 = bounds.x + bounds.width;
        var y2 = bounds.y + bounds.height;
        DBG.println("bounds.height:" + bounds.height + ", y2=" + y2 + ",deltaY=" + deltaY);

        var offset = this.getOffsetBounds();

        var newX = offset.x + bounds.x;
        var newY = offset.y + bounds.y;

        var newWidth = bounds.width;
        var newHeight = bounds.height;

        switch(type) {
            case ZmSlideEditView.TYPE_LEFT_TOP_BOX:
                newX = newX + deltaX;
                newY = newY + deltaY;
                newWidth = bounds.width - deltaX;
                newHeight = bounds.height - deltaY;
                break;
            case ZmSlideEditView.TYPE_LEFT_BOTTOM_BOX:
                newX = newX + deltaX;
                newWidth = bounds.width - deltaX;
                newHeight = bounds.height + deltaY;
                break;
            case ZmSlideEditView.TYPE_RIGHT_TOP_BOX:
                newY = newY + deltaY;
                newWidth = bounds.width + deltaX;
                newHeight = bounds.height - deltaY;
                break;
            case ZmSlideEditView.TYPE_RIGHT_BOTTOM_BOX:
                newWidth = bounds.width + deltaX;
                newHeight = bounds.height + deltaY;
                break;

        }

        DBG.println("resize src bounds: "+ bounds.x + "," + bounds.y + ", " + bounds.width + ", " + bounds.height);
        this._clearInvalidStyles(this._dragProxyDiv);
        this._enableDragProxyDiv(true);
        Dwt.setBounds(this._dragProxyDiv, newX-2, newY-2, newWidth-2, newHeight-2);


        //this.convertToPercentage(this._dragProxyDiv);
        //this._dragProxyDiv.style.padding = this._selectedDiv.style.padding;
    }
};

ZmSlideEditView.prototype._enableDragProxyDiv =
function(enable) {
    //this._dragProxyDiv.style.border = "2px solid black";
    this._dragProxyDiv.style.display = (enable?"inline":"none");
	//Dwt.setVisible(this._dragProxyDiv, enable);
};

ZmSlideEditView.prototype._handleSashMovement =
function(deltaX, deltaY) {
    var data = this._clickDivData;
    if(this._selectedDiv != null && data != null) {
        this._divDndStarted = true;
        var bounds = Dwt.getBounds(this._selectedDiv);
        var offset = this.getOffsetBounds();

        DBG.println("resize src bounds: "+ bounds.x + "," + bounds.y + ", " + bounds.width + ", " + bounds.height);
        this._dragProxyDiv.style.display = "inline";
        Dwt.setBounds(this._dragProxyDiv, offset.x + bounds.x + deltaX, offset.y + bounds.y + deltaY, bounds.width, bounds.height);
    }
};


ZmSlideEditView.prototype._mouseUpListener =
function(ev) {
    var div = this.getTargetItemDiv(ev);
    DBG.println("mouse up listener : "+div);
    delete this._clickDiv;
    delete this._clickDivData;

    var offset = this.getOffsetBounds();

    if(this._divDndStarted) {
        var bounds = Dwt.getBounds(this._dragProxyDiv);
        DBG.println("move dest bounds: "+ bounds.x + "," + bounds.y + ", " + (bounds.width) + ", " + (bounds.height));
        this._clearInvalidStyles(this._selectedDiv);
        Dwt.setLocation(this._selectedDiv, bounds.x-offset.x, bounds.y-offset.y);
        this._restoreSelectionMode();
    } else if (this._resizeStarted) {
        this._clearInvalidStyles(this._dragProxyDiv);
        var bounds = Dwt.getBounds(this._dragProxyDiv);
        this._clearInvalidStyles(this._selectedDiv);
        Dwt.setBounds(this._selectedDiv, bounds.x-offset.x, bounds.y-offset.y, bounds.width-2, bounds.height-2);
        this._restoreSelectionMode();
    }

    return this._mouseUpAction(ev, div);
};

ZmSlideEditView.prototype._restoreSelectionMode =
function() {
    //this.convertToPercentage(this._selectedDiv);
    this._selectComponent(this._selectedDiv);
    this._enableDragProxyDiv(false);
    if(this.isEditable(this._selectedDiv)) {
        this._replaceEditorContent();
    }
    this._divDndStarted = false;
    this._resizeStarted = false;
    this._syncPreview();
};

ZmSlideEditView.prototype._mouseUpAction =
function(ev, div) {
    //DBG.println("mouse up action :" +div);
    return true;
};

ZmSlideEditView.prototype._mouseOutListener =
function(ev) {
    var div = this.getTargetItemDiv(ev);
	//DBG.println("mouse out listener:"+div);
    if (!div) { return; }
    this._mouseOutAction(ev, div);
};

ZmSlideEditView.prototype._mouseOutAction =
function(ev, div) {
    //DBG.println("mouse out action:" + div);
    return true;
};


ZmSlideEditView.prototype._mouseOverListener =
function(ev) {
    var div = this.getTargetItemDiv(ev);
    if (!div) { return; }

    return this._mouseOverAction(ev, div);
};

ZmSlideEditView.prototype._mouseOverAction =
function(ev, div) {
    //DBG.println("_mouseOverAction : getItemData :" + div);
    return true;
};

//this might interrupt with resize,move and percentage calculation of slide components
ZmSlideEditView.prototype._clearInvalidStyles =
function(div) {
    //div.style.padding = "0px";
};

ZmSlideEditView.prototype.fixComponents =
function(div) {
    var el = this.getCurrentSlideElement();
    var node = el.firstChild;
    while(node) {
        this.convertToPercentage(node);
        node = node.nextSibling;
    }
};

ZmSlideEditView.prototype._syncPreview =
function() {

    this.fixComponents(this.getCurrentSlideElement());
    //remove this
    this.getCurrentPreviewSlideElement().innerHTML = this.getCurrentSlideElement().innerHTML;
};

ZmSlideEditView.prototype.convertToPercentage =
function(div) {

    var type = this._getItemData(div, "type");

    if(!this.isSlideObject(div)) {
        return;
    }

    var left = div.style.left;
    var top = div.style.top;

    var parentN = div.parentNode;
    var parentSize = Dwt.getSize(parentN);
    var childSize = Dwt.getSize(div);

    var widthPercent = (childSize.x/parentSize.x)*100;
    var heightPercent = (childSize.y/parentSize.y)*100;

    div.style.width = widthPercent + "%";
    div.style.height = heightPercent + "%";

    if(left.match(/\px$/) || top.match(/\px$/)) {
        var loc = Dwt.toWindow(div, 0, 0, parentN, null, null);
        left = 	(loc.x/parentSize.x)*100;
        top = 	(loc.y/parentSize.y)*100;
        DBG.println("new left,top:"+left+ ","+ top);
        div.style.left = left + "%";
        div.style.top = top + "%";
    }

    DBG.println("left:"+left+",top:"+top + ", parentSize:" + parentSize.x + ","+ parentSize.y + ",childSize:"+childSize.x + "," + childSize.y);
};

ZmSlideEditView.prototype.getOffsetBounds =
function() {
    return Dwt.toWindow(this.getCurrentSlideElement(), 0, 0, this.getHtmlElement(), true);
};

ZmSlideEditView.prototype.insertTextBox =
function() {

    var div = document.createElement("div");
	//todo: change this
    div.className = "slide_object_notes"; //"slide_object_title";
    div.innerHTML = ZmMsg.slides_textBoxMessage;
    Dwt.setPosition(div, Dwt.ABSOLUTE_STYLE);
    Dwt.setBounds(div, 20,20, 200, 100);

    var container  = this.getCurrentSlideElement();
    container.appendChild(div);
};

ZmSlideEditView.prototype.insertImage =
function() {

    var imgSrc = prompt(ZmMsg.slides_imageURL);

    var div = document.createElement("div");
    div.className = "slide_object_img";
    div.innerHTML = '<img src="' + imgSrc + '" width="100%" height="100%">';
    div.style.zIndex = Dwt.Z_VIEW;

    Dwt.setPosition(div, Dwt.ABSOLUTE_STYLE);
    Dwt.setBounds(div, 20,20, 200, 100);

    var container  = this.getCurrentSlideElement();
    container.appendChild(div);
};

ZmSlideEditView.prototype.insertGraph =
function(chartURL, dataURL) {

    var div = document.createElement("div");
    div.className = "slide_object_graph";
    div.innerHTML = '';

    Dwt.setPosition(div, Dwt.ABSOLUTE_STYLE);
    Dwt.setBounds(div, 20,20, 400, 300);

    var container  = this.getCurrentSlideElement();
    container.appendChild(div);

    var chart = new FusionCharts(chartURL, Dwt.getNextId(), "400", "300", "0", "0");
    chart.setDataURL(dataURL);
    chart.render(div);    
};


ZmSlideEditView.prototype.deleteTextBox =
function(div) {

    div = (div!=null) ? div : this._selectedDiv;

    if(!div) { return; }

    if(!this.isSlideObject(div)) {
        return;
    }

    if(div.parentNode) {
        if(div == this._selectedDiv) {
            if(this.isEditable(div)) {
                this._replaceEditorContent();
            }
            this._deselectComponent();
        }
        div.parentNode.removeChild(div);
    }
};


ZmSlideEditView.prototype.runSlideShow =
function() {
    var content = [];
    var idx = 0;

    idx = this.getSlideHTML(content, idx, true);

    var winname = "_new";
    var winfeatures = [
        "width=",(window.outerWidth || 640),",",
        "height=",(window.outerHeight || 480),",",
        "fullscreen=yes"
    ].join("");
    //"resizable,toolbar=no,menubar=no,fullscreen=yes,location=no,status=no"

    var win = open("", winname, winfeatures);

    var head = [];

    head.push('<link href="' +  window.contextPath + '/css/slides.css" rel="stylesheet" type="text/css" />');
    head.push('<script language="javascript" src="' +  window.contextPath + '/public/slides/presentation.js"></script>');
    head.push('<style>');
    head.push('.slide {');
    head.push('font-size: 32px;');
    head.push('overflow: hidden;');
    head.push('}');
    head.push('body {');
    head.push('background-color: #000000;');
    head.push('}');
    head.push('</style>');

    var doc = win.document;

    doc.open();
    doc.write("<head>")
    doc.write(head.join(""));
    doc.write("</head>")
    doc.write("<body>")
    doc.write(content.join(""));
    doc.write("</body>")
    doc.close();

};

ZmSlideEditView.prototype.getSlideHTML =
function(content, idx, generateEndSlide) {

    var i = 0;

    if(this._previewContainer.firstChild) {
        var node = this._previewContainer.firstChild;
        while(node) {

            var previewNode = node.firstChild;

            if(previewNode && (previewNode.className == "preview") ) {
                var zindex = Dwt.Z_VIEW;
                content[idx++] = ["<div class='slide' style='width:100%;height:100%;position:absolute;left:0%;top:0%;z-index:", zindex, ((i!=0)?";display:none;":"") ,"'>"].join("");
                content[idx++]  = previewNode.innerHTML;
                DBG.println("zz slide content:" + previewNode.innerHTML);
                content[idx++] = '</div>';
                i++;

            }
            node = node.nextSibling;
        }

    }

	//end slide content
    if(generateEndSlide) {
        content[idx++] = ["<div class='endslide' id='endslide' style='width:100%;height:100%;position:absolute;left:0%;top:0%;display: none;z-index:", (Dwt.Z_VIEW), "'>"].join("");
        content[idx++]  = "<center>" + ZmMsg.slides_endSlideMsg + "</center>";
        content[idx++] = '</div>';
    }

    //master slide content
    content[idx++] = ["<div class='masterslide' style='width:100%;height:100%;position:absolute;left:0%;top:0%;z-index:", (Dwt.Z_VIEW-10), "'>"].join("");
    content[idx++]  = this._currentSlideThemeDiv.innerHTML;
    content[idx++] = '</div>';
    return idx;
};

ZmSlideEditView.prototype.saveFile =
function() {
    var content = [];
    var idx = 0;
    idx = this.getSlideHTML(content, idx);
    window.fileInfo.content = content.join("");
    window.fileInfo.contentType = ZmSlideEditView.APP_ZIMBRA_PPT;
    this._docMgr.setSaveCallback(new AjxCallback(this, this._saveHandler));
    this._docMgr.saveDocument(window.fileInfo);
};

ZmSlideEditView.prototype._saveHandler =
function(files) {
    if(files && files.length > 0) {
        window.fileInfo.id = files[0].id;
        window.fileInfo.version = files[0].ver;
    }

};

ZmSlideEditView.prototype.loadData =
function(id) {
    return this._docMgr.getItemInfo({id:id});
};

ZmSlideEditView.prototype.loadSlide =
function(item) {
    var content = this._docMgr.fetchDocumentContent(item);
    if(content) {
        this._slideParserDiv = document.createElement("div")
        this._slideParserDiv.style.display = "none";
        this.getHtmlElement().appendChild(this._slideParserDiv);
        this._slideParserDiv.innerHTML = content;
        this.parseSlideContent();
    }
};

ZmSlideEditView.prototype.parseSlideContent =
function() {
    var node = this._slideParserDiv.firstChild;

    this.createSlide(true);

    while(node) {
        if(node.className == "slidemaster") {
            this._currentSlideThemeDiv.innerHTML = node.innerHTML;
        }
        node = node.nextSibling;
    }
    node = this._slideParserDiv.firstChild;
    while(node) {
        var isSlide = (node.className == "slide");
        if(isSlide) {
            this.createPreviewSlide();
            this._currentPreviewSlideDiv.innerHTML = node.innerHTML;
            this._currentPreviewSlideThemeDiv.innerHTML = this._currentSlideThemeDiv.innerHTML;
        }
        node = node.nextSibling;
    }

    node = this._slideParserDiv.firstChild;
    while(node) {
        var nextNode = node.nextSibling;
        node.parentNode.removeChild(node);
        node = nextNode;
    }

    var firstSlideParent = this._previewContainer.firstChild;
    var firstPreviewSlide = firstSlideParent ? firstSlideParent.firstChild : null;
    var firstPreviewThemeSlide = firstPreviewSlide ? firstPreviewSlide.nextSibling : null;

    if(firstPreviewSlide) {
        this._currentSlideDiv.innerHTML = firstPreviewSlide.innerHTML;
    }

    if(firstPreviewThemeSlide) {
        this._currentSlideThemeDiv.innerHTML = firstPreviewThemeSlide.innerHTML;
    }

    this._slideParserDiv.parentNode.removeChild(this._slideParserDiv);

};

ZmSlideEditView.prototype.isSlideObject =
function(div) {
    if(!div){ return false; }
    var className = div.className + ",";
    var str = ZmSlideEditView.SLIDE_OBJECTS.join(",") + ",";
    return (str.indexOf(className) >= 0);
};

ZmSlideEditView.prototype._getActionDiv =
function(div) {

    var type = this._getItemData(div, "type");
    if(type) {
        return div;
    }

    while(div && !this.isActionDiv(div)) {
        div = div.parentNode;
    }
    return div;
};

ZmSlideEditView.prototype.isActionDiv =
function(div) {
    if(!div.className) {
        return false;
    }

    var className = div.className;
    return ((className.indexOf("slide") >= 0) || (className.indexOf("preview")>=0))
};

