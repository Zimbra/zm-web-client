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
                    <fmt:message key="actionNoTaskListFileImportSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:importAppointments var="result" uploader="${uploader}" folderid="${uploader.params.folderId}"/>
                <app:status>
                    <fmt:message key="actionTaskListTasksImported">
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
                    <fmt:message key="actionNoTaskListNameSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:updateFolder
                        id="${uploader.params.folderId}"
                        name="${uploader.params.folderName}"
                        color="${uploader.params.folderColor}"
                        flags="${uploader.params.folderExcludeFlag}${uploader.params.folderCheckedFlag}"/>
                <app:status>
                    <fmt:message key="taskListUpdated"/>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty uploader.params.actionNew}">
         <c:choose>
            <c:when test="${empty uploader.params.newFolderName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoTaskListNameSpecified"/>
                </app:status>
            </c:when>
             <c:when test="${not empty uploader.params.newFolderOwnersEmailVisible and empty uploader.params.newFolderOwnersEmail}">
                <app:status style="Warning">
                    <fmt:message key="actionNoOwnerEmailSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${not empty uploader.params.newFolderOwnersTaskListVisible and empty uploader.params.newFolderOwnersTaskList}">
                <app:status style="Warning">
                    <fmt:message key="actionNoOwnerTaskListSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:choose>
                    <c:when test="${not empty uploader.params.newFolderOwnersEmailVisible}">
                        <zm:createMountpoint var="folder"
                                             parentid="1"
                                             name="${uploader.params.newFolderName}"
                                             view="task"
                                             color="${uploader.params.newFolderColor}"
                                             flags="${uploader.params.newFolderExcludeFlag}${uploader.params.newFolderCheckedFlag}"
                                             owner="${uploader.params.newFolderOwnersEmail}" ownerby="BY_NAME"
                                             shareditem="${uploader.params.newFolderOwnersTaskList}" shareditemby="BY_PATH"/>
                    </c:when>
                    <c:otherwise>
                        <zm:createFolder var="folder"
                                         parentid="1"
                                         name="${uploader.params.newFolderName}"
                                         view="task"
                                         color="${uploader.params.newFolderColor}"/>
                    </c:otherwise>
                </c:choose>
                <app:status>
                    <fmt:message key="actionTaskListCreated">
                        <fmt:param value="${uploader.params.newFolderName}"/>
                    </fmt:message>
                </app:status>
                <c:set var="newlyCreatedTaskListId" value="${folder.id}" scope="request"/>
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
                <zm:emptyFolder id="${uploader.params.folderEmptyId}"/>
                <c:set var="folderName" value="${zm:getFolderName(pageContext, uploader.params.folderEmptyId)}"/>
                <app:status>
                    <fmt:message key="taskListEmptied">
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
                    <fmt:message key="actionTaskListCheckConfirm"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderName" value="${folder.name}"/>
                <zm:deleteFolder id="${uploader.params.folderDeleteId}"/>
                <app:status>
                    <fmt:message key="actionTaskListDeleted">
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

