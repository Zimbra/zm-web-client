<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:if test="${empty requestScope.vmlvToolbarCache}">
    <zm:getMailbox var="mailbox"/>
    <c:set var="vmlvToolbarCache" scope="request">
        <td><div class='vertSep'></div></td>
        <app:button  text="actionSave" name="actionSave" tooltip="actionSaveTT"/>
        <c:choose>
            <c:when test="${context.isFolderSearch and context.folder.isTrash}">
                <app:button  text="actionDelete" name="actionHardDelete" tooltip="actionTrashTT"/>
            </c:when>
            <c:otherwise>
                <app:button text="actionDelete" name="actionDelete" tooltip="actionTrashTT"/>
            </c:otherwise>
        </c:choose>
        <td><div class='vertSep'></div></td>
        <app:button name="actionReplyByEmail" text="actionReplyByEmail" src="mail/Reply.gif" tooltip="actionReplyByEmailTT"/>
        <app:button name="actionForwardByEmail" text="actionForwardByEmail" src="mail/Forward.gif" tooltip="actionForwardByEmailTT"/>
    </c:set>
</c:if>

<table width=100% cellspacing=0 cellpadding=0 class='Tb'>
    <tr valign="middle">
        <td class='TbBt'>
            <table cellspacing=0 cellpadding=0 class='Tb'>
                <tr>
                    <td nowrap>
                        <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                        <a href="${refreshUrl}" <c:if test="${keys}"></c:if>><app:img src="arrows/Refresh.gif" altkey="refresh"/><span><fmt:message key="refresh"/></span></a>
                    </td>
                    ${requestScope.vmlvToolbarCache}
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
