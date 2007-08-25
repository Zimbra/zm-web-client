<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>


<c:if test="${empty requestScope.mlvToolbarCache}">
    <zm:getMailbox var="mailbox"/>
    <c:set var="mlvToolbarCache" scope="request">
        <td><div class='vertSep'></div></td>
        <c:choose>
            <c:when test="${context.isFolderSearch and context.folder.isTrash}">
                <app:button id="OPDELETE" name="actionHardDelete" text="actionDelete" tooltip="actionTrashTT"/>
            </c:when>
            <c:otherwise>
                <app:button id="OPDELETE" name="actionDelete" text="actionDelete" tooltip="actionTrashTT"/>
            </c:otherwise>
        </c:choose>
        <td><div class='vertSep'></div></td>
        <td  nowrap valign=middle>
        <select name="folderId">
            <option value="" selected/><fmt:message key="moveAction"/>
            <option disabled /><fmt:message key="actionOptSep"/>
            <zm:forEachFolder var="folder">
                <c:if test="${folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
                    <option id="OPFLDR${folder.id}" value="m:${folder.id}" />${fn:escapeXml(folder.rootRelativePath)}
                </c:if>
            </zm:forEachFolder>
        </select>
        </td>
        <app:button id="OPMOVE" name="actionMove" text="actionMove" tooltip="actionMoveTT"/>
        <td><div class='vertSep'></div></td>
        <td  nowrap valign=middle>
        <select name="actionOp">
            <option value="" selected/><fmt:message key="moreActions"/>
            <option <c:if test="${keys}">id="OPREAD" </c:if> value="read"/><fmt:message key="actionMarkRead"/>
            <option <c:if test="${keys}">id="OPUNREAD" </c:if> value="unread"/><fmt:message key="actionMarkUnread"/>
            <c:if test="${mailbox.features.flagging}">
            <option <c:if test="${keys}">id="OPFLAG" </c:if> value="flag"/><fmt:message key="actionAddFlag"/>
            <option <c:if test="${keys}">id="OPUNFLAG" </c:if> value="unflag"/><fmt:message key="actionRemoveFlag"/>
            </c:if>
            <app:tagOptions mailbox="${mailbox}"/>
        </select>
        </td>
        <app:button id="OPGO" name="action" tooltip="actionMessageGoTT" text="actionGo" />

        <td><div class='vertSep'></div></td>
        <c:if test="${!context.isFolderSearch or (context.isFolderSearch and !context.folder.isSpam)}">
            <app:button id="OPSPAM" name="actionSpam" tooltip="actionSpamTT" text="actionSpam"/>
        </c:if>
        <c:if test="${context.isFolderSearch and context.folder.isSpam}">
            <app:button id="OPSPAM" name="actionNotSpam" tooltip="actionNotSpamTT" text="actionNotSpam"/>
        </c:if>

        <%--
        <c:choose>
            <c:when test="${context.isTagSearch}">
                <input type="hidden" name="contextTagId" value="${context.selectedId}">
                <td><div class='vertSep'></div></td>
                <app:button name="actionMarkTagRead" src="mail/ImgReadMessage.gif" text="actionMarkAllRead" tooltip="actionMarkAllRead" />
            </c:when>
            <c:when test="${context.isFolderSearch}">
                <input type="hidden" name="contextFolderId" value="${context.selectedId}">
                <td><div class='vertSep'></div></td>
                <app:button name="actionMarkFolderRead" src="mail/ImgReadMessage.gif" text="actionMarkAllRead" tooltip="actionMarkAllRead" />
            </c:when>
        </c:choose>
        --%>

        <c:if test="${context.isFolderSearch}">
            <input type="hidden" name="contextFolderId" value="${context.selectedId}"/>
            <c:choose>
                <c:when test="${context.folder.isTrash}">
                    <td><div class='vertSep'></div></td>
                    <app:button name="actionEmpty" src="common/ImgDelete.gif" tooltip="emptyTrash" text="emptyTrash"/>
                </c:when>
                <c:when test="${context.folder.isSpam}">
                    <td><div class='vertSep'></div></td>
                    <app:button name="actionEmpty" src="common/ImgDelete.gif" tooltip="emptyJunk" text="emptyJunk"/>
                </c:when>
                <c:when test="${context.folder.isFeed}">
                    <td><div class='vertSep'></div></td>
                    <app:button name="actionLoadFeed" src="arrows/ImgRefresh.gif" tooltip="checkFeed" text="checkFeed"/>
                </c:when>
            </c:choose>
        </c:if>
    </c:set>
</c:if>

<table width=100% cellspacing=0 class='Tb'>
    <tr valign='middle'>
        <td class='TbBt'>
            <table cellspacing=0 cellpadding=0 class='Tb'>
                <tr>
                    <td nowrap>
                        <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                        <a href="${refreshUrl}" <c:if test="${keys}"></c:if>><app:img src="arrows/ImgRefresh.gif" altkey="refresh"/><span><fmt:message key="refresh"/></span></a>
                    </td>
                    ${requestScope.mlvToolbarCache}
                </tr>
            </table>
        </td>
        <td nowrap align=right>
            <app:searchPageLeft keys="${keys}" urlTarget="/h/search" context="${context}"/>
            <app:searchPageOffset searchResult="${context.searchResult}"/>
            <app:searchPageRight keys="${keys}" urlTarget="/h/search" context="${context}"/>
        </td>
    </tr>
</table>
