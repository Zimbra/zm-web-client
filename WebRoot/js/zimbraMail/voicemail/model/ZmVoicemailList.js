/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates an empty list of voicemails.
* @constructor
* @class
* This class represents a list of voicemails.
*
* @author Dave Comfort
* @param appCtxt	global app context
* @param search		the search that generated this list
*/
function ZmVoicemailList(appCtxt, search) {
	ZmList.call(this, ZmItem.VOICEMAIL, appCtxt, search);
};

ZmVoicemailList.prototype = new ZmList;
ZmVoicemailList.prototype.constructor = ZmVoicemailList;

ZmVoicemailList.prototype.toString = 
function() {
	return "ZmVoicemailList";
};

// Create a fake search.
ZmVoicemailList.searchHACK =
function(appCtxt, folderType) {
	var params = { 
		query:"DemoVoicemailSearch",
		types: AjxVector.fromArray([ZmItem.VOICEMAIL]),
		sortBy: appCtxt.get(ZmSetting.SORTING_PREF, ZmController.TRAD_VIEW)
	};
	var search = new ZmSearch(appCtxt, params);	
	
	var searchResult = new ZmSearchResult(appCtxt, search);
	var response = { };
	if (folderType == ZmVoicemailFolder.VOICEMAIL) {
		response.v = [
			{ caller: "858-693-6165", callerName: "Otis Smith", date: new Date(), duration: new Date(61000), isUnheard: true, soundUrl:'../../public/SoundPlayer/morning.wav' },
			{ caller: "946-272-6245", callerName: "Rufus Jones", date: new Date(2007, 0, 15), duration: new Date(654321), isUnheard: true, soundUrl:'../../public/SoundPlayer/postal.wav' },
			{ caller: "946-272-6245", callerName: "Rufus Jones", date: new Date(2007, 0, 12), duration: new Date(12300), isUnheard: false, soundUrl:'../../public/SoundPlayer/smokers.wav' },
			{ caller: "946-272-6245", callerName: "Rufus Jones", date: new Date(2007, 0, 2), duration: new Date(25000), isUnheard: false, soundUrl:'../../public/SoundPlayer/yogurt.wav' },
			{ caller: "650-462-2266", callerName: "", date: new Date(2007, 0, 1), duration: new Date(15500), isUnheard: false, soundUrl:'../../public/SoundPlayer/mutlylaf.wav' }
		];
	} else if (folderType == ZmVoicemailFolder.PLACED_CALL) {
		response.v = [
			{ caller: "858-693-6165", callerName: "Otis Smith", date: new Date(), duration: new Date(21000) },
			{ caller: "757-573-8865", callerName: "", date: new Date(2007, 1, 15), duration: new Date(654321) },
			{ caller: "858-693-6165", callerName: "Otis Smith", date: new Date(2007, 1, 11), duration: new Date(125000)  },
			{ caller: "946-272-6245", callerName: "Rufus Jones", date: new Date(2007, 1, 8), duration: new Date(112300) },
			{ caller: "757-573-8865", callerName: "", date: new Date(2007, 1, 7), duration: new Date(175500) }
		];
	} else if (folderType == ZmVoicemailFolder.ANSWERED_CALL) {
		response.v = [
			{ caller: "858-693-6165", callerName: "Otis Smith", date: new Date(), duration: new Date(41000) },
			{ caller: "757-573-8865", callerName: "", date: new Date(2007, 1, 15), duration: new Date(854321) },
		];
	} else {
		response.v = [
			{ caller: "858-693-6165", callerName: "Otis Smith", date: new Date(), duration: new Date(21000) },
			{ caller: "757-573-8865", callerName: "", date: new Date(2007, 1, 15), duration: new Date(554321) },
			{ caller: "858-693-6165", callerName: "Otis Smith", date: new Date(2007, 1, 11), duration: new Date(625000)  },
		];
	}
	for (var i = 0, count = response.v.length; i < count; i++) {
		response.v[i].id = "vm" + i;
	}
	searchResult.set(response);
	return searchResult;
};

