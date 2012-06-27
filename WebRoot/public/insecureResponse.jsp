<!--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
-->
<%@ taglib prefix="zm" uri="com.zimbra.zm" %><%
	// no cache
	response.addHeader("Vary", "User-Agent");
	response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
	response.setHeader("Pragma", "no-cache");

	// content-type
	response.setContentType("text/html");

	// data
	String emptyJsonObject = "{}";
	String data = request.getParameter("data");
	if (data != null) {
		// TODO: protecting against script tag in text is making some assumptions
		data = data.replaceAll("(</[Ss][Cc])([Rr][Ii])","$1\"+\"$2");
	}

    pageContext.setAttribute("data", data);
%>
<script>
var reqId = "${zm:jsEncode(param.reqId)}";
</script>
<script>
var params = {reqId: reqId};
params.response = eval("(" + "${ (not empty data and data ne "") ? zm:jsEncode(data) : emptyJsonObject }" + ")");
parent.parent.parent.appCtxt.getRequestMgr().sendRequest(params);
</script>