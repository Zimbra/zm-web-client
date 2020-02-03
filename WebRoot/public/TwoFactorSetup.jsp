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
	<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no,maximum-scale=1,user-scalable=0">
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
		var changeTag = document.getElementsByClassName("DwtDialogTitle")[0];
		changeTag.outerHTML = "";
		changeTag = document.getElementsByClassName("horizSep")[0];
		changeTag.outerHTML = "";
		changeTag = document.querySelectorAll('[align=right]');
		changeTag[0].align="left";

	</script>

	<style type="text/css" rel="stylesheet">
		.DwtDialog[role="dialog"] {
			top: 50% !important;
			left: 50% !important;
			transform: translateX(-50%) translateY(-50%) !important;
		}

		.WindowInnerContainer {
			background-color: #fff;
			padding: 0px ;
			border-radius: 4px ;
		}
		.DwtDialog.WindowOuterContainer {
    			box-shadow: 0 4px 6px 0 rgba(0, 0, 0, .4);
			border-radius: 2px;
			background-color: none;
			border:none;
		}
		div.DwtDialogButtonBar {
			padding: 20px 40px 40px 40px;
		}
		.DwtDialogButtonBar td[align="left"]{
			padding: 0px;
		}
		.DwtDialogButtonBar div[aria-label="Begin Setup"],
		.DwtDialogButtonBar div[aria-label="Finish"],
		.DwtDialogButtonBar div[aria-label="Previous"] {
			margin-left: 0px;
			height: 32px;
			outline: none;
		}

		div[aria-label="Begin Setup"] .ZButtonTable:hover,
		div[aria-label="Previous"] .ZButtonTable:hover ,
		div[aria-label="Finish"] .ZButtonTable:hover,
		div[aria-label="Next"] .ZButtonBorder:hover  {
			background-color: #009adb;
		}

		div[aria-label="Begin Setup"] .ZButtonBorder,
		div[aria-label="Previous"] .ZButtonBorder,
		div[aria-label="Finish"] .ZButtonBorder,
		div[aria-label="Next"] .ZButtonBorder {
			border-radius: 3px;
			border: solid 1px transparent;
			background-color: #0088c1;
		}


		div[aria-label="Begin Setup"] .ZButtonTable .ZWidgetTitle,
		div[aria-label="Previous"] .ZButtonTable .ZWidgetTitle,
		div[aria-label="Next"] .ZButtonTable .ZWidgetTitle,
		div[aria-label="Finish"] .ZButtonTable .ZWidgetTitle {
			color: #fff;
			font-size: 12px;
		}

		div[aria-label="Begin Setup"] .ZButtonBorder {
			padding: 0px 12px ;
		}
		
		div[aria-label="Previous"] .ZButtonBorder {
			padding: 0px 10px;
		}

		div[aria-label="Finish"] .ZButtonBorder {
			padding: 0px 17px;
		}

		.DwtDialogButtonBar div[aria-label="Next"],
		.DwtDialogButtonBar div[aria-label="Cancel"]{
			margin-left: 10px;
			height: 32px;
			outline: none;
		}
		
		div[aria-label="Next"] .ZButtonBorder {
			padding: 0px 21px;
		}

		div[aria-label="Next"].ZDisabled .ZButtonBorder,
		div[aria-label="Next"].ZDisabled .ZButtonBorder:hover {
			background-color: #0088c15c;
		}
	
		div[aria-label="Cancel"] .ZButtonBorder {
			padding: 0px 14px 0px 15px;
			border: solid 1px transparent;
			background-color: #f2f2f2 ;
			border-radius: 3px;
		}

		div[aria-label="Cancel"].ZHasText .ZButtonTable:hover {
			background-color: #e5e5e5;
		}

		div[aria-label="Cancel"] .ZButtonTable .ZWidgetTitle {
			color: #4d4d4d;
			font-size: 12px;
		}

		

	</style>
	<div class="Footer">
		<div id="ZLoginNotice" class="legalNotice-small"><fmt:message key="clientUpdatedLoginNotice"/></div>
	</div>
</body>
</html>
