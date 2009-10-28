<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:set var="voiceselected" value="${empty param.voiceselected ? 'general' : param.voiceselected}"/>

<%
String ua = request.getHeader( "User-Agent" );
boolean IE = ( ua != null && ua.indexOf( "MSIE" ) != -1 );
%>

<app:handleError>
	<zm:checkVoiceStatus var="voiceStatus"/>
</app:handleError>
<c:if test="${voiceStatus ne 'false'}">

<table width="100%" cellspacing="10" cellpadding="10"><tr><td>

	<%----------------- General Section --------------%>
	
	<a name="${voiceselected}"></a>
	<table width="100%" cellspacing="0" cellpadding="0" border="0" class="ZOptionsSectionTable">
		<tr class="ZOptionsHeaderRow">
		        <td class="ImgPrefsHeader_L"></td>
			<td class="ZOptionsHeader ImgPrefsHeader">
			<c:choose>
			    <c:when test="${voiceselected=='general'}">
				<fmt:message key="optionsGeneral"/>
			    </c:when>
			    <c:when test="${voiceselected=='notification'}">
				<fmt:message key="optionsVoiceNotifications"/>
			    </c:when>
			    <c:when test="${voiceselected=='forwarding'}">
				<fmt:message key="optionsCallForwarding"/>
			    </c:when>
			    <c:when test="${voiceselected=='screening'}">
				<fmt:message key="optionsCallRejection"/>
			    </c:when>
			</c:choose>
			</td>
			<td class="ImgPrefsHeader_R"></td>
		</tr>
	</table>

	<table class="ZOptionsSectionMain ZhOptVoice" border="0" cellspacing="10" width="100%">
		<%------------------- List of numbers ------------------%>
		<tr>
			<td colspan="2">
				<table border="0" cellpadding="0" cellspacing="0">
					<tr>
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						<td>
							<div width="500px"><fmt:message key="voiceOptInstructions"/></div>
							<br>
							<table class="List" border="0" cellpadding="0" cellspacing="0" width="500px" style="border:0px none">
								<tr><th><fmt:message key="number"/></th></tr>
								<c:set var="firstAccount" value="true"/>
								<zm:forEachPhoneAccount var="account">
									<c:set var="selected" value="${(empty param.phone && firstAccount) || (param.phone == account.phone.name)}"/>
									<c:set var="firstAccount" value="false"/>
									<c:url var="phoneUrl" value="/h/options?selected=voice">
										<c:param name="phone" value="${account.phone.name}"/>
										<c:param name="voiceselected" value="${voiceselected}"/>
									</c:url>
									<tr <c:if test="${selected}">class='RowSelected'</c:if> >
										<td><a href="${phoneUrl}">${account.phone.display}</a></td>
									</tr>
								</zm:forEachPhoneAccount>
							</table>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		
		<tr>
			<td colspan="2">
				<hr/>
			</td>
		</tr>

	<%--
	Stupid: I had to do a second loop that only acts on the selected account......
	--%>
	<c:set var="firstAccount" value="true"/>
	<zm:forEachPhoneAccount var="account">
		<c:set var="selected" value="${(empty param.phone and firstAccount) or (param.phone eq account.phone.name)}"/>
		<c:set var="firstAccount" value="false"/>
		<c:if test="${selected}">
			<app:handleError>
				<app:getCallFeatures account="${account}" var="features"/>
				<c:set var="phone" value="${account.phone.name}"/>
			</app:handleError>
		</c:if>
	</zm:forEachPhoneAccount>
	
	<input type="hidden" name="phone" value="${phone}">

<c:choose>
<c:when test="${voiceselected=='general'}">
	
			<%------------------- Number of rings ------------------%>

			<tr>
				<td class="SectionHeader">
					<nobr>
						<fmt:message key="optionsRings"/>
					</nobr>
				</td>
			</tr>

			<tr>
				<td class="ZOptionsTableLabel">
					<label for="numberOfRings"><fmt:message key="optionsRingsSend"/></label>
				</td>
				<td>
					<select id="numberOfRings" name="numberOfRings">
						<c:set var="numberOfRings" value="${features.callForwardingNoAnswer.numberOfRings}" />
						<c:forEach var="rings" begin="2" end="9" step="1">
							<option <c:if test="${numberOfRings eq rings}"> selected</c:if> >${rings}</option>
						</c:forEach>
					</select>
					&nbsp;<fmt:message key="optionsRingsSendSuffix"/>
				</td>
			</tr>
			
			<tr><td colspan="2"><hr/></td></tr>
			
			<%------------------- Language --------------------%>
			<jsp:useBean id="languages" class="java.util.HashMap" scope="page">
			<c:set target="${languages}" property="ENGLISH" value="English"/>
			<c:set target="${languages}" property="SPANISH" value="Spanish"/>
			</jsp:useBean>
						
			<c:set var="answeringLocale" value="${features.voiceMailPrefs.answeringLocale}"/>
			<c:set var="userLocale" value="${features.voiceMailPrefs.userLocale}"/>
			
			<tr>
				<td class="SectionHeader">
					<nobr>
						<fmt:message key="optionsLanguage"/>
					</nobr>
				</td>
			</tr>

			<tr>
				<td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="optionsLanguageIncoming"/></td>
				<td>
					<table border="0" cellpadding="0" cellspacing="0">
						<tr>
							<td colspan="2">
								<fmt:message key="optionsLanguageIncomingPrompt"/>
							</td>
						</tr>
						<c:forEach var="language" items="${languages}">
							<c:set var="id" value="voiceIncoming_${language.key}"/>
							<tr>
							<% if (IE) { %>
								<td>
									<input id="${id}" type="radio" name="answeringLocale" value="${language.key}" <c:if test="${language.key == answeringLocale}">checked</c:if>/>
									<label for="${id}"><fmt:message key="language_${language.key}"/></label>
								</td>
							<% } else { %>
								<td class="ZhOptVoiceCBCell">
									<input id="${id}" type="radio" name="answeringLocale" value="${language.key}" <c:if test="${language.key == answeringLocale}">checked</c:if>/>
								</td>
								<td>
									<label for="${id}"><fmt:message key="language_${language.key}"/></label>
								</td>
							<% } %>
							</tr>
						</c:forEach>
					</table>
				</td>
			</tr>
			
			<tr>
				<td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="optionsLanguageChecking"/></td>
				<td>
					<table border="0" cellpadding="0" cellspacing="0">
						<tr>
							<td colspan="2">
								<fmt:message key="optionsLanguageCheckingPrompt"/>
							</td>
						</tr>
						<c:forEach var="language" items="${languages}">
							<c:set var="id" value="voiceChecking_${language.key}"/>
							<tr>
							<% if (IE) { %>
								<td>
									<input id="${id}" type="radio" name="userLocale" value="${language.key}" <c:if test="${language.key == userLocale}">checked</c:if>/>
									<label for="${id}"><fmt:message key="language_${language.key}"/></label>
								</td>
							<% } else { %>
								<td class="ZhOptVoiceCBCell">
									<input id="${id}" type="radio" name="userLocale" value="${language.key}" <c:if test="${language.key == userLocale}">checked</c:if>/>
								</td>
								<td>
									<label for="${id}"><fmt:message key="language_${language.key}"/></label>
								</td>
							<% } %>
							</tr>
						</c:forEach>
					</table>
				</td>
			</tr>
			
			<tr><td colspan="2"><hr/></td></tr>
			
			<%------------------- Prompts -------------------%>
			<c:set var="autoPlayNewMsgs" value="${features.voiceMailPrefs.autoPlayNewMsgs}"/>						
			
			<tr>
				<td class="SectionHeader">
					<nobr>
						<fmt:message key="optionsPromptsMessagePlayback"/>
					</nobr>
				</td>
			</tr>
			
			<tr>
				<td class="ZOptionsTableLabel"><fmt:message key="optionsPromptsPlayback"/></td>
				<td>
					<table border="0" cellpadding="0" cellspacing="0">
						<tr>
							<td class="ZhOptVoiceCBCell">
								<input id="autoPlayNewMsgs" type="checkbox" name="autoPlayNewMsgs" <c:if test="${autoPlayNewMsgs}">checked</c:if> />
							</td>
							<td>
								<label for="autoPlayNewMsgs"><fmt:message key="optionsPromptsAutoplay"/></label>
							</td>
						</tr>
					</table>
				</td>
			</tr>
			
			<tr><td colspan="2"><hr/></td></tr>
			
			<c:set var="promptLevel" value="${features.voiceMailPrefs.promptLevel}"/>
			<c:set var="playDateAndTimeInMsgEnv" value="${features.voiceMailPrefs.playDateAndTimeInMsgEnv}"/>
			
			<tr>
				<td class="SectionHeader">
					<nobr>
						<fmt:message key="optionsVoicemailPrompts"/>
					</nobr>
				</td>
			</tr>
					
			<tr>
				<td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="optionsPrompts"/></td>
				<td>
					<table border="0" cellpadding="0" cellspacing="0">
					
						<tr>
							<td colspan="2"><fmt:message key="optionsPromptsLength"/></td>
						</tr>
						<tr>
							<td/>
							<td>
								<table border="0" cellpadding="0" cellspacing="0">
									<tr>
										<td class="ZhOptVoiceCBCell">
											<input id="promptLevelShort" type="radio" name="promptLevel" value="RAPID" <c:if test="${promptLevel == 'RAPID'}">checked</c:if>/>
										</td>
										<td>
											<label for="promptLevelShort"><fmt:message key="optionsPromptsLengthShort"/></label>
										</td>
									</tr>
									<tr>
										<td class="ZhOptVoiceCBCell">
											<input id="promptLevelMedium" type="radio" name="promptLevel" value="STANDARD" <c:if test="${promptLevel == 'STANDARD'}">checked</c:if>/>
										</td>
										<td>
											<label for="promptLevelMedium"><fmt:message key="optionsPromptsLengthMedium"/></label>
										</td>
									</tr>
									<tr>
										<td class="ZhOptVoiceCBCell">
											<input id="promptLevelLong" type="radio" name="promptLevel" value="EXTENDED" <c:if test="${promptLevel == 'EXTENDED'}">checked</c:if>/>
										</td>
										<td>
											<label for="promptLevelLong"><fmt:message key="optionsPromptsLengthLong"/></label>
										</td>
									</tr>
								</table>
							</td>
						</tr>
						<tr><td>&nbsp;</td></tr>
						<tr>
							<td class="ZhOptVoiceCBCell">
								<input id="playDateAndTimeInNewMsgEnv" type="checkbox" name="playDateAndTimeInMsgEnv" <c:if test="${playDateAndTimeInMsgEnv}">checked</c:if>/>
							</td>
							<td>
								<label for="playDateAndTimeInNewMsgEnv"><fmt:message key="optionsPromptsAnnounce"/></label>
							</td>
						</tr>
					</table>
				</td>
			</tr>
			
			<tr><td colspan="2"><hr/></td></tr>
			
			<%------------------- Count per page ------------------%>
			<tr>
				<td class="SectionHeader">
					<nobr>
						<fmt:message key="optionsVoicemailDisplayPerPage"/>
					</nobr>
				</td>
			</tr>
			<tr>
				<td class="ZOptionsTableLabel">
					<label for="numberPerPage"><fmt:message key="optionsDisplay"/></label>
				</td>
				<td>
					<select id="numberPerPage" name="numberPerPage">
						<c:set var="numberPerPage" value="${mailbox.prefs.voiceItemsPerPage}"/>
						<option	<c:if test="${numberPerPage eq 10}"> selected</c:if> >10</option>
						<option <c:if test="${numberPerPage eq 25}"> selected</c:if> >25</option>
						<option <c:if test="${numberPerPage eq 50}"> selected</c:if> >50</option>
						<option <c:if test="${numberPerPage eq 100}"> selected</c:if> >100</option>
					</select>
					&nbsp;<fmt:message key="voiceMailsPerPage"/>
				</td>
			</tr>
			
			<tr><td colspan="2"><hr/></td></tr>
			
			<%------------------ Security ------------------------%>
			<c:set var="requirePinEntry" value="${!features.voiceMailPrefs.skipPinEntry}"/>

			<tr>
				<td class="SectionHeader">
					<nobr>
						<fmt:message key="optionsVoiceSecurity"/>
					</nobr>
				</td>
			</tr>

			<tr>
				<td class="ZOptionsTableLabel"><fmt:message key="optionsVoiceSecurityChPwd"/></td>
				<td><a href="<fmt:message key='optionsVoiceSecurityChPwdUrl'/>" target="_blank"><fmt:message key="optionsVoiceSecurityChPwdLink"/></a></td>
			</tr>
			
			<tr>
				<td class="ZOptionsTableLabel"><fmt:message key="optionsVoiceSecurityLogin"/></td>
				<td>
					<table border="0" cellpadding="0" cellspacing="0">
						<tr>
							<td class="ZhOptVoiceCBCell">
							    <input id="voicePwdRequire" type="checkbox" name="requirePinEntry" <c:if test="${requirePinEntry}">checked</c:if>/>
							</td>
							<td>
							    <label for="voicePwdRequire"><fmt:message key="optionsVoiceSecurityLoginRequire"/></label>
							</td>
					</table>	
				</td>
			</tr>			
	</table>
	
</c:when>
	
<c:when test="${voiceselected == 'calllog'}">
	<%------------------- Call log section ------------------%>
	<%-- Commented out for now ---
	<table width="100%" cellspacing="0" cellpadding="0" border="0" class="ZOptionsSectionTable">
		<tr class="ZOptionsHeaderRow">
		        <td class="ImgPrefsHeader_L"></td>
			<td class="ZOptionsHeader ImgPrefsHeader"><fmt:message key="optionsCallLog"/></td>
			<td class="ImgPrefsHeader_R"></td>
		</tr>
	</table>
	
	<table class="ZOptionsSectionMain ZhOptVoice" border="0" cellspacing="10" width="100%">
		<tr>
			<td class="ZOptionsTableLabel" style="vertical-align:top;">
				<label for="numberPerPage"><fmt:message key="optionsDisplay"/></label>
			</td>
			<td>
				<select id="numberPerPage" name="numberPerPage">
					<c:set var="numberPerPage" value="${mailbox.prefs.voiceItemsPerPage}"/>
					<option	<c:if test="${numberPerPage eq 10}"> selected</c:if> >10</option>
					<option <c:if test="${numberPerPage eq 25}"> selected</c:if> >25</option>
					<option <c:if test="${numberPerPage eq 50}"> selected</c:if> >50</option>
					<option <c:if test="${numberPerPage eq 100}"> selected</c:if> >100</option>
				</select>
				&nbsp;<fmt:message key="optionsCallLogPerPage"/>
			</td>
		</tr>
	</table>
	
	<br/>			
	--%>
</c:when>
	
	
	
<c:when test="${voiceselected=='notification'}">

	<%----------------- Notifications Section --------------%>
	<c:if test="${empty sessionScope.emailNotificationAddresses}">
		<zm:forEachPhoneAccount var="_account">
			<app:handleError>
				<app:getCallFeatures account="${_account}" var="accountFeatures"/>
				<c:forEach items="${accountFeatures.voiceMailPrefs.emailNotificationAddress}" var="address">
					<zm:listObject phone="${_account.phone.name}" var="emailNotificationAddresses" scope="session" map="${sessionScope.emailNotificationAddresses}" add="${address}"/>
				</c:forEach>
			</app:handleError>
		</zm:forEachPhoneAccount>
	</c:if>

	<table class="ZOptionsSectionMain ZhOptVoice" border="0" cellspacing="10" width="100%">
		<tr>
			<td class="ZOptionsTableLabel" style="vertical-align:top;padding-top:7px"><fmt:message key="optionsVoiceNotificationsEmail"/></td>
			<td>
				<table border="0" cellpadding="0" cellspacing="0">
					<tr>
						<td>
							<fmt:message key="optionsVoiceNotificationsActive"/>
						</td>
						
						<td style="padding: 0px 10px">
							<input id="emailNotificationAddAddress" type="text" name="emailNotificationAddAddress"/>
						</td>
						
						<td>
							<input type="submit" name="actionVoiceAddNotification" value="<fmt:message key='add'/>"/>
						</td>
					</tr>
						
					<tr><td>&nbsp;</td></tr>

					<c:if test="${!empty sessionScope.emailNotificationAddresses && !empty sessionScope.emailNotificationAddresses[phone]}">
					<tr>
						<td colspan="2" style="vertical-align:top;" align="right">
							<table class="ZmBufferList List" border="0" cellpadding="0" cellspacing="0" width="400px">
								<tr><th colspan="2"><fmt:message key="optionsVoiceNotificationsAddresses"/></th></tr>
								<c:set var="i" value="0"/>
								<c:forEach items="${sessionScope.emailNotificationAddresses[phone]}" var="notificationAddress">
									<c:if test="${!empty notificationAddress}">
									<tr>
										<td style="width:50%">${notificationAddress}</td>
										<td style="width:50%;text-align:left">
										    <label for="actionVoiceRemoveNotification_${i}" class="FakeLink"><fmt:message key='remove'/></label>
										</td>
									</tr>
									<c:set var="i" value="${i+1}"/>
									</c:if>
								</c:forEach>
							</table>
						</td>
						<td style="vertical-align:top">
							<input type="submit" name="actionVoiceClearNotification" value="<fmt:message key='removeAll'/>"/>
						</td>
					</tr>
					<tr>
						<td colspan="3">
							<c:set var="i" value="0"/>
							<c:forEach items="${sessionScope.emailNotificationAddresses[phone]}" var="notificationAddress">
								<c:if test="${!empty notificationAddress}">
									<input type="submit" class="HiddenButton" id="actionVoiceRemoveNotification_${i}" name="actionVoiceRemoveNotification" value="${notificationAddress}"/>
									<c:set var="i" value="${i+1}"/>
								</c:if>
							</c:forEach>
						</td>
					</tr>

					</c:if>
				</table>
			</td>
		</tr>
	</table>
	
</c:when>


<c:when test="${voiceselected=='forwarding'}">
	
	<%----------------- Call Forwarding Section --------------%>

	<c:if test="${empty sessionScope.selectiveCallForwardingFrom}">
		<zm:forEachPhoneAccount var="_account">
			<app:handleError>
				<app:getCallFeatures account="${_account}" var="accountFeatures"/>
				<c:forEach items="${accountFeatures.selectiveCallForwarding.forwardFrom}" var="number">
					<zm:listObject phone="${_account.phone.name}" var="selectiveCallForwardingFrom" scope="session" map="${sessionScope.selectiveCallForwardingFrom}" add="${number}"/>
				</c:forEach>
			</app:handleError>
		</zm:forEachPhoneAccount>
	</c:if>

	<c:if test="${empty sessionScope.callForwardingTo}">
		<zm:forEachPhoneAccount var="_account">
			<app:handleError>
				<app:getCallFeatures account="${_account}" var="accountFeatures"/>
				<zm:listObject phone="${_account.phone.name}" var="callForwardingTo" scope="session" map="${sessionScope.callForwardingTo}" add="${accountFeatures.callForwardingAll.forwardTo}"/>
			</app:handleError>
		</zm:forEachPhoneAccount>
	</c:if>
	
	<c:if test="${empty sessionScope.selectiveCallForwardingTo}">
		<zm:forEachPhoneAccount var="_account">
			<app:handleError>
				<app:getCallFeatures account="${_account}" var="accountFeatures"/>
				<zm:listObject phone="${_account.phone.name}" var="selectiveCallForwardingTo" scope="session" map="${sessionScope.selectiveCallForwardingTo}" add="${accountFeatures.selectiveCallForwarding.forwardTo}"/>
			</app:handleError>
		</zm:forEachPhoneAccount>
	</c:if>

	<script type="text/javascript">
		<!--
			var selectiveForwardCheckboxDependers = [];
			function selectiveForwardCheckboxChanged(value) {
				for (var i=0; i<selectiveForwardCheckboxDependers.length; i++) {
					var element = document.getElementById(selectiveForwardCheckboxDependers[i]);
					if (element)
						element.disabled = !value;
				}
			}
		//-->
	</script>
	
	<c:set var="selectiveCallForwardingActive" value="${(requestScope.selectiveCallForwardingActive != 'FALSE' && (features.selectiveCallForwarding.isActive && !empty features.selectiveCallForwarding.forwardFrom && !empty features.selectiveCallForwarding.forwardTo)) || (requestScope.selectiveCallForwardingActive == 'TRUE')}"/>
	<c:set var="canAddSelectiveForwarding" value="${empty sessionScope.selectiveCallForwardingFrom || empty sessionScope.selectiveCallForwardingFrom[phone] || fn:length(sessionScope.selectiveCallForwardingFrom[phone]) < 12}"/>
	<c:set var="displayAddSelectiveForwarding" value="${selectiveCallForwardingActive && !empty requestScope.addSelectiveForwarding && canAddSelectiveForwarding}"/>

	<table class="ZOptionsSectionMain ZhOptVoice" border="0" cellspacing="10" width="100%">
		<tr>
			<td class="ZOptionsTableLabel"><fmt:message key="optionsCallForwardingAll"/></td>
			<td>
				<table border="0" cellpadding="0" cellspacing="0">
					<tr>
						<td class="ZhOptVoiceCBCell">
							<input id="callForwardingActive" type="checkbox" name="callForwardingActive" value="TRUE" <c:if test="${(features.callForwardingAll.isActive || param.callForwardingActive) && requestScope.callForwardingActive!='FALSE'}">checked</c:if>/>
						</td>
						<td>
							<label for="callForwardingActive"><fmt:message key="optionsCallForwardingAllLabel"/></label>
						</td>
						
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						
						<td>
							<zm:listObject var="bogus" csep="forwardTo" map="${sessionScope.callForwardingTo}" phone="${phone}"/>
							<input type="text" name="callForwardingTo" value="${forwardTo}"/>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		
		<tr>
			<td class="ZOptionsTableLabel" style="vertical-align:top"><fmt:message key="optionsCallForwardingSelective"/></td>
			<td>
				<table border="0" cellpadding="0" cellspacing="0">
					<tr>
						<td class="ZhOptVoiceCBCell" style="vertical-align:top;">
							<input id="selectiveCallForwardingActive" type="checkbox" name="selectiveCallForwardingActive" value="TRUE"<c:if test="${selectiveCallForwardingActive}"> checked</c:if>/>
						</td>
						
						<td style="vertical-align:top;padding-top:3px">
							<label for="selectiveCallForwardingActive"><fmt:message key="optionsCallForwardingSelectiveLabel"/></label>
						</td>
						
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						
						<td style="vertical-align:top;">
						
						
							<table class="ZmPhoneBufferList List" border="0" cellpadding="0" cellspacing="0" width="300px">
								<tr><th colspan="2"><fmt:message key="numbers"/></th></tr>
								<c:if test="${!empty sessionScope.selectiveCallForwardingFrom && !empty sessionScope.selectiveCallForwardingFrom[phone]}">
								<c:set var="i" value="0"/>
								<c:forEach items="${sessionScope.selectiveCallForwardingFrom[phone]}" var="number">
									<c:if test="${!empty number}">
									<tr>
										<td style="width:50%">${number}</td>
										<td style="width:50%;text-align:left">
										    <label for="actionVoiceRemoveForwarding_${i}" class="FakeLink"><fmt:message key='remove'/></label>
										    
										</td>
									</tr>
									<c:set var="i" value="${i+1}"/>
									</c:if>
								</c:forEach>
								</c:if>
							</table>
						</td>

						<td style="vertical-align:top;padding-left:10px">
							<input type="submit" name="addSelectiveForwarding" id="addSelectiveForwarding" value="<fmt:message key='addToList'/>" <c:if test="${displayAddSelectiveForwarding || !canAddSelectiveForwarding}">disabled</c:if>/>
							<script type="text/javascript">
							<!--
								selectiveForwardCheckboxDependers.push("addSelectiveForwarding");
							//-->
							</script>
						</td>
					</tr>

					<tr>
						<td colspan="3">
							<c:set var="i" value="0"/>
							<c:forEach items="${sessionScope.selectiveCallForwardingFrom[phone]}" var="number">
								<c:if test="${!empty number}">
									<input type="submit" class="HiddenButton" id="actionVoiceRemoveForwarding_${i}" name="actionVoiceRemoveSelectiveForwarding" value="${number}"/>
									<script type="text/javascript">
									<!--
									        selectiveForwardCheckboxDependers.push("actionVoiceRemoveForwarding_${i}");
									//-->
									</script>
									<c:set var="i" value="${i+1}"/>
								</c:if>
							</c:forEach>
						</td>
					</tr>
					
					<c:if test="${displayAddSelectiveForwarding}">
					<tr><td>&nbsp;</td></tr>

					<tr>
						<td colspan="2" style="text-align:right">
							<label for="addForwardingNumber"><fmt:message key="optionsCallForwardingSelectiveAdd"/></label>
						</td>
						
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						
						<td>
							<input id="addForwardingNumber" type="text" name="addForwardingNumber"/>
						</td>
						<td style="padding-left:10px">
							<input type="submit" id="actionVoiceAddSelectiveForwarding" name="actionVoiceAddSelectiveForwarding" value="<fmt:message key='add'/>"/>
							<script type="text/javascript">
							<!--
								selectiveForwardCheckboxDependers.push("actionVoiceAddSelectiveForwarding");
							//-->
							</script>
						</td>
					</tr>
					<tr>
						<td colspan="3"></td>
						<td colspan="2"><fmt:message key="optionsCallForwardingRules"/></td>
					</tr>
					</c:if>
					
					<tr><td>&nbsp;</td></tr>
					
					<tr>
						<td colspan="2" style="text-align:right">
							<label for="selectiveDest"><fmt:message key="optionsCallForwardingSelectiveDestination"/></label>
						</td>
						
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						
						<td>
							<zm:listObject var="bogus" csep="forwardTo" map="${sessionScope.selectiveCallForwardingTo}" phone="${phone}"/>
							<input type="text" name="selectiveCallForwardingTo" value="${forwardTo}"/>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
	<script type="text/javascript">
		<!--
			var selectiveForwardingCheckbox = document.getElementById("selectiveCallForwardingActive");
			selectiveForwardingCheckbox.onchange = function() {selectiveForwardCheckboxChanged(selectiveForwardingCheckbox.checked)};
			selectiveForwardCheckboxChanged(selectiveForwardingCheckbox.checked);
		//-->
	</script>
</c:when>



<c:when test="${voiceselected=='screening'}">
	
	<%----------------- Call Screening Section --------------%>
	
	<c:if test="${empty sessionScope.selectiveCallRejectionFrom}">
		<zm:forEachPhoneAccount var="_account">
			<app:handleError>
				<app:getCallFeatures account="${_account}" var="accountFeatures"/>
				<c:forEach items="${accountFeatures.selectiveCallRejection.rejectFrom}" var="number">
					<zm:listObject phone="${_account.phone.name}" var="selectiveCallRejectionFrom" scope="session" map="${sessionScope.selectiveCallRejectionFrom}" add="${number}"/>
				</c:forEach>
			</app:handleError>
		</zm:forEachPhoneAccount>
	</c:if>

	<script type="text/javascript">
		<!--
			var selectiveRejectionCheckboxDependers = [];
			function selectiveRejectionCheckboxChanged(value) {
				for (var i=0; i<selectiveRejectionCheckboxDependers.length; i++) {
					var element = document.getElementById(selectiveRejectionCheckboxDependers[i]);
					if (element)
						element.disabled = !value;
				}
			}
		//-->
		</script>
		
		<c:set var="selectiveCallRejectionActive" value="${requestScope.selectiveCallRejectionActive != 'FALSE' && (features.selectiveCallRejection.isActive || requestScope.selectiveCallRejectionActive == 'TRUE')}"/>
		<c:set var="canAddSelectiveRejection" value="${empty sessionScope.selectiveCallRejectionFrom || empty sessionScope.selectiveCallRejectionFrom[phone] || fn:length(sessionScope.selectiveCallRejectionFrom[phone]) < 12}"/>
		<c:set var="displayAddSelectiveRejection" value="${selectiveCallRejectionActive && !empty requestScope.addSelectiveRejection && canAddSelectiveRejection}"/>
		
	<table class="ZOptionsSectionMain ZhOptVoice" border="0" cellspacing="10" width="100%">
		<tr>
			<td class="ZOptionsTableLabel"><fmt:message key="optionsCallRejectionAll"/></td>
			<td>
				<table border="0" cellpadding="0" cellspacing="0">
					<tr>
						<td class="ZhOptVoiceCBCell">
							<input id="anonymousCallRejectionActive" type="checkbox" name="anonymousCallRejectionActive" value="TRUE" <c:if test="${requestScope.anonymousCallRejectionActive!='FALSE' && (features.anonymousCallRejection.isActive || requestScope.anonymousCallRejectionActive=='TRUE')}">checked</c:if>/>
						</td>
						<td colspan="4">
							<label for="anonymousCallRejectionActive"><fmt:message key="optionsCallRejectionAllLabel"/></label>
						</td>						
					</tr>
				</table>
			</td>
		</tr>
		
		<tr>
			<td class="ZOptionsTableLabel" style="vertical-align:top"><fmt:message key="optionsCallRejectionSelective"/></td>
			<td>
				<table border="0" cellpadding="0" cellspacing="0">
						
					<tr>
						<td class="ZhOptVoiceCBCell" style="vertical-align:top;">
							<input id="selectiveCallRejectionActive" type="checkbox" name="selectiveCallRejectionActive" value="TRUE" <c:if test="${selectiveCallRejectionActive}">checked</c:if>/>
						</td>
						
						<td style="vertical-align:top;padding-top:3px">
							<label for="selectiveCallRejectionActive"><fmt:message key="optionsCallRejectionSelectiveLabel"/></label>
						</td>
						
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						
						<td style="vertical-align:top;">
						
							<table class="ZmPhoneBufferList List" border="0" cellpadding="0" cellspacing="0" width="300px">
								<tr><th colspan="2"><fmt:message key="numbers"/></th></tr>
								<c:if test="${!empty sessionScope.selectiveCallRejectionFrom && !empty sessionScope.selectiveCallRejectionFrom[phone]}">
								<c:set var="i" value="0"/>
								<c:forEach items="${sessionScope.selectiveCallRejectionFrom[phone]}" var="number">
									<c:if test="${!empty number}">
									<tr>
										<td style="width:50%">${number}</td>
										<td style="width:50%;text-align:left">
										    <label for="actionVoiceRemoveRejection_${i}" class="FakeLink"><fmt:message key='remove'/></label>
										    
										</td>
									</tr>
									<c:set var="i" value="${i+1}"/>
									</c:if>
								</c:forEach>
								</c:if>
							</table>
						
						</td>
						
						
						<td style="vertical-align:top;padding-left:10px">
							<input type="submit" id="addSelectiveRejection" name="addSelectiveRejection" value="<fmt:message key='addToList'/>" <c:if test="${displayAddSelectiveRejection || !canAddSelectiveRejection}">disabled</c:if>/>
							<script type="text/javascript">
							<!--
								selectiveRejectionCheckboxDependers.push("addSelectiveRejection");
							//-->
							</script>
						</td>
					</tr>

					<tr>
						<td colspan="3">
							<c:set var="i" value="${0}"/>
							<c:forEach items="${sessionScope.selectiveCallRejectionFrom[phone]}" var="number">
								<c:if test="${!empty number}">
									<input type="submit" class="HiddenButton" id="actionVoiceRemoveRejection_${i}" name="actionVoiceRemoveSelectiveRejection" value="${number}"/>
									<script type="text/javascript">
									<!--
										selectiveRejectionCheckboxDependers.push("actionVoiceRemoveRejection_${i}");
									//-->
									</script>
									<c:set var="i" value="${i+1}"/>
								</c:if>
							</c:forEach>
						</td>
					</tr>
					
					<c:if test="${displayAddSelectiveRejection}">
					<tr><td>&nbsp;</td></tr>

					<tr>
						<td colspan="2" style="text-align:right">
							<label for="addRejectionNumber"><fmt:message key="optionsCallRejectionSelectiveAdd"/></label>
						</td>
						
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						
						<td>
							<input id="addRejectionNumber" type="text" name="addRejectionNumber"/>
						</td>
						<td style="padding-left:10px">
							<input type="submit" id="actionVoiceAddSelectiveRejection" name="actionVoiceAddSelectiveRejection" value="<fmt:message key='add'/>"/>
							<script type="text/javascript">
							<!--
								selectiveRejectionCheckboxDependers.push("actionVoiceAddSelectiveRejection");
							//-->
							</script>
						</td>
					</tr>
					<tr>
						<td colspan="3"></td>
						<td colspan="2"><fmt:message key="optionsCallRejectionRules"/></td>
					</tr>
					</c:if>
				</table>
			</td>
		</tr>
	</table>
	<script type="text/javascript">
		<!--
			var selectiveRejectionCheckbox = document.getElementById("selectiveCallRejectionActive");
			selectiveRejectionCheckbox.onchange = function() {selectiveRejectionCheckboxChanged(selectiveRejectionCheckbox.checked)};
			selectiveRejectionCheckboxChanged(selectiveRejectionCheckbox.checked);
		//-->
	</script>
</c:when>

</c:choose>

	</td></tr></table>
</c:if>
