<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<zm:requirePost/>
<zm:checkCrumb crumb="${param.crumb}"/>
<zm:getMailbox var="mailbox"/>
<zm:getUserAgent var="ua" session="true"/>
<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/> <%--id param for messages--%>
<c:set var="mIdsArr" value="${paramValues.id}"/>
<c:set var="cIdsArr" value="${paramValues.cid}"/>
<c:set var="_selectedIds" scope="request" value=",${ids},"/> <%--Used to keep msg's selected in the list--%>
<c:set var="_selectedCids" scope="request" value=",${fn:join(paramValues.cid,',')},"/> <%--Used to keep conv's selected in the list--%>
<%--type var specified that whether we have to operate on Conv or Message--%>
<c:set var="type" value="Message"/> <%--assume default message--%>
<c:forEach items="${paramValues.cid}" var="ccid"> <%--cid param for conversations--%>
    <c:set var="ids" value="${ccid},${ids}"/>
    <c:set var="type" value="Conv"/> <%--type is conv is this case bcoz of cid param--%>
</c:forEach>
<c:set var="selectedCidsString" scope="request" value=",${requestScope.selectedIdsString},"/>
<c:set var="anAction"
       value="${not empty paramValues.anAction[0] ? paramValues.anAction[0] :  (not empty paramValues.anAction[1] ? paramValues.anAction[1] : paramValues.anActionBottom[0])}"/>
<c:catch var="msgActionException">
<c:choose>
<c:when test="${zm:actionSet(param,'moreActions') && anAction eq 'selectAll'}">
    <c:set var="select" value="all" scope="request"/>
</c:when>
<c:when test="${zm:actionSet(param,'moreActions') && anAction eq 'selectNone'}">
    <c:set var="select" value="none" scope="request"/>
</c:when>
<c:when test="${zm:actionSet(param, 'actionCompose')}">
    <jsp:forward page="/m/mainx?st=newmail"/>
</c:when>
<c:when test="${zm:actionSet(param, 'actionMarkTagRead')}">
    <c:set var="tagName" value="${zm:getTagName(pageContext, param.contextTagId)}"/>
    <zm:markTagRead id="${param.contextTagId}"/>
    <mo:status>
        <fmt:message key="actionTagMarkRead">
            <fmt:param value="${tagName}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionMarkFolderRead')}">
    <c:set var="folderName" value="${zm:getFolderName(pageContext, param.contextFolderId)}"/>
    <zm:markFolderRead id="${param.contextFolderId}"/>
    <mo:status>
        <fmt:message key="actionFolderMarkRead">
            <fmt:param value="${folderName}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionMarkConvRead')}">
    <zm:markConversationRead read="true" var="result" id="${param.contextConvId}"/>
    <mo:status>
        <fmt:message key="actionConvMarkedRead">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionSaveDocs') || (zm:actionSet(param,'moreActions') && fn:startsWith(anAction,'actionSaveDocs'))}">
    <c:set var="partId" value="${paramValues.attachIds}"/>
    <c:set var="briefcase" value="${param.briefcase}"/>
    <c:choose>
    <c:when test="${partId == null}">
        <mo:status style="Critical">
            <fmt:message key="actionNoItemSelected"/>
        </mo:status>
    </c:when>
    <c:when test="${empty briefcase}">
        <mo:status style="Critical">
            <fmt:message key="actionNoFolderSelected"/>
        </mo:status> 
    </c:when>
    <c:otherwise>
        <c:set var="mid" value="${param.mid}"/>
        <zm:saveAttachmentsToBriefcase mid="${mid}" partId="${paramValues.attachIds}" folderId="${briefcase}" var="res"/>
        <c:if test="${fn:length(res) gt 0}">
            <mo:status>
            <fmt:message key="documentsSaved">
                <fmt:param value="${fn:length(res)}"/>
                <fmt:param value="${zm:getFolderName(pageContext, briefcase)}"/>
            </fmt:message>
            </mo:status>
        </c:if>
    </c:otherwise>
    </c:choose>
</c:when>

<c:when test="${zm:actionSet(param, 'actionEmpty') and (param.contextFolderId eq mailbox.trash.id or param.contextFolderId eq mailbox.spam.id)}">
    <zm:emptyFolder id="${param.contextFolderId}"/>
    <mo:status>
        <fmt:message key="folderEmptied">
            <fmt:param value="${zm:getFolderName(pageContext, param.contextFolderId)}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionLoadFeed')}">
    <zm:syncFolder id="${param.contextFolderId}"/>
    <zm:clearSearchCache/>
    <mo:status>
        <fmt:message key="feedLoaded">
            <fmt:param value="${zm:getFolderName(pageContext, param.contextFolderId)}"/>
        </fmt:message>
    </mo:status>
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
            <mo:status>
                <fmt:message key="shareAccepted"/>
            </mo:status>
        </c:otherwise>
    </c:choose>
</c:when>
<c:when test="${empty ids and param.doMessageAction eq '1'}">
    <mo:status style="Warning"><fmt:message key="actionNoMessageSelected"/></mo:status>
</c:when>
<c:otherwise>
<c:choose>
<%--Consolidated group actions using moreAction param, actual action to perform is specified by anAction param--%>
<c:when test="${not empty param.sq and ua.isiPad eq true and param.doMessageAction eq '0'}">
    
</c:when>
<c:when test="${(zm:actionSet(param,'moreActions') && empty anAction && empty param.actionDelete && empty param.actionHardDelete)}">
    <mo:status style="Warning"><fmt:message key="actionNoActionSelected"/></mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionMarkSpam') || (zm:actionSet(param,'moreActions') && anAction eq 'actionMarkSpam') }">
    <c:choose>
        <c:when test="${type eq 'Conv'}">
            <zm:markConversationSpam var="result" id="${ids}" spam="${true}"/>
            <c:if test="${not empty cIdsArr}">
                <c:forEach items="${cIdsArr}" var="id">
                    <zm:getConversation var="conversation" id="${id}"/>
                    <c:set var="summaries" value="${conversation.messageSummaries}"/>
                    <c:set var="email" value="${summaries[0].sender.address}"/>
                    <mo:constructAutoSpam var="filterRule" address="${email}"/>
                    <c:catch var="filterDuplicate">
                        <zm:createFilterRule rule="${filterRule}"/>
                    </c:catch>
                </c:forEach>
            </c:if>
        </c:when>
        <c:otherwise>
            <zm:markMessageSpam var="result" id="${ids}" spam="${true}"/>
            <c:forEach items="${mIdsArr}" var="id">
                <zm:getMessage var="mMessage" id="${id}"/>
                <c:set var="mAddresses" value="${mMessage.getEmailAddresses()}"/>
                <c:set var="addressesLength" value="${fn:length(mAddresses)}"/>
                <c:forEach items="${mAddresses}" var="mAddress">
                    <c:if test="${mAddress.type == 'f'}">
                        <c:set var="email" value="${mAddress.address}"/>
                        <mo:constructAutoSpam var="filterRule" address="${email}"/>
                        <c:catch var="filterDuplicate">
                            <zm:createFilterRule rule="${filterRule}"/>
                        </c:catch>
                    </c:if>
                </c:forEach>
            </c:forEach>
        </c:otherwise>
    </c:choose>
    <mo:status>
        <fmt:message key="action${type}MarkedSpam">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
    <c:if test="${param.action eq 'view'}">
        <c:set var="op" value="x" scope="request"/>
    </c:if>
</c:when>
<c:when test="${zm:actionSet(param, 'actionAttachToCompose') || (zm:actionSet(param,'moreActions') && fn:startsWith(anAction,'actionAttachToCompose'))}">
    <%--
    Send the selected message ids as is in the url, fetch the message attachment and retrieve the subject in the compose window itself.
    --%>
    <c:redirect url="/m/zmain?st=newmail&messageAttachments=${ids}&ajax=${param.ajax}"/>    
</c:when>
<c:when test="${zm:actionSet(param, 'actionMarkUnspam') || (zm:actionSet(param,'moreActions') && anAction eq 'actionMarkUnspam') }">
    <c:choose>
        <c:when test="${type eq 'Conv'}">
            <zm:markConversationSpam var="result" id="${ids}" spam="${false}"/>
        </c:when>
        <c:otherwise>
            <zm:markMessageSpam var="result" id="${ids}" spam="${false}"/>
        </c:otherwise>
    </c:choose>
    <mo:status>
        <fmt:message key="action${type}MarkedNotSpam">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
    <c:if test="${param.action eq 'view'}">
        <c:set var="op" value="x" scope="request"/>
    </c:if>
</c:when>
<c:when test="${(zm:actionSet(param, 'actionDelete') && param.isInTrash eq 'true') || (zm:actionSet(param, 'actionHardDelete') || ((zm:actionSet(param,'moreActions') && anAction eq 'actionHardDelete')))}">
    <c:choose>
        <c:when test="${type eq 'Conv'}">
            <zm:deleteConversation var="result" id="${ids}"/>
        </c:when>
        <c:otherwise>
            <zm:deleteMessage var="result" id="${ids}"/>
        </c:otherwise>
    </c:choose>
    <c:choose>
	    <c:when test="${ua.isiPad eq true}">
	        <c:set var="op" value="x" scope="request"/>
	    </c:when>
	    <c:when test="${param.action eq 'view' and ua.isiPad eq false}">
	        <c:set var="op" value="x" scope="request"/>
	    </c:when>
	</c:choose>    
    <mo:status>
        <fmt:message key="action${type}HardDeleted">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionDelete') || (zm:actionSet(param,'moreActions') && anAction eq 'actionDelete') }">
    <c:choose>
        <c:when test="${type eq 'Conv'}">
            <zm:trashConversation var="result" id="${ids}"/>
        </c:when>
        <c:otherwise>
            <zm:trashMessage var="result" id="${ids}"/>
        </c:otherwise>
    </c:choose>
    <c:choose>
	    <c:when test="${ua.isiPad eq true}">
	        <c:set var="op" value="x" scope="request"/>
	    </c:when>
	    <c:when test="${param.action eq 'view' and ua.isiPad eq false}">
	        <c:set var="op" value="x" scope="request"/>
	    </c:when>
	</c:choose>
    <mo:status>
        <fmt:message key="action${type}MovedTrash">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
</c:when>

<c:when test="${zm:actionSet(param, 'actionMarkRead') || (zm:actionSet(param,'moreActions') && anAction eq 'actionMarkRead') }">
    <c:choose>
        <c:when test="${type eq 'Conv'}">
            <zm:markConversationRead var="result" id="${ids}" read="${true}"/>
        </c:when>
        <c:otherwise>
            <zm:markMessageRead var="result" id="${ids}" read="${true}"/>
        </c:otherwise>
    </c:choose>
    <mo:status>
        <fmt:message key="action${type}MarkedRead">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
    <script type="text/javascript">
        var elem = document.getElementById('inboxUnread'); var unreadCount = ${mailbox.inbox.unreadCount}; if(elem) {elem.innerHTML = (unreadCount > 0 ? unreadCount : '');} 
    </script>
</c:when>
<c:when test="${zm:actionSet(param, 'actionMarkUnread') || (zm:actionSet(param,'moreActions') && anAction eq 'actionMarkUnread')}">
    <c:choose>
        <c:when test="${type eq 'Conv'}">
            <zm:markConversationRead var="result" id="${ids}" read="${false}"/>
        </c:when>
        <c:otherwise>
            <zm:markMessageRead var="result" id="${ids}" read="${false}"/>
        </c:otherwise>
    </c:choose>
    <mo:status>
        <fmt:message key="action${type}MarkedUnread">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
    <script type="text/javascript">
        var elem = document.getElementById('inboxUnread'); var unreadCount = ${mailbox.inbox.unreadCount}; if(elem) {elem.innerHTML = (unreadCount > 0 ? unreadCount : '');}
    </script>
    <c:set var="idsMarkedUnread" value="${paramValues.id}" scope="request"/>
</c:when>
<c:when test="${zm:actionSet(param, 'actionFlag') || (zm:actionSet(param,'moreActions') && anAction eq 'actionFlag')}">
    <c:choose>
        <c:when test="${type eq 'Conv'}">
            <zm:flagConversation var="result" id="${ids}" flag="${true}"/>
        </c:when>
        <c:otherwise>
            <zm:flagMessage var="result" id="${ids}" flag="${true}"/>
        </c:otherwise>
    </c:choose>
    <mo:status>
        <fmt:message key="action${type}Flag">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionUnflag') || (zm:actionSet(param,'moreActions') && anAction eq 'actionUnflag')}">
    <c:choose>
        <c:when test="${type eq 'Conv'}">
            <zm:flagConversation var="result" id="${ids}" flag="${false}"/>
        </c:when>
        <c:otherwise>
            <zm:flagMessage var="result" id="${ids}" flag="${false}"/>
        </c:otherwise>
    </c:choose>
    <mo:status>
        <fmt:message key="action${type}Unflag">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionAddTag') || (zm:actionSet(param,'moreActions') && fn:startsWith(anAction,'addTag_'))}">     <%--The tag id is prefixed in anAction with 'addTag_' --%>
    <c:set var="tag" value="${param.tagId}"/>
    <c:if test="${tag == null}">
        <c:set var="tag" value="${fn:replace(anAction,'addTag_','')}"/>
    </c:if>
    <c:choose>
        <c:when test="${type eq 'Conv'}">
            <zm:tagConversation tagid="${tag}" var="result" id="${ids}" tag="${true}"/>
        </c:when>
        <c:otherwise>
            <zm:tagMessage tagid="${tag}" var="result" id="${ids}" tag="${true}"/>
        </c:otherwise>
    </c:choose>
    <mo:status>
        <fmt:message key="action${type}Tag">
            <fmt:param value="${result.idCount}"/>
            <fmt:param value="${zm:getTagName(pageContext, tag)}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionRemoveTag') || (zm:actionSet(param,'moreActions') && fn:startsWith(anAction,'remTag_'))}">   <%--The tag id is prefixed in anAction with 'remTag_' --%>
    <c:set var="tag" value="${param.tagRemoveId}"/>
    <c:if test="${tag == null}">
        <c:set var="tag" value="${fn:replace(anAction,'remTag_','')}"/>
    </c:if>
    <c:choose>
        <c:when test="${type eq 'Conv'}">
            <zm:tagConversation tagid="${tag}" var="result" id="${ids}" tag="${false}"/>
        </c:when>
        <c:otherwise>
            <zm:tagMessage tagid="${tag}" var="result" id="${ids}" tag="${false}"/>
        </c:otherwise>
    </c:choose>
    <mo:status>
        <fmt:message key="action${type}Untag">
            <fmt:param value="${result.idCount}"/>
            <fmt:param value="${zm:getTagName(pageContext, tag)}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionMove') || (zm:actionSet(param,'moreActions') && fn:startsWith(anAction,'moveTo_'))}">
    <c:choose>
        <c:when test="${fn:startsWith(anAction,'moveTo_')}">
            <c:set var="folderId" value="${fn:replace(anAction,'moveTo_','')}"/>                <%--The folder id is prefixed in anAction with 'moveTo_' --%>
            <c:choose>
                <c:when test="${type eq 'Conv'}">
                    <zm:moveConversation folderid="${folderId}" var="result" id="${ids}"/>
                </c:when>
                <c:otherwise>
                    <zm:moveMessage folderid="${folderId}" var="result" id="${ids}"/>
                </c:otherwise>
            </c:choose>

            <mo:status>
                <fmt:message key="action${type}Moved">
                    <fmt:param value="${result.idCount}"/>
                    <fmt:param value="${zm:getFolderName(pageContext, folderId)}"/>
                </fmt:message>
            </mo:status>
            <c:choose>
			    <c:when test="${ua.isiPad eq true}">
			        <c:set var="op" value="x" scope="request"/>
			    </c:when>
			    <c:when test="${param.action eq 'view' and ua.isiPad eq false}">
			        <c:set var="op" value="x" scope="request"/>
			    </c:when>
			</c:choose>
        </c:when>
        <c:when test="${empty param.folderId}">  <%--In case of moveAction, we have to specify folderId param to move to--%>
            <mo:status style="Warning"><fmt:message key="actionNoFolderSelected"/></mo:status>
        </c:when>
        <c:when test="${zm:actionSet(param, 'actionMove')}">
            <c:choose>
                <c:when test="${type eq 'Conv'}">                     <%--Move Conv--%>
                    <zm:moveConversation folderid="${param.folderId}" var="result" id="${ids}"/>
                </c:when>
                <c:otherwise>                                         <%--Move Msg--%>
                    <zm:moveMessage folderid="${param.folderId}" var="result" id="${ids}"/>
                </c:otherwise>
            </c:choose>
            <mo:status>
                <fmt:message key="actionMessageMoved">
                    <fmt:param value="${result.idCount}"/>
                    <fmt:param value="${zm:getFolderName(pageContext, param.folderId)}"/>
                </fmt:message>
            </mo:status>
             <c:choose>
			    <c:when test="${ua.isiPad eq true}">
			        <c:set var="op" value="x" scope="request"/>
			    </c:when>
			    <c:when test="${param.action eq 'view' and ua.isiPad eq false}">
			        <c:set var="op" value="x" scope="request"/>
			    </c:when>
			</c:choose>
        </c:when>
    </c:choose>
</c:when>
</c:choose>
</c:otherwise>
</c:choose>
</c:catch>
<c:remove var="op"/>
<c:if test="${!empty msgActionException}">
    <zm:getException var="error" exception="${msgActionException}"/>
    <c:choose>
        <c:when test="${error.code eq 'ztaglib.SERVER_REDIRECT'}">
            <c:redirect url="${not empty requestScope.SERVIER_REDIRECT_URL ? requestScope.SERVIER_REDIRECT_URL : '/'}"/>
        </c:when>
        <c:when test="${error.code eq 'service.AUTH_EXPIRED' or error.code eq 'service.AUTH_REQUIRED'}">
            <c:choose>
                <c:when test="${not empty (paramValues.ajax[0]||param.ajax)}">
                    <script type="text/javascript">
                        var logouturl = "<c:url value="/?loginOp=relogin&client=mobile&loginErrorCode=service.AUTH_EXPIRED"/>";
                        window.location.href = logouturl;
                    </script>
                </c:when>
                <c:otherwise>
                    <c:redirect url="/?loginOp=relogin&client=mobile&loginErrorCode=${error.code}"/>
                </c:otherwise>
            </c:choose>
        </c:when>
        <c:otherwise>
            <mo:status style="Critical">
                <fmt:message key="${error.code}"/>
            </mo:status>
        </c:otherwise>
    </c:choose>
</c:if>

<c:if test="${ua.isiPad and param.doMessageAction eq '1'}">
    
    <jsp:forward page="/m/moipadredirect">
        <jsp:param name="ids" value="${empty msgActionException ? ids : ''}"/>
    </jsp:forward>
</c:if>