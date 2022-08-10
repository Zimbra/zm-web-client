<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
<%@ tag body-content="scriptless" %>
<%@ attribute name="title" rtexprvalue="true" required="false" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>

<zm:getDocument  var="doc" box="${mailbox}" id="${requestScope.zimbra_target_item_id}"/>

<c:set var="isEdit" value="${not empty param.action and param.action eq 'edit'}" scope="request"/>

<c:set var="contentType" value="${doc.contentType}"/>
<c:choose>

    <%--Documents--%>
    <c:when test="${(contentType eq 'application/x-zimbra-doc' and isEdit)}">
        <rest:documentView/>
    </c:when>
    <c:when test="${(contentType eq 'application/x-zimbra-doc')}">
         <rest:documentPreview/>
    </c:when>

    <%--Slides--%>
    <c:when test="${(contentType eq 'application/x-zimbra-slides' and isEdit)}">
        <rest:slideView/>
    </c:when>
    <c:when test="${(contentType eq 'application/x-zimbra-slides')}">
        <rest:slidePreview/>
    </c:when>


    <%--Spreadsheet--%>
    <c:when test="${(contentType eq 'application/x-zimbra-xls' and isEdit)}">
        <rest:spreadsheetView/>
    </c:when>
    <c:when test="${(contentType eq 'application/x-zimbra-xls')}">
        <rest:spreadsheetPreview/>
    </c:when>

    <c:otherwise>
        <fmt:message key="unsupportedRestView"/>
    </c:otherwise>
</c:choose>