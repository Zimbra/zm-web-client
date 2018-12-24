<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2013, 2014, 2015, 2016 Synacor, Inc.
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
<%@ attribute name="context" rtexprvalue="true" required="false" type="com.zimbra.cs.taglib.tag.SearchContext"%>

<app:handleError>
<zm:requirePost/>
<zm:getMailbox var="mailbox"/>
<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/>
<c:set var="messageIds" value="${paramValues.id}"/>
<c:set var="folderId" value="${not empty paramValues.folderId[0] ? paramValues.folderId[0] : paramValues.folderId[1]}"/>
<c:set var="actionOp" value="${not empty paramValues.actionOp[0] ? paramValues.actionOp[0] :  paramValues.actionOp[1]}"/>
<c:set var="viewOp" value="${not empty paramValues.viewOp[0] ? paramValues.viewOp[0] :  paramValues.viewOp[1]}"/>
<c:set var="readingPaneOp" value="${not empty paramValues.readingPaneOp[0] ? paramValues.readingPaneOp[0] :  paramValues.readingPaneOp[1]}"/>
<c:set var="actionSort" value="${not empty paramValues.actionSort[0] ? paramValues.actionSort[0] :  paramValues.actionSort[1]}"/>
<c:set var="dragMsgId" value="${not empty paramValues.dragMsgId[0] ? paramValues.dragMsgId[0] : paramValues.dragMsgId[1]}"/>
<c:set var="dragTargetFolder" value="${not empty paramValues.dragTargetFolder[0] ? paramValues.dragTargetFolder[0] : paramValues.dragTargetFolder[1]}"/>
<c:if test="${not empty dragMsgId}">
	<c:set var="ids" value="${dragMsgId}"/>	
</c:if>
<c:choose>
	<c:when test="${zm:actionSet(param, 'actionCompose')}">
		<jsp:forward page="/h/compose"/>
	</c:when>
	<c:when test="${zm:actionSet(param, 'actionMarkTagRead')}">
		<c:set var="tagName" value="${zm:getTagName(pageContext, param.contextTagId)}"/>
		<zm:markTagRead id="${param.contextTagId}"/>
		<app:status>
			<fmt:message key="actionTagMarkRead">
				<fmt:param value="${tagName}"/>
			</fmt:message>
		</app:status>
	</c:when>
	<c:when test="${zm:actionSet(param, 'actionMarkFolderRead')}">
		<zm:checkCrumb crumb="${param.crumb}"/>
		<c:set var="folderName" value="${zm:getFolderName(pageContext, param.contextFolderId)}"/>
		<zm:markFolderRead id="${param.contextFolderId}"/>
		<app:status>
			<fmt:message key="actionFolderMarkRead">
				<fmt:param value="${folderName}"/>
			</fmt:message>
		</app:status>
	</c:when>
		<c:when test="${zm:actionSet(param, 'actionMarkConvRead')}">
			<zm:checkCrumb crumb="${param.crumb}"/>
			<zm:markConversationRead read="true" var="result" id="${param.contextConvId}"/>
			<app:status>
				<fmt:message key="actionConvMarkedRead">
					<fmt:param value="${result.idCount}"/>
				</fmt:message>
			</app:status>
		</c:when>
	<c:when test="${zm:actionSet(param, 'actionEmpty') and (param.contextFolderId eq mailbox.trash.id) and (param.confirmed ne '1')}">
		<zm:checkCrumb crumb="${param.crumb}"/>
		<app:status html="true" block="true">
			<fmt:message key="confirmEmptyTrashFolder">
				<fmt:param value="<form style='padding:0px;margin:0px;' action='?doMessageAction=1&actionEmpty=true&${pageContext.request.queryString}' method='post'><input type='hidden' name='confirmed' value='1'/><input type='hidden' name='crumb' value='${fn:escapeXml(mailbox.accountInfo.crumb)}'/><input type='hidden' name='contextFolderId' value='${param.contextFolderId}'/>"/>
				<fmt:param value="<input type='submit' value='yes'>"/>
				<fmt:param value="</form>"/>
			</fmt:message>
		</app:status>
	</c:when>
	<c:when test="${zm:actionSet(param, 'actionEmpty') and ((param.contextFolderId eq mailbox.trash.id and param.confirmed eq '1')  or param.contextFolderId eq mailbox.spam.id)}">
		<zm:checkCrumb crumb="${param.crumb}"/>
		<zm:emptyFolder id="${param.contextFolderId}"/>
		<app:status>
			<fmt:message key="folderEmptied">
				<fmt:param value="${zm:getFolderName(pageContext, param.contextFolderId)}"/>
			</fmt:message>
		</app:status>
	</c:when>
	<c:when test="${zm:actionSet(param, 'actionLoadFeed')}">
		<zm:syncFolder id="${param.contextFolderId}"/>
		<zm:clearSearchCache/>
		<app:status>
			<fmt:message key="feedLoaded">
				<fmt:param value="${zm:getFolderName(pageContext, param.contextFolderId)}"/>
			</fmt:message>
		</app:status>
	</c:when>
	<c:when test="${zm:actionSet(param, 'actionNewShare')}">
		<c:choose>
			<c:when test="${empty param.newFolderName}">
				<fmt:message key="actionNoNameSpecified"/>
			</c:when>
			<c:otherwise>
				<c:set var="newFlags" value="${param.newFolderView eq 'appointment' ? '#' : ''}"/>
				<zm:createMountpoint var="result" parentid="${param.newFolderParentId}"
									name="${param.newFolderName}"
									ownerby="BY_ID"
									owner="${param.newFolderGrantorId}"
									shareditemby="BY_ID"
									shareditem="${param.newFolderLinkId}"
									color="${param.newFolderColor}"
									flags="${newFlags}"
									view="${param.newFolderView}"/>
				<app:status>
					<fmt:message key="shareAccepted"/>
				</app:status>
			</c:otherwise>
		</c:choose>
	</c:when>
	<c:when test="${zm:actionSet(param, 'sortAction')}">
		<c:url var="redirectUrl" value="search">
			<c:if test="${not empty param.st}">
				<c:param name="st" value="${fn:escapeXml(param.st)}"/>
			</c:if>
			<c:if test="${not empty param.sfi}">
				<c:param name="sfi" value="${fn:escapeXml(param.sfi)}"/>
			</c:if>
			<c:if test="${not empty param.sq}">
				<c:param name="sq" value="${fn:escapeXml(param.sq)}"/>
			</c:if>
			<c:if test="${not empty param.search}">
				<c:param name="search" value="${fn:escapeXml(param.search)}"/>
			</c:if>
		</c:url>
		<c:choose>
			<c:when test="${actionSort eq 'subjAsc'}">
				<c:redirect url="${redirectUrl}&ss=subjAsc"/>
			</c:when>
			<c:when test="${actionSort eq 'subjDesc'}">
				<c:redirect url="${redirectUrl}&ss=subjDesc"/>
			</c:when>
			<c:when test="${actionSort eq 'dateAsc'}">
				<c:redirect url="${redirectUrl}&ss=dateAsc"/>
			</c:when>
			<c:when test="${actionSort eq 'dateDesc'}">
				<c:redirect url="${redirectUrl}&ss=dateDesc"/>
			</c:when>
			<c:when test="${actionSort eq 'nameAsc'}">
				<c:redirect url="${redirectUrl}&ss=nameAsc"/>
			</c:when>
			<c:when test="${actionSort eq 'nameDesc'}">
				<c:redirect url="${redirectUrl}&ss=nameDesc"/>
			</c:when>
		</c:choose>
	</c:when>
	<c:when test="${zm:actionSet(param, 'viewAction')}">
		<c:choose>
			<c:when test="${viewOp eq 'byConv'}">
				<zm:modifyPrefs var="updated">
					<zm:pref name="zimbraPrefGroupMailBy" value="conversation"/>
				</zm:modifyPrefs>
				<c:url var="redirectUrl" value="search?st=conversation">
					<c:if test="${not empty param.sfi}">
						<c:param name="sfi" value="${fn:escapeXml(param.sfi)}"/>
					</c:if>
					<c:if test="${not empty param.sq}">
						<c:param name="sq" value="${fn:escapeXml(param.sq)}"/>
					</c:if>
					<c:if test="${not empty param.search}">
						<c:param name="search" value="${fn:escapeXml(param.search)}"/>
					</c:if>
				</c:url>
			</c:when>
			<c:when test="${viewOp eq 'byMsg'}">
				<zm:modifyPrefs var="updated">
					<zm:pref name="zimbraPrefGroupMailBy" value="message"/>
				</zm:modifyPrefs>
				<c:url var="redirectUrl" value="search?st=message">
					<c:if test="${not empty param.sfi}">
						<c:param name="sfi" value="${fn:escapeXml(param.sfi)}"/>
					</c:if>
					<c:if test="${not empty param.sq}">
						<c:param name="sq" value="${fn:escapeXml(param.sq)}"/>
					</c:if>
					<c:if test="${not empty param.search}">
						<c:param name="search" value="${fn:escapeXml(param.search)}"/>
					</c:if>
				</c:url>
			</c:when>
			<%--<c:when test="${actionOp eq 'byMsg'}">
				<zm:modifyPrefs var="updated">
					<zm:pref name="zimbraPrefGroupMailBy" value="message"/>
				</zm:modifyPrefs>
				<c:url var="redirectUrl" value="search?st=message">
					<c:if test="${not empty param.sfi}">
						<c:param name="sfi" value="${fn:escapeXml(param.sfi)}"/>
					</c:if>
					<c:if test="${not empty param.sq}">
						<c:param name="sq" value="${fn:escapeXml(param.sq)}"/>
					</c:if>
					<c:if test="${not empty param.search}">
						<c:param name="search" value="${fn:escapeXml(param.search)}"/>
					</c:if>
				</c:url>
				<c:redirect url="${redirectUrl}"/>
			</c:when>--%>
		</c:choose>
		<c:if test="${updated and not empty redirectUrl}">
		<%--<c:if test="${not empty redirectUrl}">--%>
			<zm:getMailbox var="mailbox" refreshaccount="${true}"/>
			<c:redirect url="${redirectUrl}"/>
		</c:if>
	</c:when>
    <c:when test="${zm:actionSet(param, 'readingPaneAction')}">
    <c:choose>
        <c:when test="${readingPaneOp eq 'bottom'}">
            <zm:modifyPrefs var="updated">
                  <zm:pref name="zimbraPrefReadingPaneLocation" value="bottom"/>
            </zm:modifyPrefs>
            <c:url var="redirectUrl" value="search?st=message">
					<c:if test="${not empty param.sfi}">
						<c:param name="sfi" value="${fn:escapeXml(param.sfi)}"/>
					</c:if>
					<c:if test="${not empty param.sq}">
						<c:param name="sq" value="${fn:escapeXml(param.sq)}"/>
					</c:if>
					<c:if test="${not empty param.search}">
						<c:param name="search" value="${fn:escapeXml(param.search)}"/>
					</c:if>
                    <c:param name="action" value="rowView"/>
		    </c:url>
        </c:when>
        <c:when test="${readingPaneOp eq 'right'}">
            <zm:modifyPrefs var="updated">
                  <zm:pref name="zimbraPrefReadingPaneLocation" value="right"/>
            </zm:modifyPrefs>
            <c:url var="redirectUrl" value="search?st=message">
					<c:if test="${not empty param.sfi}">
						<c:param name="sfi" value="${fn:escapeXml(param.sfi)}"/>
					</c:if>
					<c:if test="${not empty param.sq}">
						<c:param name="sq" value="${fn:escapeXml(param.sq)}"/>
					</c:if>
					<c:if test="${not empty param.search}">
						<c:param name="search" value="${fn:escapeXml(param.search)}"/>
					</c:if>
                    <c:param name="action" value="paneView"/>
		    </c:url>
        </c:when>
        <c:when test="${readingPaneOp eq 'off'}">
            <zm:modifyPrefs var="updated">
                  <zm:pref name="zimbraPrefReadingPaneLocation" value="off"/>
            </zm:modifyPrefs>
            <c:url var="redirectUrl" value="search?st=message">
					<c:if test="${not empty param.sfi}">
						<c:param name="sfi" value="${fn:escapeXml(param.sfi)}"/>
					</c:if>
					<c:if test="${not empty param.sq}">
						<c:param name="sq" value="${fn:escapeXml(param.sq)}"/>
					</c:if>
					<c:if test="${not empty param.search}">
						<c:param name="search" value="${fn:escapeXml(param.search)}"/>
					</c:if>
                    <%--<c:param name="action" value="view"/>--%>
		    </c:url>
        </c:when>
    </c:choose>
    <c:if test="${updated and not empty redirectUrl}">
    	<zm:getMailbox var="mailbox" refreshaccount="${true}"/>
		<c:redirect url="${redirectUrl}"/>
	</c:if>
    </c:when>
	<c:when test="${empty ids}">
		<app:status style="Warning"><fmt:message key="actionNoMessageSelected"/></app:status>
	</c:when>
	<c:otherwise>
		<c:choose>
			<c:when test="${zm:actionSet(param, 'actionSpam')}">
				<zm:checkCrumb crumb="${param.crumb}"/>
				<zm:markMessageSpam  var="result" id="${ids}" spam="true"/>
				<app:status>
					<fmt:message key="actionMessageMarkedSpam">
						<fmt:param value="${result.idCount}"/>
					</fmt:message>
				</app:status>
				<c:if test="${not empty messageIds}">
				<c:forEach items="${messageIds}" var="id">
					<zm:getMessage var="mMessage" id="${id}"/>
					<c:set var="mAddresses" value="${mMessage.getEmailAddresses()}"/>
					<c:set var="addressesLength" value="${fn:length(mAddresses)}"/>
					<c:forEach items="${mAddresses}" var="mAddress">
						<c:if test="${mAddress.type == 'f'}">
							<c:set var="email" value="${mAddress.address}"/>
							<app:constructAutoSpam var="filterRule" address="${email}"/>
							<c:catch var="filterDuplicate">
								<zm:createFilterRule rule="${filterRule}"/>
							</c:catch>
						</c:if>
					</c:forEach>
				</c:forEach>
			</c:if>
			</c:when>
			<c:when test="${zm:actionSet(param, 'actionPrint')}">
				<zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${result.idCount}"/>
				<jsp:forward page="${fn:escapeXml(newWindowUrl)}&print=true" />
			</c:when>
			<c:when test="${zm:actionSet(param, 'actionNotSpam')}">
				<zm:checkCrumb crumb="${param.crumb}"/>
				<zm:markMessageSpam  var="result" id="${ids}" spam="false"/>
				<app:status>
					<fmt:message key="actionMessageMarkedNotSpam">
						<fmt:param value="${result.idCount}"/>
					</fmt:message>
				</app:status>
			</c:when>
			<c:when test="${zm:actionSet(param, 'actionDelete')}">
				<zm:checkCrumb crumb="${param.crumb}"/>
				<zm:trashMessage  var="result" id="${ids}"/>
				<c:set var="mesgCount" value="${result.idCount}" />
				<app:status>
					<fmt:message key="actionMessageMovedTrash">
						<fmt:param value="${result.idCount}"/>
					</fmt:message>
				</app:status>
				<c:if test="${not empty param.delRedirectUrl}" >
					<zm:redirect url="${param.delRedirectUrl}&actionMessageMovedTrash=${true}&mesgcount=${mesgCount}" />
				</c:if>
			</c:when>
			<c:when test="${zm:actionSet(param, 'actionHardDelete')}">
				<zm:checkCrumb crumb="${param.crumb}"/>
				<zm:deleteMessage  var="result" id="${ids}"/>
				<app:status>
					<fmt:message key="actionMessageHardDeleted">
						<fmt:param value="${result.idCount}"/>
					</fmt:message>
				</app:status>
			</c:when>
			<c:when test="${actionOp eq 'unread' or actionOp eq 'read'}">
				<zm:checkCrumb crumb="${param.crumb}"/>
				<zm:markMessageRead var="result" id="${ids}" read="${actionOp eq 'read'}"/>
				<app:status>
					<fmt:message key="${actionOp eq 'read' ? 'actionMessageMarkedRead' : 'actionMessageMarkedUnread'}">
						<fmt:param value="${result.idCount}"/>
					</fmt:message>
				</app:status>
				<c:if test="${actionOp ne 'read'}">
					<c:set var="idsMarkedUnread" value="${paramValues.id}" scope="request"/>
				</c:if>
			</c:when>
			<c:when test="${actionOp eq 'actionSpam'}">
			<%--this is for when in message mode but viewing the full conversation of a message--%>
				<zm:markConversationSpam  var="result" id="${param.contextConvId}" spam="true"/>
				<app:status>
					<fmt:message key="actionConvMarkedSpam">
						<fmt:param value="${result.idCount}"/>
					</fmt:message>
				</app:status>
				<zm:getConversation var="conversation" id="${param.contextConvId}"/>
					<c:set var="summaries" value="${conversation.messageSummaries}"/>
					<c:set var="email" value="${summaries[0].sender.address}"/>
					<app:constructAutoSpam var="filterRule" address="${email}"/>
					<c:catch var="duplicateFilter">
						<zm:createFilterRule rule="${filterRule}"/>
					</c:catch>
			</c:when>
			<c:when test="${actionOp eq 'actionNotSpam'}">
				<zm:markConversationSpam  var="result" id="${param.contextConvId}" spam="false"/>
				<app:status>
					<fmt:message key="actionConvMarkedNotSpam">
						<fmt:param value="${result.idCount}"/>
					</fmt:message>
				</app:status>
			</c:when>
			<c:when test="${actionOp eq 'flag' or actionOp eq 'unflag'}">
				<zm:checkCrumb crumb="${param.crumb}"/>
				<zm:flagMessage var="result" id="${ids}" flag="${actionOp eq 'flag'}"/>
				<app:status>
					<fmt:message key="${actionOp eq 'flag' ? 'actionMessageFlag' : 'actionMessageUnflag'}">
						<fmt:param value="${result.idCount}"/>
					</fmt:message>
				</app:status>
			</c:when>
			<c:when test="${fn:startsWith(actionOp, 't:') or fn:startsWith(actionOp, 'u:')}">
				<zm:checkCrumb crumb="${param.crumb}"/>
				<c:set var="untagall" value="${fn:startsWith(actionOp, 'u:all')}"/>
				<c:choose>
					<c:when test="${untagall}" >
						<zm:forEachTag var="eachtag">
							<zm:tagMessage tagid="${eachtag.id}" var="result" id="${ids}" tag="false"/>
						</zm:forEachTag>
						<app:status>
							<fmt:message key="${'actionMessageUntagAll'}">
								<fmt:param value="${result.idCount}"/>
							</fmt:message>
						</app:status>
					</c:when>
					<c:otherwise>
						<c:set var="tag" value="${fn:startsWith(actionOp, 't')}"/>
						<c:set var="tagid" value="${fn:substring(actionOp, 2, -1)}"/>
						<zm:tagMessage tagid="${tagid}" var="result" id="${ids}" tag="${tag}"/>
						<app:status>
							<fmt:message key="${tag ? 'actionMessageTag' : 'actionMessageUntag'}">
								<fmt:param value="${result.idCount}"/>
								<fmt:param value="${zm:getTagName(pageContext, tagid)}"/>
							</fmt:message>
						</app:status>
					</c:otherwise>
				</c:choose>
			</c:when>
			<c:when test="${fn:startsWith(dragTargetFolder, 'm:')}">
				<c:set var="dragFolderid" value="${fn:substring(dragTargetFolder, 2, -1)}"/>
				<c:set var="movedFolderName" value="${zm:getFolderName(pageContext, dragFolderid)}"/>
				<zm:checkCrumb crumb="${param.crumb}"/>
				<zm:moveMessage folderid="${dragFolderid}" var="result" id="${ids}"/>
				<app:status>
					<fmt:message  key="actionMessageMoved">
						<fmt:param value="${result.idCount}"/>
						<fmt:param value="${movedFolderName}"/>
					</fmt:message>
				</app:status>
			</c:when>	
			<c:when test="${fn:startsWith(folderId, 'm:')}">
				<c:set var="folderid" value="${fn:substring(folderId, 2, -1)}"/>
				<c:set var="movedFolderName" value="${zm:getFolderName(pageContext, folderid)}"/>
				<zm:checkCrumb crumb="${param.crumb}"/>
				<zm:moveMessage folderid="${folderid}" var="result" id="${ids}"/>
				<app:status>
					<fmt:message  key="actionMessageMoved">
						<fmt:param value="${result.idCount}"/>
						<fmt:param value="${movedFolderName}"/>
					</fmt:message>
				</app:status>
				<c:if test="${not empty param.delRedirectUrl}" >
					<zm:redirect url="${param.delRedirectUrl}&actionMessageMoved=${true}&movedFolderId=${folderid}"/>
				</c:if>
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
