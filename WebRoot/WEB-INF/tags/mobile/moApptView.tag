<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>
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
    <c:set var="isInstance" value="${param.useInstance eq '1'}"/>

    <c:set var="apptFolder" value="${zm:getFolder(pageContext, msg.folderId)}"/>
    <c:set var="readOnly" value="${apptFolder.isMountPoint or apptFolder.isFeed}"/>

</mo:handleError>

<mo:view mailbox="${mailbox}" title="${msg.subject}" context="${null}" clazz="zo_obj_body" scale="true">
    <table width=100% cellspacing="0" cellpadding="2" border=0 class="ToolbarBg">
        <tr>
            <td>
                <mo:calendarUrl var="backurl" action="${null}"/>
                <a href="${backurl}">
                    <fmt:message key="back"/>
                </a>
            </td>
            <td align="right">
                <a href="${context_url}?st=newappt">
                    <fmt:message key="add"/>
                </a>
            </td>
        </tr>
    </table>
    <table width=100% class="Stripes" border="0">
        <tr>
            <td>
                <c:set var="extImageUrl" value=""/>
                <c:if test="${empty param.xim}">
                    <zm:currentResultUrl var="extImageUrl" value="search" action="view" context="${context}" xim="1"/>
                </c:if>
                    <%--
       <zm:currentResultUrl var="composeUrl" value="search" context="${context}"
                    action="compose" paction="view" id="${msg.id}"/>
                    --%>
                <mo:calendarUrl var="composeUrl" id="${id}" action="compose" paction="view" apptFromParam="${true}"
                                inviteReplyInst="${isInstance ? param.instStartTime : ''}"
                                inviteReplyAllDay="${isInstance and invite.component.allDay ? '1' : ''}"/>
                    <%-- <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${msg.id}"/> --%>
                <mo:displayAppointment mailbox="${mailbox}" message="${msg}" invite="${invite}"
                                       showInviteReply="${not readOnly}" externalImageUrl="${extImageUrl}"
                                       composeUrl="${composeUrl}" newWindowUrl=""/>
                <c:set var="repeat" value="${invite.component.simpleRecurrence}"/>
                <c:if test="${repeat != null && repeat.type != null && !repeat.type.none}">
                    <div class="View">
                    <span class="label"><fmt:message
                            key="repeats"/> :</span> ${fn:escapeXml(zm:getRepeatBlurb(repeat,pageContext,mailbox.prefs.timeZone, invite.component.start.date))}
                    </div>
                </c:if>
                    <%--<c:set var="apptFolder" value="${zm:getFolder(pageContext, appt.folderId)}"/>--%>
                <c:if test="${invite.component.isOrganizer}">
                    <div class="View">
                        <a id="_edit_link" class="button" href="<c:url value="/m/mainx?st=newappt&invId=${id}&useInstance=0"/>"><fmt:message key="edit"/></a>
                        <input id="edtbtn" style="display:none;" type="button" onclick="zClickLink('_edit_link')"
                               value="<fmt:message key="edit"/>"/>
                        <script type="text/javascript">
                            document.getElementById('edtbtn').style.display='';
                            document.getElementById('_edit_link').style.display='none';
                      </script>
                    </div>

                </c:if>
                    <%-- <c:choose>
                        <c:when test="${not context.folder.isInTrash}">
                            <input name="actionDelete" type="submit" value="<fmt:message key="delete"/>"/>
                        </c:when>
                        <c:otherwise>
                            <input name="actionHardDelete" type="submit" value="<fmt:message key="delete"/>"/>
                        </c:otherwise>
                    </c:choose>--%>

            </td>
        </tr>

    </table>
</mo:view>
