<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2017 Synacor, Inc.
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
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<app:skinAndRedirect />
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<fmt:setBundle basename="/messages/ZhMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZmMsg" var="zmmsg" scope="request"/>

<%
	Object messageKey = request.getAttribute("messageKey");
	String message = "zimbraAddressVerification" + messageKey;
%>
<c:set var="msg" value="<%=message%>"/>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <title><fmt:message bundle="${zmmsg}" key="zimbraAddressVerificationResult"/></title>
    <meta name="viewport" content="width=320; initial-scale=1.0; maximum-scale=8.0; user-scalable=1;">
    <meta name="description" content="<fmt:message bundle="${zmmsg}" key="zimbraAddressVerificationResult"/>">
    <link  rel="stylesheet" type="text/css" href="<c:url value='/css/common,login,zhtml,skin.css'>
        <c:param name="skin" value="${param.skin}" />
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
    <div class="ErrorScreen">
        <div class="center">
            <div class="contentBox">
                <div class="InlineErrorPanel">
                    <table width="100%">
                        <tr>
                            <td>
                                <p style="font-size: 150%;margin-bottom:2em;padding-top:20px"><fmt:message bundle="${zmmsg}" key="${msg}"/></p>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="decor1"></div>
        </div>
        <div class="decor2"></div>
    </div>
</body>
</html>

