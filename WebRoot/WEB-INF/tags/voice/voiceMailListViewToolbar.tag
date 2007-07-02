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
        <c:choose>
            <c:when test="${context.isFolderSearch and context.folder.isTrash}">
                <app:button id="OPDELETE" src="common/Trash.gif" name="actionHardDelete" tooltip="actionTrashTT"/>
            </c:when>
            <c:otherwise>
                <app:button id="OPDELETE" src="common/Trash.gif" name="actionDelete" tooltip="actionTrashTT"/>
            </c:otherwise>
        </c:choose>
        <td nowrap>
            <zm:currentResultUrl var="printUrl" value="/h/printvoicemails" context="${context}" refresh="true" />
            <a id="OPPRINT" target="_blank" href="${printUrl}"><app:img src="common/Print.gif" altkey="actionPrint"/></a>
        </td>
        <td><div class='vertSep'></div></td>
        <app:button id="OPREPLYBYEMAIL" name="actionReplyByEmail" text="actionReplyByEmail" src="mail/Reply.gif" tooltip="actionReplyByEmailTT"/>
        <app:button id="OPFORWARDBYEMAIL" name="actionForwardByEmail" text="actionForwardByEmail" src="mail/Forward.gif" tooltip="actionForwardByEmailTT"/>
        <td><div class='vertSep'></div></td>
        <app:button id="OPHEARD" name="actionMarkHeard" text="actionMarkHeard" src="voicemail/MarkAsHeard.gif" tooltip="actionMarkHeardTT"/>
        <app:button id="OPUNHEARD" name="actionMarkUnheard" text="actionMarkUnheard" src="voicemail/MarkAsUnheard.gif" tooltip="actionMarkUnheardTT"/>
        <td><div class='vertSep'></div></td>
        <td nowrap>
            <c:url var="optionsUrl" value="/h/options">
                <c:param name="selected" value="voice"/>
                <c:param name="phone" value="${zm:getPhoneFromVoiceQuery(context.query)}"/>
            </c:url>
            <a id="OPCALLMANAGER" href="${optionsUrl}"><span><fmt:message key="actionCallManager"/></span></a>
        </td>
    </c:set>
</c:if>

<table width=100% cellspacing=0 cellpadding=0 class='Tb'>
    <tr valign="middle">
        <td class='TbBt'>
            <table cellspacing=0 cellpadding=0 class='Tb'>
                <tr>
                    <td nowrap>
                        <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                        <a href="${refreshUrl}" <c:if test="${keys}"></c:if>><app:img src="arrows/Refresh.gif" altkey="getVoiceMail"/><span><fmt:message key="getVoiceMail"/></span></a>
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
