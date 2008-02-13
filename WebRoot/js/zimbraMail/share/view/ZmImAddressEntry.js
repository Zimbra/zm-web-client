/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

// simple widget to allow input of one IM address.  Services are
// displayed in a drop-down.  Service types, labels and parsing
// routines are defined in ../model/ZmImAddress.js

ZmImAddressEntry = function(parent) {
        DwtComposite.call(this, {parent:parent, className:"ZmImAddressEntry"});
        this._init();
};

ZmImAddressEntry.prototype = new DwtComposite;
ZmImAddressEntry.prototype.constructor = ZmImAddressEntry;

ZmImAddressEntry.prototype._init = function() {
        var html = [ "<table><tr>",
                     "<td id='", this._idSelect = Dwt.getNextId(), "'></td>",
                     "<td id='", this._idInput = Dwt.getNextId(), "'></td>",
                     "</tr></table>"
                   ].join("");
        this.setContent(html);

        var options = [
                new DwtSelectOption(
                        "_NONE",
                        true,
                        ZmMsg.none
                )
        ];
        var services = ZmImAddress.IM_SERVICES;
        for (var i = 0; i < services.length; ++i)
                options.push(
                        new DwtSelectOption(
                                services[i].value,
                                i == 0,
                                services[i].label
                        )
                );

        this._selectService = new DwtSelect({parent:this, options:options});
        this._selectService.reparentHtmlElement(this._idSelect);
        this._selectService.addChangeListener(new AjxListener(this, this._on_selectService_change));

        this._inputScreenName = new DwtInputField({ parent: this });
        this._inputScreenName.reparentHtmlElement(this._idInput);
        this._inputScreenName.setEnabled(false);

        var dropTgt = new DwtDropTarget([ "ZmRosterItem" ]);
	this.setDropTarget(dropTgt);
        this._selectService.setDropTarget(dropTgt);
        this._inputScreenName.setDropTarget(dropTgt);
	dropTgt.addDropListener(new AjxListener(this, this._dropListener));
};

ZmImAddressEntry.prototype.setValue = function(addr) {
        addr = ZmImAddress.parse(addr);
        this._selectService.setSelectedValue(addr ? addr.service : "_NONE");
        this._inputScreenName.setValue(addr ? addr.screenName : "");
        this._inputScreenName.setEnabled(!!addr);
};

ZmImAddressEntry.prototype.getValue = function() {
        return ZmImAddress.make(this._selectService.getValue(),
                                this._inputScreenName.getValue());
};

ZmImAddressEntry.prototype._on_selectService_change = function() {
        var enabled = this._selectService.getValue() != "_NONE";
        this._inputScreenName.setEnabled(enabled);
        if (enabled)
                this._inputScreenName.focus();
};

ZmImAddressEntry.prototype._dropListener = function(ev) {
        if (ev.action == DwtDropEvent.DRAG_DROP) {
		var item = ev.srcData;
                if (item instanceof ZmRosterItem) {
		        var roster = AjxDispatcher.run("GetRoster");
                        var addr = roster.makeGenericAddress(item.getAddress());
                        if (addr)
                                this.setValue(addr);
                }
	}
};
