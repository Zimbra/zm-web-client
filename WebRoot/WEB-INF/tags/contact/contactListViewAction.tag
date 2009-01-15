<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
<zm:getMailbox var="mailbox"/>

<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/>
<c:set var="folderId" value="${not empty paramValues.folderId[0] ? paramValues.folderId[0] : paramValues.folderId[1]}"/>
<c:set var="actionOp" value="${not empty paramValues.actionOp[0] ? paramValues.actionOp[0] :  paramValues.actionOp[1]}"/>
<c:set var="searchQuery" value="${not empty paramValues.contactsq[0] ? paramValues.contactsq[0] :  paramValues.contactsq[1]}"/>
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
    <c:when test="${zm:actionSet(param, 'actionSearch')}">
        <c:redirect url="/h/search?sq=${searchQuery}&st=contact&search=Search"/>
    </c:when>
</c:choose>

<c:choose>
    <c:when test="${zm:actionSet(param, 'actionEmpty') and (param.contextFolderId eq mailbox.trash.id) and (param.confirmed ne '1')}">
        <zm:checkCrumb crumb="${param.crumb}"/>
        <app:status html="true">
            <fmt:message key="confirmEmptyTrashFolder">
                <fmt:param value="<form style='padding:0px;margin:0px;' action='?doContactListViewAction=1&actionEmpty=true&${pageContext.request.queryString}' method='post'><input type='hidden' name='confirmed' value='1'/><input type='hidden' name='crumb' value='${fn:escapeXml(mailbox.accountInfo.crumb)}'/><input type='hidden' name='contextFolderId' value='${param.contextFolderId}'/>"/>
                <fmt:param value="<input type='submit' value='yes'>"/>
                <fmt:param value="</form>"/>
            </fmt:message>
        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionEmpty') and (param.confirmed eq '1') and (param.contextFolderId eq mailbox.trash.id or param.contextFolderId eq mailbox.spam.id)}">
        <zm:checkCrumb crumb="${param.crumb}"/>
        <zm:emptyFolder id="${param.contextFolderId}"/>
        <app:status>
            <fmt:message key="folderEmptied">
                <fmt:param value="${zm:getFolderName(pageContext, param.contextFolderId)}"/>
            </fmt:message>
        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionCreate') and not contactError}">
        <zm:checkCrumb crumb="${param.crumb}"/>
        <app:editContactAction id="${param.id}"/>
        <app:status><fmt:message key="${not empty param.dlist and param.isgroup ? 'contactGroupCreated' :'contactCreated'}"/></app:status>
        <zm:clearSearchCache type="contact"/>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionModify') and not contactError}">
        <zm:checkCrumb crumb="${param.crumb}"/>
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
    <c:when test="${empty ids}">
        <app:status style="Warning"><fmt:message key="actionNoContactSelected"/></app:status>
    </c:when>
    <c:otherwise>
        <zm:checkCrumb crumb="${param.crumb}"/>
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
            <c:when test="${zm:actionSet(param, 'actionCompose')}">
                <c:set var="contactIds" value="" />
                <c:forEach items="${ids}" var="id">
                    <c:if test="${not empty contactIds}"><c:set var="sep" value=", " /></c:if>
                    <zm:getContact var="contact" id="${id}" />
                    <c:choose>
                        <c:when test="${contact.isGroup}">
                            <c:set var="emailIds" value="" />
                            <c:forEach var="member" items="${contact.groupMembers}">
                                <c:if test="${not empty emailIds}"><c:set var="grpsep" value=", " /></c:if>
                                <c:set var="emailIds" value="${emailIds}${grpsep}${member}" /> 
                                </tr>
                            </c:forEach>
                        </c:when>
                        <c:otherwise>
                            <c:set var="emailIds" value="${contact.email}" />
                        </c:otherwise>
                    </c:choose>
                    <c:set var="contactIds" value="${contactIds}${sep}${emailIds}" />
                </c:forEach>
                <c:redirect url="/h/search?action=compose&to=${contactIds}" />
            </c:when>
            <c:when test="${fn:startsWith(actionOp, 't:') or fn:startsWith(actionOp, 'u:')}">
                <c:set var="untagall" value="${fn:startsWith(actionOp, 'u:all')}"/>
                <c:choose>
                    <c:when test="${untagall}" >
                        <zm:forEachTag var="eachtag">
                            <zm:tagContact tagid="${eachtag.id}" var="result" id="${ids}" tag="false"/>
                        </zm:forEachTag>
                        <app:status>
                            <fmt:message key="${'actionContactUntagAll'}">
                                <fmt:param value="${result.idCount}"/>
                            </fmt:message>
                        </app:status>
                    </c:when>
                    <c:otherwise>
                <c:set var="tag" value="${fn:startsWith(actionOp, 't')}"/>
                <c:set var="tagid" value="${fn:substring(actionOp, 2, -1)}"/>
                <zm:tagContact tagid="${tagid}"var="result" id="${ids}" tag="${tag}"/>
                <app:status>
                    <fmt:message key="${tag ? 'actionContactTag' : 'actionContactUntag'}">
                        <fmt:param value="${result.idCount}"/>
                        <fmt:param value="${zm:getTagName(pageContext, tagid)}"/>
                    </fmt:message>
                </app:status>
                   </c:otherwise>
                </c:choose>
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