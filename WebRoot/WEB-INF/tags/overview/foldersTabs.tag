<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ attribute name="selected" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:set var="accessKey" value="${1}"/>
<table cellpadding=0 cellspacing=0>
    <tr class='Tabs'>
        <td class='TabSpacer'/>
        <td class='TabSpacer'/>
        <td class='Tab ${selected=='folders' ? 'TabSelected' :'TabNormal'}'>
            <a href="<c:url value="/h/mfolders"/>" accesskey="${accessKey}">
                <app:img src="common/Folder.gif" altkey='ALT_APP_MANAGE_FOLDERS'/>
                <span><fmt:message key="folders"/></span>
            </a>
        </td>
        <c:set var="accessKey" value="${accessKey+1}"/>
        <c:if test="${mailbox.features.contacts}">
        <td class='TabSpacer'/>
        <td class='Tab ${selected=='addressbooks' ? 'TabSelected' :'TabNormal'}'>
            <a href="<c:url value="/h/maddrbooks"/>" accesskey="${accessKey}">
                <app:img src="contacts/ContactsFolder.gif" altkey='ALT_APP_MANAGE_ADDRESS_BOOKS'/>
                <span><fmt:message key="addressBooks"/></span></a>
        </td>
            <c:set var="accessKey" value="${accessKey+1}"/>
        </c:if>
        <c:if test="${mailbox.features.calendar}">
        <td class='TabSpacer'/>
        <td class='Tab ${selected=='calendars' ? 'TabSelected' :'TabNormal'}'>
            <a href="<c:url value="/h/mcalendars"/>" accesskey="${accessKey}">
                <app:img src="calendar/CalendarFolder.gif" altkey='ALT_APP_MANAGE_CALENDARS'/>
                <span><fmt:message key="calendars"/></span></a>
        </td>
                    <c:set var="accessKey" value="${accessKey+1}"/>
        </c:if>
        <c:if test="${mailbox.features.tagging}">
        <td class='TabSpacer'/>
        <td class='Tab ${selected=='tags' ? 'TabSelected' :'TabNormal'}'>
            <a href="<c:url value="/h/mtags"/>" accesskey="${accessKey}">
                 <app:img src="tag/Tag.gif" altkey='ALT_APP_MANAGE_TAGS'/>
                <span><fmt:message key="tags"/></span></a>
        </td>
            <c:set var="accessKey" value="${accessKey+1}"/>
        </c:if>
        <td class='TabFiller'>
            &nbsp;
        </td>
    </tr>
</table>
