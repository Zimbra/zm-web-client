<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>


<table border="0" cellpadding="0" cellspacing="4" width=100%>
    <tbody>
        <app:optCheckbox label="autoAddContacts" pref="zimbraPrefAutoAddAddressEnabled"
                         checked="${mailbox.prefs.autoAddAddressEnabled}"/>
        <tr>
            <td nowrap align=right>
                <fmt:message key="numberOfContactsToDisplayPerPage"/>
                :
            </td>
            <td>
                <select name="zimbraPrefContactsPerPage">
                    <c:set var="contactsPP" value="${mailbox.prefs.contactsPerPage}"/>
                    <option
                            <c:if test="${contactsPP eq 10}"> selected</c:if>
                            >10
                    </option>
                    <option
                            <c:if test="${contactsPP eq 25}"> selected</c:if>
                            >25
                    </option>
                    <option
                            <c:if test="${contactsPP eq 50}"> selected</c:if>
                            >50
                    </option>
                    <option
                            <c:if test="${contactsPP eq 100}"> selected</c:if>
                            >100
                    </option>
                </select>
            </td>
        </tr>
        <app:optSeparator/>
    </tbody>
</table>
