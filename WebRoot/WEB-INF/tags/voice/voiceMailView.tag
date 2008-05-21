<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
	<zm:getMailbox var="mailbox"/>
	<zm:checkVoiceStatus var="voiceStatus"/>
	<c:choose>
	<c:when test="${not empty mailbox.prefs.locale}">
		<fmt:setLocale value='${mailbox.prefs.locale}' scope='request' />
	</c:when>
	<c:otherwise>
		<fmt:setLocale value='${pageContext.request.locale}' scope='request' />
	</c:otherwise>
	</c:choose>
	<fmt:setBundle basename="/messages/ZhMsg" scope="request"/>

	<c:set var="message" value="${zm:deserializeVoiceMailItemHit(param.voiceId, param.phone)}"/>

	<c:set var="heardChanged" value="${zm:actionSet(param, 'actionMarkHeard') or zm:actionSet(param, 'actionMarkUnheard')}"/>
	<c:choose>
		<c:when test="${heardChanged}">
			<c:set var="autostart" value="false"/>
			<c:set var="heard" value="${zm:actionSet(param, 'actionMarkHeard')}"/>
		</c:when>
		<c:otherwise>
			<zm:markVoiceMailHeard var="ignored" id="${message.id}" phone="${param.phone}" heard="true"/>
			<c:set var="autostart" value="true"/>
			<c:set var="heard" value="${true}"/>
		</c:otherwise>
	</c:choose>
	<zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
	<fmt:message key="voiceMailMessage" var="title"/>

</app:handleError>

<app:view editmode="${voiceStatus eq 'false' ? 'true' : ''}" mailbox="${mailbox}" title="${title}" selected='voice' voice="true" folders="false" tags="false" searches="false" context="${context}" keys="true">
	<c:url var="currentUrl" value="/h/search">
		<c:param name="st" value="voicemail"/>
		<c:param name="sq" value="phone:${param.phone} in:\"Voicemail Inbox\""/>
		<c:param name="action" value="listen"/>
	</c:url>
	<form action="${fn:escapeXml(currentUrl)}" method="post">
		<table width="100%" cellpadding="0" cellspacing="0">
			<tr>
				<td class='TbTop'>
					<app:voiceMailViewToolbar context="${context}" cursor="${cursor}" keys="true" heard="${heard}" isPrivate="${message.isPrivate}" saveAsUrl="/service/extension/velodrome/voice/~/voicemail?phone=${param.phone}&id=${message.id}&disp=a"/>
				</td>
			</tr>
			<tr>
				<td class='ZhAppContent'>
					<table class="ZhVoiceMailContent" cellspacing="0" cellpadding="0">
						<tr>
							<td class="ZhVoiceMailTableHeader"><fmt:message key="voiceMailMessage"/></td>
						</tr>
						<tr>
							<td class="ZOptionsSectionMain ZOptionsSectionMainLinks" style="padding:1em;">
								<table cellpadding="10" cellspacing="0"><tr>
									<td class="ZhVoiceMailCellLeft">
										<div class="ZhVoiceMailData"><span class="ZhVoiceMailLabel"><fmt:message key="from"/>: </span> ${message.displayCaller}</div>
										<div class="ZhVoiceMailData"><span class="ZhVoiceMailLabel"><fmt:message key="date"/>: </span> ${fn:escapeXml(zm:displayMsgDate(pageContext, message.voiceMailItemHit.date))}</div>
										<div class="ZhVoiceMailData"><span class="ZhVoiceMailLabel"><fmt:message key="duration"/>: </span> ${fn:escapeXml(zm:displayDuration(pageContext, message.voiceMailItemHit.duration))}</div>
									</td>
									<td class="ZhVoiceMailCellRight">
										<c:set var="path">/service/extension/velodrome/voice/~/voicemail?phone=${param.phone}&id=${message.id}</c:set>
										<object CLASSID="CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6" type="audio/wav">
											<param name="url" value="${path}">
											<param name="autostart" value="${autostart}">
											<param name="controller" value="true">
											<embed src="${path}" controller="true" autostart="${autostart}" type="audio/wav" />
										</object>
									</td>
								</tr></table>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
		<input type="hidden" name="voiceId" value="${param.voiceId}"/>
		<input type="hidden" name="doVoiceMailViewAction" value="1"/>
		<input type="hidden" name="phone" value="${param.phone}"/>
		<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
	</form>

	<SCRIPT TYPE="text/javascript">
		<!--
		var zclick = function(id) { var e2 = document.getElementById(id); if (e2) e2.click(); }
		var zdownload = function() { var e = document.getElementById("IOPDOWNLOAD"); if (e) document.location = e.href; }
		var zdelete = function() { zclick("SOPDELETE"); }
		var zreply = function() { zclick("SOPREPLYBYEMAIL"); }
		var zforward = function() { zclick("SOPFORWARDBYEMAIL"); }
		var zheard = function() { zclick("SOPHEARD"); }
		var zunheard = function() { zclick("SOPUNHEARD"); }
		//-->
	</SCRIPT>

	<app:keyboard cache="voice.voiceMailView" globals="true" mailbox="${mailbox}" tags="false" folders="false">
		<zm:bindKey message="voicemail.Download" func="zdownload"/>
		<zm:bindKey message="voicemail.Delete" func="zdelete"/>
		<zm:bindKey message="voicemail.Reply" func="zreply"/>
		<zm:bindKey message="voicemail.Forward" func="zforward"/>
		<zm:bindKey message="voicemail.MarkHeard" func="zheard"/>
		<zm:bindKey message="voicemail.MarkUnheard" func="zunheard"/>
		<zm:bindKey message="mail.Close" id="CLOSE_ITEM"/>
	</app:keyboard>
</app:view>
