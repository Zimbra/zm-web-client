<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<app:handleError>

</app:handleError>
<table border="0" cellpadding="0" cellspacing="4" width="550px">
    <%------------------- List of numbers ------------------%>
    <tr>
        <td style="width:200px">&nbsp;</td>
        <td>
            <div><fmt:message key="voiceOptInstructions"/></div>
            <table class="List" border="0" cellpadding="0" cellspacing="0" width=100%>
                <tr><th><fmt:message key="number"/></th></tr>
                <c:set var="firstAccount" value="true"/>
                <zm:forEachPhoneAccount var="account">
                    <c:set var="selected" value="${(empty param.phone and firstAccount) or (param.phone eq account.phone.name)}"/>
                    <c:set var="firstAccount" value="false"/>
                    <c:url var="phoneUrl" value="/h/options?selected=voice">
                        <c:param name="phone" value="${account.phone.name}"/>
                    </c:url>
                    <tr <c:if test="${selected}">class='RowSelected'</c:if> >
                        <td><a href="${phoneUrl}">${account.phone.display}</a></td>
                    </tr>
                </zm:forEachPhoneAccount>
            </table>
        </td>
    </tr>

<%--
Stupid: I had to do a second loop that only acts on the selected account......
--%>
<c:set var="firstAccount" value="true"/>
<zm:forEachPhoneAccount var="account">
    <c:set var="selected" value="${(empty param.phone and firstAccount) or (param.phone eq account.phone.name)}"/>
    <c:set var="firstAccount" value="false"/>
    <c:if test="${selected}">
    <%------------------- Count per page ------------------%>
    <tr>
    </tr>
    <%------------------- Email notification ------------------%>
    <tr>
        <td align=right><fmt:message key="emailNotification"/></td>
        <td>
            <input id="emailNotificationActive" type=checkbox name="emailNotificationActive" value="TRUE" <c:if test="${account.callFeatures.emailNotification.isActive}">checked</c:if>>
            <label for="emailNotificationActive"><fmt:message key="sendEmailNotification"/></label>
            <input name="emailNotificationAddress" type="text" size="25" value="${account.callFeatures.emailNotification.address}">
        </td>
    </tr>
    <%------------------- Call forwarding ------------------%>
    <tr>
        <td align=right><fmt:message key="callForwarding"/></td>
        <td>
            <input id="callForwardingAllActive" type=checkbox name="callForwardingAllActive" value="TRUE" <c:if test="${account.callFeatures.callForwardingAll.isActive}">checked</c:if>>
            <label for="callForwardingAllActive"><fmt:message key="forwardAllCalls"/></label>
            <input name="callForwardingAllNumber" type="text" size="25" value="${account.callFeatures.callForwardingAll.forwardTo}">
        </td>
    </tr>
    <input type="hidden" name="phone" value="${account.phone.name}">
</c:if>
</zm:forEachPhoneAccount>    
</table>
