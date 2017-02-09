<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:catch var="viewException">
    <jsp:doBody/>
</c:catch>
    <c:if test="${!empty viewException}">
    <zm:getException var="error" exception="${viewException}"/>
    <c:choose>
        <c:when test="${error.code eq 'ztaglib.SERVER_REDIRECT'}">
            <c:redirect url="${not empty requestScope.SERVIER_REDIRECT_URL ? requestScope.SERVIER_REDIRECT_URL : '/'}"/>
        </c:when>
        <c:when test="${error.code eq 'service.AUTH_EXPIRED' or error.code eq 'service.AUTH_REQUIRED'}">
            <c:redirect url="/?loginOp=relogin&client=standard&loginErrorCode=${error.code}"/>
        </c:when>
        <c:when test="${error.code eq 'zclient.UPLOAD_SIZE_LIMIT_EXCEEDED'}">
            <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
            <c:set scope="request" var="draftid" value="${draftResult.id}"/>
            <c:set var="statusClass" scope="request" value="StatusCritical"/>
            <c:set var="uploadError" scope="request" value="${true}"/>
            <fmt:message var="errorMsg" key="${error.code}"/>
            <c:set var="statusMessage" scope="request" value="${errorMsg}"/>
            <jsp:forward page="/h/compose"/>
        </c:when>
        <c:otherwise>
            <div align="center">
                <h4><fmt:message key="${error.code}"/></h4>
                    <!-- ${fn:escapeXml(error.id)} -->
            </div>                
        </c:otherwise>
    </c:choose>
</c:if>
