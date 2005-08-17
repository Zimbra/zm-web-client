/**
* Creates a new LmEmailAddress, either by parsing an email string or from component parts.
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
function LmEmailAddress(address, type, name, dispName) {
	this.address = address;
	this.name = name;
	this.dispName = dispName;
	this.type = type || LmEmailAddress.TO;
}

LmEmailAddress.FROM			= 1;
LmEmailAddress.TO			= 2;
LmEmailAddress.CC			= 3;
LmEmailAddress.BCC			= 4;
LmEmailAddress.REPLY_TO		= 5;
LmEmailAddress.LAST_ADDR	= 5;

LmEmailAddress.TYPE_STRING = new Array();
LmEmailAddress.TYPE_STRING[LmEmailAddress.FROM]		= "from";
LmEmailAddress.TYPE_STRING[LmEmailAddress.TO]		= "to";
LmEmailAddress.TYPE_STRING[LmEmailAddress.CC]		= "cc";
LmEmailAddress.TYPE_STRING[LmEmailAddress.BCC]		= "bcc";
LmEmailAddress.TYPE_STRING[LmEmailAddress.REPLY_TO]	= "replyTo";

LmEmailAddress.fromSoapType = new Array();
LmEmailAddress.fromSoapType["f"] = LmEmailAddress.FROM;
LmEmailAddress.fromSoapType["t"] = LmEmailAddress.TO;
LmEmailAddress.fromSoapType["c"] = LmEmailAddress.CC;
LmEmailAddress.fromSoapType["b"] = LmEmailAddress.BCC;
LmEmailAddress.fromSoapType["r"] = LmEmailAddress.REPLY_TO;

LmEmailAddress.toSoapType = new Array();
LmEmailAddress.toSoapType[LmEmailAddress.FROM]		= "f";
LmEmailAddress.toSoapType[LmEmailAddress.TO]		= "t";
LmEmailAddress.toSoapType[LmEmailAddress.CC]		= "c";
LmEmailAddress.toSoapType[LmEmailAddress.BCC]		= "b";
LmEmailAddress.toSoapType[LmEmailAddress.REPLY_TO]	= "r";

LmEmailAddress.SEPARATOR = "; ";			// used to join addresses
LmEmailAddress.DELIMS = [';', ',', '\n'];	// recognized as address delimiters
LmEmailAddress.IS_DELIM = new Object();
for (var i = 0; i < LmEmailAddress.DELIMS.length; i++)
	LmEmailAddress.IS_DELIM[LmEmailAddress.DELIMS[i]] = true;

LmEmailAddress.mailboxPat = /^((((((\s*[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))+)?(\s*<(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*)))>\s*))|(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*))))(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|)+)*\s*\)\s*))+)*\s*\)\s*))+)*\s*\)\s*))+)*\s*\)\s*))+)*\s*\)\s*)*)$/;	
LmEmailAddress.addrAnglePat = /(\s*<(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*)))>\s*)/;
LmEmailAddress.addrPat = /(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*)))/;
LmEmailAddress.commentPat = /(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|(\s*\((\s*(([^()\\])|(\\([^\x0A\x0D]))|)+)*\s*\)\s*))+)*\s*\)\s*))+)*\s*\)\s*))+)*\s*\)\s*))+)*\s*\)\s*)/;
LmEmailAddress.phrasePat = /(((\s*[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))+)/;

LmEmailAddress.boundAddrPat = /(\s*<?(((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*"(([^\\"])|(\\([^\x0A\x0D])))+"\s*))\@((\s*([^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+(\.[^\x00-\x1F\x7F()<>\[\]:;@\,."\s]+)*)\s*)|(\s*\[(\s*(([^\[\]\\])|(\\([^\x0A\x0D])))+)*\s*\]\s*)))>?\s*)$/;

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
LmEmailAddress.parse =
function(str) {
	var str = LsStringUtil.trim(str);
	// Do preliminary check for @ since we don't support local addresses, and as workaround for Mozilla bug
	// https://bugzilla.mozilla.org/show_bug.cgi?id=225094
	// Also check for . since we require FQDN
	var atIndex = str.indexOf('@');
	var dotIndex = str.lastIndexOf('.');
	var prelimOkay = ((atIndex != -1) && (dotIndex != -1) && (dotIndex > atIndex));
	if (!(prelimOkay && str.match(LmEmailAddress.mailboxPat))) {
		DBG.println(LsDebug.DBG1, "mailbox match failed: " + str);
		return null;
	}

	// Note: It would be nice if you could get back the matching parenthesized subexpressions from replace,
	// then we wouldn't have to do both a match and a replace. The parsing works by removing parts after it
	// finds them.
	var parts = str.match(LmEmailAddress.addrAnglePat);
	var user, host, name, comment;
	if (parts) {
		user = parts[3];
		host = parts[12];
		str = str.replace(LmEmailAddress.addrAnglePat, '');
	} else {
		parts = str.match(LmEmailAddress.addrPat);
		if (parts) {
			user = parts[2];
			host = parts[11];
			str = str.replace(LmEmailAddress.addrPat, '');
		}
	}
	parts = str.match(LmEmailAddress.commentPat);
	if (parts) {
		comment = parts[2]; // doesn't include the ()
		str = str.replace(LmEmailAddress.commentPat, '');
	}
	parts = str.match(LmEmailAddress.phrasePat);
	if (parts) {
		name = LsStringUtil.trim(LsStringUtil.trim(parts[0]), false, '"');
	}
	
	var addr = new LmEmailAddress();
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
LmEmailAddress.parseEmailString =
function(emailStr, type, strict) {
	var good = new LsVector();
	var bad = new LsVector();
	var all = new LsVector();
	var addrList = LmEmailAddress._split(emailStr);
	for (var i = 0; i < addrList.length; i++) {
		var addrStr = LsStringUtil.trim(addrList[i]);
		if (addrStr) {
			var addr = LmEmailAddress.parse(addrStr);
			if (!addr && !strict) {
				var temp = addrStr;
				if (temp.match(LmEmailAddress.addrAnglePat)) {
					var t1 = temp.replace(LmEmailAddress.addrAnglePat, '');
					temp = temp.replace(t1, ['"', t1, '"'].join(""));
					var addr = LmEmailAddress.parse(temp);
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
				all.add(new LmEmailAddress(addrStr));
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
LmEmailAddress.isValid =
function(str) {
	str = LsStringUtil.trim(str);
	return str.match(LmEmailAddress.mailboxPat);
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
LmEmailAddress._split =
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
			if (LmEmailAddress.IS_DELIM[ch]) {
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
						doAdd = test.match(LmEmailAddress.boundAddrPat);
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

LmEmailAddress.prototype.toString =
function() {
	if (this.name) {
		var name = this.name.replace(/"/g, '\\"', this.name);
		var addr = [name, " <", this.address, ">"].join("");
		if (!LmEmailAddress.parse(addr))
			addr = ['"', name, '" <', this.address, ">"].join("");
		return addr;
	} else {
		return this.address;
	}
}

LmEmailAddress.prototype.getAddress =
function() {
	return this.address;
}

LmEmailAddress.prototype.setAddress =
function(addr) {
	this.address = addr;
}

LmEmailAddress.prototype.getType =
function() {
	return this.type;
}

LmEmailAddress.prototype.setType =
function(type) {
	this.type = type;
}

LmEmailAddress.prototype.getTypeAsString =
function() {
	return LmEmailAddress.TYPE_STRING[this.type];
}

LmEmailAddress.prototype.getName =
function() {
	return this.name;
}

LmEmailAddress.prototype.getDispName =
function() {
	return this.dispName;
}
