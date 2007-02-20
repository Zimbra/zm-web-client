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
        <c:set var="newFolderColor" value="${fn:trim(param.newFolderColor)}"/>
        <c:choose>
            <c:when test="${empty newFolderName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookNameSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:createFolder parentid="1" var="folder" name="${newFolderName}" view="contact" color="${fn:substring(newFolderColor,2,-1)}"/>
                <app:status>
                    <fmt:message key="actionAddressBookCreated">
                        <fmt:param value="${newFolderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${!empty param.actionLink}">
        <c:set var="linkedOwnersEmail" value="${fn:trim(param.linkedOwnersEmail)}"/>
        <c:set var="linkedOwnersAddressBook" value="${fn:trim(param.linkedOwnersAddressBook)}"/>
        <c:set var="linkedFolderName" value="${fn:trim(param.linkedFolderName)}"/>
        <c:set var="linkedFolderColor" value="${fn:trim(param.linkedFolderColor)}"/>
        <c:choose>
            <c:when test="${empty linkedOwnersEmail}">
                <app:status style="Warning">
                    <fmt:message key="actionNoOwnerEmailSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${empty linkedOwnersAddressBook}">
                <app:status style="Warning">
                    <fmt:message key="actionNoOwnerAddressBookSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${empty linkedFolderName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookNameSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:createMountpoint owner="${linkedOwnersEmail}" ownerby="BY_NAME"
                                     shareditem="${linkedOwnersAddressBook}" shareditemby="BY_PATH"
                                     parentid="1" var="folder" name="${linkedFolderName}"
                                     view="contact" color="${fn:substring(linkedFolderColor,2,-1)}"/>
                <app:status>
                    <fmt:message key="actionAddressBookCreated">
                        <fmt:param value="${linkedFolderName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty param.actionChangeColor}">
        <c:choose>
            <c:when test="${!fn:startsWith(param.folderToChangeColor, 'f:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookSelected"/>
                </app:status>
            </c:when>
            <c:when test="${not fn:startsWith(param.newColor, 'c:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoColorSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderid" value="${fn:substring(param.folderToChangeColor, 2, -1)}"/>
                <c:set var="color" value="${fn:substring(param.newColor, 2, -1)}"/>
                <zm:modifyFolderColor id="${folderid}" color="${color}"/>
                <c:set var="folderName" value="${zm:getFolderName(pageContext, folderid)}"/>
                <app:status>
                    <fmt:message key="${color}" var="colorMsg"/>
                    <fmt:message key="actionAddressBookColorChanged">
                        <fmt:param value="${folderName}"/>
                        <fmt:param value="${colorMsg}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${not empty param.actionRename}">
        <c:set var="newName" value="${fn:trim(param.newName)}"/>
        <c:choose>
            <c:when test="${empty newName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookNameSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${!fn:startsWith(param.folderToRename, 'f:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderid" value="${fn:substring(param.folderToRename, 2, -1)}"/>
                <c:set var="oldName" value="${zm:getFolderName(pageContext, folderid)}"/>
                <zm:renameFolder id="${folderid}" newname="${newName}"/>
                <app:status>
                    <fmt:message key="actionAddressBookRenamed">
                        <fmt:param value="${oldName}"/>
                        <fmt:param value="${newName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${!empty param.actionDelete}">
        <c:choose>
            <c:when test="${!fn:startsWith(param.folderToDelete, 'f:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoAddressBookSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="folderid" value="${fn:substring(param.folderToDelete, 2, -1)}"/>
                <c:set var="folderName" value="${zm:getFolderName(pageContext, folderid)}"/>
                <zm:moveFolder id="${folderid}" parentid="3"/>
                <app:status>
                    <fmt:message key="actionAddressBookMovedToTrash">
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

