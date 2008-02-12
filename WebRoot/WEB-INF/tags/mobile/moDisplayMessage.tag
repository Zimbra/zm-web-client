<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="showconvlink" rtexprvalue="true" required="false" %>
<%@ attribute name="counter" rtexprvalue="true" required="false" %>
<%@ attribute name="hideops" rtexprvalue="true" required="false" %>
<%@ attribute name="externalImageUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="composeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="newWindowUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>

<%--compute body up front, so attachments refereneced in multipart/related don't show up --%>
<c:set var="body" value="${message.body}"/>

<c:set var="theBody">
    <c:if test="${body.isTextHtml or body.isTextPlain}">
        <c:catch>
          ${zm:getPartHtmlContent(body, message)}
        </c:catch>
    </c:if>
</c:set>

<c:if test="${not empty message.invite and mailbox.features.calendar}">
    <c:set var="appt" value="${message.invite.component}"/>
    <c:set var="showInviteReply" value="${not zm:getFolder(pageContext, message.folderId).isInTrash and not empty message.invite.component}"/>
</c:if>
<c:set var="shareAccepted" value="${not empty message.share and zm:hasShareMountPoint(mailbox, message)}"/>
<c:set var="showShareInfo" value="${not empty message.share and not shareAccepted}"/>
<c:set var="needExtraCol" value="${showInviteReply or showShareInfo}"/>

<fmt:message var="unknownSender" key="unknownSender"/>
<c:set var="isPart" value="${!empty message.partName}"/>

<c:set var="from" value="${message.displayFrom}"/>
<c:set var="to" value="${message.displayTo}"/>
<c:set var="cc" value="${message.displayCc}"/>
<c:set var="sender" value="${message.displaySender}"/>


    <c:if test="${not empty from}">
    
	<div class="View">
	<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td valign='top' class='label' width="35" nowrap="nowrap" align="right"><fmt:message key="from"/>:</td>
        <td class="Padding">${fn:escapeXml(from)}</td>
    </tr>
    </table>
    </div>
    </c:if>
    <c:if test="${not empty sender}">
       	<div class="View">
       	<table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td valign='top' class='label' width="35" nowrap="nowrap" align="right"><fmt:message key="sender"/>:</td>
            <td class="Padding">${fn:escapeXml(sender)}</td>
        </tr>
    	</table>
    	</div>
    </c:if>
    <c:if test="${not empty to}">
        <div class="View">
       	<table width="100%" cellpadding="0" cellspacing="0">
           <tr>
            <td valign='top' class='label' nowrap="nowrap" width="35" align="right"><fmt:message key="to"/>:</td>
            <td class="Padding">${fn:escapeXml(to)}</td>
        </tr>
        </table>
        </div>
    </c:if>
    <c:if test="${not empty cc}">
        <div class="View">
       	<table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td valign='top' class='label' width="35" nowrap="nowrap" align="right"><fmt:message key="cc"/>:</td>
            <td class="Padding">${fn:escapeXml(cc)}</td>
        </tr>
        </table>
        </div>
    </c:if>
	<div class="View">
      	<table cellspacing="2" cellpadding="0" border="0" align="center">
                    <tr>
 						<td valign="top"><mo:img src="startup/ImgReply.gif" alt="reply"/></td>	                   
                        <td class="Padding">
                            <a <c:if test="${not isPart}">id="OPREPLY"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=reply" class="Action">
                                 <fmt:message key="reply"/>
                            </a> &nbsp; 
                        </td>
						<td valign="top"><mo:img src="startup/ImgReplyAll.gif" alt="replyall"/> </td>
                        <td class="Padding">
                            <a <c:if test="${not isPart}">id="OPREPLYALL"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=replyAll" class="Action">
                                <fmt:message key="replyAll"/>
                            </a> &nbsp; 
                        </td>
						<td valign="top"><mo:img src="startup/ImgForward.gif" alt="forward"/></td>
                        <td class="Padding">
                            <a <c:if test="${not isPart}">id="OPFORW"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=forward" class="Action">
                                 <fmt:message key="forward"/>
                            </a> 
                        </td>
                    </tr>
                </table>
            <hr size="1"/>
      	<table width="100%" cellpadding="0" cellspacing="0">
    <fmt:message var="noSubject" key="noSubject"/>
    <tr><td>
    <p class='zo_m_list_from'>
    <fmt:message var="dateFmt" key="formatDateSent"/>
            <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" pattern="${dateFmt}" value="${message.sentDate}"/>
    </p>
    <p class="zo_unread">
    ${fn:escapeXml(empty message.subject ? noSubject : message.subject)}
                        <c:if test="${message.isFlagged}">&nbsp;<mo:img src="startup/ImgFlagRed.gif" alt="flag"/></c:if>
    
    </p>
    <hr size="1"/>
    </td></tr>
    
    <c:if test="${message.hasTags and mailbox.features.tagging}">
        <tr>
            <td valign="middle" class="mo_taglist" colspan="2">
                <c:set var="tags" value="${zm:getTags(pageContext, message.tagIds)}"/>
                <c:forEach items="${tags}" var="tag">
                    <mo:img src="${tag.miniImage}" alt='${fn:escapeXml(tag.name)}'/>
                    <span>${fn:escapeXml(tag.name)}</span>
                </c:forEach>
            </td>
        </tr>
    </c:if>
    <c:if test="${not hideops}">
        <c:if test="${showInviteReply}">
            <tr>
                <td colspan="2">
                
                    <table cellspacing="0" cellpadding="0" border="0" align="center">
                        <tr>
							<td><mo:img src="common/ImgCheck.gif" alt="check"/></td>                        
                            <td class="Padding">
                                <a <c:if test="${not isPart}">id="OPACCEPT"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=accept" class="Action">
                                    <span><fmt:message key="replyAccept"/></span>
                                </a> &nbsp;
                            </td>
							<td><mo:img src="common/ImgQuestionMark.gif" alt="tentative"/></td>
                            <td class="Padding">
                                <a <c:if test="${not isPart}">id="OPTENT"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=tentative" class="Action">
                                    <span><fmt:message key="replyTentative"/></span>
                                </a> &nbsp;
                            </td>
                            <td><mo:img src="common/ImgCancel.gif" alt="cancel"/></td>
                            <td class="Padding">
                                <a <c:if test="${not isPart}">id="OPDECLINE"</c:if> href="${fn:escapeXml(composeUrl)}&amp;op=decline" class="Action">
                                    <span><fmt:message key="replyDecline"/></span>
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </c:if>
    </c:if>
    <c:if test="${not empty externalImageUrl and (message.externalImageCount gt 0)}">
        <tr>
            <td colspan="2">
                <div class='zo_dispimages'>
                    <fmt:message key="externalImages"/>
                    &nbsp;<a id="DISPEXTIMG" href="${fn:escapeXml(externalImageUrl)}"><fmt:message key="displayExternalImages"/></a>
                </div>
            </td>
        </tr>
    </c:if>
    <tr>
        <td width="100%" id="iframeBody${counter}" class="zo_mv_body" valign='top' colspan="2">
            <mo:body message="${message}" body="${body}" theBody="${theBody}" mailbox="${mailbox}" counter="${counter}"/>
            <c:set var="bodies" value="${zm:getAdditionalBodies(body,message)}"/>
            <c:if test="${not empty bodies}">
                <c:forEach var="addbody" items="${bodies}" varStatus="bstatus">
                    <mo:body message="${message}" body="${addbody}" mailbox="${mailbox}"
                             theBody="${zm:getPartHtmlContent(addbody, message)}" counter="${counter}X${bstatus.count}"/>
                </c:forEach>
            </c:if>
        </td>
    </tr>

    <c:if test="${not empty message.attachments}">
        <tr><td colspan="2"><hr size="1"/><a name="attachments${message.partName}"></a></td></tr>
        <tr>
            <td colspan="2">
                <mo:attachments mailbox="${mailbox}" message="${message}" composeUrl="${composeUrl}"/>
            </td>
        </tr>
    </c:if>

    <c:if test="${not empty param.debug}">
        <tr><td colspan="2">
            <pre>${fn:escapeXml(message)}</pre>
        </td></tr>
    </c:if>
</table>
