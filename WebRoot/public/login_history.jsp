<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page session="false" %>
<%@ page import="com.zimbra.cs.taglib.ZJspSession"%>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
<fmt:setBundle basename="/messages/ZmMsg" scope="request"/>
<fmt:setBundle basename="/messages/ZhMsg" var="zhmsg" scope="request"/>
<html>
<head>

<!DOCTYPE html>
<!-- set this class so CSS definitions that now use REM size, would work relative to this.
    Since now almost everything is relative to one of the 2 absolute font size classese -->
<html class="user_font_size_normal" lang="${fn:substring(pageContext.request.locale, 0, 2)}">
<head>
<!--
 login_history.jsp
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
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
-->
<c:set var="client" value="${param.client}"/>
    <c:set var="useStandard" value="${not (ua.isFirefox3up or ua.isGecko1_9up or ua.isIE9up or ua.isSafari4Up or ua.isChrome or ua.isModernIE)}"/>
    <c:if test="${empty client}">
        <%-- set client select default based on user agent. --%>
        <c:choose>
            <c:when test="${touchSupported}">
                <c:set var="client" value="${touchLoginPageExists ? 'touch' : 'mobile'}"/>
            </c:when>
            <c:when test="${mobileSupported}">
                <c:set var="client" value="mobile"/>
            </c:when>
            <c:when test="${useStandard}">
                <c:set var="client" value="standard"/>
            </c:when>
            <c:otherwise>
                <c:set var="client" value="preferred"/>
            </c:otherwise>
        </c:choose>
    </c:if>
    <c:set var="smallScreen" value="${client eq 'mobile' or client eq 'socialfox'}"/>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <title><fmt:message key="zimbraLoginHistory"/></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<fmt:message key="zimbraLoginMetaDesc"/>">
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <link rel="stylesheet" type="text/css" href="<c:url value='/css/common,login-history,zhtml,skin.css'>
        <c:param name="skin"    value="${skin}" />
        <c:param name="v"       value="${version}" />
        <c:if test="${not empty param.debug}">
            <c:param name="debug" value="${param.debug}" />
        </c:if>
        <c:if test="${not empty param.customerDomain}">
            <c:param name="customerDomain"  value="${param.customerDomain}" />
        </c:if>
    </c:url>">
</head>
<body>
<div align="center" style="margin-top: 10%">
<h2><fmt:message key="zimbraLoginHistoryHeading" /></h2>
<div class="divTable" style="border: 1px solid #000;" >
    <div class="divTableBody">
    <div class="divTableRow">
        <div class="divTableCell">&nbsp;Sr. No</div>
        <div class="divTableCell">&nbsp;<fmt:message key="zimbraLoginHistoryGeoLocationIP"/></div>
        <div class="divTableCell">&nbsp;<fmt:message key="zimbraLoginHistoryTimestamp"/></div>
    </div>
    <div class="divTableRow">
        <div class="divTableCell">&nbsp;1</div>
        <div class="divTableCell">&nbsp;</div>
        <div class="divTableCell">&nbsp;</div>
    </div>
    <div class="divTableRow">
        <div class="divTableCell">&nbsp;2</div>
        <div class="divTableCell">&nbsp;</div>
        <div class="divTableCell">&nbsp;</div>
    </div>
    <div class="divTableRow">
        <div class="divTableCell">&nbsp;3</div>
        <div class="divTableCell">&nbsp;</div>
        <div class="divTableCell">&nbsp;</div>
    </div>
    <div class="divTableRow">
        <div class="divTableCell">&nbsp;4</div>
        <div class="divTableCell">&nbsp;</div>
        <div class="divTableCell">&nbsp;</div>
    </div>
    <div class="divTableRow">
        <div class="divTableCell">&nbsp;5</div>
        <div class="divTableCell">&nbsp;</div>
        <div class="divTableCell">&nbsp;</div>
    </div>
    <div class="divTableRow">
        <div class="divTableCell">&nbsp;6</div>
        <div class="divTableCell">&nbsp;</div>
        <div class="divTableCell">&nbsp;</div>
    </div>
    <div class="divTableRow">
        <div class="divTableCell">&nbsp;7</div>
        <div class="divTableCell">&nbsp;</div>
        <div class="divTableCell">&nbsp;</div>
    </div>    
    <div class="divTableRow">
        <div class="divTableCell">&nbsp;8</div>
        <div class="divTableCell">&nbsp;</div>
        <div class="divTableCell">&nbsp;</div>
    </div>
    <div class="divTableRow">
        <div class="divTableCell">&nbsp;9</div>
        <div class="divTableCell">&nbsp;</div>
        <div class="divTableCell">&nbsp;</div>
    </div>
    <div class="divTableRow">
        <div class="divTableCell">&nbsp;10</div>
        <div class="divTableCell">&nbsp;</div>
        <div class="divTableCell">&nbsp;</div>
    </div>
    </div>
</div>
<hr/>
<h3><a href="/?skipLoginHistory=true"><fmt:message key="zimbraLoginHistoryProceedDashboard"/></a> &nbsp; | &nbsp; <a href="#"><fmt:message key="zimbraLoginHistoryViewDetails"/></a></h3>
</div>
</body>
</html>
