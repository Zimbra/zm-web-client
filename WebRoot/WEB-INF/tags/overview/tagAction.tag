<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>


<app:handleError>
<c:choose>
    <c:when test="${!empty param.actionCreate}">
        <c:set var="newTagName" value="${fn:trim(param.newTagName)}"/>
        <c:choose>
            <c:when test="${empty newTagName}">
                <app:status style="Warning">
                    <fmt:message key="actionNoTagNameSpecified"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <zm:createTag var="newid" name="${newTagName}" color="${param.newTagColor}"/>
                <app:status>
                    <fmt:message key="actionTagCreated">
                        <fmt:param value="${newTagName}"/>
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
                    <fmt:message key="actionNoTagNameSpecified"/>
                </app:status>
            </c:when>
            <c:when test="${!fn:startsWith(param.tagToRename, 't:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoTagRenameSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="tagid" value="${fn:substring(param.tagToRename, 2, -1)}"/>
                <c:set var="oldName" value="${zm:getTagName(pageContext, tagid)}"/>
                <zm:renameTag id="${tagid}" newname="${newName}"/>                        
                <app:status>
                    <fmt:message key="actionTagRenamed">
                        <fmt:param value="${oldName}"/>
                        <fmt:param value="${newName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${!empty param.actionColorChange}">
        <c:set var="newColor" value="${fn:trim(param.newColor)}"/>
        <c:choose>
            <c:when test="${!fn:startsWith(param.tagToChangeColor, 't:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoTagChangeColorSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="tagid" value="${fn:substring(param.tagToChangeColor, 2, -1)}"/>
                <c:set var="tagName" value="${zm:getTagName(pageContext, tagid)}"/>
                <zm:modifyTagColor id="${tagid}" color="${param.newColor}"/>
                <app:status>
                    <fmt:message key="${newColor}" var="colorMsg"/>
                    <fmt:message key="actionTagColorChanged">
                        <fmt:param value="${tagName}"/>
                        <fmt:param value="${colorMsg}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${!empty param.actionDelete}">
        <c:choose>
            <c:when test="${!fn:startsWith(param.tagToDelete, 't:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoTagToDeleteSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="tagid" value="${fn:substring(param.tagToDelete, 2, -1)}"/>
                <c:set var="tagName" value="${zm:getTagName(pageContext, tagid)}"/>
                <zm:deleteTag id="${tagid}"/>                
                <app:status>
                    <fmt:message key="actionTagDeleted">
                        <fmt:param value="${tagName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:when test="${!empty param.actionMarkRead}">
        <c:choose>
            <c:when test="${!fn:startsWith(param.tagToMarkRead, 't:')}">
                <app:status style="Warning">
                    <fmt:message key="actionNoTagMarkReadSelected"/>
                </app:status>
            </c:when>
            <c:otherwise>
                <c:set var="tagid" value="${fn:substring(param.tagToMarkRead, 2, -1)}"/>
                <c:set var="tagName" value="${zm:getTagName(pageContext, tagid)}"/>
                <zm:markTagRead id="${tagid}"/>
                <app:status>
                    <fmt:message key="actionTagMarkRead">
                        <fmt:param value="${tagName}"/>
                    </fmt:message>
                </app:status>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:otherwise>

    </c:otherwise>
</c:choose>
</app:handleError>
