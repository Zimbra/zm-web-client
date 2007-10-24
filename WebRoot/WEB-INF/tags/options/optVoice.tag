<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<app:handleError>

</app:handleError>
<table class="ZhOptVoice" border="0" cellspacing="10" width="100%">
    <%------------------- List of numbers ------------------%>
    <tr>
        <td class="ZOptionsTableLabel">&nbsp;</td>
        <td>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="ZhOptVoiceCBCell">&nbsp;</td>
                    <td>
                        <div width="350px"><fmt:message key="voiceOptInstructions"/></div>
                        <br>
                        <table class="List" border="0" cellpadding="0" cellspacing="0" width="350px">
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
        <app:getCallFeatures account="${account}" var="features"/>
        <%------------------- Count per page ------------------%>
        <tr>
			<td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="optionsDisplay"/> :</td>
			<td>
				<select name="numberPerPage">
					<c:set var="numberPerPage" value="${features.voiceMailPrefs.numberPerPage}"/>
					<option	<c:if test="${numberPerPage eq 10}"> selected</c:if> >10</option>
					<option <c:if test="${numberPerPage eq 25}"> selected</c:if> >25</option>
					<option <c:if test="${numberPerPage eq 50}"> selected</c:if> >50</option>
					<option <c:if test="${numberPerPage eq 100}"> selected</c:if> >100</option>
				</select>
				&nbsp;<fmt:message key="voiceMailsPerPage"/>
			</td>
		</tr>
        <%------------------- Email notification ------------------%>
        <tr>
            <td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="emailNotification"/></td>
            <td>
                <table border="0" cellpadding="0" cellspacing="0" >
                    <tr>
                        <td class="ZhOptVoiceCBCell">
                            <input id="emailNotificationActive" type=checkbox name="emailNotificationActive" value="TRUE" <c:if test="${!empty features.voiceMailPrefs.emailNotificationAddress}">checked</c:if>>
                        </td>
                        <td>
                            <label for="emailNotificationActive"><fmt:message key="sendEmailNotification"/></label>&nbsp;&nbsp;
                            <input name="emailNotificationAddress" type="text" size="25" value="${features.voiceMailPrefs.emailNotificationAddress}">
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <%------------------- Call forwarding ------------------%>
        <tr>
            <td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="callForwarding"/></td>
            <td>
                <table border="0" cellpadding="0" cellspacing="0" >
                    <tr>
                        <td class="ZhOptVoiceCBCell">
                            <input id="callForwardingAllActive" type=checkbox name="callForwardingAllActive" value="TRUE"
								<c:if test="${!features.callForwardingAll.isSubscribed}">disabled</c:if>
								<c:if test="${features.callForwardingAll.isActive}">checked</c:if>
							>
                        </td>
                        <td>
                            <label for="callForwardingAllActive"><fmt:message key="forwardAllCalls"/></label>&nbsp;&nbsp;
                            <input name="callForwardingAllNumber" type="text" size="25" value="${features.callForwardingAll.forwardTo}"
								<c:if test="${!features.callForwardingAll.isSubscribed}">disabled</c:if>
							>
                        </td>
                    </tr>
				</table>
			</td>
        </tr>
        <%------------------- More voice controls ------------------%>
		<tr><td colspan=2><hr></td></tr>
		<tr valign='top'>
			<td class='ZOptionsTableLabel'><fmt:message key="moreVoiceControlsLabel"/></td>
		</tr>
		<tr valign='top'>
			<td class='ZhOptVoiceCBCell'><fmt:message key="moreVoiceControlsText"/></td>
		</tr>
        <input type="hidden" name="phone" value="${account.phone.name}">
    </c:if>
</zm:forEachPhoneAccount>    
</table>
