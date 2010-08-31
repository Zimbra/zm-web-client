<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" import="java.util.Date,java.text.*" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>


<table border="0" cellpadding="10" cellspacing="10" width="100%">
<tr>
<td>
<table class="ZOptionsSectionTable" border="0" cellpadding="0" cellspacing="0" width="100%">
<tr class="ZOptionsHeaderRow">
	<td class="ImgPrefsHeader_L">
		&nbsp;
	</td>
	<td class='ZOptionsHeader ImgPrefsHeader' >
		<fmt:message key="optionsDisplayingMessages"/>
	</td>
	<td class="ImgPrefsHeader_R">
		&nbsp;
	</td>
</tr>
</table>
<table width="100%" cellpadding="3" class="ZOptionsSectionMain">
<tr>
	<td class='ZOptionsTableLabel'>
		<fmt:message key="optionsDisplay"/> :
	</td>
	<td>
		<table border="0" cellpadding="0" cellspacing="0">
			<tr>
				<td>
					<select name="zimbraPrefMailItemsPerPage" id="itemsPP">
						<c:set var="mailItemsPP" value="${mailbox.prefs.mailItemsPerPage}"/>
						<option
								<c:if test="${mailItemsPP eq 10}"> selected</c:if>
								>10
						</option>
						<option
								<c:if test="${mailItemsPP eq 25}"> selected</c:if>
								>25
						</option>
						<option
								<c:if test="${mailItemsPP eq 50}"> selected</c:if>
								>50
						</option>
						<option
								<c:if test="${mailItemsPP eq 100}"> selected</c:if>
								>100
						</option>
					</select>
				</td>
				<td style='padding-left:5px'>
					<label for="itemsPP"><fmt:message key="optionsEmailPerPage"/></label>
				</td>
			</tr>
		</table>
	</td>
</tr>
<c:if test="${mailbox.features.conversations}">
	<tr>
		<td class='ZOptionsTableLabel'>
			<label for="groupMailBy"><fmt:message key="groupMailBy"/>
				:</label>
		</td>
		<td>
			<select name="zimbraPrefGroupMailBy" id="groupMailBy">
				<c:set var="groupMailBy" value="${mailbox.prefs.groupMailBy}"/>
				<option
						<c:if test="${groupMailBy eq 'conversation'}">selected</c:if> value="conversation">
					<fmt:message key="conversation"/>
				</option>
				<option
						<c:if test="${groupMailBy eq 'message'}">selected</c:if> value="message">
					<fmt:message key="message"/>
				</option>
			</select>
		</td>
	</tr>
</c:if>
<tr valign="middle">
	<td class='ZOptionsTableLabel'>
		<fmt:message key="optionsDisplayHtml"/>:
	</td>
	<td>
		<table border="0" cellpadding="0" cellspacing="3">
			<tr>
				<td>
					<input id="viewHtml" type="radio" name="zimbraPrefMessageViewHtmlPreferred" value="TRUE" <c:if test="${mailbox.prefs.messageViewHtmlPreferred}">checked</c:if>/>
				</td>
				<td>
					<label for="viewHtml"><fmt:message key="optionsDisplayHtmlAsHtml"/></label>
				</td>
				<td>
					<input id="viewText" type="radio" name="zimbraPrefMessageViewHtmlPreferred" value="FALSE" <c:if test="${not mailbox.prefs.messageViewHtmlPreferred}">checked</c:if>/>
				</td>
				<td>
					<label for="viewText"><fmt:message key="optionsDisplayHtmlAsText"/></label>
				</td>
			</tr>
		</table>
	</td>
</tr>
<tr valign="middle">
    <td class='ZOptionsTableLabel'>
        <fmt:message key="optionsReadingPane"/>:
    </td>
    <td>
		<table border="0" cellpadding="0" cellspacing="3">
			<tr>
				<td>
					<input id="viewRight" type="radio" name="zimbraPrefReadingPaneLocation" value="right" <c:if test="${mailbox.prefs.readingPaneLocation eq 'right'}">checked</c:if>/>
				</td>
				<td>
					<label for="viewRight"><fmt:message key="readingPaneOnRight"/></label>
				</td>
				<td>
					<input id="viewBottom" type="radio" name="zimbraPrefReadingPaneLocation" value="bottom" <c:if test="${mailbox.prefs.readingPaneLocation eq 'bottom'}">checked</c:if>/>
				</td>
				<td>
					<label for="viewBottom"><fmt:message key="readingPaneAtBottom"/></label>
				</td>
                <td>
                    <input id="noReadingPane" type="radio" name="zimbraPrefReadingPaneLocation" value="off" <c:if test="${mailbox.prefs.readingPaneLocation eq 'off'}">checked</c:if>/>
                </td>
                <td>
                    <label for="noReadingPane"><fmt:message key="readingPaneOff"/></label>
                </td>
			</tr>
		</table>
	</td>
</tr>
<app:optSeparator/>
<tr>
	<td class='ZOptionsTableLabel'>
		<fmt:message key="optionsMessagePreview"/>:
	</td>
	<td>
		<app:optCheckbox boxfirst="true" label="optionsShowFragments" pref="zimbraPrefShowFragments" checked="${mailbox.prefs.showFragments}"/>
	</td>
</tr>
<c:if test="${mailbox.features.initialSearchPreference}">
	<app:optSeparator/>
	<tr>
		<td class='ZOptionsTableLabel'>
			<label for="zimbraPrefMailInitialSearch"><fmt:message key="optionsDefaultMailSearch"/> :</label>
		</td>
		<td>
			<input id="zimbraPrefMailInitialSearch" size="40" type="text" name='zimbraPrefMailInitialSearch' value="${fn:escapeXml(mailbox.prefs.mailInitialSearch)}">
		</td>
	</tr>
</c:if>
<tr>
	<td colspan="2">
		&nbsp;
	</td>
</tr>
</table>
<br/>
<table class="ZOptionsSectionTable" border="0" cellpadding="0" cellspacing="0" width="100%">
<tr class="ZOptionsHeaderRow">
	<td class="ImgPrefsHeader_L">
		&nbsp;
	</td>
	<td class='ZOptionsHeader ImgPrefsHeader' >
		<fmt:message key="optionsReceivingMessages"/>
	</td>
	<td class="ImgPrefsHeader_R">
		&nbsp;
	</td>
</tr>
</table>
<table cellpadding="3"  width="100%" class="ZOptionsSectionMain">
<c:set var="messageArrives"><fmt:message key="optionsWhenAMessageArrives"/> : </c:set>
<c:if test="${mailbox.features.mailForwarding}">
	<tr>
		<td class='ZOptionsTableLabel'>
				${messageArrives}
			<c:set var="messageArrives" value="&nbsp;"/>
		</td>
		<td>
			<table cellspacing="0" cellpadding="0">
				<tr>
					<td><input type="checkbox" id="FORWARDCHECKED" name='FORWARDCHECKED' value="TRUE" <c:if test="${not empty mailbox.prefs.mailForwardingAddress}">checked</c:if>></td>
					<td style='padding-left:5px' nowrap align=right><label for="FORWARDCHECKED"><fmt:message key="optionsForwardAcopyTo"/>:</label></td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<td class='ZOptionsTableLabel'>
			&nbsp;
		</td>
		<td style='padding-left:20px'>
			<input id="zimbraPrefMailForwardingAddress" size="40" type="text" name='zimbraPrefMailForwardingAddress' value="${fn:escapeXml(mailbox.prefs.mailForwardingAddress)}">
			<span style='padding-left:5px' class='ZOptionsHint'><fmt:message key="optionsEmailAddressHint"/></span>
		</td>
	</tr>
	<tr>
		<td class='ZOptionsTableLabel'>
			&nbsp;
		</td>
		<td style='padding-left:20px'>
			<app:optCheckbox boxfirst="true" label="mailDeliveryDisabled" pref="zimbraPrefMailLocalDeliveryDisabled"
							 checked="${mailbox.prefs.mailLocalDeliveryDisabled}"/>
		</td>
	</tr>
	<tr>
		<td class='ZOptionsTableLabel'>
			&nbsp;
		</td>
		<td>
			<hr>
		</td>
	</tr>
</c:if>
<c:if test="${mailbox.features.newMailNotification}">
	<tr>
		<td class='ZOptionsTableLabel'>
				${messageArrives}
			<c:set var="messageArrives" value="&nbsp;"/>
		</td>
		<td>
			<app:optCheckbox boxfirst="true" trailingcolon="true" label="mailNotifEnabled" pref="zimbraPrefNewMailNotificationEnabled"
							 checked="${mailbox.prefs.newMailNotificationsEnabled}"/>
		</td>
	</tr>
	<tr>
		<td class='ZOptionsTableLabel'>
			&nbsp;
		</td>
		<td style='padding-left:20px'>
			<input id="zimbraPrefNewMailNotificationAddress" size="40" type="text" name='zimbraPrefNewMailNotificationAddress' value="${fn:escapeXml(mailbox.prefs.newMailNotificationAddress)}">
			<span style='padding-left:5px' class='ZOptionsHint'><fmt:message key="optionsEmailAddressHint"/></span>
		</td>
	</tr>
	<tr>
		<td class='ZOptionsTableLabel'>
			&nbsp;
		</td>
		<td>
			<hr>
		</td>
	</tr>
</c:if>
<c:if test="${mailbox.features.outOfOfficeReply}">
	<tr>
		<td class='ZOptionsTableLabel'>
				${messageArrives}
			<c:set var="messageArrives" value="&nbsp;"/>
		</td>
		<td>
			<app:optCheckbox boxfirst="true" trailingcolon="true" label="awayMessageEnabled" pref="zimbraPrefOutOfOfficeReplyEnabled"
							 checked="${mailbox.prefs.outOfOfficeReplyEnabled}"/>
		</td>
	</tr>
	<tr>
		<td class='ZOptionsTableLabel'>
			&nbsp;
		</td>
		<td style='padding-left:20px'>
			<textarea id="zimbraPrefOutOfOfficeReply" name='zimbraPrefOutOfOfficeReply' cols='60' rows='4'>${fn:escapeXml(mailbox.prefs.outOfOfficeReply)}</textarea>
		</td>
	</tr>
	<tr>
		 <td class='ZOptionsTableLabel'>
			<fmt:message key="startDate"/> :
		</td>
        <fmt:message key="CAL_APPT_EDIT_DATE_FORMAT" var="editDateFmt"/>
        <td style='padding-left:20px'>
			<c:set var="fromDate" value="${fn:escapeXml(mailbox.prefs.outOfOfficeFromDate)}" />
			<c:if test="${not empty fromDate}">
				<c:catch var="parseError">
					<fmt:parseDate pattern="yyyyMMddHHmmss'Z'" value="${fromDate}" var="parsedDate"  />
					<fmt:formatDate value="${parsedDate}" pattern="${editDateFmt}" var="fmtDate" />
				</c:catch>
				<c:if test="${not empty parseError}">
					<c:set var="fmtDate" value="" />
				</c:if>
			</c:if>
			<input id="zimbraPrefOutOfOfficeFromDate" size="20" type="text" name='zimbraPrefOutOfOfficeFromDate' value="${fmtDate}">
			<span style='padding-left:5px' class='ZOptionsHint'><fmt:message key="CAL_APPT_EDIT_DATE_FORMAT"/></span>
		</td>
	</tr>
	<tr>
		<td class='ZOptionsTableLabel'>
			<fmt:message key="untilDate"/> :
		</td>
		<td style='padding-left:20px'>
			<c:set var="untilDate" value="${fn:escapeXml(mailbox.prefs.outOfOfficeUntilDate)}" />
			<c:if test="${not empty untilDate}">
				<c:catch var="parseError2">
					<fmt:parseDate pattern="yyyyMMddHHmmss'Z'" value="${untilDate}" var="parsedDate"  />
					<fmt:formatDate value="${parsedDate}" pattern="${editDateFmt}" var="fmtDate" />
				</c:catch>
				<c:if test="${not empty parseError2}">
					<c:set var="fmtDate" value="" />
				</c:if>
			</c:if>
			<input id="zimbraPrefOutOfOfficeUntilDate" size="20" type="text" name='zimbraPrefOutOfOfficeUntilDate' value="${fmtDate}">
			<span style='padding-left:5px' class='ZOptionsHint'><fmt:message key="CAL_APPT_EDIT_DATE_FORMAT"/></span>
		</td>
	</tr>
</c:if>
<app:optSeparator/>
<tr>
	<td class='ZOptionsTableLabel'>
		<fmt:message key="optionsMessagesFromMe"/> :
	</td>
	<td>
		<fmt:message key="removeDupesToSelf"/>
		:
	</td>
</tr>
<tr>
	<td class='ZOptionsTableLabel'>
		&nbsp;
	</td>
	<td>
		<table border="0" cellpadding="0" cellspacing="3">
			<tr>
				<c:set var="dedupe" value="${mailbox.prefs.dedupeMessagesSentToSelf}"/>
				<td>
					<input id="dedupeNone" type="radio" name="zimbraPrefDedupeMessagesSentToSelf" value="dedupeNone" <c:if test="${dedupe eq 'dedupeNone'}">checked</c:if>/>
				</td>
				<td>
					<label for="dedupeNone"><fmt:message key="optionsDedupeNone"/></label>
				</td>
				<td>
					<input id="secondCopy" type="radio" name="zimbraPrefDedupeMessagesSentToSelf" value="secondCopyifOnToOrCC" <c:if test="${dedupe eq 'secondCopyifOnToOrCC'}">checked</c:if>/>
				</td>
				<td>
					<label for="secondCopy"><fmt:message key="optionsDedupeSecondCopy"/></label>
				</td>
				<td>
					<input id="dedupeall" type="radio" name="zimbraPrefDedupeMessagesSentToSelf" value="dedupeAll" <c:if test="${dedupe eq 'dedupeAll'}">checked</c:if>/>
				</td>
				<td>
					<label for="dedupeall"><fmt:message key="optionsDedupeAll"/></label>
				</td>
			</tr>
		</table>
	</td>
</tr>
<tr>
	<td colspan="2">
		&nbsp;
	</td>
</tr>
</table>
<c:if test="${mailbox.features.pop3Enabled}">
	<c:set var="pop3DownloadSince" value="${mailbox.prefs.pop3DownloadSince}" />
	<%	PageContext pageContext = (PageContext)jspContext;

		// NOTE: We need to adjust to UTC for formatting purposes
		Date now = new Date();
		now.setHours(now.getHours() - now.getTimezoneOffset());
		pageContext.setAttribute("now", now, PageContext.PAGE_SCOPE);

		// NOTE: We need to adjust from UTC for formatting purposes
		Date current = null;
		String pop3DownloadSince = (String)pageContext.findAttribute("pop3DownloadSince");
		if (pop3DownloadSince != null && pop3DownloadSince.length() > 0) {
			current = new SimpleDateFormat("yyyyMMddHHmmss'Z'").parse(pop3DownloadSince);
			current.setHours(current.getHours() + current.getTimezoneOffset());
		}
		pageContext.setAttribute("current", current, PageContext.PAGE_SCOPE);
	%>
	<br/>
	<table class="ZOptionsSectionTable" border="0" cellpadding="0" cellspacing="0" width="100%">
	<tr class="ZOptionsHeaderRow">
		<td class="ImgPrefsHeader_L">&nbsp;</td>
		<td class='ZOptionsHeader ImgPrefsHeader' ><fmt:message key="optionsAccess" /></td>
		<td class="ImgPrefsHeader_R">&nbsp;</td>
	</tr>
	</table>
	<table width="100%" cellpadding="3" class="ZOptionsSectionMain">
	<tr>
		<td class='ZOptionsTableLabel' style="vertical-align:top"><fmt:message key="optionsAccessPop" /></td>
		<td>
			<table cellspacing="0" cellpadding="0">
				<tr>
					<td><input id="pop3DownloadAll" name='zimbraPrefPop3DownloadSince' type="radio"
							   value="" ${empty pop3DownloadSince ? "checked" : ""}>
					</td>
					<td style='padding-left:5px' nowrap>
						<label for="pop3DownloadAll"><fmt:message key="optionsAccessPopDownloadAll" /></label>
					</td>
				</tr>
				<tr>
					<td><input id="pop3DownloadFromNow" name='zimbraPrefPop3DownloadSince' type="radio"
							   value="<fmt:formatDate value="${now}" pattern="yyyyMMddHHmmss'Z'" />">
					</td>
					<td style='padding-left:5px' nowrap>
						<label for="pop3DownloadFromNow"><fmt:message key="optionsAccessPopDownloadFromNow" /></label>
					</td>
				</tr>
			</table>
		</td>
	</tr>
	<tr><td></td>
		<td class="ZOptionsHint">
			<c:choose>
				<c:when test="${empty current}">
				    <fmt:message key="optionsAccessPopNotSet" />
				</c:when>
				<c:otherwise>
					<fmt:message key="optionsAccessPopCurrentValue">
						<fmt:param value="${current}" />
					</fmt:message>
				</c:otherwise>
			</c:choose>
		</td>
	</tr>
	</table>
</c:if>
</td>
</tr>
</table>