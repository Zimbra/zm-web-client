<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
<zm:getMailbox var="mailbox"/>

<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/>
<c:set var="folderId" value="${not empty paramValues.folderId[0] ? paramValues.folderId[0] : paramValues.folderId[1]}"/>
<c:set var="actionOp" value="${not empty paramValues.actionOp[0] ? paramValues.actionOp[0] :  paramValues.actionOp[1]}"/>
<c:set var="contactError" value="${false}"/>
<c:choose>
   <c:when test="${ (zm:actionSet(param, 'actionCreate') or zm:actionSet(param, 'actionModify')) and (param.isgroup and empty fn:trim(param.nickname))}">
       <c:set var="contactError" value="true"/>
        <app:status>
            <fmt:message key="noContactGroupName"/>
        </app:status>
    </c:when>
    <c:when test="${ (zm:actionSet(param, 'actionCreate') or zm:actionSet(param, 'actionModify')) and (param.isgroup and empty fn:trim(param.dlist))}">
        <c:set var="contactError" value="true"/>
        <app:status>
            <fmt:message key="noContactGroupMembers"/>
        </app:status>
    </c:when>
</c:choose>

<c:choose>
    <c:when test="${zm:actionSet(param, 'actionEmpty') and (param.contextFolderId eq mailbox.trash.id or param.contextFolderId eq mailbox.spam.id)}">
        <zm:emptyFolder id="${param.contextFolderId}"/>
        <app:status>
            <fmt:message key="folderEmptied">
                <fmt:param value="${zm:getFolderName(pageContext, param.contextFolderId)}"/>
            </fmt:message>
        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionCreate') and not contactError}">
        <app:editContactAction id="${param.id}"/>
        <app:status><fmt:message key="${not empty param.dlist and param.isgroup ? 'contactGroupCreated' :'contactCreated'}"/></app:status>
        <zm:clearSearchCache type="contact"/>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionModify') and not contactError}">
        <app:editContactAction id="${param.id}"/>
        <app:status><fmt:message key="contactModified"/></app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionCancelCreate')}">
        <app:status style="Warning"><fmt:message key="contactCancelCreate"/></app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionCancelModify')}">
        <app:status style="Warning"><fmt:message key="contactCancelModify"/></app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionNew') or param.action eq 'newcontact'}">
        <jsp:forward page="/h/econtact"/>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionNewGroup') or param.action eq 'newcontactgroup'}">
        <jsp:forward page="/h/egroup"/>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionEdit')}">
        <jsp:forward page="/h/econtact"/>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionPrint')}">
        <jsp:forward page="/h/printcontacts"/>
    </c:when>
    <c:when test="${empty ids}">
        <app:status style="Warning"><fmt:message key="actionNoContactSelected"/></app:status>
    </c:when>
    <c:otherwise>
        <c:choose>
            <c:when test="${zm:actionSet(param, 'actionDelete')}">
                <zm:requirePost/>
				<c:choose>
					<c:when test="${zm:getIsMyCard(pageContext, ids)}">
						<app:status style="Critical">
							<fmt:message key="errorMyCardDelete"/>
						</app:status>
					</c:when>
					<c:otherwise>
						<zm:trashContact  var="result" id="${ids}"/>
						<app:status>
							<fmt:message key="actionContactMovedTrash">
								<fmt:param value="${result.idCount}"/>
							</fmt:message>
						</app:status>
					</c:otherwise>
				</c:choose>
            </c:when>
            <c:when test="${zm:actionSet(param, 'actionHardDelete')}">
                <zm:requirePost/>
				<c:choose>
					<c:when test="${zm:getIsMyCard(pageContext, ids)}">
						<app:status style="Critical">
							<fmt:message key="errorMyCardDelete"/>
						</app:status>
					</c:when>
					<c:otherwise>
						<zm:deleteContact  var="result" id="${ids}"/>
						<app:status>
							<fmt:message key="actionContactHardDeleted">
								<fmt:param value="${result.idCount}"/>
							</fmt:message>
						</app:status>
					</c:otherwise>
				</c:choose>
			</c:when>
            <c:when test="${fn:startsWith(actionOp, 't:') or fn:startsWith(actionOp, 'u:')}">
                <c:set var="tag" value="${fn:startsWith(actionOp, 't')}"/>
                <c:set var="tagid" value="${fn:substring(actionOp, 2, -1)}"/>
                <zm:tagContact tagid="${tagid}"var="result" id="${ids}" tag="${tag}"/>
                <app:status>
                    <fmt:message key="${tag ? 'actionContactTag' : 'actionContactUntag'}">
                        <fmt:param value="${result.idCount}"/>
                        <fmt:param value="${zm:getTagName(pageContext, tagid)}"/>
                    </fmt:message>
                </app:status>
            </c:when>
            <c:when test="${fn:startsWith(folderId, 'm:')}">
				<c:choose>
					<c:when test="${zm:getIsMyCard(pageContext, ids)}">
						<app:status style="Critical">
							<fmt:message key="errorMyCardMove"/>
						</app:status>
					</c:when>
					<c:otherwise>
						<c:set var="folderid" value="${fn:substring(folderId, 2, -1)}"/>
						<zm:moveContact folderid="${folderid}"var="result" id="${ids}"/>
						<app:status>
							<fmt:message key="actionContactMoved">
								<fmt:param value="${result.idCount}"/>
								<fmt:param value="${zm:getFolderName(pageContext, folderid)}"/>
							</fmt:message>
						</app:status>
					</c:otherwise>
				</c:choose>
            </c:when>
            <c:when test="${zm:actionSet(param, 'actionMove')}">
                <app:status style="Warning"><fmt:message key="actionNoFolderSelected"/></app:status>
            </c:when>
            <c:otherwise>
                <app:status style="Warning"><fmt:message key="actionNoActionSelected"/></app:status>
            </c:otherwise>
        </c:choose>
    </c:otherwise>
</c:choose>
</app:handleError>