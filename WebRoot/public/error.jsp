<%--
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
--%>
<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<app:skinAndRedirect />
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<fmt:setBundle basename="/messages/ZhMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZmMsg" var="zmmsg" scope="request"/>

<%
    Object errorCode = request.getAttribute("javax.servlet.error.status_code");
    String errorTitle = errorCode+"Title";
    String errorMsg = errorCode+"Msg";
%>

<c:set var="errCode" value="<%=errorCode%>"/>
<c:set var="errTitle" value="<%=errorTitle%>"/>
<c:set var="errMsg" value="<%=errorMsg%>"/>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <title>${errCode} - <fmt:message key="${errTitle}"/></title>
    <meta name="viewport" content="width=320; initial-scale=1.0; maximum-scale=8.0; user-scalable=1;">
    <meta name="description" content="<fmt:message bundle="${zmmsg}" key="zimbraLoginMetaDesc"/>">
    <link  rel="stylesheet" type="text/css" href="<c:url value='/css/common,login,zhtml,skin.css'>
		<c:param name="skin" value="${skin}" />
		<c:param name="v" value="${version}" />
	</c:url>">
	<zm:getFavIcon request="${pageContext.request}" var="favIconUrl" />
	<c:if test="${empty favIconUrl}">
	    <fmt:message key="favIconUrl" var="favIconUrl"/>
	</c:if>
    <link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">
</head>
<c:set value="/img" var="iconPath" scope="request"/>
<body>
<p><br><br></p><p><br><br></p>
<table width="100%"><tr><td align="center">
<div id="ZLoginPanel">
<table width="500" cellpadding="5" cellspacing="5" border="0" align="center" id="ZLoginBodyContainer">
 <tr>
	<td><img src="<c:url value='/img/dwt/ImgWarning_32.png?v=${version}' />" width="32" height="32" border="0"></td>
    <td vlaign="middle"><h2 style="margin: 0px;"><fmt:message key="${errTitle}"/></h2></td>
 </tr>
 <tr>
 	<td></td>
 	<td><hr style="margin: 0px;"><p><fmt:message key="${errMsg}"/></p><p><fmt:message key="errorTryAgainLater"/> </p><br>
 	<a href="/"><b>&laquo; <fmt:message key="errorGoBack"/></b></a><br><br>
    <p>ERROR: ${errCode}</p></td>
 </tr>
</table>
</div>
</td></tr></table>
</body>
</html>
