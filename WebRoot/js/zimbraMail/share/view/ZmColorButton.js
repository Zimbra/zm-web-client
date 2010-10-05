/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010 Zimbra, Inc.
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

ZmColorButton = function(params) {
    if (arguments.length == 0) return;
    DwtButton.call(this, params);
    var menu = new ZmColorMenu({parent:this});
    menu.addSelectionListener(new AjxListener(this, this._handleSelection));
    this.setMenu(menu);
    this._colorMenu = menu;
};
ZmColorButton.prototype = new DwtButton;
ZmColorButton.prototype.constructor = ZmColorButton;

ZmColorButton.prototype.toString = function() {
    return "ZmColorButton";
};

//
// Public methods
//

ZmColorButton.prototype.setImage = function(image, skipMenu) {
    DwtButton.prototype.setImage.apply(this, arguments);
    if (!skipMenu) {
        this._colorMenu.setImage(image);
    }
};

ZmColorButton.prototype.setValue = function(color) {
    this._color = color;
    var image = this.getImage();
    if (image) {
        image = image.replace(/,.*$/,"");
        this.setImage(this._color?[image,this._color].join(",color="):image, true);
    }
    this.setText(this._colorMenu.getTextForColor(this._color));
};


ZmColorButton.prototype.getValue = function() {
    return this._color;
};

//
// Protected methods
//

ZmColorButton.prototype._handleSelection = function(evt) {
    this.setValue(evt.item.getData(ZmOperation.MENUITEM_ID)); 
};