<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="convSearchResult" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZSearchResultBean"%>
<%@ attribute name="convCursor" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.NextPrevItemBean"%>
<%@ attribute name="convHit" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZConversationHitBean"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="top" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:if test="${empty requestScope.cvToolbarCache}">
    <c:set var="cvToolbarCache" scope="request">
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
                    <option disabled /><fmt:message key="actionOptSep"/>
                    <option disabled /><fmt:message key="actionAddTag"/>
                    <zm:forEachTag var="tag">
                        <option value="t:${tag.id}" />${fn:escapeXml(tag.name)}
                    </zm:forEachTag>
                    <option disabled /><fmt:message key="actionOptSep"/>
                    <option disabled /><fmt:message key="actionRemoveTag"/>
                    <zm:forEachTag var="tag">
                        <option value="u:${tag.id}" />${fn:escapeXml(tag.name)}
                    </zm:forEachTag>
                </select>
                <input class='tbButton' type="submit" name="action" value="<fmt:message key="actionGo"/>">
        &nbsp;&nbsp;
                <input type="hidden" name="contextConvId" value="${convHit.id}">
                <input class='tbButton' type="submit" name="actionMarkConvRead" value="<fmt:message key="actionMarkAllRead"/>">

    </c:set>
</c:if>

<div class="${top ? 'TbTop' : 'TbBottom'}">
    <table width=100% cellspacing=0 class='Tb'>
        <tr>
            <td align=left class=TbBt>
                <zm:currentResultUrl var="closeurl" value="/h/search" index="${context.currentItemIndex}" context="${context}"/>
                <a href="${closeurl}" <c:if test="${keys}">accesskey="z"</c:if>>${fn:escapeXml(context.backTo)}</a>
                ${requestScope.cvToolbarCache}
            </td>
            <td nowrap align=right>
                 <c:if test="${context.hasPrevItem}">
                     <zm:prevItemUrl var="prevItemUrl" value="" cursor="${convCursor}" context="${context}" css="${param.css}"/>
                     <a <c:if test="${keys}">accesskey="p"</c:if> href="${prevItemUrl}"><img alt='dblleft' src="<c:url value='/images/arrows/LeftDoubleArrow.gif'/>" border="0"/></a>
                </c:if>
                <c:if test="${!context.hasPrevItem}">
                    <app:img disabled='true' src="arrows/LeftDoubleArrow.gif" border="0"/>
                </c:if>
                <c:if test="${convSearchResult.hasPrevPage}">
                    <zm:currentResultUrl var="prevPageUrl" value=""  context="${context}"
                                      cso="${convSearchResult.prevOffset}" css="${param.css}"/>
                    <a <c:if test="${keys}">accesskey="b"</c:if> href="${prevPageUrl}"><img alt='left' src="<c:url value='/images/arrows/LeftArrow.gif'/>" border="0"/></a>
                </c:if>
                <c:if test="${!convSearchResult.hasPrevPage}">
                    <app:img disabled='true' src="arrows/LeftArrow.gif" border="0"/>
                </c:if>
                <app:searchPageOffset searchResult="${convSearchResult}" max="${convHit.messageCount}"/>
               <c:if test="${convSearchResult.hasNextPage}">
                    <zm:currentResultUrl var="nextPageUrl" value=""  context="${context}"
                                      cso="${convSearchResult.nextOffset}" css="${param.css}"/>
                    <a <c:if test="${keys}">accesskey="f"</c:if> href="${nextPageUrl}"><img alt='right' src="<c:url value='/images/arrows/RightArrow.gif'/>" border="0"/></a>
                </c:if>
                <c:if test="${!convSearchResult.hasNextPage}">
                    <app:img disabled='true' src="arrows/RightArrow.gif" border="0"/>
                </c:if>
                <c:if test="${context.hasNextItem}">
                    <zm:nextItemUrl var="nextItemUrl" value="" cursor="${convCursor}" context="${context}" css="${param.css}"/>
                    <a <c:if test="${keys}">accesskey="n"</c:if> href="${nextItemUrl}"><img alt='dblright' src="<c:url value='/images/arrows/RightDoubleArrow.gif'/>" border="0"/></a>
                </c:if>
                <c:if test="${!context.hasNextItem}">
                    <app:img disabled='true' src="arrows/RightDoubleArrow.gif" border="0"/>
                </c:if>
            </td>
        </tr>
    </table>
</div>