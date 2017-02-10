<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2015, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="false" %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<%
	String userName = request.getParameter("userName");
	if (userName != null) {
		userName = BeanUtils.cook(userName);
	}
	String isDebugMode = request.getParameter("isDebug");
	String ext = (String)request.getAttribute("fileExtension");
	if (ext == null) {
		ext = "";
	}
	String contextPath = request.getContextPath();
	if (contextPath.equals("/")) {
		contextPath = "";
	}
%>
<!DOCTYPE html>
<html class="user_font_size_normal" data-istwofactorsetuppage="true">
<head>
	<title><fmt:message key="twoStepAuthSetup"/></title>

	<zm:getFavIcon request="${pageContext.request}" var="favIconUrl" />

	<c:if test="${empty favIconUrl}">
		<fmt:message key="favIconUrl" var="favIconUrl"/>
	</c:if>

	<link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">

	<link href="<c:url value="/css/images,common,dwt,zm,skin.css">
			<c:param name="v" value="${version}" />
			<c:param name="skin" value="${skin}" />
			<c:if test="${not empty param.isDebug}">
				<c:param name="debug" value="${param.isDebug}"/>
			</c:if>
			<c:if test="${not empty param.customerDomain}">
				<c:param name="customerDomain" value="${param.customerDomain}" />
			</c:if>
		</c:url>" rel="stylesheet" type="text/css" />

	<jsp:include page="Resources.jsp">
		<jsp:param name="res" value="I18nMsg,AjxMsg,ZmMsg" />
		<jsp:param name="skin" value="${skin}" />
	</jsp:include>

	<jsp:include page="Boot.jsp"/>

	<% if (isDebugMode != null) { %>
		<jsp:include page="/public/jsp/TwoFactor.jsp"/>
	<% } else { %>
		<script src="${contextPath}/js/TwoFactor_all.js<%=ext%>?v=${version}"></script>
	<% } %>
</head>
<body class="user_font_system">
	<script>
		if(!window.DBG) {
			DBG = new AjxDebug(AjxDebug.NONE, null, false);
		}
		var params = {
			userName : "<%=userName%>",
			isFromLoginPage : true
		};
		new ZmTwoFactorSetupDialog(params).popup();
	</script>
</body>
</html>