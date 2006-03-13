/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a key mapping.
* @constructor
* @class
* 
* @author Ross Dargahi
* @param keyMappings [Object, optional]
*
* @throws
*	ZmKeyMapException
*/
function ZmKeyMap(keyMappings) {
	if (!ZmKeyMap._inited) {
		ZmKeyMap._initUsKeyCodeMap();
		ZmKeyMap._inited = true;
	}
		
	keyMappings = (keyMappings) ? keyMappings : ZmKeyMap._DEF_MAPPINGS;
	
	// Builds key mapping FSA for each mapping
	this._fsas = new Object();
	for (var key in keyMappings) {
		if (key == "GLOBAL")
			continue;
		// Start with the global table. We will augment this for each mapping.
		var newFSA = ZmKeyMap._buildFSA(new Object(), ZmKeyMap._DEF_MAPPINGS["GLOBAL"]);
		try {
			newFSA = ZmKeyMap._buildFSA(newFSA, ZmKeyMap._DEF_MAPPINGS[key]);
			this._fsas[key] = newFSA;
		} catch (ex) {
			alert("EX: " + ex);
		}
	}

	DBG.dumpObj(this._fsas);
};

// Key names (localize?)

ZmKeyMap.CTRL  = "Ctrl+";
ZmKeyMap.ALT   = "Alt+";
ZmKeyMap.SHIFT = "Shift+";

ZmKeyMap.ARROW_DOWN = "ArrowDown";
ZmKeyMap.ARROW_LEFT = "ArrowLeft";
ZmKeyMap.ARROW_RIGHT = "ArrowRight";
ZmKeyMap.ARROW_UP = "ArrowUp";
ZmKeyMap.BACKSPACE = "Backspace";
ZmKeyMap.DELETE = "Del";
ZmKeyMap.END = "End";
ZmKeyMap.ENTER = "Enter";
ZmKeyMap.ESC = "Esc";
ZmKeyMap.HOME = "Home";
ZmKeyMap.PAGE_DOWN = "PgDown";
ZmKeyMap.PAGE_UP = "PgUp";
ZmKeyMap.SPACE = "Space";

ZmKeyMap.SEP   = ",";

// Key map action code contants
var i = 0;

ZmKeyMap.CANCEL = i++;
ZmKeyMap.DBG_NONE = i++;
ZmKeyMap.DBG_1 = i++;
ZmKeyMap.DBG_2 = i++;
ZmKeyMap.DBG_3 = i++;
ZmKeyMap.DBG_TIMING = i++;
ZmKeyMap.DEL = i++;
ZmKeyMap.NEW_APPT = i++;
ZmKeyMap.NEW_CALENDAR = i++;
ZmKeyMap.NEW_CONTACT = i++;
ZmKeyMap.NEW_FOLDER = i++;
ZmKeyMap.NEW_MESSAGE = i++;
ZmKeyMap.NEW_TAG = i++;
ZmKeyMap.NEXT_CONV = i++;
ZmKeyMap.NEXT_ITEM = i++;
ZmKeyMap.NEXT_PAGE = i++;
ZmKeyMap.OPEN = i++;
ZmKeyMap.PREV_CONV = i++;
ZmKeyMap.PREV_ITEM = i++;
ZmKeyMap.PREV_PAGE = i++;
ZmKeyMap.SAVE = i++;
ZmKeyMap.SELECT = i++;

ZmKeyMap.REPLY = i++;
ZmKeyMap.REPLY_ALL = i++;
ZmKeyMap.SEND = i++;

delete i;

/* Always specify Control, then Alt, then Shift. All Chars must be upper case
 * Note that "GLOBAL" is the global mapping and will be logically appended
 * to each defined mapping*/
ZmKeyMap._DEF_MAPPINGS = {
	GLOBAL: {
		"Alt+Shift+D,0": ZmKeyMap.DBG_NONE,
		"Alt+Shift+D,1": ZmKeyMap.DBG_1,
		"Alt+Shift+D,2": ZmKeyMap.DBG_2,
		"Alt+Shift+D,3": ZmKeyMap.DBG_3,
		"Alt+Shift+D,t": ZmKeyMap.DBG_TIMING,
		"Alt+N,A": ZmKeyMap.NEW_APPT,
		"Alt+N,L": ZmKeyMap.NEW_CALENDAR,
		"Alt+N,C": ZmKeyMap.NEW_CONTACT,
		"Alt+N,F": ZmKeyMap.NEW_FOLDER,
		"Alt+N,M": ZmKeyMap.NEW_MESSAGE,
		"Alt+N,T": ZmKeyMap.NEW_TAG,
		"Alt+S":   ZmKeyMap.SAVE,
		"Del":     ZmKeyMap.DEL,
		"Esc":     ZmKeyMap.CANCEL,
		"ArrowDown":  ZmKeyMap.NEXT_ITEM,
		"N":          ZmKeyMap.NEXT_ITEM,
		"ArrowUp":    ZmKeyMap.PREV_ITEM,
		"P":          ZmKeyMap.PREV_ITEM,
		"ArrowRight": ZmKeyMap.NEXT_PAGE,
		"ArrowLeft":  ZmKeyMap.PREV_PAGE
	},
	ZmComposeController: {
		"Alt+Shift+S": ZmKeyMap.SEND
	},
	ZmConvListController: {
		"Alt+R": ZmKeyMap.REPLY,
		"R": ZmKeyMap.REPLY,
		"Alt+Shift+R": ZmKeyMap.REPLY_ALL,
		"A": ZmKeyMap.REPLY_ALL,
		"Enter": ZmKeyMap.OPEN
	},
	ZmConvController: {
		"Alt+R": ZmKeyMap.REPLY,
		"R": ZmKeyMap.REPLY,
		"Alt+Shift+R": ZmKeyMap.REPLY_ALL,
		"A": ZmKeyMap.REPLY_ALL,
		"R": ZmKeyMap.REPLY,
		"Shift+ArrowRight": ZmKeyMap.NEXT_CONV,
		"Shift+ArrowLeft": ZmKeyMap.PREV_CONV
	}
};

ZmKeyMap._KEYCODES = new Array(); // Keycode map
ZmKeyMap._inited = false; // Initialize flag

ZmKeyMap.prototype.isTerminal =
function (keySeq, mappingName) {
	var mapping = this._fsas[mappingName];
	
	// TODO If there is no such mapping then consider this a terminal?
	if (!mapping)
		return true;
				
	var keySeqLen = keySeq.length;
	var tmpFsa = mapping;
	var key;
	for (var j = 0; j < keySeqLen; j++) {
		key = keySeq[j];

		if (!tmpFsa[key] || !tmpFsa[key].subMap)
			return true;

		tmpFsa = tmpFsa[key].subMap;		
	}
	
	return false;
}

ZmKeyMap.prototype.getActionCode =
function (keySeq, mappingName) {
	var mapping = this._fsas[mappingName];
	
	// TODO If there is no such mapping then consider this a terminal?
	if (!mapping)
		return true;
			
	var keySeqLen = keySeq.length;
	var tmpFsa = mapping;
	var key;
	for (var j = 0; j < keySeqLen && tmpFsa; j++) {
		key = keySeq[j];

		if (!tmpFsa[key])
			return null;
		
		if (j < keySeqLen - 1)
			tmpFsa = tmpFsa[key].subMap;		
	}

	if (tmpFsa[key].actionCode != null)
		return tmpFsa[key].actionCode;
	else 
		return null;
}

ZmKeyMap.prototype.keyCode2Char =
function(keyCode) {
	return ZmKeyMap._KEYCODES[keyCode];
}

ZmKeyMap._initUsKeyCodeMap =
function() {
	ZmKeyMap._KEYCODES[18]  = ZmKeyMap.ALT;
	ZmKeyMap._KEYCODES[40]  = ZmKeyMap.ARROW_DOWN;
	ZmKeyMap._KEYCODES[37]  = ZmKeyMap.ARROW_LEFT;
	ZmKeyMap._KEYCODES[39]  = ZmKeyMap.ARROW_RIGHT;
	ZmKeyMap._KEYCODES[38]  = ZmKeyMap.ARROW_UP;
	ZmKeyMap._KEYCODES[8]   = ZmKeyMap.BACKSPACE;
	ZmKeyMap._KEYCODES[17]  = ZmKeyMap.CTRL;
	ZmKeyMap._KEYCODES[46]  = ZmKeyMap.DELETE;
	ZmKeyMap._KEYCODES[35]  = ZmKeyMap.END;
	ZmKeyMap._KEYCODES[13]  = ZmKeyMap.ENTER;
	ZmKeyMap._KEYCODES[27]  = ZmKeyMap.ESC;
	ZmKeyMap._KEYCODES[34]  = ZmKeyMap.PAGE_DOWN;
	ZmKeyMap._KEYCODES[33]  = ZmKeyMap.PAGE_UP;
	ZmKeyMap._KEYCODES[145] = ZmKeyMap.SHIFT;
	ZmKeyMap._KEYCODES[32]  = ZmKeyMap.SPACE;
	
	// Function keys
	for (var i = 112; i < 124; i++) 
		ZmKeyMap._KEYCODES[i] = "F" + (i - 111);
	
	// Take advantage of the fact that keycode for capital letters are the 
	// same as the charcode values i.e. ASCII code
	for (var i = 65; i < 91; i++)
		ZmKeyMap._KEYCODES[i] = String.fromCharCode(i);

	// Numbers 0 - 9
	for (var i = 48; i < 58; i++)
		ZmKeyMap._KEYCODES[i] = String.fromCharCode(i);
		
	// punctuation
	ZmKeyMap._KEYCODES[222] = "'";
	ZmKeyMap._KEYCODES[189] = "-";
	ZmKeyMap._KEYCODES[188] = ",";
	ZmKeyMap._KEYCODES[190] = ".";
	ZmKeyMap._KEYCODES[191] = "/";
	ZmKeyMap._KEYCODES[186] = ";";
	ZmKeyMap._KEYCODES[219] = "[";
	ZmKeyMap._KEYCODES[220] = "\\";
	ZmKeyMap._KEYCODES[221] = "]";
	ZmKeyMap._KEYCODES[192] = "`";
	ZmKeyMap._KEYCODES[187] = "=";	
	
	// Setup the "is" methods
	ZmKeyMap.isAlpha = ZmKeyMap._isAlphaUs;
	ZmKeyMap.isNumeric = ZmKeyMap._isNumericUs;
	ZmKeyMap.isAlphanumeric = ZmKeyMap._isAlphanumericUs;
	ZmKeyMap.isPunctuation = ZmKeyMap._isPunctuationUs;
	ZmKeyMap.isUsableTextInputValue = ZmKeyMap.isUsableTextInputValueUs;
}

ZmKeyMap._isAlphaUs = 
function(keyCode) {
	if (keyCode > 64 && keyCode < 91)
		return true;
}

ZmKeyMap._isNumericUs = 
function(keyCode) {
	if (keyCode > 47 && keyCode < 58)
		return true;
}

ZmKeyMap._isAlphanumericUs = 
function(keyCode) {
	return (ZmKeyMap._isNumericUs(keyCode) || ZmKeyMap._isAlphaUs(keyCode));
}

ZmKeyMap._isPunctuationUs = 
function(keyCode) {
	switch (keyCode) {
		case 186:
		case 187:
		case 188:
		case 189:
		case 190:
		case 191:
		case 192:
		case 219:
		case 220:
		case 221:
		case 222:
			return true;
		default:
			return false;		
	}
}

ZmKeyMap.isUsableTextInputValueUs =
function(keyCode) {
	if (ZmKeyMap._isAlphanumericUs(keyCode) || ZmKeyMap._isPunctuationUs(keyCode) 
		|| ZmKeyMap._isAlphanumericUs(keyCode))
		return true;
		
	switch (keyCode) {
		case 37:
		case 39:
		case 8:
		case 45:
		case 46:
		case 35:
		case 13:
		case 27:
			return true;
			
		default:
			return false;
	}	
}

ZmKeyMap._buildFSA =
function(fsa, mapping) {
	for (var i in mapping) {
		//DBG.println("keySeq: " + i);
		var keySeq = i.split(",");
		var keySeqLen = keySeq.length;
		var tmpFsa = fsa;
		for (var j = 0; j < keySeqLen; j++) {
			var key = keySeq[j];
			DBG.println("Processing: " + key);
			
			/* If we have not visit this key before we will need to create a
			 * new ZmKeyMapItem object */
			if (!tmpFsa[key])
				tmpFsa[key] = new ZmKeyMapItem();

			if (j == keySeqLen - 1) {
				/* If this key has a submap, then it is illegal for it to also 
				 * have an action code. Throw an exception!*/
				 if (tmpFsa[key].subMap)
				 	throw new ZmMappingException(ZmKeyMapException.NON_TERM_HAS_ACTION, keySeqStr,
				 		"Attempting to add action code to non-terminal key sequence");
				
				/* We are at the last key in the sequence so we can bind the
				 * action code to it */
				DBG.println("BINDING: " + mapping[i]);
				tmpFsa[key].actionCode = mapping[i];
			} else {
				/* If this key has an action code, then it is illegal for it to also 
				 * have a submap. Throw an exception! */
				 if (tmpFsa[key].actionCode) {
				 	var tmp = new Array(j)
				 	for (var k = 0; k <= j; k++)
				 		tmp[k] = keySeq[k];
				 	throw new ZmMappingException(ZmKeyMapException.TERM_HAS_SUBMAP, keySeqStr,
				 		"Attempting to add submapping to terminal key sequence");
				}
				
				/* We have more keys in the sequence. If our subMap is null,
				 * then we need to create it to hold the new key sequences */
				if (!tmpFsa[key].subMap)
					tmpFsa[key].subMap = new Object();
				tmpFsa = tmpFsa[key].subMap;
			}			
		}
	}
	return fsa;
};

// Helper class
function ZmKeyMapItem() {
	this.actionCode = null;
	this.subMap = null;
};

function ZmKeyMapException(errorCode, keySeqStr, msg) {
	this.errorCode = errorCode;
	this._keySeqStr = keySeqStr;
	this._msg = msg;
}

ZmKeyMapException.NON_TERM_HAS_ACTION = 1;
ZmKeyMapException.TERM_HAS_SUBMAP = 2;

