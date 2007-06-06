<%@ tag body-content="empty" %>
<%@ attribute name="selected" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<table cellpadding=0 cellspacing=0>
    <tr class='Tabs'>
        <td class='TabSpacer'/>
        <td class='TabSpacer'/>        
        <td class='Tab ${selected=='mail' ? 'TabSelected' :'TabNormal'}'>
            <a id='TAB_MAIL' href="<c:url value="/h/search"/>">
                <app:img src="mail/MailApp.gif" altkey='ALT_APP_MAIL'/>
                <span><fmt:message key="mail"/></span>
            </a>
        </td>
        <c:if test="${mailbox.features.voice}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='voice' ? 'TabSelected' :'TabNormal'}'>
                <a id='TAB_VOICE' href="<c:url value="/h/search?st=voicemail"/>" <c:if test="${keys}">accesskey="v"</c:if>><app:img src="voicemail/VoicemailApp.gif" altkey='ALT_APP_CONTACTS'/><span><fmt:message
                        key="voice"/></span></a>
            </td>
        </c:if>
        <c:if test="${mailbox.features.contacts}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='contacts' ? 'TabSelected' :'TabNormal'}'>
                <a id='TAB_ADDRESSBOOK' href="<c:url value="/h/search?st=contact"/>">
                    <app:img src="contacts/Contact.gif" altkey='ALT_APP_CONTACTS'/><span><fmt:message
                        key="addressBook"/></span></a>
            </td>
        </c:if>
        <c:if test="${mailbox.features.calendar}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='calendar' ? 'TabSelected' :'TabNormal'}'>
                <a id='TAB_CALENDAR' href="<c:url value="/h/calendar"/>">
                    <app:img src="calendar/CalendarApp.gif" altkey='ALT_APP_CALENDAR'/><span><fmt:message
                        key="calendar"/></span></a>
            </td>
        </c:if>
        <td class='TabSpacer'/>
        <td class='Tab ${selected=='options' ? 'TabSelected' :'TabNormal'}'>
            <a id='TAB_OPTIONS' href="<c:url value="/h/options"/>">
                <app:img src="common/Preferences.gif" altkey='ALT_APP_OPTIONS'/><span><fmt:message
                    key="options"/></span></a>
        </td>
        <td class='TabSpacer'/>
        <td class='Tab ${selected=='compose' ? 'TabSelected' :'TabNormal'}'>
            <c:choose>
                <c:when test="${not empty context}">
                    <zm:currentResultUrl var="composeUrl" value="/h/search" context="${context}" paction="${param.action}" action="compose"/>
                </c:when>
                <c:otherwise>
                    <c:url var="composeUrl" value="/h/search?action=compose"/>
                </c:otherwise>
            </c:choose>
            <a id='TAB_COMPOSE' href="${composeUrl}"><app:img src="mail/NewMessage.gif" altkey='ALT_APP_COMPOSE'/><span><fmt:message
                    key="compose"/></span></a>
        </td>
        <td class='TabSpacer'/>
        <td class='TabFiller'>
            &nbsp;
        </td>
    </tr>
</table>
