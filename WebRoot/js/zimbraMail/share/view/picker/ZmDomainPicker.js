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

ZmDomainPicker = function(parent) {

	ZmPicker.call(this, parent, ZmPicker.DOMAIN);

    this._checkedItems = {};
    ZmDomainPicker._instance = this;

	this._searchAction = new AjxTimedAction(null, this._search);
	this._searchActionId = -1;
}

ZmDomainPicker.prototype = new ZmPicker;
ZmDomainPicker.prototype.constructor = ZmDomainPicker;

ZmPicker.CTOR[ZmPicker.DOMAIN] = ZmDomainPicker;

ZmDomainPicker.LIMIT = 20;

ZmDomainPicker._onClick =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var picker = ZmDomainPicker._instance;
	if (el.checked) {
		picker._checkedItems[el.value] = 1;
	} else {
		delete picker._checkedItems[el.value];
 	}
	picker._updateQuery();
};

ZmDomainPicker._onChange =
function(ev) {
	var element = DwtUiEvent.getTarget(ev);
	var picker = ZmDomainPicker._instance;
	picker._updateDomains();
	picker._updateQuery();
};

/**
 * Handler to run on input into the text box. Waits for a pause of 300ms, then
 * runs a domain search and displays the results.
 */
ZmDomainPicker._onKeyUp =
function(ev) {
	var picker = ZmDomainPicker._instance;

	// reset (cancel and create) timer on any text field key activity
	if (picker._searchActionId != -1) {
		AjxTimedAction.cancelAction(picker._searchActionId);
		picker._searchActionId = -1;
	}
	picker._searchAction.obj = picker;
	picker._searchAction.args = [picker._textField.value];
	DBG.println(AjxDebug.DBG2, "scheduling domain search");
	picker._searchActionId = AjxTimedAction.scheduleAction(picker._searchAction, 300);
};

ZmDomainPicker.prototype.toString = 
function() {
	return "ZmDomainPicker";
};

ZmDomainPicker.prototype._domainHtml =
function(domain, html, idx) {
	var divId = this._divIds[domain] = Dwt.getNextId();
	var inputId = this._inputIds[domain] = Dwt.getNextId();	
	html[idx++] = "<div id='";
	html[idx++] = divId;
	html[idx++] = "'><table cellpadding='0' cellspacing='0' border='0'><tr valign='middle'>";
	html[idx++] = "<td align='left'><input type='checkbox' id='";
	html[idx++] = inputId;
	html[idx++] = "'></input></td><td align='left' nowrap>";
	html[idx++] = domain;
	html[idx++] = "</td></tr></table></div>";
	return idx;
};

ZmDomainPicker.prototype._setupPicker =
function(parent) {
    this._elements = {};
	this._divIds = {};
	this._inputIds = {};
    var picker = new DwtComposite(parent);
	var fromId = Dwt.getNextId();
	var toId = Dwt.getNextId();
	var textFieldId = Dwt.getNextId();
	var domainsDivId = Dwt.getNextId();
	var size = 15;
    var html = [];
    var idx = 0;

	html[idx++] = "<table cellpadding='3' cellspacing='0' border='0' style='width:100%;'>";
	html[idx++] = "<tr>";
    html[idx++] = "<td align='right' nowrap>";
	html[idx++] = AjxMessageFormat.format(ZmMsg.makeLabel, ZmMsg.search);
	html[idx++] = "</td>";
    html[idx++] = "<td align='left' nowrap><input type='text' autocomplete='off' nowrap size='";
	html[idx++] = size;
	html[idx++] = "' id='";
	html[idx++] = textFieldId;
	html[idx++] = "'/></td>";
	html[idx++] = "</tr>";
	html[idx++] = "<tr align='center' valign='middle'>";
	html[idx++] = "<td align='left'><input type='checkbox' checked id='" + fromId + "'/> " + ZmMsg.from + "</td>";
	html[idx++] = "<td align='left'><input type='checkbox' id='" + toId + "'/> " + ZmMsg.toCc + "</td>";
	html[idx++] = "</tr>";
	html[idx++] = "<tr>";
	html[idx++] = "<td nowrap align='left' colspan='2'><hr /></td>";
	html[idx++] = "</tr></table>";
	html[idx++] = "<div id='";
	html[idx++] = domainsDivId;
	html[idx++] = "'></div>";

	this._picker.getHtmlElement().innerHTML = html.join("");

	var from = this._from = document.getElementById(fromId);
	Dwt.setHandler(from, DwtEvent.ONCHANGE, ZmDomainPicker._onChange);
	var to = this._to = document.getElementById(toId);
	Dwt.setHandler(to, DwtEvent.ONCHANGE, ZmDomainPicker._onChange);
	var text = this._textField = document.getElementById(textFieldId);
	Dwt.setHandler(text, DwtEvent.ONKEYUP, ZmDomainPicker._onKeyUp);
	this._domainsDiv = document.getElementById(domainsDivId);

	this._search();
};

ZmDomainPicker.prototype._search =
function(str) {
	respCallback = new AjxCallback(this, this._handleResponseSearch);
	ZmDomainTree.search(str, ZmDomainPicker.LIMIT, respCallback);
};

ZmDomainPicker.prototype._handleResponseSearch =
function(domains) {
	ZmDomainPicker.domains = domains;
	this._showDomains(domains)
};

ZmDomainPicker.prototype._showDomains =
function(domains) {
	var html = [];
	var idx = 0;
	for (var i in domains) {
		idx = this._domainHtml(domains[i].name, html, idx);
	}
	this._domainsDiv.innerHTML = html.join("");

	for (var i in domains) {
		var domain = domains[i];
		var ip = document.getElementById(this._inputIds[domain.name]);
		Dwt.setHandler(ip, DwtEvent.ONCLICK, ZmDomainPicker._onClick);
		ip.value = domain.name;
		ip._div = document.getElementById(this._divIds[domain.name]);
		this._elements[domain.name] = ip;
	}	

	this._updateDomains();
};

ZmDomainPicker.prototype._updateDomains = 
function(domains) {
	var domains = ZmDomainPicker.domains;
	for (var i in domains) {
		var domain = domains[i];
		var el = this._elements[domain.name];
		var newVisible = (this._from.checked && domain.hasFrom) ||
						 (this._to.checked && (domain.hasTo || domain.hasCc));
		if (Dwt.getVisible(el._div) != newVisible) {
			Dwt.setVisible(el._div, newVisible);
		}
		el.checked = false;
	}
    this._checkedItems = {};	
};

ZmDomainPicker.prototype._updateQuery = 
function() {
	var domains = new Array(10);
	var query = new Array(10);
	var idx = 0;
	var num = 0;

	var headers = [];
	if (this._from.checked) {
		headers.push("from");
	}
	if (this._to.checked) {
		headers.push("to", "cc");
	}
	var numHeaders = headers.length;

	if (numHeaders == 0) {
		this.setQuery("");
		this.execute();
		return;
 	}
 	
	domains[idx++] = "("
	for (var domain in this._checkedItems) {
		if (num++ > 0) {
			domains[idx++] = " OR ";
		}
		domains[idx++] = "@" + domain;
	}
	
	if (num > 0) {
		domains[idx++] = ")";	
		var domainExpr = domains.join("");// join with " OR " instead?
		idx = 0;
		if (numHeaders > 1) {
			query[idx++] = "(";
		}
		for (var h in headers) {
			if (h > 0) {
				query[idx++] = " OR ";
			}
			query[idx++] = headers[h];
			query[idx++] = ":";
			query[idx++] = domainExpr;			
		}			
		if (numHeaders > 1) {
			query[idx++] = ")";
		}
		this.setQuery(query.join(""));
	} else {
		this.setQuery("");
	}
	this.execute();
};
