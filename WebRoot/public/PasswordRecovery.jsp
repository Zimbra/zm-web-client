<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 *
 * Copyright (C) 2018 Synacor, Inc.
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
<%!
	static String getParameter(HttpServletRequest request, String pname, String defValue) {
		String value = request.getParameter(pname);
		return value != null ? value : defValue;
	}
	static String getAttribute(HttpServletRequest request, String aname, String defValue) {
		Object object = request.getAttribute(aname);
		String value = object != null ? String.valueOf(object) : null;
		return value != null ? value : defValue;
	}
%>
<%
	String accountInput = request.getParameter("account");
	if (accountInput != "") {
		accountInput = BeanUtils.cook(accountInput);
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

	boolean isDevMode = getParameter(request, "dev", "0").equals("1");
	pageContext.setAttribute("isDevMode", isDevMode);
%>
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<!DOCTYPE html>
<html class="user_font_size_normal" data-ispasswordrecoverypage="true">
<head>
	<title><fmt:message key="passwordRecoveryTitle"/></title>

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
		
		<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no,maximum-scale=1,user-scalable=0">

	<jsp:include page="Resources.jsp">
		<jsp:param name="res" value="I18nMsg,AjxMsg,ZmMsg,ZMsg" />
		<jsp:param name="skin" value="${skin}" />
	</jsp:include>

	<jsp:include page="Boot.jsp"/>

	<% if (isDevMode) { %>
		<jsp:include page="/public/jsp/PasswordRecovery.jsp"/>
	<% } else { %>
		<script src="${contextPath}/js/PasswordRecovery_all.js<%=ext%>?v=${version}"></script>
	<% } %>
</head>
<body class="user_font_modern">
	<script>
		if(!window.DBG) {
			DBG = new AjxDebug(AjxDebug.NONE, null, false);
		}
		var params = {
			accountInput : "<%=accountInput%>"
		};
		new ZmPasswordRecoveryDialog(params).popup();
		var changeTag = document.getElementsByClassName("DwtDialogTitle")[0];
		changeTag.outerHTML = "";
		changeTag = document.getElementsByClassName("horizSep")[0];
		changeTag.outerHTML = "";

	</script>
	<style type="text/css" rel="stylesheet">
		.DwtDialog[role="dialog"] {
			top: 50% !important;
			left: 50% !important;
			transform: translateX(-50%) translateY(-50%) !important;
		}

		div.DwtDialogButtonBar {
			padding: 20px 40px;
		}

		.DwtDialogButtonBar td[align="left"]{
			padding: 0;
		}

		.DwtDialogButtonBar > table > tbody > tr > td > table,
		.DwtDialogButtonBar > table > tbody > tr > td > table > tbody,
		.DwtDialogButtonBar > table > tbody > tr > td > table > tbody > tr,
		.DwtDialogButtonBar > table > tbody > tr > td > table > tbody > tr > td {
			display: block;
		}

		.DwtDialogButtonBar > table > tbody > tr > td > table > tbody > tr > td > div {
			margin: 0 0 12px 0;
		}

	</style>
	<div class="Footer">
		<div id="ZLoginNotice" class="legalNotice-small"><fmt:message key="splashScreenCopyright"/></div>
	</div>
</body>
</html>
