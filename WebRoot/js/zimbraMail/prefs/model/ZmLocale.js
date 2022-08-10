/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
 * @param	{String}	localName	the name in user's locale
 *
 * @see		ZmLocale.create
 */
ZmLocale = function(id, name, image, localName) {
	this.id = id;
	this.name = name;
	this.localName = localName;
	this._image = image;
};

//List of RTL supporting languages
ZmLocale.RTLLANGUAGES = {
    ar:"Arabic",
    iw:"Hebrew"
};

ZmLocale.localeMap = {};
ZmLocale.languageMap = {};

/**
 * Creates the locale.
 * 
 * @param	{String}	id		the locale id (for example, <code>en_US</code>)
 * @param	{String}	name	the locale name
 * @param	{String}	localName	the name in user's locale
 */
ZmLocale.create =
function(id, name, localName) {
	var index = id.indexOf("_");
	var languageId;
	var country = null;
	if (index == -1) {
		languageId = id;
	}
	else {
		languageId = id.substr(0, index);
		country = id.substring(id.length - 2);
	}

	var languageObj = ZmLocale.languageMap[languageId];
	if (!languageObj) {
		languageObj = new ZmLocale(languageId, name, null, localName);
		ZmLocale.languageMap[languageId] = languageObj;
		ZmLocale.localeMap[id] = languageObj;
	}
	if (country) {
		var localeObj = new ZmLocale(id, name, null, localName);
		languageObj._add(localeObj);
		ZmLocale.localeMap[id] = localeObj;
		return localeObj;
	}
	else {
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
	return this._image;
};

/**
 * Gets the name in both the locale itself, and in the local (user) locale. 
 *
 * @return	{String}	the name
 */
ZmLocale.prototype.getNativeAndLocalName =
function() {
	if (this.name == this.localName) {
		/* don't show both if they are the same - it looks extremely funny */
		return this.name;
	}
	return [this.localName, " - ", this.name].join("");
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
