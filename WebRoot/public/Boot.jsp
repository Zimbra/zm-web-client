<%@ page session="false" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%--
***** BEGIN LICENSE BLOCK *****
Zimbra Collaboration Suite Web Client
Copyright (C) 2006, 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software Foundation,
version 2 of the License.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this program.
If not, see <https://www.gnu.org/licenses/>.
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

    // Pages that must not contain inline scripts (e.g. under a CSP) set this attribute before including Boot.jsp.
    boolean externalScripts = Boolean.TRUE.equals(request.getAttribute("bootExternalScripts"));
    pageContext.setAttribute("bootContextPath", contextPath);
    pageContext.setAttribute("bootPackageExtension", (isDevMode ? "" : "_all") + ".js" + ext);
    pageContext.setAttribute("bootVersion", vers);

%>
<!-- bootstrap classes -->
<% if (isDevMode) { %>
	<jsp:include page="jsp/Boot.jsp" />
<% } else if (externalScripts) { %>
	<script type="text/javascript" src="<%=contextPath%>/js/Boot_all.js<%=ext%>?v=<%=vers%>"></script>
<% } else { %>
	<script type="text/javascript">
	<jsp:include>
		<jsp:attribute name='page'>/js/Boot_all.js<%= isDevMode || isOfflineMode ? "" : ".min" %></jsp:attribute>
	</jsp:include>
	</script>
<% } %>

<% if (externalScripts) { %>
<meta id="zBootConfig" name="zimbra-boot-config" content=""
	data-context-path="${fn:escapeXml(bootContextPath)}"
	data-package-extension="${fn:escapeXml(bootPackageExtension)}"
	data-version="${fn:escapeXml(bootVersion)}">
<script type="text/javascript" src="<%=contextPath%>/public/js/boot-config.js?v=<%=vers%>"></script>
<% } else { %>
<script type="text/javascript">
AjxPackage.setBasePath("<%=contextPath%>/js");
AjxPackage.setExtension("<%= isDevMode ? "" : "_all" %>.js<%=ext%>");
AjxPackage.setQueryString("v=<%=vers%>");

AjxTemplate.setBasePath("<%=contextPath%>/templates");
AjxTemplate.setExtension(".template.js");
</script>
<% } %>
