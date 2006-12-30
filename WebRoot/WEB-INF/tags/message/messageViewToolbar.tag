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
        <zm:currentResultUrl var="closeurl" value="/h/search" index="${context.currentItemIndex}" context="${context}"/>
         <a href="${closeurl}" <c:if test="${keys}">accesskey="z"</c:if>>${fn:escapeXml(context.backTo)}</a>
        <input class='tbButton' type="submit" name="actionDelete" value="<fmt:message key="actionTrash"/>">
        &nbsp;
        <input class='tbButton' type="submit" name="actionSpam" value="<fmt:message key="actionSpam"/>">
        &nbsp;
        <select name="folderId">
            <option value="" selected/><fmt:message key="moveAction"/>
            <option disabled /><fmt:message key="actionOptSep"/>
            <zm:forEachFolder var="folder">
                <c:if test="${folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
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
    </c:set>
</c:if>

<table width=100% cellspacing=0 class='Tb'>
    <tr>
        <td align=left class=TbBt>
            <zm:currentResultUrl var="closeUrl" value="/h/search" context="${context}"/>
            ${requestScope.mvToolbarCache}
        </td>
        <td align=right>
            <c:if test="${context.hasPrevItem}">
                <zm:prevItemUrl var="prevItemUrl" value="/h/search" action="view" cursor="${cursor}" context="${context}"/>
                <a  <c:if test="${keys}">accesskey="p"</c:if> href="${prevItemUrl}"><img src="<c:url value='/images/arrows/LeftArrow.gif'/>" border="0" alt='left'/></a>
            </c:if>
            <c:if test="${!context.hasPrevItem}">
                <app:img disabled='true' src="arrows/LeftArrow.gif" border="0"/>
            </c:if>
            <span class='Paging'>${context.searchResult.offset+context.currentItemIndex+1}</span>
            <c:if test="${context.hasNextItem}">
                <zm:nextItemUrl var="nextItemUrl" value="/h/search" action="view" cursor="${cursor}" context="${context}"/>
                <a  <c:if test="${keys}">accesskey="n"</c:if> href="${nextItemUrl}"><img src="<c:url value='/images/arrows/RightArrow.gif'/>" border="0" alt='right'/></a>
            </c:if>
            <c:if test="${!context.hasNextItem}">
                <app:img disabled='true' src="arrows/RightArrow.gif" border="0"/>
            </c:if>
        </td>
    </tr>
</table>
