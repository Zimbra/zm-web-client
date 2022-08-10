/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @param {hash} params Constructor parameters.
 * @param {DwtComposite} params.parent Parent control.
 * @param {string} params.image Item image to display next to each color choice.
 * @param {boolean} params.hideNone True to hide the "None" option.
 * @param {boolean} params.hideNoFill True to hide the no-fill/use-default option.
 */
ZmColorMenu = function(params) {
    if (arguments.length == 0) return;
    params.className = params.className || "ZmColorMenu DwtMenu";
    DwtMenu.call(this, params);
    this._hideNone = params.hideNone;
    this._hideNoFill = params.hideNoFill;
    this.setImage(params.image);
    this._populateMenu();
};
ZmColorMenu.prototype = new DwtMenu;
ZmColorMenu.prototype.constructor = ZmColorMenu;

ZmColorMenu.prototype.toString = function() {
    return "ZmColorMenu";
};

//
// Constants
//

ZmColorMenu.__KEY_COLOR = "color";

//
// Public methods
//

ZmColorMenu.prototype.setImage = function(image) {
    if (this._image != image) {
        this._image = image;
        var children = this.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var color = child.getData(ZmColorMenu.__KEY_COLOR);
			var displayColor = color || ZmOrganizer.COLOR_VALUES[ZmOrganizer.ORG_DEFAULT_COLOR]; //default to gray
            var icon = [image, displayColor].join(",color=");
            child.setImage(icon);
        }
    }
};
ZmColorMenu.prototype.getImage = function() {
    return this._image;
};

ZmColorMenu.prototype.getTextForColor = function(color) {
    color = String(color).toLowerCase();
    if (!color.match(/^#/)) color = ZmOrganizer.COLOR_VALUES[color];
    var children = this.getChildren();
    for (var i = 0; i < children.length; i++) {
        var mi = children[i];
        if (mi.getData(ZmColorMenu.__KEY_COLOR) == color) {
            return mi.getText();
        }
    }
    return ZmMsg.custom;
};

ZmColorMenu.prototype.showMoreColors = function() {
    if (this.parent && this.parent.getMenu() == this) {
        var menu = this.parent.getMenu();
        var moreMenu = this._getMoreColorMenu();
        this.parent.setMenu(moreMenu);
        if (menu.isPoppedUp()) {
            var loc = menu.getLocation();
            menu.popdown();
            moreMenu.popup(0, loc.x, loc.y);
        }
        else {
            this.parent.popup();
        }
    }
};

ZmColorMenu.prototype.showLessColors = function() {
    if (this.parent && this.parent.getMenu() != this) {
        var menu = this.parent.getMenu();
        this.parent.setMenu(this);
        if (menu.isPoppedUp()) {
            var loc = menu.getLocation();
            menu.popdown();
            this.popup(0, loc.x, loc.y);
        }
        else {
            this.parent.popup();
        }
    }
};

//
// DwtMenu methods
//

ZmColorMenu.prototype.addSelectionListener = function(listener) {
    DwtMenu.prototype.addSelectionListener.apply(this, arguments);
    this._getMoreColorMenu().addSelectionListener(listener);
};
ZmColorMenu.prototype.removeSelectionListener = function(listener) {
    DwtMenu.prototype.removeSelectionListener.apply(this, arguments);
    this._getMoreColorMenu().removeSelectionListener(listener);
};

//
// Protected methods
//

ZmColorMenu.prototype._populateMenu = function() {
    var list = ZmOrganizer.COLOR_VALUES;
    for (var id = 0; id < list.length; id++) {
        var color = ZmOrganizer.COLOR_VALUES[id];
        if (!color && this._hideNone) continue;
		var displayColor = color || ZmOrganizer.COLOR_VALUES[ZmOrganizer.ORG_DEFAULT_COLOR]; //default to gray
        var image = this._image ? [this._image, displayColor].join(",color=") : null;
        var text = ZmOrganizer.COLOR_TEXT[id];
        var menuItemId = "COLOR_" + id;
        var menuItem = new DwtMenuItem({parent:this, id:menuItemId});
        menuItem.setImage(image);
        menuItem.setText(text);
        menuItem.setData(ZmOperation.MENUITEM_ID, id);
        menuItem.setData(ZmColorMenu.__KEY_COLOR, color);
    }
    var callback = new AjxCallback(this, this.showMoreColors); 
    var showMoreItem = new ZmColorMenuItem({parent:this,callback:callback, id:"SHOW_MORE_ITEMS"});
    showMoreItem.setText(ZmMsg.colorsShowMore);
};

ZmColorMenu.prototype._getMoreColorMenu = function() {
    if (!this._moreMenu) {
        var callback = new AjxCallback(this, this.showLessColors);
        this._moreMenu = new ZmMoreColorMenu({parent:this.parent,callback:callback,hideNoFill:this._hideNoFill});
    }
    return this._moreMenu;
};

//
// Classes
//

ZmMoreColorMenu = function(params) {
    params.style = DwtMenu.COLOR_PICKER_STYLE;
    DwtMenu.call(this, params);
    this._colorPicker = new DwtColorPicker({parent:this,hideNoFill:params.hideNoFill});
    this._colorPicker.getData = this.__DwtColorPicker_getData; // HACK
    var showLessItem = new ZmColorMenuItem({parent:this,callback:params.callback});
    showLessItem.setText(ZmMsg.colorsShowLess);
};
ZmMoreColorMenu.prototype = new DwtMenu;
ZmMoreColorMenu.prototype.constructor = ZmMoreColorMenu;

ZmMoreColorMenu.prototype.toString = function() {
    return "ZmMoreColorMenu";
};

/**
 * <strong>Note:</strong>
 * This method is run in the context of the color picker!
 *
 * @private
 */
ZmMoreColorMenu.prototype.__DwtColorPicker_getData = function(key) {
    // HACK: This is to fake the color picker as a menu item whose
    // HACK: id is the selected color.
    if (key == ZmOperation.MENUITEM_ID) {
        return this.getInputColor();
    }
    return DwtColorPicker.prototype.getData.apply(this, arguments);
};

ZmMoreColorMenu.prototype.setDefaultColor = function(color) {
    this._colorPicker.setDefaultColor(color);
}

/**
 * A custom menu item class for the "More colors..." and
 * "Fewer colors..." options which should not leave space for
 * an image next to the text. A sub-class is also needed so
 * that we can avoid the default handling of the item click.
 *
 * @param params
 */
ZmColorMenuItem = function(params) {
    DwtMenuItem.call(this, params);
    this.callback = params.callback;
    // HACK: This is needed because we no-op the add/removeSelectionListener
    // HACK: methods so that external people can't register listeners but we
    // HACK: still want to handle a true selection to call the callback.
    DwtMenuItem.prototype.addSelectionListener.call(this, new AjxListener(this, this.__handleItemSelect));
};
ZmColorMenuItem.prototype = new DwtMenuItem;
ZmColorMenuItem.prototype.constructor = ZmColorMenuItem;

ZmColorMenuItem.prototype.toString = function() {
    return "ZmColorMenuItem";
};

ZmColorMenuItem.prototype.TEMPLATE = "zimbra.Widgets#ZmColorMenuItem";

// DwtMenuItem methods

ZmColorMenuItem.prototype.addSelectionListener = function() {}; // no-op
ZmColorMenuItem.prototype.removeSelectionListener = function() {}; // no-op

ZmColorMenuItem.prototype.__handleItemSelect = function() {
    if (this.callback) {
        this.callback.run();
    }
};
