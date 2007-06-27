<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<app:handleError>

</app:handleError>
<table border="0" cellspacing="10" width="100%">
    <%------------------- List of numbers ------------------%>
    <tr>
        <td class="ZOptionsTableLabel">&nbsp;</td>
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
        <td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="emailNotification"/></td>
        <td>
            <input id="emailNotificationActive" type=checkbox name="emailNotificationActive" value="TRUE" <c:if test="${!empty account.callFeatures.voiceMailPrefs.emailNotificationAddress}">checked</c:if>>
            <label for="emailNotificationActive"><fmt:message key="sendEmailNotification"/></label>
            <input name="emailNotificationAddress" type="text" size="25" value="${account.callFeatures.voiceMailPrefs.emailNotificationAddress}">
        </td>
    </tr>
    <%------------------- Call forwarding ------------------%>
    <tr>
        <td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="callForwarding"/></td>
        <td>
            <input id="callForwardingAllActive" type=checkbox name="callForwardingAllActive" value="TRUE" <c:if test="${account.callFeatures.callForwardingAll.isActive}">checked</c:if>>
            <label for="callForwardingAllActive"><fmt:message key="forwardAllCalls"/></label>
            <input name="callForwardingAllNumber" type="text" size="25" value="${account.callFeatures.callForwardingAll.forwardTo}">

            <%------------------- Selective Call forwarding ------------------%>
            <br>
            <input id="selectiveCallForwardingActive" type=checkbox name="selectiveCallForwardingActive" value="TRUE" <c:if test="${account.callFeatures.selectiveCallForwarding.isActive}">checked</c:if>>
            <label for="selectiveCallForwardingActive"><fmt:message key="forwardSomeCalls"/></label>
            <input name="selectiveCallForwardingNumber" type="text" size="25" value="${account.callFeatures.selectiveCallForwarding.forwardTo}">
            <table class="List" width="260px">
                <tr><th colspan="2"><fmt:message key="forwardCallFrom"/></th></tr>
                <c:choose>
                    <c:when test="${param.haveForwardFromList}">
                        <c:forEach items="${paramValues.forwardNumbers}" var="a">
                            <app:forwardFromRow phone="${a}"/>
                        </c:forEach>
                    </c:when>
                    <c:otherwise>
                        <c:forEach items="${account.callFeatures.selectiveCallForwarding.forwardFrom}" var="a">
                            <app:forwardFromRow phone="${a}"/>
                        </c:forEach>
                    </c:otherwise>
                </c:choose>
                <c:if test="${zm:actionSet(param, 'actionAdd')}">
                    <app:forwardFromRow phone="${param.addNumber}"/>
                </c:if>
            </table>
            <input type="hidden" name="haveForwardFromList" value="true">

            <table width="260px">
                <tr>
                    <c:set var="addButton"><fmt:message key="add"/></c:set>
                    <td><b><fmt:message key="add"/></b></td>
                    <td><input type="text" name="addNumber" style="width:100%;"></td>
                    <td><input type="submit" title="${addButton}" value="${addButton}" name="actionAdd"></td>
                </tr>
                <tr>
                    <td></td>
                    <td><fmt:message key="selectCallForwardingRule"/></td>
                    <td></td>
                </tr>
            </table>
        </td>
    </tr>
    <input type="hidden" name="phone" value="${account.phone.name}">
</c:if>
</zm:forEachPhoneAccount>    
</table>
