<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<table border="0" cellpadding="0" cellspacing="4" width=100%>
<tbody>
<c:if test="${mailbox.features.conversations}">
    <tr>
        <td nowrap align=right>
            <fmt:message key="groupMailBy"/>
            :
        </td>
        <td>
            <select name="zimbraPrefGroupMailBy">
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
<tr>
    <td nowrap align=right>
        <fmt:message key="numberOfItemsPerPage"/>
        :
    </td>
    <td>
        <select name="zimbraPrefMailItemsPerPage">
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
</tr>

<app:optCheckbox label="showFragments" pref="zimbraPrefShowFragments" checked="${mailbox.prefs.showFragments}"/>

<c:if test="${mailbox.features.initialSearchPreference}">
    <app:optText label="initialMailSearch" pref="zimbraPrefMailInitialSearch" size="40"
                 value="${mailbox.prefs.mailInitialSearch}"/>
</c:if>

<app:optSeparator/>

<app:optCheckbox label="saveToSent" pref="zimbraPrefSaveToSent" checked="${mailbox.prefs.saveToSent}"/>

<c:if test="${mailbox.features.outOfOfficeReply}">
    <app:optCheckbox label="awayMessageEnabled" pref="zimbraPrefOutOfOfficeReplyEnabled"
                     checked="${mailbox.prefs.outOfOfficeReplyEnabled}"/>

    <app:optTextArea label="awayMessage" pref="zimbraPrefOutOfOfficeReply" rows='4' cols='60'
                     value="${mailbox.prefs.outOfOfficeReply}"/>
</c:if>

<app:optSeparator/>

<c:if test="${mailbox.features.newMailNotification}">
    <app:optCheckbox label="mailNotifEnabled" pref="zimbraPrefNewMailNotificationEnabled"
                     checked="${mailbox.prefs.newMailNotificationsEnabled}"/>

    <app:optText label="mailNotifAddress" pref="zimbraPrefNewMailNotificationAddress" size="40"
                 value="${mailbox.prefs.newMailNotificationAddress}"/>

    <app:optSeparator/>
</c:if>

<c:if test="${mailbox.features.mailForwarding}">
    <app:optText label="mailForwardingAddress" pref="zimbraPrefMailForwardingAddress" size="40"
                 value="${mailbox.prefs.mailForwardingAddress}"/>

    <app:optCheckbox label="mailDeliveryDisabled" pref="zimbraPrefMailLocalDeliveryDisabled"
                     checked="${mailbox.prefs.mailLocalDeliveryDisabled}"/>

    <app:optSeparator/>
</c:if>

<app:optCheckbox label="viewMailAsHtml" pref="zimbraPrefMessageViewHtmlPreferred"
                 checked="${mailbox.prefs.messageViewHtmlPreferred}"/>

<tr>
    <td nowrap align=right>
        <fmt:message key="removeDupesToSelf"/>
        :
    </td>
    <td>
        <select name="zimbraPrefDedupeMessagesSentToSelf">
            <c:set var="dedupe" value="${mailbox.prefs.dedupeMessagesSentToSelf}"/>
            <option
                    <c:if test="${dedupe eq 'dedupeNone'}"> selected</c:if> value="dedupeNone">
                <fmt:message key="dedupeNone"/>
            </option>
            <option
                    <c:if test="${dedupe eq 'secondCopyifOnToOrCC'}"> selected</c:if> value="secondCopyifOnToOrCC">
                <fmt:message key="dedupeSecondCopy"/>
            </option>
            <option
                    <c:if test="${dedupe eq 'dedupeAll'}"> selected</c:if> value="dedupeAll">
                <fmt:message key="dedupeAll"/>
            </option>
        </select>
    </td>
</tr>
<app:optSeparator/>
</tbody>
</table>
