<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:composeUploader var="uploader"/>

    <c:set var="needUploadView" value="${param.action eq 'newbrief'}"/>
    <c:set var="needListView" value="${false}"/>
    
    <c:if test="${uploader.isUpload}">
        <c:choose>
            <c:when test="${uploader.isAttachCancel}">
                 <c:set var="needListView" value="${true}"/>
                 <c:set var="needUploadView" value="${false}"/>
            </c:when>
            <c:when test="${uploader.isAttachDone}">
                <c:set var="needListView" value="${true}"/>
                <c:set var="needUploadView" value="${false}"/>
                <c:if test="${uploader.compose.hasFileItems}">
                    <c:forEach var="part" items="${uploader.compose.fileItems}" varStatus="status">
                        <c:set var="emptyfile" value="${part.size eq 0 ? true : false}"/>
                        <c:if test="${emptyfile}">
                           <app:status><fmt:message key="zeroSizedAtts"/></app:status>
                        </c:if>
                    </c:forEach>
                    <zm:saveBriefcase var="result" folderId="${empty param.sfi ? mailbox.briefcase.id : param.sfi}" compose="${uploader.compose}"/>
                </c:if>
            </c:when>
            <c:when test="${uploader.isLimitExceeded}">
                <c:set var="needUploadView" value="${false}"/>
                <c:set var="needListView" value="${false}"/>
                <fmt:message var="errorMsg" key="zclient.UPLOAD_SIZE_LIMIT_EXCEEDED"/>
                <app:status style="Warning">${errorMsg}</app:status>
            </c:when>
        </c:choose>
    </c:if>

    <c:if test="${needUploadView}">
        <jsp:forward page="/h/briefcaseupload"/>
    </c:if>

    <c:if test="${needListView}">
        <c:redirect url="/h/search?st=briefcase&sfi=${empty param.sfi ? mailbox.briefcase.id : param.sfi}"/>
    </c:if>

</app:handleError>
