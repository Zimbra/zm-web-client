<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="cursor" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.NextPrevItemBean"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="closeurl" rtexprvalue="true" required="true" %>
<%@ attribute name="top" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>


<c:if test="${empty requestScope.contactToolbarCache}">
    <c:set var="contactToolbarCache" scope="request">
        <input class='tbButton' type="submit" name="actionEdit" value="<fmt:message key="edit"/>">
        &nbsp;        
        <input class='tbButton' type="submit" name="actionDelete" value="<fmt:message key="actionTrash"/>">
        &nbsp;
        <select name="folderId">
            <option value="" selected/><fmt:message key="moveAction"/>
            <option disabled /><fmt:message key="actionOptSep"/>
            <zm:forEachFolder var="folder">
                <c:if test="${folder.isContactMoveTarget and !folder.isTrash}">
                    <option value="m:${folder.id}" />${fn:escapeXml(folder.rootRelativePath)}
                </c:if>
            </zm:forEachFolder>
        </select>
        <input class='tbButton' type="submit" name="actionMove" value="<fmt:message key="actionMove"/>">
        &nbsp;
        <select name="actionOp">
            <option value="" selected/><fmt:message key="moreActions"/>
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
    </c:set>
</c:if>

 <div class="${top ? 'TbTop' : 'TbBottom'}">
    <table width=100% cellspacing=0 class='Tb'>
        <tr>
            <td align=left class=TbBt>
                <a href="${closeurl}" <c:if test="${keys}">accesskey="z"</c:if>>${fn:escapeXml(context.backTo)}</a>
                ${requestScope.contactToolbarCache}
            </td>
            <td nowrap align=right>
                  <c:if test="${context.hasPrevItem}">
                      <zm:prevItemUrl var="prevItemUrl" disp="1" value="" cursor="${cursor}" context="${context}" usecache="true"/>
                      <a <c:if test="${keys}">accesskey="p"</c:if> href="${prevItemUrl}"><app:img src="arrows/LeftArrow.gif" border="0"/></a>
                </c:if>
                <c:if test="${!context.hasPrevItem}">
                    <app:img disabled='true' src="arrows/LeftArrow.gif" border="0"/>
                </c:if>
                <span class='Paging'>${context.searchResult.offset+context.currentItemIndex+1}</span>
                <c:if test="${context.hasNextItem}">
                    <zm:nextItemUrl var="nextItemUrl" disp="1" value="" cursor="${cursor}" context="${context}" usecache="true"/>
                    <a <c:if test="${keys}">accesskey="n"</c:if>href="${nextItemUrl}"><app:img src="arrows/RightArrow.gif" border="0"/></a>
                </c:if>
                <c:if test="${!context.hasNextItem}">
                    <app:img disabled='true' src="arrows/RightArrow.gif" border="0"/>
                </c:if>
            </td>
        </tr>
    </table>
</div>
