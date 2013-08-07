<%@ page session="false" %>
<%--
***** BEGIN LICENSE BLOCK *****
Zimbra Collaboration Suite Web Client
Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011 Zimbra Software, LLC.

The contents of this file are subject to the Zimbra Public License
Version 1.3 ("License"); you may not use this file except in
compliance with the License.  You may obtain a copy of the License at
http://www.zimbra.com/license.

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
***** END LICENSE BLOCK *****
--%>
<%
    String contextPath = request.getContextPath();
    if (contextPath.equals("/")) contextPath = "";

	String dev = request.getParameter("dev");
	boolean isDev = dev != null && dev.equals("1");
	if (isDev) {
		request.setAttribute("mode", "mjsf");
//		request.setAttribute("gzip", "false");
//		request.setAttribute("fileExtension", "");
//		request.setAttribute("debug", "1");
//		request.setAttribute("packages", "dev");
	}

	String mode = (String)request.getAttribute("mode");
	boolean isDevMode = mode != null && mode.equalsIgnoreCase("mjsf");

    String vers = (String)request.getAttribute("version");
    if (vers == null) vers = "";

    String ext = (String)request.getAttribute("fileExtension");
    if (ext == null) ext = "";

    String offline = (String)request.getAttribute("offline");
    if (offline == null) offline = application.getInitParameter("offlineMode");
    boolean isOfflineMode = offline != null && offline.equals("true");

%>
<!-- bootstrap classes -->
<% if (isDevMode) { %>
	<jsp:include page="jsp/Boot.jsp" />
<% } else { %>
	<script type="text/javascript">
	<jsp:include>
		<jsp:attribute name='page'>/js/Boot_all.js<%= isDevMode || isOfflineMode ? "" : ".min" %></jsp:attribute>
	</jsp:include>
	</script>
<% } %>

<script type="text/javascript">
AjxPackage.setBasePath("<%=contextPath%>/js");
AjxPackage.setExtension("<%= isDevMode ? "" : "_all" %>.js<%=ext%>");
AjxPackage.setQueryString("v=<%=vers%>");

AjxTemplate.setBasePath("<%=contextPath%>/templates");
AjxTemplate.setExtension(".template.js");
</script>
