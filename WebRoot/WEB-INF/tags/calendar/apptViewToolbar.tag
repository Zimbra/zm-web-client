<%@ tag body-content="empty" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:if test="${empty requestScope.apptToolbarCache}">
    <zm:getMailbox var="mailbox"/>
    <c:set var="apptToolbarCache" scope="request">
        <td nowrap>
            <app:calendarUrl var="closeurl" />
            <a href="${closeurl}" <c:if test="${keys}">accesskey="z"</c:if>> <app:img src="common/Close.gif"/> <span><fmt:message key="close"/></span></a>
        </td>
    </c:set>
</c:if>

<table width=100% cellspacing=0 class='Tb'>
      <tr valign='middle'>
        <td style='padding:2px'>
            <table cellspacing=2 cellpadding=0 class='Tb'>
                <tr>
                    ${requestScope.apptToolbarCache}
                </tr>
            </table>
        </td>
    </tr>
</table>
