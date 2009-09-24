<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:set var="voiceselected" value="${empty param.voiceselected ? 'general' : param.voiceselected}"/>

<app:handleError>
	<zm:checkVoiceStatus var="voiceStatus"/>
</app:handleError>
<c:if test="${voiceStatus ne 'false'}">

<script type="text/javascript">
    <!--
    function addAnchor(anchorname, form) {
	if (typeof(form) === "object") {
	    if (typeof(form.action)==="string")
		form.action += "#"+anchorname;
	    else
		form.action = "#"+anchorname;
	}
    }
    //-->
</script>

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
			<td class="ZOptionsTableLabel">&nbsp;</td>
			<td>
				<table border="0" cellpadding="0" cellspacing="0">
					<tr>
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						<td>
							<div width="350px"><fmt:message key="voiceOptInstructions"/></div>
							<br>
							<table class="List" border="0" cellpadding="0" cellspacing="0" width="350px">
								<tr><th><fmt:message key="number"/></th></tr>
								<c:set var="firstAccount" value="true"/>
								<zm:forEachPhoneAccount var="account">
									<c:set var="selected" value="${(empty param.phone and firstAccount) or (param.phone eq account.phone.name)}"/>
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
			<app:getCallFeatures account="${account}" var="features"/>
		</c:if>
	</zm:forEachPhoneAccount>
	
	<input type="hidden" name="phone" value="${account.phone.name}">
		
	
	
		
<c:choose>
<c:when test="${voiceselected=='general'}">
	
			<%------------------- Number of rings ------------------%>
			<tr>
				<td class="ZOptionsTableLabel" style="vertical-align:top;">
					<label for="numberOfRings"><fmt:message key="optionsRingsSend"/>:</label>
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
				<td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="optionsLanguageIncoming"/>:</td>
				<td>
					<table border="0" cellpadding="0" cellspacing="0">
						<tr>
							<td colspan="2">
								<fmt:message key="optionsLanguageIncomingPrompt"/>:
							</td>
						</tr>
						<c:forEach var="language" items="${languages}">
							<c:set var="id" value="voiceIncoming_${language.key}"/>
							<tr>
								<td class="ZhOptVoiceCBCell">
									<input id="${id}" type="radio" name="answeringLocale" value="${language.key}" <c:if test="${language.key == answeringLocale}">checked</c:if>/>
								</td>
								<td>
									<label for="${id}"><fmt:message key="language_${language.key}"/></label>
								</td>
							</tr>
						</c:forEach>
					</table>
				</td>
			</tr>
			
			<tr>
				<td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="optionsLanguageChecking"/>:</td>
				<td>
					<table border="0" cellpadding="0" cellspacing="0">
						<tr>
							<td colspan="2">
								<fmt:message key="optionsLanguageCheckingPrompt"/>:
							</td>
						</tr>
						<c:forEach var="language" items="${languages}">
							<c:set var="id" value="voiceChecking_${language.key}"/>
							<tr>
								<td class="ZhOptVoiceCBCell">
									<input id="${id}" type="radio" name="userLocale" value="${language.key}" <c:if test="${language.key == userLocale}">checked</c:if>/>
								</td>
								<td>
									<label for="${id}"><fmt:message key="language_${language.key}"/></label>
								</td>
							</tr>
						</c:forEach>
					</table>
				</td>
			</tr>
			
			<tr><td colspan="2"><hr/></td></tr>
			
			<%------------------- Prompts -------------------%>
			<c:set var="promptLevel" value="${features.voiceMailPrefs.promptLevel}"/>
			<c:set var="autoPlayNewMsgs" value="${features.voiceMailPrefs.autoPlayNewMsgs}"/>						
			<c:set var="playDateAndTimeInMsgEnv" value="${features.voiceMailPrefs.playDateAndTimeInMsgEnv}"/>
			
			<script type="text/javascript">
			<!--
				function setLengthOptionsEnabled(enabled) {
					document.getElementById("promptLevelShort").disabled = !enabled;
					document.getElementById("promptLevelMedium").disabled = !enabled;
					document.getElementById("promptLevelLong").disabled = !enabled;
				}
			//-->
			</script>
			
			<tr>
				<td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="optionsPromptsPlayback"/>:</td>
				<td>
					<table border="0" cellpadding="0" cellspacing="0">
						<tr>
							<td class="ZhOptVoiceCBCell">
								<input id="autoPlayNewMsgs" type="checkbox" name="autoPlayNewMsgs" onchange="setLengthOptionsEnabled(this.checked)" <c:if test="${autoPlayNewMsgs}">checked</c:if> />
							</td>
							<td>
								<label for="autoPlayNewMsgs"><fmt:message key="optionsPromptsAutoplay"/></label>
							</td>
						</tr>
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
			
			<%-- Disable radio buttons if autoplay is unset and javascript is available (just setting each input to "disabled" screws non-javascript users as there's no way to re-enable it) --%>
			<c:if test="${!autoPlayNewMsgs}">
				<script type="text/javascript">
				<!--
					setLengthOptionsEnabled(false);
				//-->
				</script>
			</c:if>
			
			<tr><td colspan="2"><hr/></td></tr>
			
			<%------------------- Count per page ------------------%>
			<tr>
				<td class="ZOptionsTableLabel" style="vertical-align:top;">
					<label for="numberPerPage"><fmt:message key="optionsDisplay"/> :</label>
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
				<td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="optionsVoiceSecurityChPwd"/></td>
				<td><a href="<fmt:message key='optionsVoiceSecurityChPwdUrl'/>" target="_blank"><fmt:message key="optionsVoiceSecurityChPwdLink"/></a></td>
			</tr>
			
			<tr>
				<td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="optionsVoiceSecurityLogin"/></td>
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
	<br/>
	
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
				<label for="numberPerPage"><fmt:message key="optionsDisplay"/> :</label>
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
	<table class="ZOptionsSectionMain ZhOptVoice" border="0" cellspacing="10" width="100%">
		<tr>
			<td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="optionsVoiceNotificationsEmail"/>:</td>
			<td>
				<table border="0" cellpadding="0" cellspacing="0">
					<tr>
						<td class="ZhOptVoiceCBCell">
							<input id="emailNotificationActive" type="checkbox" name="emailNotificationActive" value="TRUE" 
							<c:choose>
								<c:when test="${requestScope.emailNotificationActive eq null and !empty features.voiceMailPrefs.emailNotificationAddress}">
								checked
								</c:when>
								<c:when test="${requestScope.emailNotificationActive eq 'TRUE'}">
								checked
								</c:when>
							</c:choose>
							<c:if test="${!account.hasVoiceMail}"> disabled</c:if>
							/>
						</td>
						<td>
							<label for="emailNotificationActive"><fmt:message key="optionsVoiceNotificationsActive"/>:</label>
						</td>
						
						<td style="padding: 0px 10px">
							<input id="emailNotificationAddAddress" type="text" name="emailNotificationAddAddress"/>
						</td>
						
						<td>
							<input type="submit" name="actionVoiceAddNotification" value="<fmt:message key='add'/>" onclick="addAnchor('notification', this.form)"/>
						</td>
					</tr>
					
					<c:if test="${empty sessionScope.emailNotificationAddress && !sessionScope.emailNotificationFetched}">
						<c:set var="emailNotificationAddress" scope="session" value=""/>
						<c:set var="emailNotificationFetched" scope="session" value="${true}"/>
						<c:forEach items="${features.voiceMailPrefs.emailNotificationAddress}" var="email">
						    <c:if test="${!empty sessionScope.emailNotificationAddress}">
						    <c:set var="emailNotificationAddress" scope="session" value="${sessionScope.emailNotificationAddress},"/>
						    </c:if>
						    <c:set var="emailNotificationAddress" scope="session" value="${sessionScope.emailNotificationAddress}${email}"/>
						</c:forEach>
					</c:if>
						
					<tr><td>&nbsp;</td></tr>
					<c:if test="${!empty sessionScope.emailNotificationAddress}">
					<tr>
						<td colspan="4" style="vertical-align:top;text-align:right">
							<table class="ZmBufferList" border="0" cellpadding="0" cellspacing="0" width="400px">
								<tr><th colspan="2"><fmt:message key="optionsVoiceNotificationsAddresses"/></th></tr>
								<c:set var="i" value="0"/>
								<c:forEach items="${fn:split(sessionScope.emailNotificationAddress, ',')}" var="notificationAddress">
									<c:if test="${!empty notificationAddress}">
									<tr>
										<td style="width:50%">${notificationAddress}</td>
										<td style="width:50%;text-align:left">
										    <input type="submit" id="actionVoiceRemoveNotification_${i}" name="actionVoiceRemoveNotification" value="${notificationAddress}" style="display:none;" onclick="addAnchor('notification', this.form)"/>
										    <label for="actionVoiceRemoveNotification_${i}" style="cursor:pointer"><a href="#notification"><fmt:message key='remove'/></a></label>
										</td>
									</tr>
									</c:if>
									<c:set var="i" value="${i+1}"/>
								</c:forEach>
							</table>
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


	<table class="ZOptionsSectionMain ZhOptVoice" border="0" cellspacing="10" width="100%">
		<tr>
			<td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="optionsCallForwardingAll"/>:</td>
			<td>
				<table border="0" cellpadding="0" cellspacing="0">
					<tr>
						<td class="ZhOptVoiceCBCell">
						
							<input id="callForwardingActive" type="checkbox" name="callForwardingActive" <c:if test="${features.callForwardingAll.isActive}">checked</c:if>/>
						</td>
						<td>
							<label for="callForwardingActive"><fmt:message key="optionsCallForwardingAllLabel"/>:</label>
						</td>
						
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						
						<td>
							<input type="text" name="callForwardingTo" value="${features.callForwardingAll.forwardTo}"/>
						</td>
					</tr>
					
					<tr><td>&nbsp;</td></tr>

					<tr>
						<td class="ZhOptVoiceCBCell" style="vertical-align:top;">
							<input id="selectiveCallForwardingActive" type="checkbox" name="selectiveCallForwardingActive" value="TRUE" 
							<c:choose>
								<c:when test="${features.selectiveCallForwarding.isActive && !empty features.selectiveCallForwarding.forwardFrom && !empty features.selectiveCallForwarding.forwardTo}">
								checked
								</c:when>
								<c:when test="${requestScope.selectiveCallForwardingActive eq 'TRUE'}">
								checked
								</c:when>
							</c:choose>
							/>
						</td>
						
						<td style="vertical-align:top;padding-top:3px">
							<label for="selectiveCallForwardingActive"><fmt:message key="optionsCallForwardingSelectiveLabel"/>:</label>
						</td>
						
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						
						<c:if test="${empty sessionScope.selectiveCallForwardingFrom && !sessionScope.selectiveCallForwardingFetched}">
						<%-- PUT FORWARDING LIST INTO SESSION VAR --%>
						<c:set var="selectiveCallForwardingFrom" scope="session" value=""/>
						<c:set var="selectiveCallForwardingFetched" scope="session" value="${true}"/>
						<c:forEach items="${features.selectiveCallForwarding.forwardFrom}" var="number">
						    <c:if test="${!empty sessionScope.selectiveCallForwardingFrom}">
						    <c:set var="selectiveCallForwardingFrom" scope="session" value="${sessionScope.selectiveCallForwardingFrom},"/>
						    </c:if>
						    <c:set var="selectiveCallForwardingFrom" scope="session" value="${sessionScope.selectiveCallForwardingFrom}${number}"/>
						</c:forEach>
						</c:if>
						
						<c:if test="${!empty sessionScope.selectiveCallForwardingFrom}">
						<td style="vertical-align:top;">
							<table class="ZmPhoneBufferList" border="0" cellpadding="0" cellspacing="0" width="300px">
								<c:set var="i" value="0"/>
								<c:forEach items="${sessionScope.selectiveCallForwardingFrom}" var="number">
									<c:if test="${!empty number}">
									<tr>
										<td style="width:50%">${number}</td>
										<td style="width:50%;text-align:left">
										    <input type="submit" id="actionVoiceRemoveForwarding_${i}" name="actionVoiceRemoveSelectiveForwarding" value="${number}" style="display:none;" onclick="addAnchor('forwarding', this.form)"/>
										    <label for="actionVoiceRemoveForwarding_${i}" style="cursor:pointer"><a href="#forwarding"><fmt:message key='remove'/></a></label>
										</td>
									</tr>
									<c:set var="i" value="${i+1}"/>
									</c:if>
								</c:forEach>
							</table>
						</td>
						</c:if>
						
						<td style="vertical-align:top;padding-left:10px">
							<input type="submit" name="addSelectiveForwarding" value="<fmt:message key='add'/>" <c:if test="${!empty param.addSelectiveForwarding}">disabled</c:if> onclick="addAnchor('forwarding', this.form)"/>
						</td>
					</tr>
					
					<c:if test="${!empty param.addSelectiveForwarding}">
					<tr>
						<td colspan="2">
							<label for="addForwardingNumber"><fmt:message key="optionsCallForwardingSelectiveAdd"/>:</label>
						</td>
						
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						
						<td>
							<input id="addForwardingNumber" type="text" name="addForwardingNumber"/>
						</td>
						<td style="padding-left:10px">
							<input type="submit" name="actionVoiceAddSelectiveForwarding" value="<fmt:message key='add'/>" onclick="addAnchor('forwarding', this.form)"/>
						</td>
					</tr>
					</c:if>
					
					<tr><td>&nbsp;</td></tr>
					
					<tr>
						<td colspan="2" style="text-align:right">
							<label for="selectiveDest"><fmt:message key="optionsCallForwardingSelectiveDestination"/>:</label>
						</td>
						
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						
						<td>
							<input id="selectiveDest" type="text" name="selectiveCallForwardingTo" value="${features.selectiveCallForwarding.forwardTo}"/>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
	
</c:when>



<c:when test="${voiceselected=='screening'}">
	
	<%----------------- Call Screening Section --------------%>
	<table class="ZOptionsSectionMain ZhOptVoice" border="0" cellspacing="10" width="100%">
		<tr>
			<td class="ZOptionsTableLabel" style="vertical-align:top;"><fmt:message key="optionsCallRejectionAll"/>:</td>
			<td>
				<table border="0" cellpadding="0" cellspacing="0">
					<tr>
						<td class="ZhOptVoiceCBCell">
							<input id="anonymousCallRejectionActive" type="checkbox" name="anonymousCallRejectionActive" value="TRUE" <c:if test="${features.anonymousCallRejection.isActive}">checked</c:if>/>
						</td>
						<td colspan="4">
							<label for="anonymousCallRejectionActive"><fmt:message key="optionsCallRejectionAllLabel"/></label>
						</td>						
					</tr>
					
					<tr><td>&nbsp;</td></tr>

					<tr>
						<td class="ZhOptVoiceCBCell" style="vertical-align:top;">
							<input id="callRejectionSelective" type="checkbox" name="selectiveCallRejectionActive" value="TRUE" <c:if test="${features.selectiveCallRejection.isActive}">checked</c:if>/>
						</td>
						
						<td style="vertical-align:top;padding-top:3px">
							<label for="callRejectionSelective"><fmt:message key="optionsCallRejectionSelectiveLabel"/>:</label>
						</td>
						
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						
						<c:if test="${empty sessionScope.selectiveRejectionNumber && !sessionScope.selectiveRejectionFetched}">
						<c:set var="selectiveRejectionNumber" scope="session" value=""/>
						<c:set var="selectiveRejectionFetched" scope="session" value="${true}"/>
						<c:forEach items="${features.selectiveCallRejection.rejectFrom}" var="number">
						    <c:if test="${!empty sessionScope.selectiveRejectionNumber}">
						    <c:set var="selectiveRejectionNumber" scope="session" value="${sessionScope.selectiveRejectionNumber},"/>
						    </c:if>
						    <c:set var="selectiveRejectionNumber" scope="session" value="${sessionScope.selectiveRejectionNumber}${number}"/>
						</c:forEach>
						</c:if>
						
						
						<td style="vertical-align:top;">
						<c:if test="${!empty sessionScope.selectiveRejectionNumber}">
							<table class="ZmPhoneBufferList" border="0" cellpadding="0" cellspacing="0" width="300px">
								<c:forEach items="${sessionScope.selectiveRejectionNumber}" var="number">
									<c:if test="${!empty number}">
									<tr>
										<td style="width:50%">${number}</td>
										<td style="width:50%;text-align:left">
										    <input type="submit" id="actionVoiceRemoveRejection_${i}" name="actionVoiceRemoveSelectiveRejection" value="${number}" style="display:none;" onclick="addAnchor('rejection', this.form)"/>
										    <label for="actionVoiceRemoveRejection_${i}" style="cursor:pointer"><a href="#rejection"><fmt:message key='remove'/></a></label>
										</td>
									</tr>
									</c:if>
								</c:forEach>
							</table>
							</c:if>
						</td>
						
						
						<td style="vertical-align:top;padding-left:10px">
							<input type="submit" name="addSelectiveRejection" value="<fmt:message key='add'/>" <c:if test="${!empty param.addSelectiveRejection || (!empty sessionScope.selectiveRejectionNumber && fn:length(fn:split(sessionScope.selectiveRejectionNumber, ','))>=12)}">disabled</c:if> onclick="addAnchor('rejection', this.form)"/>
						</td>
					</tr>
					
					<c:if test="${!empty param.addSelectiveRejection && (empty sessionScope.selectiveRejectionNumber || fn:length(fn:split(sessionScope.selectiveRejectionNumber, ','))<12)}">
					<tr>
						<td colspan="2">
							<label for="addRejectionNumber"><fmt:message key="optionsCallRejectionSelectiveAdd"/>:</label>
						</td>
						
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						
						<td>
							<input id="addRejectionNumber" type="text" name="addRejectionNumber"/>
						</td>
						<td style="padding-left:10px">
							<input type="submit" name="actionVoiceAddSelectiveRejection" value="<fmt:message key='add'/>" onclick="addAnchor('rejection', this.form)"/>
						</td>
					</tr>
					</c:if>
										
					<%-- Not sure if this is needed --%>
					<%--
					<tr><td>&nbsp;</td></tr>
					
					<tr>
						<td colspan="2" style="text-align:right">
							<label for="selectiveDest"><fmt:message key="optionsCallRejectionSelectiveTo"/>:</label>
						</td>
						
						<td class="ZhOptVoiceCBCell">&nbsp;</td>
						
						<td>
							<input id="selectiveDest" type="text" name="callRejectionSelectiveTo"/>
						</td>
					</tr>
					--%>
				</table>
			</td>
		</tr>
	</table>
</c:when>

</c:choose>

	</td></tr></table>
</c:if>
