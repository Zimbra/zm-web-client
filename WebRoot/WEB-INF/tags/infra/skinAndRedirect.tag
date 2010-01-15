<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag import="java.io.*" %>
<%@ tag import="javax.servlet.*" %>
<%@ tag import="javax.servlet.jsp.*" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="false" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="defaultSkin" rtexprvalue="true" required="false" %>
<%@ attribute name="uri" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<c:if test="${empty param.doNotForwardRequest}">
	<app:skin mailbox="${mailbox}" defaultSkin="${defaultSkin}" />
	<%
		PageContext pageContext = (PageContext)jspContext;
		String skin = (String)pageContext.findAttribute("skin");

		if (uri == null) {
			uri = request.getRequestURI();
		}

		String contextPath = request.getContextPath();
		if (uri.startsWith(contextPath)) {
			uri = uri.substring(contextPath.length());
		}

		uri = "/skins/"+skin+uri;

		// perform redirect
		String path = pageContext.getServletContext().getRealPath(uri);
		File file = new File(path);
		if (file.exists()) {
			/***
			// NOTE: Setting an attribute and passing it into the
			// NOTE: forwarded request doesn't work. The value is
			// NOTE: not seen by the other JSP.
	//		pageContext.setAttribute("originalRequest", request);
			pageContext.forward(uri);
			/***/
			ServletContext servletContext = pageContext.getServletContext();
			RequestDispatcher dispatcher = servletContext.getRequestDispatcher(uri);

			ServletRequest servletRequest = pageContext.getRequest();
			ServletResponse servletResponse = pageContext.getResponse();
			servletRequest.setAttribute("originalRequestURI", request.getRequestURI());
			dispatcher.forward(servletRequest, servletResponse);
			/***/
		}
	%>
</c:if>