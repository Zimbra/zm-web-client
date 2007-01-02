<%@ tag body-content="scriptless" %>
<%@ attribute name="selected" rtexprvalue="true" required="false" %>
<%@ attribute name="folders" rtexprvalue="true" required="false" %>
<%@ attribute name="searches" rtexprvalue="true" required="false" %>
<%@ attribute name="contacts" rtexprvalue="true" required="false" %>
<%@ attribute name="calendars" rtexprvalue="true" required="false" %>
<%@ attribute name="editmode" rtexprvalue="true" required="false" %>
<%@ attribute name="title" rtexprvalue="true" required="true" %>
<%@ attribute name="ads" rtexprvalue="true" required="false" %>
<%@ attribute name="tags" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<zm:getMailbox var="mailbox"/>
<app:head title="${title}"/>

<body>
<table width=100% cellpadding="0" cellspacing="0">
    <tr>
        <td class='TopContent' colspan=3  align=right valign=top><b>${fn:escapeXml(mailbox.name)}</b> |
                        <a href="<c:url value="/h/login?loginOp=logout"/>"><fmt:message key="logOff"/></a>
        </td>
    </tr>
    <tr>
        <td valign=top align=center class='Overview'>
            <a href="http://www.zimbra.com" target=_new><div class='ImgAppBanner'/></a>
        </td>
        <td colspan=2 valign=top class='TopContent'>
            <table width=100% cellspacing=0>
                <app:appTop mailbox="${mailbox}" keys="${keys}" query="${empty context.query ? param.sq : context.query}"/>
                <app:appStatus/>
            </table>
        </td>
    </tr>
    <tr>
        <td class='Overview'>&nbsp;</td>
        <td colspan=2>
            <app:appTabs mailbox="${mailbox}" keys="${keys}" selected='${selected}'/>
        </td>
    </tr>
    <tr>
        <td valign=top class='Overview'>
            <app:overviewTree keys="${keys}" contacts="${contacts}" tags="${tags}" searches="${searches}" folders="${folders}" editmode="${editmode}"/>
        </td>
<c:set var="adsOn" value="${!empty ads}"/>
<c:if test="${adsOn}" >
        <td valign='top'>
            <table width=100% cellpadding="0" cellspacing="0">
                <tr>
</c:if>        
                    <td valign='top'>
                        <jsp:doBody/>
                    </td>
<c:if test="${adsOn}" >
                    <td valign='top' style='border-top: 1px solid #98adbe; width: 180px;'>
                       <app:ads content="${ads}"/>
                    </td>

                </tr>
            </table>
        </td>
</c:if>
        <td style='width:10px;'>
            &nbsp; <%-- for IE's scrollbar, this should be CSS browser-specific --%>
        </td>
    </tr>
</table>
</body>
</html>
