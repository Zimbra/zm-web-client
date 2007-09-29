<!-- 
***** BEGIN LICENSE BLOCK *****
Zimbra Collaboration Suite Web Client
Copyright (C) 2005, 2006 Zimbra, Inc.

The contents of this file are subject to the Yahoo! Public License
Version 1.0 ("License"); you may not use this file except in
compliance with the License.  You may obtain a copy of the License at
http://www.zimbra.com/license.

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
***** END LICENSE BLOCK *****
-->
<%
String vers = (String) request.getAttribute("version");
if (vers == null) vers = "";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title></title>

<script>

var cacheKillerVersion = "<%= vers %>";
paramMap = new Object();
paramsInited = false;
getParam = function (name) {
	if (!paramsInited) {
		var loc = unescapedLoc;
		loc = loc.replace(/.*\?/, '');
		var myPairs = loc.split('&');
		for (var i = 0; i < myPairs.length; i++) {
			var myPair = myPairs[i];
			var keyVal = myPair.split('=');
			var myKey = unescape(keyVal[0]);
			var myValue = (keyVal[1]);
			if (myValue == 'true'){
				myValue = true;
			} else if (myValue == 'false') {
				myValue = false;
			}
			paramMap[myKey] = myValue;
		}
		paramsInited = true;
	}

	var value = paramMap[name];
	if (!value || value == '' ) {
		value = null;
	}
	return value;
};

onloadFunc = function() {
	try {
		if (!window.opener.AjxWindowOpener) {
			return;
		}
		// Pull the parameter out of the URL.  Advance the index past the
		// parameter name and the equal sign
		unescapedLoc = unescape(window.location.search);
		var id = getParam(window.opener.AjxWindowOpener.PARAM_INSTANCE_ID);
		var async = getParam(window.opener.AjxWindowOpener.PARAM_ASYNC);
		// Now notify the dialog the iframe has been loaded
		if (!async) {
			window.opener.AjxWindowOpener.onWindowOpened(id);
		} else {
			window.setTimeout("window.opener.AjxWindowOpener.onWindowOpened("+id+")", 1);
		}
	} catch (e) {
		document.write("Error opening the view: " + e.toString());
	}
};

window.onload = onloadFunc;

</script>
</head>
<body>
</body>
</html>
