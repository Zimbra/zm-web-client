/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

/**
 * @class
 * @constructor
 */
function ZmMailSignaturePref ( mId, labl, showSep){
    var htmlTempl ="<div id=%1><input id=%2 type='radio' %6 name='signature'>No Signature</input><div style='width:%wpx''><input id=%3 type='radio' %7 name='signature' style ='float:left'> <textarea  id=%4 wrap='on' rows='4' cols='60' style='float:right; width:380'>%5</textarea></div></div>";
    ZmMailPref.call(this, mId, labl, htmlTempl, showSep, 
                    this.htmlReplaceCallback,
                    "defaultSig", this.onChangeHandler);
};

ZmMailSignaturePref.prototype = new ZmMailPref;
ZmMailSignaturePref.prototype.coinstructor = ZmMailSignaturePref;

ZmMailSignaturePref.prototype.htmlReplaceCallback = function (id, value) {
    var html = this.htmlTemplate.replace("%1", id); 
    //var html = this.htmlTemplate.replace("%1", this._textAreaId); 
    html = html.replace("%5", value);
    if ((value != null) && (value != "")){
        html = html.replace("%7", "checked");
        html = html.replace("%6", "");
    } else {
        html = html.replace("%7", "");
        html = html.replace("%6", "checked");
    }
    this._input1Id = Dwt.getNextId();
    this._input2Id = Dwt.getNextId();
    this._textAreaId = Dwt.getNextId();
    html = html.replace("%2", this._input1Id);
    html = html.replace("%3", this._input2Id);
    html = html.replace("%4", this._textAreaId);
    if (AjxEnv.isIE) {
        html = html.replace("%w", 400);
    } else {
        html = html.replace("%w", 402);
    }
    //html = html.replace("%4", id);
    this.htmlId = id;
    this.setHtmlType(ZmMailPref.HTML_TYPE_TEXT_AREA);
    return html;
};

ZmMailSignaturePref.prototype.installEventListeners = function () {
    if (AjxEnv.isIE) {
        var elem = null;
        var div =  document.getElementById(this.htmlId);
        this._installEHandler(div);
        var input1 = document.getElementById(this._input1Id);
        this._installEHandler(input1);
        var input2 =  document.getElementById(this._input2Id);
        this._installEHandler(input2);
        var ta =  document.getElementById(this._textAreaId);
        this._installEHandler(ta);
    } else {
        ZmMailPref.prototype.installEventListeners.call(this);
    }
};
ZmMailSignaturePref.prototype._installEHandler = function ( elem ){
    if(elem) {
	elem.onchange = this.onChangeHandler;
        elem._targetField = this.targetField;
        elem._fieldName = this.modelId;
        elem._objId = this._internalId;
        ZmMailPref._internalIds[this._internalId] = this;
    }
    return elem;

};

ZmMailSignaturePref.prototype.onChangeHandler = function (event) {
    var dwtEv = new DwtUiEvent();
    dwtEv.setFromDhtmlEvent(event);
    var targetFieldName = dwtEv.target._targetField;
    var fieldName = dwtEv.target._fieldName
    var p = null;
    if (event && event.currentTarget) {
        if (event.currentTarget != dwtEv.target) {
            infoTarget = event.currentTarget;
        }
    } else {
        infoTarget = this;
    }

    targetFieldName = infoTarget._targetField;
    fieldName = infoTarget._fieldName;
    p = ZmMailPref._internalIds[infoTarget._objId];


    // look myself up
    var value = "";
    var ta = null;
    var input2 = null;
    if (p != null){ 
        input2 = document.getElementById(p._input2Id);
        if (input2 != null) {
            if (input2.checked) {
                ta = document.getElementById(p._textAreaId);
                if (ta != null) {
                    value = ta.value;
                }
            } else {
                value = "";
            }
        }
    }
    var e = new Object();
    e.prefName = fieldName;
    e.newPrefValue = value;
    if ((p != null) && (p != void 0)){
        p._evtMgr.notifyListeners(ZmMailPref.PREF_CHANGE, e);
    }
};
