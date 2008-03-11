<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<zm:requirePost/>
<zm:checkCrumb crumb="${param.crumb}"/>
<zm:getMailbox var="mailbox"/>
<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/>
<c:set var="_selectedIds" scope="request" value=",${ids},"/>
<c:set var="_selectedCids" scope="request" value=",${fn:join(paramValues.cid,',')},"/>
<c:forEach items="${paramValues.cid}" var="ccid">
    <c:set var="ccid" value="id_${ccid}"/>
    <c:set var="ids1" value="${fn:join(paramValues[ccid], ',')}"/>
    <c:set var="ids" value="${ids1},${ids!=null?ids:''}"/>
</c:forEach>
<c:set var="selectedCidsString" scope="request" value=",${requestScope.selectedIdsString},"/>
<c:set var="actionOp"
       value="${not empty paramValues.actionOp[0] ? paramValues.actionOp[0] :  paramValues.actionOp[1]}"/>
<c:choose>
<c:when test="${zm:actionSet(param, 'actionCompose')}">
    <jsp:forward page="/m/mocompose"/>
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
<c:when test="${empty ids}">
    <mo:status style="Warning"><fmt:message key="actionNoMessageSelected"/></mo:status>
</c:when>
<c:otherwise>
<c:choose>
<c:when test="${zm:actionSet(param, 'actionSpam')}">
    <zm:markMessageSpam var="result" id="${ids}" spam="true"/>
    <mo:status>
        <fmt:message key="actionMessageMarkedSpam">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionNotSpam')}">
    <zm:markMessageSpam var="result" id="${ids}" spam="false"/>
    <mo:status>
        <fmt:message key="actionMessageMarkedNotSpam">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionDelete')}">
    <zm:trashMessage var="result" id="${ids}"/>
    <mo:status>
        <fmt:message key="actionMessageMovedTrash">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionHardDelete')}">
    <zm:deleteMessage var="result" id="${ids}"/>
    <mo:status>
        <fmt:message key="actionMessageHardDeleted">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
</c:when>

<c:when test="${zm:actionSet(param, 'actionMarkRead') || (zm:actionSet(param,'moreActions') && param.anAction == 'actionMarkRead') }">
    <zm:markMessageRead var="result" id="${ids}" read="${true}"/>
    <mo:status>
        <fmt:message key="actionMessageMarkedRead">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>

</c:when>
<c:when test="${zm:actionSet(param, 'actionMarkUnread') || (zm:actionSet(param,'moreActions') && param.anAction == 'actionMarkUnread')}">
    <zm:markMessageRead var="result" id="${ids}" read="${false}"/>
    <mo:status>
        <fmt:message key="actionMessageMarkedUnread">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
    <c:set var="idsMarkedUnread" value="${paramValues.id}" scope="request"/>
</c:when>
<c:when test="${zm:actionSet(param, 'actionFlag') || (zm:actionSet(param,'moreActions') && param.anAction == 'actionFlag')}">
    <zm:flagMessage var="result" id="${ids}" flag="${true}"/>
    <mo:status>
        <fmt:message key="actionMessageFlag">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionUnflag') || (zm:actionSet(param,'moreActions') && param.anAction == 'actionUnflag')}">
    <zm:flagMessage var="result" id="${ids}" flag="${false}"/>
    <mo:status>
        <fmt:message key="actionMessageUnflag">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionAddTag') || (zm:actionSet(param,'moreActions') && fn:startsWith(param.anAction,'addTag_'))}">
    <c:set var="tag" value="${param.tagId}"/>
    <c:if test="${tag == null}">
        <c:set var="tag" value="${fn:replace(param.anAction,'addTag_','')}"/>
    </c:if>
    <zm:tagMessage tagid="${tag}" var="result" id="${ids}" tag="${true}"/>
    <mo:status>
        <fmt:message key="actionMessageTag">
            <fmt:param value="${result.idCount}"/>
            <fmt:param value="${zm:getTagName(pageContext, tag)}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionRemoveTag') || (zm:actionSet(param,'moreActions') && fn:startsWith(param.anAction,'remTag_'))}">
    <c:set var="tag" value="${param.tagRemoveId}"/>
    <c:if test="${tag == null}">
        <c:set var="tag" value="${fn:replace(param.anAction,'remTag_','')}"/>
    </c:if>
    <zm:tagMessage tagid="${tag}" var="result" id="${ids}" tag="${false}"/>
    <mo:status>
        <fmt:message key="actionMessageUntag">
            <fmt:param value="${result.idCount}"/>
            <fmt:param value="${zm:getTagName(pageContext, tag)}"/>
        </fmt:message>
    </mo:status>
</c:when>
<c:when test="${zm:actionSet(param, 'actionMove') || zm:actionSet(param,'moreActions')}">
    <c:choose>
        <c:when test="${fn:startsWith(param.anAction,'moveTo_')}">
        <c:set var="folderId" value="${fn:replace(param.anAction,'moveTo_','')}"/>
	    <zm:moveMessage folderid="${folderId}" var="result" id="${ids}"/>
            <mo:status>
                <fmt:message key="actionMessageMoved">
                    <fmt:param value="${result.idCount}"/>
                    <fmt:param value="${zm:getFolderName(pageContext, folderId)}"/>
                </fmt:message>
            </mo:status>
        </c:when>
        <c:when test="${empty param.folderId}">
            <mo:status style="Warning"><fmt:message key="actionNoFolderSelected"/></mo:status>
        </c:when>
        <c:otherwise>
            <zm:moveMessage folderid="${param.folderId}" var="result" id="${ids}"/>
            <mo:status>
                <fmt:message key="actionMessageMoved">
                    <fmt:param value="${result.idCount}"/>
                    <fmt:param value="${zm:getFolderName(pageContext, param.folderId)}"/>
                </fmt:message>
            </mo:status>
        </c:otherwise>
    </c:choose>
</c:when>
</c:choose>
</c:otherwise>
</c:choose>
