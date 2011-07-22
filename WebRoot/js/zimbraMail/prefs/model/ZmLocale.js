/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2009, 2010 Zimbra, Inc.
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

/**
 * Default constructor.
 * @class
 * This class represents a locale.
 * 
 * @param	{String}	id		the id
 * @param	{String}	name	the name
 * @param	{String}	image	the image
 * 
 * @see		ZmLocale.create
 */
ZmLocale = function(id, name, image) {
	this.id = id;
	this.name = name;
	this._image = image;
};

ZmLocale.localeMap = {};
ZmLocale.languageMap = {};

/**
 * Creates the locale.
 * 
 * @param	{String}	id		the locale id (for example, <code>en_US</code>)
 * @param	{String}	name	the locale name
 */
ZmLocale.create =
function(id, name) {
	var index = id.indexOf("_");
	var languageId;
	if (index == -1) {
		languageId = id;
	} else {
		languageId = id.substr(0, index);
	}
	var languageObj = ZmLocale.languageMap[languageId];
	if (!languageObj) {
		languageObj = new ZmLocale(languageId, name, null);
		ZmLocale.languageMap[languageId] = languageObj;
		ZmLocale.localeMap[id] = languageObj;
	}
	if (index != -1) {
		var country = id.substring(id.length - 2);
		var localeObj = new ZmLocale(id, name, "Flag" + country); 
		languageObj._add(localeObj);
		ZmLocale.localeMap[id] = localeObj;
		return localeObj;
	} else {
		languageObj.name = name;
		return languageObj;
	}
};

/**
 * Checks if there are more than one selectable locale.
 * 
 * @return	{Boolean}	<code>true</code> if there are more than one selectable locale
 */
ZmLocale.hasChoices =
function() {
	var count = 0;
	for (var id in ZmLocale.localeMap) {
		var locale = ZmLocale.localeMap[id]; 
		if (!locale.locales) {
			count++;
		}
		if (count >= 2) {
			return true;
		}
	}
	return false;
};

/**
 * Gets the image.
 * 
 * @return	{String}	the image
 */
ZmLocale.prototype.getImage =
function() {
	return this._image || this._getLanguageImage();
};

ZmLocale.prototype._add =
function(locale) {
	(this.locales = this.locales || []).push(locale);
};

ZmLocale.prototype._getLanguageImage =
function() {
	switch (this.id) {
		// Arabic was omitted from this list...not sure what country to use.
		case "sq": return "FlagAL"; // Albanian -> Albania
		case "be": return "FlagBY"; // Belarusian -> Belarus
		case "bg": return "FlagBG"; // Bulgarian -> Bulgaria
		case "ca": return "FlagES"; // Catalan -> Spain
		case "zh": return "FlagCN"; // Chinese -> China
		case "hr": return "FlagHR"; // Croatian -> Croatia
		case "cs": return "FlagCZ"; // Czech -> Czech Republic
		case "da": return "FlagDK"; // Danish -> Denmark
		case "nl": return "FlagNL"; // Dutch -> Netherlands
		case "en": return "FlagUS"; // English -> USA
		case "et": return "FlagEE"; // Estonian -> Estonia
		case "fi": return "FlagFI"; // Finnish -> Finland
		case "fr": return "FlagFR"; // French -> France
		case "de": return "FlagDE"; // German -> Germany
		case "el": return "FlagGR"; // Greek -> Greece
		case "iw": return "FlagIL"; // Hebrew -> Israel
		case "hi": return "FlagIN"; // Hindi -> India
		case "hu": return "FlagHU"; // Hungarian -> Hungary
		case "id": return "FlagID"; // Indonesian -> Indonesia
		case "is": return "FlagIS"; // Icelandic -> Iceland
		case "it": return "FlagIT"; // Italian -> Italy
		case "ja": return "FlagJP"; // Japanese -> Japan
		case "ko": return "FlagKR"; // Korean -> South Korea
		case "lv": return "FlagLV"; // Latvian -> Latvia
		case "lt": return "FlagLT"; // Lithuanian -> Lithuania
		case "mk": return "FlagMK"; // Macedonian -> Macedonia
		case "no": return "FlagNO"; // Norwegian -> Norway
		case "pl": return "FlagPL"; // Polish -> Poland
		case "pt": return "FlagPT"; // Portugese -> Portugal
		case "ro": return "FlagRO"; // Romanian -> Romania
		case "ru": return "FlagRU"; // Russian -> Russia
		case "sk": return "FlagSK"; // Slovak -> Slovakia
		case "sl": return "FlagSI"; // Slovenian -> Slovenia
		case "es": return "FlagES"; // Spanish -> Spain
		case "sv": return "FlagSE"; // Swedish -> Sweden
		case "th": return "FlagTH"; // Thai -> Thailand
		case "tr": return "FlagTR"; // Turkish -> Turkey
		case "uk": return "FlagUA"; // Ukrainian -> Ukraine
		case "vi": return "FlagVN"; // Vietnamese -> Vietnam
		default: return "FlagNone";
	}
};
