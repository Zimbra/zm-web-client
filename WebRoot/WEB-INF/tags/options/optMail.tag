<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" import="java.util.Date,java.text.*,com.zimbra.cs.ldap.LdapDateUtil" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>


<table width="100%">
<tr>
<td>
<table class="ZOptionsSectionTable" width="100%">
<tr class="ZOptionsHeaderRow">
	<td class="ImgPrefsHeader_L">&nbsp;</td>
	<td class='ZOptionsHeader ImgPrefsHeader' >
		<fmt:message key="optionsDisplayingMessages"/>
	</td>
	<td class="ImgPrefsHeader_R">&nbsp;</td>
</tr>
</table>
<table width="100%" class="ZOptionsSectionMain" cellspacing="6">
<tr>
	<td class='ZOptionsTableLabel'>
		<fmt:message key="optionsDisplay"/>:
	</td>
	<td>
		<table>
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
			<label for="groupMailBy"><fmt:message key="groupMailBy"/>:</label>
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
		<table>
			<tr>
				<td>
					<input id="viewHtml" type="radio" name="zimbraPrefMessageViewHtmlPreferred" value="TRUE" 
						<c:if test="${mailbox.prefs.messageViewHtmlPreferred}">checked</c:if>/>
				</td>
				<td>
					<label for="viewHtml"><fmt:message key="optionsDisplayHtmlAsHtml"/></label>
				</td>
				<td>
					<input id="viewText" type="radio" name="zimbraPrefMessageViewHtmlPreferred" value="FALSE" 
						<c:if test="${not mailbox.prefs.messageViewHtmlPreferred}">checked</c:if>/>
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
		<table>
			<tr>
				<td>
					<input id="viewRight" type="radio" name="zimbraPrefReadingPaneLocation" value="right" 
						<c:if test="${mailbox.prefs.readingPaneLocation eq 'right'}">checked</c:if>/>
				</td>
				<td>
					<label for="viewRight"><fmt:message key="readingPaneOnRight"/></label>
				</td>
				<td>
					<input id="viewBottom" type="radio" name="zimbraPrefReadingPaneLocation" value="bottom" 
						<c:if test="${mailbox.prefs.readingPaneLocation eq 'bottom'}">checked</c:if>/>
				</td>
				<td>
					<label for="viewBottom"><fmt:message key="readingPaneAtBottom"/></label>
				</td>
                <td>
                    <input id="noReadingPane" type="radio" name="zimbraPrefReadingPaneLocation" value="off" 
						<c:if test="${mailbox.prefs.readingPaneLocation eq 'off'}">checked</c:if>/>
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
		<app:optCheckbox boxfirst="true" label="optionsShowFragments" pref="zimbraPrefShowFragments" 
			checked="${mailbox.prefs.showFragments}"/>
	</td>
</tr>
<c:if test="${mailbox.features.initialSearchPreference}">
	<app:optSeparator/>
	<tr>
		<td class='ZOptionsTableLabel'>
			<label for="zimbraPrefMailInitialSearch"><fmt:message key="optionsDefaultMailSearch"/>:</label>
		</td>
		<td>
			<input id="zimbraPrefMailInitialSearch" size="40" type="text" name='zimbraPrefMailInitialSearch' 
				value="${fn:escapeXml(mailbox.prefs.mailInitialSearch)}">
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
<table class="ZOptionsSectionTable" width="100%">
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
<table width="100%" class="ZOptionsSectionMain" cellspacing="6">
<c:set var="messageArrives"><fmt:message key="optionsWhenAMessageArrives"/> : </c:set>
<c:if test="${mailbox.features.mailForwarding}">
	<tr>
		<td class='ZOptionsTableLabel'>
				${messageArrives}
			<c:set var="messageArrives" value="&nbsp;"/>
		</td>
		<td>
			<table>
				<tr>
					<td>
						<input type="checkbox" id="FORWARDCHECKED" name='FORWARDCHECKED' value="TRUE" 
							<c:if test="${not empty mailbox.prefs.mailForwardingAddress}">checked</c:if>>
					</td>
					<td style='padding-left:5px' nowrap align=right>
						<label for="FORWARDCHECKED"><fmt:message key="optionsForwardAcopyTo"/>:</label>
					</td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<td class='ZOptionsTableLabel'>&nbsp;</td>
		<td style='padding-left:20px'>
			<input id="zimbraPrefMailForwardingAddress" size="40" type="text" name='zimbraPrefMailForwardingAddress' 
				value="${fn:escapeXml(mailbox.prefs.mailForwardingAddress)}">
			<span style='padding-left:5px' class='ZOptionsHint'><fmt:message key="optionsEmailAddressHint"/></span>
		</td>
	</tr>
	<tr>
		<td class='ZOptionsTableLabel'>&nbsp;</td>
		<td style='padding-left:20px'>
			<app:optCheckbox boxfirst="true" label="mailDeliveryDisabled" pref="zimbraPrefMailLocalDeliveryDisabled"
							 checked="${mailbox.prefs.mailLocalDeliveryDisabled}"/>
		</td>
	</tr>
	<tr>
		<td class='ZOptionsTableLabel'>&nbsp;</td>
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
		<td class='ZOptionsTableLabel'>&nbsp;</td>
		<td style='padding-left:20px'>
			<input id="zimbraPrefNewMailNotificationAddress" size="40" type="text" name='zimbraPrefNewMailNotificationAddress' 
				value="${fn:escapeXml(mailbox.prefs.newMailNotificationAddress)}">
			<span style='padding-left:5px' class='ZOptionsHint'><fmt:message key="optionsEmailAddressHint"/></span>
		</td>
	</tr>
	<tr>
		<td class='ZOptionsTableLabel'>&nbsp;</td>
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
		<td class='ZOptionsTableLabel'>&nbsp;</td>
		<td style='padding-left:20px'>
			<textarea id="zimbraPrefOutOfOfficeReply" name='zimbraPrefOutOfOfficeReply' 
				cols='60' rows='4'>${fn:escapeXml(mailbox.prefs.outOfOfficeReply)}</textarea>
		</td>
	</tr>
	<tr>
		 <td class='ZOptionsTableLabel'>
			<label><fmt:message key="startDate"/>:</label>
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
			<label><fmt:message key="untilDate"/>:</label>
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
		<label><fmt:message key="optionsMessagesFromMe"/>:</label>
	</td>
	<td>
		<label><fmt:message key="removeDupesToSelf"/>:</label>
	</td>
</tr>
<tr>
	<td class='ZOptionsTableLabel'>&nbsp;</td>
	<td>
		<table>
			<tr>
				<c:set var="dedupe" value="${mailbox.prefs.dedupeMessagesSentToSelf}"/>
				<td>
					<input id="dedupeNone" type="radio" name="zimbraPrefDedupeMessagesSentToSelf" value="dedupeNone" 
						<c:if test="${dedupe eq 'dedupeNone'}">checked</c:if>/>
				</td>
				<td>
					<label for="dedupeNone"><fmt:message key="optionsDedupeNone"/></label>
				</td>
				<td>
					<input id="secondCopy" type="radio" name="zimbraPrefDedupeMessagesSentToSelf" value="secondCopyifOnToOrCC" 
						<c:if test="${dedupe eq 'secondCopyifOnToOrCC'}">checked</c:if>/>
				</td>
				<td>
					<label for="secondCopy"><fmt:message key="optionsDedupeSecondCopy"/></label>
				</td>
				<td>
					<input id="dedupeall" type="radio" name="zimbraPrefDedupeMessagesSentToSelf" value="dedupeAll" 
						<c:if test="${dedupe eq 'dedupeAll'}">checked</c:if>/>
				</td>
				<td>
					<label for="dedupeall"><fmt:message key="optionsDedupeAll"/></label>
				</td>
			</tr>
		</table>
	</td>
</tr>
<tr>
	<td colspan="2">&nbsp;</td>
</tr>
</table>
<c:if test="${mailbox.features.pop3Enabled}">
	<c:set var="pop3DownloadSince" value="${mailbox.prefs.pop3DownloadSince}"/>
    <%	PageContext pageContext = (PageContext)jspContext;

        // NOTE: We need to adjust to UTC for formatting purposes
		Date dateObj = new Date();
		String now = LdapDateUtil.toGeneralizedTime(dateObj);
		pageContext.setAttribute("now", now, PageContext.PAGE_SCOPE);

		// NOTE: We need to adjust from UTC for formatting purposes
		Date current = null;
		String pop3DownloadSince = (String)pageContext.findAttribute("pop3DownloadSince");
		if (pop3DownloadSince != null && pop3DownloadSince.length() > 0) {
		    current = LdapDateUtil.parseGeneralizedTime(pop3DownloadSince);
		}
		pageContext.setAttribute("current", current, PageContext.PAGE_SCOPE);
	%>
	<br/>
	<table class="ZOptionsSectionTable" width="100%">
	<tr class="ZOptionsHeaderRow">
		<td class="ImgPrefsHeader_L">&nbsp;</td>
		<td class='ZOptionsHeader ImgPrefsHeader'><fmt:message key="optionsAccess" /></td>
		<td class="ImgPrefsHeader_R">&nbsp;</td>
	</tr>
	</table>
	<table width="100%" class="ZOptionsSectionMain" cellspacing="6">
	<tr>
		<td class='ZOptionsTableLabel' style="vertical-align:top"><fmt:message key="optionsAccessPop" /></td>
		<td>
			<table>
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
							   value="${now}" ${not empty pop3DownloadSince ? "checked" : ""}>
					</td>
					<td style='padding-left:5px' nowrap>
						<label for="pop3DownloadFromNow"><fmt:message key="optionsAccessPopDownloadFromNow" /></label>
					</td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<td></td>
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