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

<table cellpadding=0 border=0 cellspacing=0>
    <tr class='Tabs'>
        <td class='TabSpacer'/>
        <c:if test="${mailbox.features.portalEnabled}">
            <td></td>
            <td class='Tab ${selected=='home' ? 'TabSelected' :'TabNormal'}'>
                <a id='TAB_HOME' href="<c:url value="/h/home"/>" <c:if test="${keys}">accesskey="v"</c:if>>
                    <span id='tab_ikon_home'><app:img src="common/ImgZimlet.gif" altkey='ALT_APP_HOME'/></span>
                    <span><fmt:message key="home"/></span>
                </a>
            </td>
            <td class='TabSpacerR'/>
        </c:if>
        <c:if test="${mailbox.features.mail}">
        <td class='Tab ${selected=='mail' ? 'TabSelected' :'TabNormal'}'>
            <a id='TAB_MAIL' href="<c:url value="/h/search"/>">
              <span id='tab_ikon_mail'><app:img src="startup/ImgMailApp.gif" altkey='ALT_APP_MAIL'/>
              </span>
                <span><fmt:message key="mail"/></span>
            </a>
        </td>
        </c:if>
        <td class='TabSpacerR'/>
        <c:if test="${mailbox.features.voice}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='voice' ? 'TabSelected' :'TabNormal'}'>
                <a id='TAB_VOICE' href="<c:url value="/h/search?st=voicemail"/>" <c:if test="${keys}">accesskey="v"</c:if>><span id='tab_ikon_voice'><app:img src="voicemail/ImgVoicemailApp.gif" altkey='ALT_APP_CONTACTS'/></span><span><fmt:message
                        key="voice"/></span></a>
            </td>
            <td class='TabSpacerR'/>
        </c:if>
        <c:if test="${mailbox.features.contacts}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='contacts' ? 'TabSelected' :'TabNormal'}'>
                <a id='TAB_ADDRESSBOOK' href="<c:url value="/h/search?st=contact"/>">
                   <span id='tab_ikon_contacts'><app:img src="contacts/ImgContact.gif" altkey='ALT_APP_CONTACTS'/></span><span><fmt:message
                        key="addressBook"/></span></a>
            </td>
            <td class='TabSpacerR'/>
        </c:if>
        <c:if test="${mailbox.features.calendar}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='calendar' ? 'TabSelected' :'TabNormal'}'>
                <a id='TAB_CALENDAR' href="<c:url value="/h/calendar"/>">
                    <span id='tab_ikon_calendar'><app:img src="startup/ImgCalendarApp.gif" altkey='ALT_APP_CALENDAR'/></span><span><fmt:message
                        key="calendar"/></span></a>
            </td>
            <td class='TabSpacerR'/>
        </c:if>
        <c:if test="${mailbox.features.tasks}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='tasks' ? 'TabSelected' :'TabNormal'}'>
                <a id='TAB_TASKS' href="<c:url value="/h/search?st=task"/>">
                    <span id='tab_ikon_tasks'><app:img src="startup/ImgTaskList.gif" altkey='ALT_APP_TASK'/></span><span><fmt:message
                        key="tasks"/></span></a>
            </td>
            <td class='TabSpacerR'/>
        </c:if>
        <td class='TabSpacer'/>
        <td class='Tab ${selected=='options' ? 'TabSelected' :'TabNormal'}'>
            <a id='TAB_OPTIONS' href="<c:url value="/h/options"/>">
                <span id='tab_ikon_options'><app:img src="startup/ImgPreferences.gif" altkey='ALT_APP_OPTIONS'/></span><span><fmt:message
                    key="options"/></span></a>
        </td>
        <td class='TabSpacerR'/>
        <c:if test="${mailbox.features.mail}">
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
            <a id='TAB_COMPOSE' href="${fn:escapeXml(composeUrl)}"><span id='tab_ikon_compose'><app:img src="startup/ImgNewMessage.gif" altkey='ALT_APP_COMPOSE'/></span><span><fmt:message
                    key="compose"/></span></a>
        </td>
        <td class='TabSpacerR'/>
        </c:if>    
        <td class='TabSpacer'/>
        <td class='TabFiller'>
            &nbsp;
        </td>
    </tr>
</table>
