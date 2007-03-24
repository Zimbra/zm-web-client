<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <c:choose>
        <c:when test="${param.useInstance eq '1' and not empty param.exInvId}">
            <c:set var="id" value="${param.exInvId}"/>
            <c:set var="compNum" value="${empty param.exCompNum ? 0 : param.exCompNum}"/>
        </c:when>
        <c:otherwise>
            <c:set var="id" value="${param.invId}"/>
            <c:set var="compNum" value="${empty param.invCompNum ? 0 : param.invCompNum}"/>
        </c:otherwise>
    </c:choose>
    <zm:getMessage var="msg" id="${id}" markread="true" neuterimages="${empty param.xim}"/>
    <c:set var="invite" value="${msg.invite}"/>

</app:handleError>

<app:view mailbox="${mailbox}" title="${msg.subject}" context="${null}" selected='calendar' calendars="true" keys="false" minical="true" date="${requestScope.dateContext}">
    <form action="" method="post">

        <table width=100% cellpadding="0" cellspacing="0">
            <tr>
                <td class='TbTop'>
                    <app:apptViewToolbar keys="true"/>
                </td>
            </tr>
            <tr>
                <td class='ZhAppContent'>
                        <c:set var="extImageUrl" value=""/>
                        <c:if test="${empty param.xim}">
                            <zm:currentResultUrl var="extImageUrl" value="search" action="view" context="${context}" xim="1"/>
                        </c:if>
                        <zm:currentResultUrl var="composeUrl" value="search" context="${context}"
                                             action="compose" paction="view" id="${msg.id}"/>
                        <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${msg.id}"/>
                        <app:displayAppointment mailbox="${mailbox}" message="${msg}" invite="${invite}" externalImageUrl="${extImageUrl}" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
                </td>
            </tr>
            <tr>
                <td class='TbBottom'>
                    &nbsp;
                </td>
            </tr>
        </table>
        <input type="hidden" name="id" value="${msg.id}"/>
        <input type="hidden" name="doMessageAction" value="1"/>
    </form>
</app:view>
