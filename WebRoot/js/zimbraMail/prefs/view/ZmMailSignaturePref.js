/**
 * @class
 * @constructor
 */
function LmMailSignaturePref ( mId, labl, showSep){
    var htmlTempl ="<div id=%1><input id=%2 type='radio' %6 name='signature'>No Signature</input><div style='width:%wpx''><input id=%3 type='radio' %7 name='signature' style ='float:left'> <textarea  id=%4 wrap='on' rows='4' cols='60' style='float:right; width:380'>%5</textarea></div></div>";
    LmMailPref.call(this, mId, labl, htmlTempl, showSep, 
                    this.htmlReplaceCallback,
                    "defaultSig", this.onChangeHandler);
};

LmMailSignaturePref.prototype = new LmMailPref;
LmMailSignaturePref.prototype.coinstructor = LmMailSignaturePref;

LmMailSignaturePref.prototype.htmlReplaceCallback = function (id, value) {
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
    if (LsEnv.isIE) {
        html = html.replace("%w", 400);
    } else {
        html = html.replace("%w", 402);
    }
    //html = html.replace("%4", id);
    this.htmlId = id;
    this.setHtmlType(LmMailPref.HTML_TYPE_TEXT_AREA);
    return html;
};

LmMailSignaturePref.prototype.installEventListeners = function () {
    if (LsEnv.isIE) {
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
        LmMailPref.prototype.installEventListeners.call(this);
    }
};
LmMailSignaturePref.prototype._installEHandler = function ( elem ){
    if(elem) {
	elem.onchange = this.onChangeHandler;
        elem._targetField = this.targetField;
        elem._fieldName = this.modelId;
        elem._objId = this._internalId;
        LmMailPref._internalIds[this._internalId] = this;
    }
    return elem;

};

LmMailSignaturePref.prototype.onChangeHandler = function (event) {
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
    p = LmMailPref._internalIds[infoTarget._objId];


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
        p._evtMgr.notifyListeners(LmMailPref.PREF_CHANGE, e);
    }
};
