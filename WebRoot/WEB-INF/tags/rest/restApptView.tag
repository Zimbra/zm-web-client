<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<rest:handleError>
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
    <zm:getMessage box="${mailbox}" var="msg" id="${id}" markread="true" neuterimages="${empty param.xim}" wanthtml="${true}"/>
    <c:set var="invite" value="${msg.invite}"/>
    <c:set var="isInstance" value="${param.useInstance eq '1'}"/>

    <c:set var="readOnly" value="${true}"/>
    
</rest:handleError>

<rest:view title="${msg.subject}">

    <table width=100% cellpadding="0" cellspacing="0" border=0>
        <tr>
            <td style='padding:20px'>

        <table width=100% cellpadding="0" cellspacing="0">
            <tr>
                <td class='TbTop'>
                    <table width=100% cellspacing=0 class='Tb'>
                        <tr valign='middle'>
                            <td class='TbBt'>
                                <table cellspacing=0 cellpadding=0 class='Tb'>
                                    <tr>
                                        <td nowrap>
                                            <rest:calendarUrl var="closeurl" />
                                            <a id="OPCLOSE" href="${closeurl}"> <app:img src="common/ImgClose.gif"/> <span><fmt:message key="close"/></span></a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class='ZhAppContent'>
                    <table cellpadding=0 cellspacing=0 width=100%>
                        <c:if test="${isInstance}">
                            <tr>
                                <td>
                                    <table width=100% cellpadding=0 cellspacing=0>
                                        <tr>
                                            <td class='ZhApptRecurrInfo' style='padding-left:5px' width=24><app:img src="dwt/ImgInformation.gif"/></td>
                                            <td class='ZhApptRecurrInfo'>
                                                <rest:calendarUrl toggleInstance="true" var="apptUrl"/>
                                                <fmt:message key="apptInstViewNote"/>
                                                &nbsp;<a href="${apptUrl}"><fmt:message key="apptInstViewSeries"/></a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </c:if>
                        <tr>
                            <td>
                                <c:set var="extImageUrl" value=""/>
                                <c:if test="${empty param.xim}">
                                    <zm:currentResultUrl var="extImageUrl" value="search" action="view" context="${null}" xim="1"/>
                                </c:if>
                                <%--
                                <zm:currentResultUrl var="composeUrl" value="search" context="${context}"
                                             action="compose" paction="view" id="${msg.id}"/>
                                             --%>
                                <rest:calendarUrl var="composeUrl" id="${id}" action="compose" paction="view" apptFromParam="${true}" inviteReplyInst="${isInstance ? param.instStartTime : ''}"  inviteReplyAllDay="${isInstance and invite.component.allDay ? '1' : ''}"/>
                                <%-- <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${msg.id}"/> --%>
                                <rest:displayAppointment mailbox="${mailbox}" message="${msg}" invite="${invite}" timezone="${timezone}"
                                                        showInviteReply="${not readOnly}" externalImageUrl="${extImageUrl}" composeUrl="${composeUrl}" newWindowUrl=""/>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class='TbBottom'>
                    &nbsp;
                </td>
            </tr>
        </table>
    </td>
    </tr>
    </table>

</rest:view>
