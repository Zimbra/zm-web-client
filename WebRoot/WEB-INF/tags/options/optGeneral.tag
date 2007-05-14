<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>


<table border="0" cellpadding="0" cellspacing="4" width=100%>
    <tbody>
        <app:optCheckbox label="includeJunkFolder" pref="zimbraPrefIncludeSpamInSearch"
                         checked="${mailbox.prefs.includeSpamInSearch}"/>
        <app:optCheckbox label="includeTrashFolder" pref="zimbraPrefIncludeTrashInSearch"
                         checked="${mailbox.prefs.includeTrashInSearch}"/>
        <app:optSeparator/>
        <app:optCheckbox label="showSearchString" pref="zimbraPrefShowSearchString"
                         checked="${mailbox.prefs.showSearchString}"/>
        <app:optSeparator/>
        <c:if test="${mailbox.features.changePassword}">
            <tr>
                <td nowrap align=right>
                    <fmt:message key="changePassword"/>
                    :
                </td>
                <td>
                    <c:url var="changePassUrl" value="${zm:getChangePasswordUrl(pageContext, '/h/changepass')}"/>
                    <a href="${changePassUrl}" target="_blank"><fmt:message key="changePassword"/></a>
                </td>
            </tr>
            <app:optSeparator/>
        </c:if>
        <c:if test="${mailbox.features.skinChange}">
            <tr>
                <td nowrap align=right>
                    <label for="skinPref"><fmt:message key="SKIN_uiTheme"/>
                    :</label>
                </td>
                <td>
                    <select name="zimbraPrefSkin" id="skinPref">
                        <c:set var="skin" value="${mailbox.prefs.skin}"/>
                        <c:forEach var="name" items="${mailbox.availableSkins}">
                            <fmt:message var="displayName" key="SKIN_${name}"/>
                            <option
                                    <c:if test="${name eq skin}">selected</c:if>
                                    value="${fn:escapeXml(name)}">${fn:escapeXml(fn:startsWith(displayName,'???') ? name : displayName)}</option>
                        </c:forEach>
                    </select>
                </td>
            </tr>
            <app:optSeparator/>
        </c:if>
              <tr>
                <td nowrap align=right>
                    <label for="timeZone"><fmt:message key="timeZonePref"/>
                    :</label>
                </td>
                <td>
                    <select name="zimbraPrefTimeZoneId" id="timeZone">
                        <c:set var="tzpref" value="${mailbox.prefs.timeZoneWindowsId}"/>
                        <zm:forEachTimeZone var="tz">
                            <%--<fmt:message var="displayName" key="SKIN_${name}"/>--%>
                            <option
                                    <c:if test="${tzpref eq tz.id}">selected</c:if>
                                    value="${fn:escapeXml(tz.id)}">${fn:escapeXml(tz.display)}</option>
                        </zm:forEachTimeZone>
                    </select>
                </td>
            </tr>
            <app:optSeparator/>
    </tbody>
</table>
