<%@ tag body-content="scriptless" %>
<%@ attribute name="selected" rtexprvalue="true" required="false" %>
<%@ attribute name="folders" rtexprvalue="true" required="false" %>
<%@ attribute name="searches" rtexprvalue="true" required="false" %>
<%@ attribute name="contacts" rtexprvalue="true" required="false" %>
<%@ attribute name="calendars" rtexprvalue="true" required="false" %>
<%@ attribute name="minical" rtexprvalue="true" required="false" %>
<%@ attribute name="date" rtexprvalue="true" required="false" type="java.util.Calendar" %>
<%@ attribute name="editmode" rtexprvalue="true" required="false" %>
<%@ attribute name="title" rtexprvalue="true" required="true" %>
<%@ attribute name="ads" rtexprvalue="true" required="false" %>
<%@ attribute name="tags" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<app:head mailbox="${mailbox}" title="${title}"/>

<body>
<table width=100% cellpadding="0" cellspacing="0">
    <tr>
        <td class='TopContent' colspan=3  align=right valign=top>&nbsp;</td>
    </tr>

    <tr>
        <td valign=top align=center class='Overview'>
            <a href="http://www.zimbra.com/" target="_new">
                <div style='cursor:pointer' class='ImgAppBanner'></div>

            </a>
        </td>
        <td colspan=2 valign=top class='TopContent'>
            <app:appTop mailbox="${mailbox}" keys="${keys}" query="${empty context.query ? param.sq : context.query}"/>
        </td>
    </tr>
    <tr>
        <td class='Overview'>
            &nbsp;
        </td>
        <td align=center colspan=2>
            <app:appStatus/>
        </td>
    </tr>
    <tr>

        <td class='Overview'>&nbsp;</td>
        <td colspan=1>
            <app:appTabs context="${context}" mailbox="${mailbox}" keys="${keys}" selected='${selected}'/>
        </td>
        <td align=right class='ZhAppLinks'>
            <table cellpadding=2 cellspacing=0>
                <tr>
                    <td align=right>
                        <a target=_new href="<c:url value="/bhelp/Zimbra_Basic_User_Help.htm"/>"><img alt='<fmt:message key="ALT_APP_LINK_HELP"/>' src="<c:url value='/images/common/Help.gif'/>" border="0"/> <fmt:message key="help"/></a>
                    </td>
                    <td align=right>
                        &nbsp;
                    </td>
                    <td align=right>
                        <a href="<c:url value="/h/login?loginOp=logout"/>"><img alt='<fmt:message key="ALT_APP_LINK_LOGOFF"/>' src="<c:url value='/images/common/Logoff.gif'/>" border="0"/> <fmt:message key="logOut"/></a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <c:if test="${empty editmode}">
            <td valign=top class='Overview'>
                <app:overviewTree mailbox="${mailbox}" keys="${keys}" minical="${minical}" calendars="${calendars}" contacts="${contacts}" tags="${tags}" searches="${searches}" folders="${folders}" editmode="${editmode}" date="${date}"/>
            </td>
        </c:if>
        <c:set var="adsOn" value="${!empty ads}"/>
<c:if test="${adsOn}" >
        <td valign='top' colspan=2>
            <table width=100% cellpadding="0" cellspacing="0">
                <tr>
</c:if>
        <td valign='top' colspan='${empty editmode ? 2 : 3}' style='padding-left:${editmode ? 10 : 0}px'>
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
