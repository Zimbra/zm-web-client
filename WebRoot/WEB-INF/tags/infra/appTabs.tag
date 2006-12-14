<%@ tag body-content="empty" %>
<%@ attribute name="selected" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
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
            <a href="<c:url value="/h/search"/>" <c:if test="${keys}">accesskey="m"</c:if>>
                <app:img src="mail/MailApp.gif"/>
                <span><fmt:message key="mail"/></span>
            </a>
        </td>
        <td class='TabSpacer'/>
        <td class='Tab ${selected=='compose' ? 'TabSelected' :'TabNormal'}'>
            <a href="<c:url value="/h/search?action=compose"/>" <c:if test="${keys}">accesskey="e"</c:if>><app:img src="mail/NewMessage.gif"/><span><fmt:message
                    key="compose"/></span></a>
        </td>
        <td class='TabSpacer'/>
        <td class='Tab ${selected=='contacts' ? 'TabSelected' :'TabNormal'}'>
            <a href="<c:url value="/h/search?st=contact"/>" <c:if test="${keys}">accesskey="c"</c:if>><app:img src="contacts/Contact.gif"/><span><fmt:message
                    key="contacts"/></span></a>
        </td>
        <td class='TabSpacer'/>
        <td class='Tab ${selected=='options' ? 'TabSelected' :'TabNormal'}'>
            <a href="<c:url value="/h/options"/>" <c:if test="${keys}">accesskey="y"</c:if>><app:img src="common/Preferences.gif"/><span><fmt:message
                    key="options"/></span></a>
        </td>
        <td class='TabSpacer'/>
        <c:choose>
            <c:when test="${selected =='managetags'}">
                <td class='Tab TabSelected'>
                    <app:img src="tag/Tag.gif"/><span><fmt:message key="tags"/></span>
                </td>
                <td class='TabSpacer'/>
            </c:when>
            <c:when test="${selected =='managefolders'}">
                <td class='Tab TabSelected'>
                    <app:img src="common/Folder.gif"/><span><fmt:message key="folders"/></span>
                </td>
                <td class='TabSpacer'/>
            </c:when>
            <c:when test="${selected =='managesearches'}">
                <td class='Tab TabSelected'>
                    <app:img src="common/SearchFolder.gif"/><span><fmt:message key="searches"/></span>
                </td>
                <td class='TabSpacer'/>
            </c:when>
            <c:when test="${selected =='manageaddressbooks'}">
                <td class='Tab TabSelected'>
                    <app:img src="contacts/ContactsFolder.gif"/><span><fmt:message key="addressBooks"/></span>
                </td>
                <td class='TabSpacer'/>
            </c:when>
        </c:choose>
        <%--
        <td class='Tab ${selected=='calendar' ? ' TabSelected' :' TabNormal'}'>
            <app:img src="calendar/CalendarApp.gif"/>
            <span><fmt:message key="calendar"/></span>
        </td>
        --%>
        <td class='TabFiller'>
            &nbsp;
        </td>
    </tr>
</table>
