<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:if test="${empty requestScope.vmlvToolbarCache}">
    <zm:getMailbox var="mailbox"/>
    <c:set var="vmlvToolbarCache" scope="request">
        <td><div class='vertSep'></div></td>
        <app:button id="OPDELETE" text="actionDelete" name="actionDelete" tooltip="actionTrashTT" disabled="${context.isFolderSearch and context.folder.isVoiceMailTrash}" src="startup/ImgDelete.gif"/>
		<td><div class='vertSep'></div></td>
		<td nowrap>
            <zm:currentResultUrl var="printUrl" value="/h/printvoicemails" context="${context}" refresh="true" />
            <a id="OPPRINT" target="_blank" href="${printUrl}"><app:img src="startup/ImgPrint.gif" altkey="actionPrint"/></a>
        </td>
        <td><div class='vertSep'></div></td>
		<c:set var="disableMailButtons" value="${mailbox.features.mail ne true}"/>
		<app:button id="OPREPLYBYEMAIL" name="actionReplyByEmail" text="actionReplyByEmail" src="startup/ImgReply.gif" tooltip="actionReplyByEmailTT" disabled="${disableMailButtons}"/>
        <app:button id="OPFORWARDBYEMAIL" name="actionForwardByEmail" text="actionForwardByEmail" src="startup/ImgForward.gif" tooltip="actionForwardByEmailTT" disabled="${disableMailButtons}"/>
        <td><div class='vertSep'></div></td>
        <app:button id="OPHEARD" name="actionMarkHeard" text="actionMarkHeard" src="voicemail/ImgMarkAsHeard.gif" tooltip="actionMarkHeardTT"/>
        <app:button id="OPUNHEARD" name="actionMarkUnheard" text="actionMarkUnheard" src="voicemail/ImgMarkAsUnheard.gif" tooltip="actionMarkUnheardTT"/>
        <td><div class='vertSep'></div></td>
        <td nowrap>
            <c:url var="optionsUrl" value="/h/options">
                <c:param name="selected" value="voice"/>
                <c:param name="phone" value="${zm:getPhoneFromVoiceQuery(context.query)}"/>
            </c:url>
            <a id="OPCALLMANAGER" href="${optionsUrl}"><app:img src="voicemail/ImgCallManager.gif" altkey="callManager"/><span><fmt:message key="actionCallManager"/></span></a>
        </td>
		<c:if test="${context.isFolderSearch and context.folder.isVoiceMailTrash}">
			<td><div class='vertSep'></div><input type="hidden" name="folderId" value="${context.folder.id}"></td>
			<app:button name="actionHardDelete" src="startup/ImgDelete.gif" tooltip="emptyTrash" text="emptyTrash"/>
		</c:if>
    </c:set>
</c:if>

<table width=100% cellspacing=0 cellpadding=0 class='Tb'>
    <tr valign="middle">
        <td class='TbBt'>
            <table cellspacing=0 cellpadding=0 class='Tb'>
                <tr>
                    <td nowrap>
                        <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                        <a href="${refreshUrl}" <c:if test="${keys}"></c:if>><app:img src="arrows/ImgRefresh.gif" altkey="getVoiceMail"/><span><fmt:message key="getVoiceMail"/></span></a>
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
