/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmColorButton = function(params) {

    if (arguments.length == 0) {
	    return;
    }

    DwtButton.call(this, params);
    var menu = new ZmColorMenu({parent:this,hideNone:params.hideNone});
    menu.addSelectionListener(new AjxListener(this, this._handleSelection));
    this.setMenu(menu);
    this._colorMenu = menu;
	this._labelId = params.labelId;
};

ZmColorButton.prototype = new DwtButton;
ZmColorButton.prototype.constructor = ZmColorButton;

ZmColorButton.prototype.isZmColorButton = true;
ZmColorButton.prototype.toString = function() { return "ZmColorButton"; };

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

	var standardColorCode = ZmOrganizer.getStandardColorNumber(color),
		colorMenuItemId;

	if (standardColorCode !== -1) {
		this._color = standardColorCode;
		colorMenuItemId = 'COLOR_' + standardColorCode;
	}
	else {
        this._color = color;
	}
    var image = this.getImage();
    if (image) {
        image = image.replace(/,.*$/, "");
		var displayColor = this._color || ZmOrganizer.COLOR_VALUES[ZmOrganizer.ORG_DEFAULT_COLOR]; //default to gray
        this.setImage([image, this._color].join(",color="), true);
    }
    this.setText(this._colorMenu.getTextForColor(this._color));

	if (colorMenuItemId) {
		this.removeAttribute('aria-label');
		this.setAttribute('aria-labelledby', [ this._labelId, colorMenuItemId ].join(' '));
	}
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
