<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
<zm:getMailbox var="mailbox"/>
<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/>
<c:choose>
    <c:when test="${not empty param.actionEmpty and (param.contextFolderId eq mailbox.trash.id or param.contextFolderId eq mailbox.spam.id)}">
        <zm:emptyFolder id="${param.contextFolderId}"/>
        <app:status>
            <fmt:message key="folderEmptied">
                <fmt:param value="${zm:getFolderName(pageContext, param.contextFolderId)}"/>
            </fmt:message>
        </app:status>
    </c:when>
    <c:when test="${!empty param.actionCreate}">
        <app:editContactAction id="${param.id}"/>
        <app:status><fmt:message key="contactCreated"/></app:status>
        <zm:clearSearchCache type="contact"/>
    </c:when>
    <c:when test="${!empty param.actionModify}">
        <app:editContactAction id="${param.id}"/>
        <app:status><fmt:message key="contactModified"/></app:status>
    </c:when>
    <c:when test="${!empty param.actionCancelCreate}">
        <app:status style="Warning"><fmt:message key="contactCancelCreate"/></app:status>
    </c:when>
    <c:when test="${!empty param.actionCancelModify}">
        <app:status style="Warning"><fmt:message key="contactCancelModify"/></app:status>
    </c:when>
    <c:when test="${!empty param.actionNew}">
        <jsp:forward page="/h/econtact"/>
    </c:when>
    <c:when test="${!empty param.actionNewGroup}">
        <jsp:forward page="/h/econtact"/>
    </c:when>
    <c:when test="${!empty param.actionEdit}">
        <jsp:forward page="/h/econtact"/>
    </c:when>
    <c:when test="${empty ids}">
        <app:status style="Warning"><fmt:message key="actionNoContactSelected"/></app:status>
    </c:when>
    <c:otherwise>
        <c:choose>
            <c:when test="${!empty param.actionDelete}">
                <zm:moveContact  var="result" id="${ids}" folderid="${mailbox.trash.id}"/>
                <app:status>
                    <fmt:message key="actionContactMovedTrash">
                        <fmt:param value="${result.idCount}"/>
                    </fmt:message>
                </app:status>
            </c:when>
            <c:when test="${!empty param.actionHardDelete}">
                <zm:deleteContact  var="result" id="${ids}"/>
                <app:status>
                    <fmt:message key="actionContactHardDeleted">
                        <fmt:param value="${result.idCount}"/>
                    </fmt:message>
                </app:status>
            </c:when>
            <c:when test="${fn:startsWith(param.actionOp, 't:') or fn:startsWith(param.actionOp, 'u:')}">
                <c:set var="tag" value="${fn:startsWith(param.actionOp, 't')}"/>
                <c:set var="tagid" value="${fn:substring(param.actionOp, 2, -1)}"/>
                <zm:tagContact tagid="${tagid}"var="result" id="${ids}" tag="${tag}"/>
                <app:status>
                    <fmt:message key="${tag ? 'actionContactTag' : 'actionContactUntag'}">
                        <fmt:param value="${result.idCount}"/>
                        <fmt:param value="${zm:getTagName(pageContext, tagid)}"/>
                    </fmt:message>
                </app:status>
            </c:when>
            <c:when test="${fn:startsWith(param.folderId, 'm:')}">
                <c:set var="folderid" value="${fn:substring(param.folderId, 2, -1)}"/>
                <zm:moveContact folderid="${folderid}"var="result" id="${ids}"/>
                <app:status>
                    <fmt:message key="actionContactMoved">
                        <fmt:param value="${result.idCount}"/>
                        <fmt:param value="${zm:getFolderName(pageContext, folderid)}"/>
                    </fmt:message>
                </app:status>
            </c:when>
            <c:when test="${!empty param.actionMove}">
                <app:status style="Warning"><fmt:message key="actionNoFolderSelected"/></app:status>
            </c:when>
            <c:otherwise>
                <app:status style="Warning"><fmt:message key="actionNoActionSelected"/></app:status>
            </c:otherwise>
        </c:choose>
    </c:otherwise>
</c:choose>
</app:handleError>