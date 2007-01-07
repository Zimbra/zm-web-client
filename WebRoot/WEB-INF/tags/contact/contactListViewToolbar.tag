<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:if test="${empty requestScope.contactsToolbarCache}">
     <zm:getMailbox var="mailbox"/>
    <c:set var="contactsToolbarCache" scope="request">
        <input class='tbButton' type="submit" name="actionNew" value="<fmt:message key="newContact"/>">
        &nbsp;
        <input class='tbButton' type="submit" name="actionNewGroup" value="<fmt:message key="newGroup"/>">
        &nbsp;
        <c:if test="${not empty contact}">
        <input class='tbButton' type="submit" name="actionEdit" value="<fmt:message key="edit"/>">
        <input type='hidden' name="actionEditId" value="${contact.id}"/>
        &nbsp;
        </c:if>
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
        <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
            <select name="actionOp">
                <option value="" selected/><fmt:message key="moreActions"/>
        </c:if>
        <app:tagOptions mailbox="${mailbox}"/>
        <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
            </select>
            <input class='tbButton' type="submit" name="action" value="<fmt:message key="actionGo"/>">
        </c:if>
    </c:set>
</c:if>

<table width=100% cellspacing=0 class='Tb'>
    <tr>
        <td align=left class=TbBt>
            <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
            <a href="${refreshUrl}" <c:if test="${keys}">accesskey="r"</c:if>><fmt:message key="refresh"/></a>
            ${requestScope.contactsToolbarCache}
        </td>
        <td nowrap align=right>
            <app:searchPageLeft keys="${keys}" context="${context}" urlTarget="/h/search"/>
            <app:searchPageOffset searchResult="${context.searchResult}"/>
            <app:searchPageRight keys="${keys}" context="${context}" urlTarget="/h/search"/>
        </td>
    </tr>
</table>
