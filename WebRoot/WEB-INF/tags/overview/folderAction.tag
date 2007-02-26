<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>


<app:handleError>
<c:choose>
    <c:when test="${!empty param.actionCreate}">
        <c:set var="newFolderName" value="${fn:trim(param.newFolderName)}"/>
        <c:choose>
            <c:when test="${empty newFolderName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoFolderNameSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${!fn:startsWith(param.parentFolderId, 'f:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoParentFolderSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="parentid" value="${fn:substring(param.parentFolderId, 2, -1)}"/>
                <zm:createFolder parentid="${parentid}" var="folder" name="${newFolderName}" view="conversation"/>
                <app:status>
                    <fmt:message key="actionFolderCreated">
                        <fmt:param value="${newFolderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
        <c:when test="${!empty param.actionSubscribe}">
        <c:set var="newFolderName" value="${fn:trim(param.feedFolderName)}"/>
        <c:set var="newFolderUrl" value="${fn:trim(param.feedFolderUrl)}"/>
        <c:choose>
            <c:when test="${empty newFolderName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoFolderNameSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${empty newFolderUrl}">
                <app:status style="Warning">
                    <fmt:message key="actionNoUrlSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${!fn:startsWith(param.feedParentFolderId, 'f:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoParentFolderSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="parentid" value="${fn:substring(param.feedParentFolderId, 2, -1)}"/>
                <zm:createFolder parentid="${parentid}" var="folder" name="${newFolderName}" view="conversation" url="${newFolderUrl}"/>
                <app:status>
                    <fmt:message key="actionFolderCreated">
                        <fmt:param value="${newFolderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${!empty param.actionRename}">
        <c:set var="newName" value="${fn:trim(param.newName)}"/>
        <c:choose>
            <c:when test="${empty newName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoFolderNameSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${!fn:startsWith(param.folderToRename, 'f:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoFolderRenameSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderid" value="${fn:substring(param.folderToRename, 2, -1)}"/>
                <c:set var="oldName" value="${zm:getFolderName(pageContext, folderid)}"/>
                <zm:renameFolder id="${folderid}" newname="${newName}"/>
                <app:status>
                    <fmt:message key="actionFolderRenamed">
                        <fmt:param value="${oldName}"/>
                        <fmt:param value="${newName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${!empty param.actionMove}">
        <c:choose>
            <c:when test="${!fn:startsWith(param.folderToMove, 'f:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoFolderMoveSelected"/>
                </app:status>
            </c:when>
            <c:when test="${!fn:startsWith(param.newParentFolder, 'f:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoNewParentFolderSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderid" value="${fn:substring(param.folderToMove, 2, -1)}"/>
                <c:set var="folderName" value="${zm:getFolderName(pageContext, folderid)}"/>
                <c:set var="parentid" value="${fn:substring(param.newParentFolder, 2, -1)}"/>
                <zm:moveFolder id="${folderid}" parentid="${parentid}"/>
                <app:status>
                    <fmt:message key="actionFolderMoved">
                        <fmt:param value="${folderName}"/>
                        <c:choose>
                            <c:when test="${parentid == 1}">
                                <fmt:param><fmt:message key="rootFolder"/></fmt:param>
                            </c:when>
                            <c:otherwise>
                                <fmt:param value="${zm:getFolderName(pageContext, parentid)}"/>
                            </c:otherwise>
                        </c:choose>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${!empty param.actionDelete}">
        <c:choose>
            <c:when test="${!fn:startsWith(param.folderToDelete, 'f:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoFolderDeleteSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderid" value="${fn:substring(param.folderToDelete, 2, -1)}"/>
                <c:set var="folderName" value="${zm:getFolderName(pageContext, folderid)}"/>
                <zm:moveFolder id="${folderid}" parentid="3"/>
                <app:status>
                    <fmt:message key="actionFolderMovedToTrash">
                        <fmt:param value="${folderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${!empty param.actionMarkRead}">
        <c:choose>
            <c:when test="${!fn:startsWith(param.folderToMarkRead, 'f:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoFolderMarkReadSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderid" value="${fn:substring(param.folderToMarkRead, 2, -1)}"/>
                <c:set var="folderName" value="${zm:getFolderName(pageContext, folderid)}"/>
                <zm:markFolderRead id="${folderid}"/>
                <app:status>
                    <fmt:message key="actionFolderMarkRead">
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

