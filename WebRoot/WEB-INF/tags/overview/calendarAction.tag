<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
<zm:fileUploader var="uploader"/>

<c:choose>
    <c:when test="${not empty uploader.params.actionImport}">
        <c:choose>
            <c:when test="${empty uploader.params.fileUpload}">
                <app:status style="Warning">
                    <fmt:message key="actionNoCalendarFileImportSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:importAppointments var="result" uploader="${uploader}" folderid="${uploader.params.folderId}"/>
                <app:status>
                    <fmt:message key="actionCalendarAppointmentsImported">
                        <fmt:param value="${result.count}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty uploader.params.actionSave}">
        <c:set var="folder" value="${zm:getFolder(pageContext, uploader.params.folderId)}"/>
        <c:choose>
            <c:when test="${not empty uploader.params.folderNameVisible and empty uploader.params.folderName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoCalendarNameSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${not empty uploader.params.folderUrlVisible and empty uploader.params.folderUrl}">
                <app:status style="Warning">
                    <fmt:message key="actionNoCalendarUrlSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="otherFlags" value="${fn:replace(fn:replace(folder.flags,'#',''), 'b', '')}"/>
                <zm:updateFolder
                        id="${uploader.params.folderId}"
                        name="${uploader.params.folderName}"
                        color="${uploader.params.folderColor}"
                        flags="${otherFlags}${uploader.params.folderExcludeFlag}${uploader.params.folderCheckedFlag}"/>
                <c:if test="${not empty uploader.params.folderUrl and uploader.params.folderUrl ne folder.remoteURL}">
                    <zm:modifyFolderUrl id="${uploader.params.folderId}" url="${uploader.params.folderUrl}"/>
                </c:if>
                <app:status>
                    <fmt:message key="calendarUpdated"/>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty uploader.params.actionNew}">
         <c:choose>
            <c:when test="${empty uploader.params.newFolderName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoCalendarNameSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${not empty uploader.params.newFolderUrlVisible and empty uploader.params.newFolderUrl}">
                <app:status style="Warning">
                    <fmt:message key="actionNoCalendarUrlSpecified"/>
                </app:status>
            </c:when>
             <c:when test="${not empty uploader.params.newFolderOwnersEmailVisible and empty uploader.params.newFolderOwnersEmail}">
                <app:status style="Warning">
                    <fmt:message key="actionNoOwnerEmailSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${not empty uploader.params.newFolderOwnersCalendarVisible and empty uploader.params.newFolderOwnersCalendar}">
                <app:status style="Warning">
                    <fmt:message key="actionNoOwnerCalendarSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:choose>
                    <c:when test="${not empty uploader.params.newFolderOwnersEmailVisible}">
                        <zm:createMountpoint var="folder"
                                             parentid="1"
                                             name="${uploader.params.newFolderName}"
                                             view="appointment"
                                             color="${uploader.params.newFolderColor}"
                                             flags="${uploader.params.newFolderExcludeFlag}${uploader.params.newFolderCheckedFlag}"
                                             owner="${uploader.params.newFolderOwnersEmail}" ownerby="BY_NAME"
                                             shareditem="${uploader.params.newFolderOwnersCalendar}" shareditemby="BY_PATH"/>
                    </c:when>
                    <c:otherwise>
                        <zm:createFolder var="folder"
                                         parentid="1"
                                         name="${uploader.params.newFolderName}"
                                         view="appointment"
                                         color="${uploader.params.newFolderColor}"
                                         url="${uploader.params.newFolderUrl}"
                                         flags="${uploader.params.newFolderExcludeFlag}${uploader.params.newFolderCheckedFlag}"/>
                    </c:otherwise>
                </c:choose>
                <app:status>
                    <fmt:message key="actionCalendarCreated">
                        <fmt:param value="${uploader.params.newFolderName}"/>
                    </fmt:message>
                </app:status>
                <c:set var="newlyCreatedCalendarId" value="${folder.id}" scope="request"/>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty uploader.params.actionEmptyFolderConfirm}">
        <c:set var="folder" value="${zm:getFolder(pageContext, uploader.params.folderEmptyId)}"/>
        <c:set var="folderName" value="${zm:getFolderName(pageContext, uploader.params.folderEmptyId)}"/>
        <c:choose>
            <c:when test="${empty uploader.params.folderEmptyConfirm}">
                <app:status style="Warning">
                    <fmt:message key="actionDeleteCheckConfirm"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:emptyFolder id="${folder.canonicalId}"/>
                <c:set var="folderName" value="${zm:getFolderName(pageContext, uploader.params.folderEmptyId)}"/>
                <app:status>
                    <fmt:message key="calendarEmptied">
                        <fmt:param value="${folderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty uploader.params.actionDelete}">
        <c:set var="folder" value="${zm:getFolder(pageContext, uploader.params.folderDeleteId)}"/>
        <c:choose>
            <c:when test="${empty uploader.params.folderDeleteConfirm}">
                <app:status style="Warning">
                    <fmt:message key="actionCalendarCheckConfirm"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderName" value="${folder.name}"/>
                <zm:deleteFolder id="${uploader.params.folderDeleteId}"/>
                <app:status>
                    <fmt:message key="actionCalendarDeleted">
                        <fmt:param value="${folderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:otherwise>

    </c:otherwise>
</c:choose>
</app:handleError>

