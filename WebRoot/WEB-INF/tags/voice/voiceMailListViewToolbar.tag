<%--
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
--%>
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
	<c:set var="isTrash" value="${context.isFolderSearch and context.folder.isVoiceMailTrash}"/>
	<c:set var="vmlvToolbarCache" scope="request">
        <td><div class='vertSep'></div></td>
		<c:choose>
			<c:when test="${isTrash}">
				<app:button id="OPUNDELETE" text="actionUntrashVoiceMail" name="actionUndelete" tooltip="actionUntrashVoiceMail" src="voicemail/ImgUnDelete.gif"/>
			</c:when>
			<c:otherwise>
				<app:button id="OPDELETE" text="actionDelete" name="actionDelete" tooltip="actionTrashTT" src="startup/ImgDelete.gif"/>
			</c:otherwise>
		</c:choose>
		<td><div class='vertSep'></div></td>
		<td nowrap>
			<c:choose>
				<c:when test="${context.searchResult.size > 0}">
					<zm:currentResultUrl var="printUrl" value="/h/printvoicemails" context="${context}" />
					<a id="OPPRINT" target="_blank" href="${printUrl}"><app:img src="startup/ImgPrint.gif" altkey="actionPrint"/></a>
				</c:when>
				<c:otherwise>
					<%-- Empty <a> to pick up styles... --%>
					<a><app:img src="startup/ImgPrint.gif" altkey="actionPrint" clazz="ImgDisabled"/></a>
				</c:otherwise>
			</c:choose>
		</td>
        <td><div class='vertSep'></div></td>
        <app:button id="OPHEARD" name="actionMarkHeard" text="actionMarkHeard" src="voicemail/ImgMarkAsHeard.gif" tooltip="actionMarkHeardTT" disabled="${isTrash}"/>
        <app:button id="OPUNHEARD" name="actionMarkUnheard" text="actionMarkUnheard" src="voicemail/ImgMarkAsUnheard.gif" tooltip="actionMarkUnheardTT" disabled="${isTrash}"/>
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
                        <a href="${refreshUrl}" <c:if test="${keys}"></c:if>><app:img src="startup/ImgRefresh.gif" altkey="getVoiceMail"/><span><fmt:message key="getVoiceMail"/></span></a>
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
