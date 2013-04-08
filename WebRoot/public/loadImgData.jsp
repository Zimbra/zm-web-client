<!--
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012 VMware, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
-->
<!--
NOTE: it should not happen, but if for some reason updating this file does not cause a recompile of the files including it
(currently launchZCS and launchNewWindow), make sure you touch those files too to test.
I tested on my Jetty and it does recognize included files and recompiles the files that include them. But just in case.
-->
<script>
<jsp:include page="/img/images.css.js" />
<jsp:include page="/skins/${skin}/img/images.css.js" />
document.write("<DIV style='display:none'>");
for (id in AjxImgData) {
	data = AjxImgData[id];
	if (data.f) data.f = data.f.replace(/@AppContextPath@/,appContextPath);
	if (data.ief) data.ief = data.ief.replace(/@AppContextPath@/,appContextPath);
	f = AjxEnv.isIE ? data.ief : data.f;
	document.write("<IMG id='",id,"' src='",data.d||f,"?v=${vers}'>");
}
document.write("</DIV>");
delete id;
delete data;
delete f;
</script>
