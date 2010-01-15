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
        </c:choose>
    </c:if>

    <c:if test="${needUploadView}">
            <jsp:forward page="/h/briefcaseupload"/>
    </c:if>

    <c:if test="${needListView}">
            <c:redirect url="/h/search?st=briefcase&sfi=${empty param.sfi ? mailbox.briefcase.id : param.sfi}"/>
    </c:if>

</app:handleError>
