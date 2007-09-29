<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<HTML>
<HEAD>
	<!--
 /*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */
 --><%


	String contextPath = request.getContextPath();
	if(contextPath.equals("/")) {
		contextPath = "";
	}
	String vers = (String) request.getAttribute("version");
	if (vers == null) vers = "";
	String ext = (String) request.getAttribute("fileExtension");
	if (ext == null) ext = "";
	String mode = (String) request.getAttribute("mode");
	Boolean inDevMode = (mode != null) && (mode.equalsIgnoreCase("mjsf"));
 if (inDevMode) {
	%>
	<jsp:include page="Messages.jsp"/>
    <jsp:include page="Boot.jsp"/>
	<jsp:include page="Ajax.jsp"/>
 <% } else { %>
	<script type="text/javascript" src="<%=contextPath%>/js/msgs/I18nMsg,AjxMsg,ZMsg,ZmMsg.js<%=ext%>?v=<%=vers%>"></script>
	<script type="text/javascript" src="<%=contextPath%>/js/Ajax_all.js<%=ext%>?v=<%=vers%>"></script>
	<% } %>
	<SCRIPT type="text/javascript">
		function onLoad() {
			var skin;
			if (location.search && (location.search.indexOf("skin=") != -1)) {
				var m = location.search.match(/skin=(\w+)/);
				if (m && m.length)
					skin = m[1];
			}
			document.title = ZmMsg.skinDeletedErrorTitle;
			var htmlArr = [];
			var idx = 0;
			htmlArr[idx++] = "<br/><br/><center>"
			htmlArr[idx++] = AjxMessageFormat.format(ZmMsg.skinDeletedError, [skin]);
			htmlArr[idx++] = "</center>"
			document.body.innerHTML = htmlArr.join("");
		}
	</SCRIPT>
<BODY ONLOAD='onLoad()'></BODY>
</HTML>