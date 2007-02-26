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
        <td><div class='vertSep'></div></td>
        <app:button name="actionNew" src="contacts/NewContact.gif" tooltip="newContact" text="contact"/>
        <td><div class='vertSep'></div></td>
        <app:button name="actionNewGroup" src="mail/NewGroup.gif" tooltip="newGroup" text="group"/>
        <c:if test="${not empty contact}">
            <td><div class='vertSep'></div></td>
            <app:button name="actionEdit" src="common/Edit.gif" tooltip="edit" text="edit"/>
            <input type='hidden' name="actionEditId" value="${contact.id}"/>
         </c:if>
         <td><div class='vertSep'></div></td>
        <td nowrap>
            <select name="folderId">
                <option value="" selected/><fmt:message key="moveAction"/>
                <option disabled /><fmt:message key="actionOptSep"/>
                <zm:forEachFolder var="folder">
                    <c:if test="${folder.isContactMoveTarget and !folder.isTrash}">
                        <option value="m:${folder.id}" />${fn:escapeXml(folder.rootRelativePath)}
                    </c:if>
                </zm:forEachFolder>
            </select>
        </td>
        <app:button name="actionMove" src="common/MoveToFolder.gif" tooltip="actionMoveTT"/>

        <td><div class='vertSep'></div></td>

        <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
            <td nowrap>
            <select name="actionOp">
            <option value="" selected/><fmt:message key="moreActions"/>
        </c:if>
        <app:tagOptions mailbox="${mailbox}"/>
        <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
            </select>
            </td>
            <app:button name="action" tooltip="actionContactGoTT" src="contacts/Contact.gif" />
        </c:if>
        <td><div class='vertSep'></div></td>
         <c:choose>
             <c:when test="${context.isFolderSearch and context.folder.isTrash}">
                 <app:button name="actionHardDelete" src="common/Delete.gif" tooltip="actionTrashTT" />
             </c:when>
             <c:otherwise>
                 <app:button name="actionDelete" src="common/Delete.gif" tooltip="actionTrashTT"/>
             </c:otherwise>
         </c:choose>
        <c:if test="${context.folder.isTrash}">
            <td><div class='vertSep'></div></td>
            <input type="hidden" name="contextFolderId" value="${context.selectedId}"/>
            <app:button name="actionEmpty" src="common/Delete.gif" tooltip="emptyTrash" text="emptyTrash"/>
        </c:if>
    </c:set>
</c:if>

<table width=100% cellspacing=0 class='Tb'>
    <tr>
        <td align=left class=Tb>
            <table cellspacing=2 cellpadding=0 class='Tb'>
                <tr>
                    <td nowrap>
                        <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                        <a href="${refreshUrl}" <c:if test="${keys}">accesskey="r"</c:if>><app:img src="arrows/Refresh.gif" altkey="refresh"/><span><fmt:message key="refresh"/></span></a>
                    </td>
                    ${requestScope.contactsToolbarCache}
                </tr>
            </table>
        </td>
        <td nowrap align=right>
            <app:searchPageLeft keys="${keys}" context="${context}" urlTarget="/h/search"/>
            <app:searchPageOffset searchResult="${context.searchResult}"/>
            <app:searchPageRight keys="${keys}" context="${context}" urlTarget="/h/search"/>
        </td>
    </tr>
</table>
