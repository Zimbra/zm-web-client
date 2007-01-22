<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:if test="${empty requestScope.clvToolbarCache}">
    <zm:getMailbox var="mailbox"/>
    <c:set var="clvToolbarCache" scope="request">
        <c:if test="${context.isFolderSearch}">
            <input type="hidden" name="contextFolderId" value="${context.selectedId}"/>
            <c:choose>
                <c:when test="${context.folder.isTrash}">
                    <input class='tbButton' type="submit" name="actionEmpty" value="<fmt:message key="emptyTrash"/>">
                    &nbsp;
                </c:when>
                <c:when test="${context.folder.isSpam}">
                    <input class='tbButton' type="submit" name="actionEmpty" value="<fmt:message key="emptyJunk"/>">
                    &nbsp;
                </c:when>
                <c:when test="${context.folder.isFeed}">
                    <input class='tbButton' type="submit" name="actionLoadFeed" value="<fmt:message key="checkFeed"/>">
                    &nbsp;
                </c:when>
            </c:choose>
        </c:if>
        <c:choose>
            <c:when test="${context.isFolderSearch and context.folder.isTrash}">
                <input class='tbButton' type="submit" name="actionHardDelete" value="<fmt:message key="actionTrash"/>">
            </c:when>
            <c:otherwise>
                <input class='tbButton' type="submit" name="actionDelete" value="<fmt:message key="actionTrash"/>">
            </c:otherwise>
        </c:choose>
        &nbsp;
        <c:if test="${!context.isFolderSearch or (context.isFolderSearch and !context.folder.isSpam)}">
            <input class='tbButton' type="submit" name="actionSpam" value="<fmt:message key="actionSpam"/>">
            &nbsp;
        </c:if>
        <c:if test="${context.isFolderSearch and context.folder.isSpam}">
            <input class='tbButton' type="submit" name="actionNotSpam" value="<fmt:message key="actionNotSpam"/>">
            &nbsp;
        </c:if>
        <select name="folderId">
            <option value="" selected/><fmt:message key="moveAction"/>
            <option disabled /><fmt:message key="actionOptSep"/>
            <zm:forEachFolder var="folder">
                <c:if test="${folder.isConversationMoveTarget and !folder.isTrash and !folder.isSpam}">
                    <option value="m:${folder.id}" />${fn:escapeXml(folder.rootRelativePath)}
                </c:if>
            </zm:forEachFolder>
        </select>
        <input class='tbButton' type="submit" name="actionMove" value="<fmt:message key="actionMove"/>">
        &nbsp;
        <select name="actionOp">
            <option value="" selected/><fmt:message key="moreActions"/>
            <option value="read"/><fmt:message key="actionMarkRead"/>
            <option value="unread"/><fmt:message key="actionMarkUnread"/>
            <option value="flag"/><fmt:message key="actionAddFlag"/>
            <option value="unflag"/><fmt:message key="actionRemoveFlag"/>
            <app:tagOptions mailbox="${mailbox}"/>
        </select>
        <input class='tbButton' type="submit" name="action" value="<fmt:message key="actionGo"/>">
        <c:choose>
            <c:when test="${context.isTagSearch and mailbox.features.tagging}">
                &nbsp;&nbsp;
                <input type="hidden" name="contextTagId" value="${context.selectedId}">
                <input class='tbButton' type="submit" name="actionMarkTagRead" value="<fmt:message key="actionMarkAllRead"/>">
            </c:when>
            <c:when test="${context.isFolderSearch}">
                &nbsp;&nbsp;
                <input type="hidden" name="contextFolderId" value="${context.selectedId}">
                <input class='tbButton' type="submit" name="actionMarkFolderRead" value="<fmt:message key="actionMarkAllRead"/>">
            </c:when>
        </c:choose>
    </c:set>
</c:if>

<table width=100% cellspacing=0 class='Tb'>
    <tr>
        <td align=left class=TbBt>
            <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
            <a href="${refreshUrl}" <c:if test="${keys}">accesskey="r"</c:if>><fmt:message key="refresh"/></a>
            ${requestScope.clvToolbarCache}
        </td>
        <td nowrap align=right>
            <app:searchPageLeft keys="${keys}" context="${context}" urlTarget="/h/search"/>
            <app:searchPageOffset searchResult="${context.searchResult}"/>
            <app:searchPageRight keys="${keys}" context="${context}" urlTarget="/h/search"/>
        </td>
    </tr>
</table>
