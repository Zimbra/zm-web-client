<%@ page session="false" %>
<%--
***** BEGIN LICENSE BLOCK *****
Zimbra Collaboration Suite Web Client
Copyright (C) 2006, 2007, 2008, 2009, 2010, 2013 Zimbra, Inc.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software Foundation,
version 2 of the License.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this program.
If not, see <http://www.gnu.org/licenses/>.
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
