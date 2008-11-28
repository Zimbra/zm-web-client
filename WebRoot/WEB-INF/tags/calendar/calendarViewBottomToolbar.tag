<%@ tag body-content="empty" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:setBundle basename='/messages/AjxMsg' var='AjxMsg' scope='request' />
<fmt:message bundle='${AjxMsg}' key='${zm:getJavaId(timezone)}' var='timezoneStr' scope='request' />

<%-- TODO: blank for now, could add timezone drop down or more date selection --%>

<table width="100%" cellspacing="0" class='Tb'>
    <tr>
        <td align="left" class=TbBt>
            <input type="hidden" class='tbButton' name="zzz">&nbsp;
        </td>
        <td align='right' class='ZhCalTimeZone'>
            <zm:getMailbox var="mailbox"/>
            ${fn:escapeXml(fn:startsWith(timezoneStr,"???") ? (zm:getWindowsId(timezone)) : timezoneStr)}
        </td>
    </tr>
</table>
