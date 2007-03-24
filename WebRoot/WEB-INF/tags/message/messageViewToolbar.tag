<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="cursor" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.NextPrevItemBean"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:if test="${empty requestScope.mvToolbarCache}">
    <zm:getMailbox var="mailbox"/>
    <c:set var="mvToolbarCache" scope="request">
        <td nowrap>
        <zm:currentResultUrl var="closeurl" value="/h/search" index="${context.currentItemIndex}" context="${context}"/>
        <a href="${closeurl}" <c:if test="${keys}">accesskey="z"</c:if>> <app:img src="common/Close.gif"/> <span>${fn:escapeXml(context.backTo)}&nbsp;</span></a>
        </td>
         <td><div class='vertSep'></div></td>
        <td  nowrap valign=middle>
        <select name="folderId">
            <option value="" selected/><fmt:message key="moveAction"/>
            <option disabled /><fmt:message key="actionOptSep"/>
            <zm:forEachFolder var="folder">
                <c:if test="${folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
                    <option value="m:${folder.id}" />${fn:escapeXml(folder.rootRelativePath)}
                </c:if>
            </zm:forEachFolder>
        </select>
        </td>
        <app:button name="actionMove" src="common/MoveToFolder.gif" tooltip="actionMoveTT"/>
        <td><div class='vertSep'></div></td>
        <td  nowrap valign=middle>
        <select name="actionOp">
            <option value="" selected/><fmt:message key="moreActions"/>
            <option value="read"/><fmt:message key="actionMarkRead"/>
            <option value="unread"/><fmt:message key="actionMarkUnread"/>
            <option value="flag"/><fmt:message key="actionAddFlag"/>
            <option value="unflag"/><fmt:message key="actionRemoveFlag"/>
            <app:tagOptions mailbox="${mailbox}"/>
        </select>
        </td>
        <app:button name="action" tooltip="actionMessageGoTT" text="actionGo" />
        <td><div class='vertSep'></div></td>
         <app:button name="actionDelete" src="common/Delete.gif" tooltip="actionTrashTT"/>
        <td><div class='vertSep'></div></td>
        <c:if test="${!context.isFolderSearch or (context.isFolderSearch and !context.folder.isSpam)}">
            <app:button name="actionSpam" src="mail/SpamFolder.gif" tooltip="actionSpamTT" text="actionSpam"/>
        </c:if>
        <c:if test="${context.isFolderSearch and context.folder.isSpam}">
            <app:button name="actionNotSpam" src="mail/SpamFolder.gif" tooltip="actionNotSpamTT" text="actionNotSpam"/>
        </c:if>
    </c:set>
</c:if>

<table width=100% cellspacing=0 class='Tb'>
      <tr valign='middle'>
        <td class='TbBT'
            <table cellspacing=0 cellpadding=0 class='Tb'>
                <tr>
                    ${requestScope.mvToolbarCache}
                </tr>
            </table>
        </td>
        <td align=right>
            <c:if test="${context.hasPrevItem}">
                <zm:prevItemUrl var="prevItemUrl" value="/h/search" action="view" cursor="${cursor}" context="${context}"/>
                <a  <c:if test="${keys}">accesskey="p"</c:if> href="${prevItemUrl}"><img alt="<fmt:message key='ALT_MSG_PREVIOUS_MESSAGE'/>" src="<c:url value='/images/arrows/LeftArrow.gif'/>" border="0" /></a>
            </c:if>
            <c:if test="${!context.hasPrevItem}">
                <app:img disabled='true' src="arrows/LeftArrow.gif" border="0"/>
            </c:if>
            <span class='Paging'>${context.searchResult.offset+context.currentItemIndex+1}</span>
            <c:if test="${context.hasNextItem}">
                <zm:nextItemUrl var="nextItemUrl" value="/h/search" action="view" cursor="${cursor}" context="${context}"/>
                <a  <c:if test="${keys}">accesskey="n"</c:if> href="${nextItemUrl}"><img alt="<fmt:message key='ALT_MSG_NEXT_MESSAGE'/>" src="<c:url value='/images/arrows/RightArrow.gif'/>" border="0"/></a>
            </c:if>
            <c:if test="${!context.hasNextItem}">
                <app:img disabled='true' src="arrows/RightArrow.gif" border="0"/>
            </c:if>
        </td>
    </tr>
</table>
