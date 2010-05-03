<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="counter" rtexprvalue="true" required="false" %>
<%@ attribute name="externalImageUrl" rtexprvalue="true" required="false" type="java.lang.String" %>
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

		function formatDate(UTCTimeString, format) {
			if (UTCTimeString && format) {
				var dateStr = UTCTimeString.replace(/[^\d]/g,"");
				if (dateStr && dateStr.length == 16) {
					var date = new Date();
					date.setUTCFullYear(dateStr.substr(0,4));
					date.setUTCMonth(parseInt(dateStr.substr(4,2), 10)-1);
					date.setUTCDate(parseInt(dateStr.substr(6,2), 10));
					date.setUTCHours(parseInt(dateStr.substr(9,2), 10));
					date.setUTCMinutes(parseInt(dateStr.substr(11,2), 10));
					date.setUTCSeconds(parseInt(dateStr.substr(13,2), 10));
			
					var d = {
						yyyy: date.getFullYear(),
						yy: (""+date.getFullYear()).substr(2,2),
						EEE: days[date.getDay()],
						MMM: months[date.getMonth()],
						M: date.getMonth()+1,
						d: date.getDate(),
						K: date.getHours() % 12,
						H: date.getHours(),
						a: (date.getHours() < 12) ? "AM" : "PM",
						m: date.getMinutes(),
						s: date.getSeconds(),
						S: date.getMilliseconds()
					};
					d.h = d.K==0?12:d.K;
					d.k = d.H==0?24:d.H;

					var out = ""+format;
						out = insert(out, "EEE", d.EEE);
						out = insert(out, "MMM", d.MMM);
						out = insert(out, "MM", pad(d.M),2);
						out = insert(out, "M", d.M);
						out = insert(out, "dd", pad(d.d,2));
						out = insert(out, "d", d.d);
						out = insert(out, "yyyy", d.yyyy);
						out = insert(out, "yy", d.yy);
						out = insert(out, "hh", pad(d.h,2));
						out = insert(out, "h", d.h);
						out = insert(out, "kk", pad(d.k,2));
						out = insert(out, "k", d.k);
						out = insert(out, "HH", pad(d.H,2));
						out = insert(out, "H", d.H);
						out = insert(out, "KK", pad(d.K,2));
						out = insert(out, "K", d.K);
						out = insert(out, "mm", pad(d.m,2));pageScope
						out = insert(out, "m", d.m,2);
						out = insert(out, "ss", pad(d.s,2));
						out = insert(out, "s", d.s);
						out = insert(out, "SSS", pad(d.S,3));
						out = insert(out, "SS", pad(d.S,2));
						out = insert(out, "S", d.S);
						out = insert(out, "a", d.a);
						out = out.replace(/'/g, '');
					return out;
				}
			}
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
									<span id="messageDisplayTime_${message.id}"><fmt:formatDate timeZone="${mailbox.prefs.timeZone}" pattern="${dateFmt}" value="${message.sentDate}"/></span>
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
                                            <app:img altkey='ALT_FLAGGED' src="startup/ImgFlagRed.gif"/>
                                        </c:if>
                                    </td>
                                </tr>
                            </c:if>
                            <c:if test="${not empty message.attachments}">
                                <tr>
                                    <td nowrap align="right" class='MsgHdrAttAnchor'>
                                            <app:img src="startup/ImgAttachment.gif" altkey="ALT_ATTACHMENT"/>
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
        <td id="iframeBody${counter}" style="padding:5px;" valign='top' colspan="${needExtraCol ? 1 : 2}">
            <app:body message="${message}" body="${body}" theBody="${theBody}" mailbox="${mailbox}" counter="${counter}" isPrintView="${true}"/>
            <c:set var="bodies" value="${zm:getAdditionalBodies(body,message)}"/>
            <c:if test="${not empty bodies}">
                <br/>
                <c:forEach var="addbody" items="${bodies}" varStatus="bstatus">
                    <app:body message="${message}" body="${addbody}" mailbox="${mailbox}"
                              theBody="${zm:getPartHtmlContent(addbody, message)}" counter="${counter}X${bstatus.count}"  isPrintView="${true}"/>
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
<script type="text/javascript">
<!--
	var displayContainer = document.getElementById("messageDisplayTime_${message.id}");
	if (displayContainer) {
		var newContent = formatDate('<fmt:formatDate timeZone="GMT" pattern="yyyyMMdd'T'HHmmss'Z'" value="${message.sentDate}"/>', "${dateFmt}");
		if (newContent) displayContainer.innerHTML = newContent;
	}
//-->
</script>
