<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title></title>
    <script>
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
			} else if (myValue == 'false'){
				myValue = false;
			}
			paramMap[myKey] = myValue;
		}
		paramsInited = true;
	}

	var value = paramMap[name];
	if (!value || value == '' ){
		value = null;
	}
	return value;
};

onloadFunc = function () {
      try {
		 if (!window.opener.LsWindowOpener) {
			 return;
		 }
		 
		 // Pull the parameter out of the URL.  Advance the index past the
		 // parameter name and the equal sign
		 unescapedLoc = unescape(window.location.search);
		 var id = getParam(window.opener.LsWindowOpener.PARAM_INSTANCE_ID);
		 var async = getParam(window.opener.LsWindowOpener.PARAM_ASYNC);
		 // Now notify the dialog the iframe has been loaded
		 if (!async) {
			 window.opener.LsWindowOpener.onWindowOpened(id);
		 } else {
			 window.setTimeout("window.opener.LsWindowOpener.onWindowOpened("+id+")", 1);
		 }
	 } catch (e) {
		 document.write("Error opening the view");
	 }
};
	 window.onload = onloadFunc;
	</script>
  </head>
  <body>
  </body>
</html>
