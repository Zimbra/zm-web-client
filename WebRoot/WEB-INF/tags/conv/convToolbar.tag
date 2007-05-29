<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="convSearchResult" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZSearchResultBean"%>
<%@ attribute name="convCursor" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.NextPrevItemBean"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:if test="${empty requestScope.cvToolbarCache}">
    <zm:getMailbox var="mailbox"/>
    <c:set var="cvToolbarCache" scope="request">
        <td><div class='vertSep'></div></td>
        <app:button name="actionDelete" text="actionDelete" tooltip="actionTrashTT"/>
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
        <app:button name="actionMove" text="actionMove" tooltip="actionMoveTT"/>
        <td><div class='vertSep'></div></td>
        <td  nowrap valign=middle>
        <select name="actionOp">
                    <option value="" selected/><fmt:message key="moreActions"/>
                    <option <c:if test="${keys}">id="OPREAD" </c:if> value="read"/><fmt:message key="actionMarkRead"/>
                    <option <c:if test="${keys}">id="OPUNREAD" </c:if> value="unread"/><fmt:message key="actionMarkUnread"/>
                    <option <c:if test="${keys}">id="OPFLAG" </c:if> value="flag"/><fmt:message key="actionAddFlag"/>
                    <option <c:if test="${keys}">id="OPUNFLAG" </c:if> value="unflag"/><fmt:message key="actionRemoveFlag"/>
                    <app:tagOptions mailbox="${mailbox}"/>
        </select>
        </td>
        <app:button id="OPGO" name="action" tooltip="actionMessageGoTT" text="actionGo" />

        <c:if test="${!context.isFolderSearch or (context.isFolderSearch and !context.folder.isSpam)}">
            <td><div class='vertSep'></div></td>
            <app:button id="OPSPAM" name="actionSpam" tooltip="actionSpamTT" text="actionSpam"/>
        </c:if>
        <c:if test="${context.isFolderSearch and context.folder.isSpam}">
            <td><div class='vertSep'></div></td>
            <app:button name="actionNotSpam" tooltip="actionNotSpamTT" text="actionNotSpam"/>
        </c:if>
        <td><div class='vertSep'></div></td>
        <input type="hidden" name="contextConvId" value="${convSearchResult.conversationSummary.id}">
        <app:button id="OPMARKALL" name="actionMarkConvRead" src="mail/ReadMessage.gif" text="actionMarkAllRead" tooltip="actionMarkAllRead"/>
    </c:set>
</c:if>

<table width=100% cellspacing=0 class='Tb'>
    <tr>
        <td align=left class=TbBt>
            <table cellspacing=0 cellpadding=0 class='Tb'>
                <tr>
                    <td nowrap>
                        <zm:currentResultUrl var="closeurl" value="/h/search" index="${context.currentItemIndex}" context="${context}"/>
                        <a href="${closeurl}" <c:if test="${keys}">accesskey="z" id="CLOSE_ITEM"</c:if>> <app:img src="common/Close.gif"/> <span>${fn:escapeXml(context.backTo)}&nbsp;</span></a>
                    </td>
                    ${requestScope.cvToolbarCache}
                </tr>
            </table>
        </td>
        <td nowrap align=right>
            <c:if test="${context.hasPrevItem}">
                <zm:prevItemUrl var="prevItemUrl" value="" action="view" cursor="${convCursor}" context="${context}" css="${param.css}"/>
                <a <c:if test="${keys}">accesskey="p" id="PREV_PAGE"</c:if> href="${prevItemUrl}"><img alt='<fmt:message key="ALT_CONV_PREVIOUS_CONVERSATION"/>' src="<c:url value='/images/arrows/LeftDoubleArrow.gif'/>" border="0"/></a>
            </c:if>
            <c:if test="${!context.hasPrevItem}">
                <app:img altkey='ALT_CONV_NO_PREVIOUS_CONVERSATION' disabled='true' src="arrows/LeftDoubleArrow.gif" border="0"/>
            </c:if>
            <c:if test="${convSearchResult.hasPrevPage}">
                <zm:currentResultUrl var="prevPageUrl" value=""  action="view" context="${context}"
                                     cso="${convSearchResult.prevOffset}" css="${param.css}"/>
                <a <c:if test="${keys}">accesskey="b" id="PREV_CONV"</c:if> href="${prevPageUrl}"><img   alt='<fmt:message key="ALT_CONV_PREVIOUS_PAGE_IN_CONVERSATION"/>' src="<c:url value='/images/arrows/LeftArrow.gif'/>" border="0"/></a>
            </c:if>
            <c:if test="${!convSearchResult.hasPrevPage}">
                <app:img altkey='ALT_CONV_NO_PREVIOUS_PAGE_IN_CONVERSATION' disabled='true' src="arrows/LeftArrow.gif" border="0"/>
            </c:if>
            <app:searchPageOffset searchResult="${convSearchResult}" max="${convSearchResult.conversationSummary.messageCount}"/>
            <c:if test="${convSearchResult.hasNextPage}">
                <zm:currentResultUrl var="nextPageUrl" value=""  action="view" context="${context}"
                                     cso="${convSearchResult.nextOffset}" css="${param.css}"/>
                <a <c:if test="${keys}">accesskey="f" id="NEXT_CONV"</c:if> href="${nextPageUrl}"><img  alt='<fmt:message key="ALT_CONV_NEXT_PAGE_IN_CONVERSATION"/>' src="<c:url value='/images/arrows/RightArrow.gif'/>" border="0"/></a>
            </c:if>
            <c:if test="${!convSearchResult.hasNextPage}">
                <app:img altkey='ALT_CONV_NO_NEXT_PAGE_IN_CONVERSATION' disabled='true' src="arrows/RightArrow.gif" border="0"/>
            </c:if>
            <c:if test="${context.hasNextItem}">
                <zm:nextItemUrl var="nextItemUrl" value="" action="view" cursor="${convCursor}" context="${context}" css="${param.css}"/>
                <a <c:if test="${keys}">accesskey="n" id="NEXT_PAGE"</c:if> href="${nextItemUrl}"><img  alt='<fmt:message key="ALT_CONV_NEXT_CONVERSATION"/>' src="<c:url value='/images/arrows/RightDoubleArrow.gif'/>" border="0"/></a>
            </c:if>
            <c:if test="${!context.hasNextItem}">
                <app:img altkey='ALT_CONV_NO_NEXT_CONVERSATION' disabled='true' src="arrows/RightDoubleArrow.gif" border="0"/>
            </c:if>
        </td>
    </tr>
</table>
