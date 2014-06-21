<!--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013 Zimbra, Inc.
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
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