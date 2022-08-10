<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="counter" rtexprvalue="true" required="false" %>
<%@ attribute name="externalImageUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="timezone" rtexprvalue="true" required="false" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%--compute body up front, so attachments refereneced in multipart/related don't show up --%>
<fmt:setBundle basename="/messages/I18nMsg" var="i18n"/>

<c:set var="body" value="${message.body}"/>

<c:set var="theBody">
    <c:if test="${body.isTextHtml or body.isTextPlain}">
        <c:catch>
          ${zm:getPartHtmlContent(body, message)}
        </c:catch>
    </c:if>
</c:set>
<fmt:message var="unknownSender" key="unknownSender"/>

<c:set var="isPart" value="${!empty message.partName}"/>

<c:if test="${empty requestScope.dateFormat}">
	<c:set var="dateFormat" scope="request" value="${true}"/>
	<script type="text/javascript">
	<!--
		var bundle = {
			days: ["<fmt:message key='weekdaySunMedium' bundle='${i18n}'/>","<fmt:message key='weekdayMonMedium' bundle='${i18n}'/>","<fmt:message key='weekdayTueMedium' bundle='${i18n}'/>","<fmt:message key='weekdayWedMedium' bundle='${i18n}'/>","<fmt:message key='weekdayThuMedium' bundle='${i18n}'/>","<fmt:message key='weekdayFriMedium' bundle='${i18n}'/>","<fmt:message key='weekdaySatMedium' bundle='${i18n}'/>"],
			months: ["<fmt:message key='monthJanMedium' bundle='${i18n}'/>","<fmt:message key='monthFebMedium' bundle='${i18n}'/>","<fmt:message key='monthMarMedium' bundle='${i18n}'/>","<fmt:message key='monthAprMedium' bundle='${i18n}'/>","<fmt:message key='monthMayMedium' bundle='${i18n}'/>","<fmt:message key='monthJunMedium' bundle='${i18n}'/>","<fmt:message key='monthJulMedium' bundle='${i18n}'/>","<fmt:message key='monthAugMedium' bundle='${i18n}'/>","<fmt:message key='monthSepMedium' bundle='${i18n}'/>","<fmt:message key='monthOctMedium' bundle='${i18n}'/>","<fmt:message key='monthNovMedium' bundle='${i18n}'/>","<fmt:message key='monthDecMedium' bundle='${i18n}'/>"]
		};

		function pad(number, length) {
			var str=""+number;
			var pad=[];
			for (var i=0, cnt=length-str.length; i<cnt; i++) {
				pad[i]="0";
			}
			return pad.join("")+str;
		}
		function escape(string) {
			return ["'", string, "'"].join("");
		}
		function insert(str, value, replacement) {
			var _str=""+str;
			if (value&&_str.indexOf(value)==-1) return _str;
			var out="";
			var escaped=false;
			for (var i=0;i<_str.length;i++) {
				var c=_str.substr(i,1);
				if (c=="'") {
					escaped=!escaped;
				}
				else if (!escaped) {
					var tok=_str.substr(i,value.length);
					if (tok==value) {
						out+=escape(replacement);
						i+=value.length-1;
						continue;
					}
				}
				out+=c;
			}
			return out;
		}
    //-->
	</script>
</c:if>

<table width="100%" cellpadding="0" cellspacing="0" class="Msg" style="padding:10px;">
    <tr>
        <td  colspan="2">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEEEEE;" >
                <tr>
                    <td align="left">
                        <table width="100%" align="left" cellpadding="2" cellspacing="0" border="0">
                            <tr>
                                <td class='MsgHdrName'>
                                    <fmt:message key="from"/>
                                    :
                                </td>
                                <td class='MsgHdrValue'>
                                    <c:out value="${message.displayFrom}" default="${unknownSender}"/>
                                </td>
                            </tr>
                            <c:set var="sender" value="${message.displaySender}"/>
                            <c:if test="${not empty sender}">
                                 <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="sender"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>
                                        <c:out
                                                value="${sender}"/>
                                    </td>
                                </tr>
                            </c:if>
                            <c:if test="${empty message.subject}">
                                <fmt:message var="noSubject" key="noSubject"/>
                            </c:if>
                            <tr>
                                <td class='MsgHdrName'>
                                    <fmt:message key="subject"/>
                                    :
                                </td>
                                <td
                                        class='MsgHdrValue'>${fn:escapeXml(empty message.subject ? noSubject : message.subject)}</td>
                            </tr>
                            <c:set var="to" value="${message.displayTo}"/>
                            <c:if test="${not empty to}">
                                <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="to"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>
                                        <c:out
                                                value="${to}"/>
                                    </td>
                                </tr>
                            </c:if>
                            <c:set var="cc" value="${message.displayCc}"/>
                            <c:if test="${not empty cc}">
                                <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="cc"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>
                                        <c:out
                                                value="${cc}"/>
                                    </td>
                                </tr>
                            </c:if>
                            <c:set var="bcc" value="${message.displayBcc}"/>
                            <c:if test="${not empty bcc}">
                                <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="bcc"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>
                                        <c:out
                                                value="${bcc}"/>
                                    </td>
                                </tr>
                            </c:if>
                            <c:set var="replyto" value="${message.displayReplyTo}"/>
                            <c:if test="${not empty replyto}">
                                <tr>
                                    <td class='MsgHdrName'>
                                        <fmt:message key="replyTo"/>
                                        :
                                    </td>
                                    <td class='MsgHdrValue'>
                                        <c:out
                                                value="${replyto}"/>
                                    </td>
                                </tr>
                            </c:if>
                        </table>
                    </td>
                    <td valign='top'>
                        <table width="100%" cellpadding="2" cellspacing="0" border="0">
                            <tr>
                                <td nowrap align='right' class='MsgHdrSent'>
                                    <fmt:message var="dateFmt" key="formatDateSent"/>
									<span id="messageDisplayTime_${message.id}"><fmt:formatDate timeZone="${not empty timezone ? timezone : mailbox.prefs.timeZone}" pattern="${dateFmt}" value="${message.sentDate}"/></span>
                                </td>
                            </tr>
                            <c:if test="${message.hasTags or message.isFlagged}">
                                <tr>
                                    <td nowrap align='right' class='Tags'>
                                        <c:if test="${mailbox.features.tagging}">
                                            <c:set var="tags" value="${zm:getTags(pageContext, message.tagIds)}"/>
                                            <c:forEach items="${tags}" var="tag">
                                                <app:img src="${tag.miniImage}" alt='${fn:escapeXml(tag.name)}'/>
                                                <span>${fn:escapeXml(tag.name)}</span>
                                            </c:forEach>
                                        </c:if>
                                        <c:if test="${mailbox.features.flagging and message.isFlagged}">
                                            <app:img altkey='ALT_FLAGGED' src="startup/ImgFlagRed.png"/>
                                        </c:if>
                                    </td>
                                </tr>
                            </c:if>
                            <c:if test="${not empty message.attachments}">
                                <tr>
                                    <td nowrap align="right" class='MsgHdrAttAnchor'>
                                            <app:img src="startup/ImgAttachment.png" altkey="ALT_ATTACHMENT"/>
                                            <fmt:message key="attachmentCount">
                                                <fmt:param value="${message.numberOfAttachments}"/>
                                            </fmt:message>
                                    </td>
                                </tr>
                            </c:if>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <c:if test="${not empty externalImageUrl and (message.externalImageCount gt 0)}">
        <tr>
            <td class='DisplayImages' colspan="2">
                <fmt:message key="externalImages"/>
                &nbsp;<a id="DISPEXTIMG" href="${fn:escapeXml(externalImageUrl)}">
                <fmt:message key="displayExternalImages"/>
            </a>
            </td>
        </tr>
    </c:if>
    <tr>
        <td id="iframeBody${counter}" style="padding:5px; font-family: monospace" valign='top' colspan="${needExtraCol ? 1 : 2}">
            <app:body message="${message}" body="${body}" theBody="${body.isTextHtml ? zm:stripHtmlComments(theBody) : theBody}" mailbox="${mailbox}" counter="${counter}" isPrintView="${true}"/>
            <c:set var="bodies" value="${zm:getAdditionalBodies(body,message)}"/>
            <c:if test="${not empty bodies}">
                <br/>
                <c:forEach var="addbody" items="${bodies}" varStatus="bstatus">
                    <c:set var="html" value="${zm:getPartHtmlContent(addbody, message)}"/>
                    <c:set var="messageBody" value="${addbody.isTextHtml ? zm:stripHtmlComments(html) : html}"/>
                    <app:body message="${message}" body="${addbody}" mailbox="${mailbox}"
                              theBody="${messageBody}" counter="${counter}X${bstatus.count}"  isPrintView="${true}"/>
                </c:forEach>
            </c:if>
            <c:if test="${not empty message.attachments}">
                <hr/>
                <a name="attachments${message.partName}"></a>
                <app:attachments mailbox="${mailbox}" message="${message}" print="${true}" composeUrl="${composeUrl}"/>
            </c:if>
            <hr>
        </td>
    </tr>
</table>

