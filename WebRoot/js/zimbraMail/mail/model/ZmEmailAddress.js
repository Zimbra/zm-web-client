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
 * The Original Code is: Zimbra Collaboration Suite.
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
* Creates a new ZmEmailAddress, either by parsing an email string or from component parts.
* @constructor
* @class
* This class represents an email address and defines some related constants. The class does not attempt full compliance
* with RFC2822, so there are limitations for some of the edge cases.
*
* @author Conrad Damon
* @param address	an email string, or just the address portion
* @param type		from, to, cc, bcc, or reply-to
* @param name		the personal name portion
* @param dispName	an abbreviated form of the name (not currently used)
*/
function ZmEmailAddress(address, type, name, dispName) {
	this.address = address;
	this.name = name;
	this.dispName = dispName;
	this.type = type || ZmEmailAddress.TO;
}

ZmEmailAddress.FROM			= 1;
ZmEmailAddress.TO			= 2;
ZmEmailAddress.CC			= 3;
ZmEmailAddress.BCC			= 4;
ZmEmailAddress.REPLY_TO		= 5;
ZmEmailAddress.LAST_ADDR	= 5;

ZmEmailAddress.TYPE_STRING = new Array();
ZmEmailAddress.TYPE_STRING[ZmEmailAddress.FROM]		= "from";
ZmEmailAddress.TYPE_STRING[ZmEmailAddress.TO]		= "to";
ZmEmailAddress.TYPE_STRING[ZmEmailAddress.CC]		= "cc";
ZmEmailAddress.TYPE_STRING[ZmEmailAddress.BCC]		= "bcc";
ZmEmailAddress.TYPE_STRING[ZmEmailAddress.REPLY_TO]	= "replyTo";

ZmEmailAddress.fromSoapType = new Array();
ZmEmailAddress.fromSoapType["f"] = ZmEmailAddress.FROM;
ZmEmailAddress.fromSoapType["t"] = ZmEmailAddress.TO;
ZmEmailAddress.fromSoapType["c"] = ZmEmailAddress.CC;
ZmEmailAddress.fromSoapType["b"] = ZmEmailAddress.BCC;
ZmEmailAddress.fromSoapType["r"] = ZmEmailAddress.REPLY_TO;

ZmEmailAddress.toSoapType = new Array();
ZmEmailAddress.toSoapType[ZmEmailAddress.FROM]		= "f";
ZmEmailAddress.toSoapType[ZmEmailAddress.TO]		= "t";
ZmEmailAddress.toSoapType[ZmEmailAddress.CC]		= "c";
ZmEmailAddress.toSoapType[ZmEmailAddress.BCC]		= "b";
ZmEmailAddress.toSoapType[ZmEmailAddress.REPLY_TO]	= "r";

ZmEmailAddress.SEPARATOR = "; ";			// used to join addresses
ZmEmailAddress.DELIMS = [';', ',', '\n'];	// recognized as address delimiters
ZmEmailAddress.IS_DELIM = new Object();
for (var i = 0; i < ZmEmailAddress.DELIMS.length; i++)
	ZmEmailAddress.IS_DELIM[ZmEmailAddress.DELIMS[i]] = true;

ZmEmailAddress.mailboxPat = /^((((((\s*[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))+)?(\s*<(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*)))>\s*))|(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*))))(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|)+)*\s*\)\s*))+)*\s*\)\s*))+)*\s*\)\s*))+)*\s*\)\s*))+)*\s*\)\s*)*)$/;	
ZmEmailAddress.addrAnglePat = /(\s*<(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*)))>\s*)/;
ZmEmailAddress.addrPat = /(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*)))/;
ZmEmailAddress.commentPat = /(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|)+)*\s*\)\s*))+)*\s*\)\s*))+)*\s*\)\s*))+)*\s*\)\s*))+)*\s*\)\s*)/;
ZmEmailAddress.phrasePat = /(((\s*[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))+)/;

ZmEmailAddress.boundAddrPat = /(\s*<?(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*)))>?\s*)$/;

/**
* Parses an email address string into its component parts. The parsing is adapted from the perl module 
* <a href="http://search.cpan.org/~cwest/Email-Address-1.2/lib/Email/Address.pm">Email::Address</a>. Check that out if you
* want to know how the gory regexes that do the parsing were built. They are based on RFC2822, but don't represent a full 
* implementation. We don't really need or want that, since we don't want to be overly restrictive or bloated. It was easier
* to just use the resulting regexes from the Perl module, rather than go through all the rigmarole of building them up from
* atoms. Plus, I get to use the word "rigmarole".
* 
* <p>If the address parses successfully, the current object's properties will be set.</p>
*/
ZmEmailAddress.parse =
function(str) {
	var str = AjxStringUtil.trim(str);
	// Do preliminary check for @ since we don't support local addresses, and as workaround for Mozilla bug
	// https://bugzilla.mozilla.org/show_bug.cgi?id=225094
	// Also check for . since we require FQDN
	var atIndex = str.indexOf('@');
	var dotIndex = str.lastIndexOf('.');
	var prelimOkay = ((atIndex != -1) && (dotIndex != -1) && (dotIndex > atIndex));
	if (!(prelimOkay && str.match(ZmEmailAddress.mailboxPat))) {
		DBG.println(AjxDebug.DBG1, "mailbox match failed: " + str);
		return null;
	}

	// Note: It would be nice if you could get back the matching parenthesized subexpressions from replace,
	// then we wouldn't have to do both a match and a replace. The parsing works by removing parts after it
	// finds them.
	var parts = str.match(ZmEmailAddress.addrAnglePat);
	var user, host, name, comment;
	if (parts) {
		user = parts[3];
		host = parts[12];
		str = str.replace(ZmEmailAddress.addrAnglePat, '');
	} else {
		parts = str.match(ZmEmailAddress.addrPat);
		if (parts) {
			user = parts[2];
			host = parts[11];
			str = str.replace(ZmEmailAddress.addrPat, '');
		}
	}
	parts = str.match(ZmEmailAddress.commentPat);
	if (parts) {
		comment = parts[2]; // doesn't include the ()
		str = str.replace(ZmEmailAddress.commentPat, '');
	}
	parts = str.match(ZmEmailAddress.phrasePat);
	if (parts) {
		name = AjxStringUtil.trim(AjxStringUtil.trim(parts[0]), false, '"');
	}
	
	var addr = new ZmEmailAddress();
	addr.address = [user, '@', host].join("");
	addr.name = name ? name : comment;
	
	return addr;
}

/**
* Takes a string with one or more addresses and parses it. An object with lists of good addresses, bad
* addresses, and all addresses is returned. Strict RFC822 validation (at least as far as it goes in the
* regexes we have) is optional. If it's off, we'll retry a failed address after quoting the personal part.
*
* @param emailStr		an email string with one or more addresses
* @param type			address type of the string
* @param strict			enforce RFC822
*/
ZmEmailAddress.parseEmailString =
function(emailStr, type, strict) {
	var good = new AjxVector();
	var bad = new AjxVector();
	var all = new AjxVector();
	var addrList = ZmEmailAddress._split(emailStr);
	for (var i = 0; i < addrList.length; i++) {
		var addrStr = AjxStringUtil.trim(addrList[i]);
		if (addrStr) {
			var addr = ZmEmailAddress.parse(addrStr);
			if (!addr && !strict) {
				var temp = addrStr;
				if (temp.match(ZmEmailAddress.addrAnglePat)) {
					var t1 = temp.replace(ZmEmailAddress.addrAnglePat, '');
					temp = temp.replace(t1, ['"', t1, '"'].join(""));
					var addr = ZmEmailAddress.parse(temp);
					if (addr)
						addr.name = t1; // reset name to original form
				}
			}
			if (addr) {
				addr.type = type;
				good.add(addr);
				all.add(addr);
			} else {
				bad.add(addrStr);
				all.add(new ZmEmailAddress(addrStr));
			}
		}
	}
	return {good: good, bad: bad, all: all};
}

/**
* Tests a string to see if it's a valid email string according to our mailbox pattern.
*
* @param str		an email string
*/
ZmEmailAddress.isValid =
function(str) {
	str = AjxStringUtil.trim(str);
	return str.match(ZmEmailAddress.mailboxPat);
}

/**
* Splits a string into (possible) email address strings based on delimiters. Tries to
* be flexible about what it will accept. The following delimiters are recognized, under
* the following conditions:
*
* return		always
* semicolon		must not be inside quoted or comment text
* comma			must not be inside quoted or comment text, and must follow an address (which
*				may be in angle brackets)
*
* @param str	the string to be split
*/
ZmEmailAddress._split =
function(str) {
	// first, construct a list of ranges to ignore because they are quoted or comment text
	var ignore = new Array();
	var pos = 0, startPos = 0;
	var prevCh = "", startCh = "";
	var inside = false;
	while (pos < str.length) {
		var ch = str.charAt(pos);
		if ((ch == '"' || ch == '(') && prevCh != "\\") {
			inside = true;
			startCh = ch;
			startPos = pos;
			pos++;
			while (inside && pos < str.length) {
				var ch = str.charAt(pos);
				if (((startCh == '"' && ch == '"') || (startCh == '(' && ch == ')')) && (prevCh != "\\")) {
					ignore.push({start: startPos, end: pos});
					inside = false;
				}
				pos++;
				prevCh = ch;
			}
		} else {
			pos++;
		}
		prevCh = ch;
	}
	
	// Progressively scan the string for delimiters. Once an email string has been found, continue with
	// the remainder of the original string.
	startPos = 0;
	var addrList = new Array();
	while (startPos < str.length) {
		var sub = str.substring(startPos, str.length);
		pos = 0;
		var delimPos = sub.length;
		while ((delimPos == sub.length) && (pos < sub.length)) {
			var ch = sub.charAt(pos);
			if (ZmEmailAddress.IS_DELIM[ch]) {
				var doIgnore = false;
				if (ch != "\n") {
					for (var i = 0; i < ignore.length; i++) {
						var range = ignore[i];
						doIgnore = (pos >= range.start && pos <= range.end);
						if (doIgnore) break;
					}
				}
				if (!doIgnore) {
					var doAdd = true;
					var test = sub.substring(0, pos);
					if (ch == ",")
						doAdd = test.match(ZmEmailAddress.boundAddrPat);
					if (doAdd) {
						addrList.push(test);
						delimPos = pos;
						startPos += test.length + 1;
					}
				}
				pos++;
			} else {
				pos++;
			}
		}
		if (delimPos == sub.length) {
			addrList.push(sub);
			startPos += sub.length + 1;
		}
	}
	return addrList;
}

ZmEmailAddress.prototype.toString =
function() {
	if (this.name) {
		var name = this.name.replace(/"/g, '\\"', this.name);
		var addr = [name, " <", this.address, ">"].join("");
		if (!ZmEmailAddress.parse(addr))
			addr = ['"', name, '" <', this.address, ">"].join("");
		return addr;
	} else {
		return this.address;
	}
}

ZmEmailAddress.prototype.getAddress =
function() {
	return this.address;
}

ZmEmailAddress.prototype.setAddress =
function(addr) {
	this.address = addr;
}

ZmEmailAddress.prototype.getType =
function() {
	return this.type;
}

ZmEmailAddress.prototype.setType =
function(type) {
	this.type = type;
}

ZmEmailAddress.prototype.getTypeAsString =
function() {
	return ZmEmailAddress.TYPE_STRING[this.type];
}

ZmEmailAddress.prototype.getName =
function() {
	return this.name;
}

ZmEmailAddress.prototype.getDispName =
function() {
	return this.dispName;
}
