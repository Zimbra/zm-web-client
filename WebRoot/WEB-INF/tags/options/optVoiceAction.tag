<%@ tag body-content="empty" %>
<%@ attribute name="accountindex" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<app:handleError>
</app:handleError>

<c:set var="voiceselected" value="${empty param.voiceselected ? 'general' : param.voiceselected}"/>

<fmt:message var="faqlink" key="errorPhoneFAQLink"/>
<fmt:message var="faqurl" key="errorPhoneFAQURL"/>
<c:set var="faqlink" value="&nbsp;${fn:replace(faqlink, '{1}', faqurl)}"/>

<c:set var="selectiveCallForwardingActive" scope="request" value="${param.selectiveCallForwardingActive=='TRUE' ? 'TRUE':'FALSE'}"/>
<c:set var="callForwardingActive" scope="request" value="${param.callForwardingActive=='TRUE' ? 'TRUE':'FALSE'}"/>
<c:set var="addSelectiveForwarding" scope="request" value="${param.addSelectiveForwarding}"/>

<c:set var="anonymousCallRejectionActive" scope="request" value="${param.anonymousCallRejectionActive=='TRUE' ? 'TRUE':'FALSE'}"/>
<c:set var="selectiveCallRejectionActive" scope="request" value="${param.selectiveCallRejectionActive=='TRUE' ? 'TRUE':'FALSE'}"/>
<c:set var="addSelectiveRejection" scope="request" value="${param.addSelectiveRejection}"/>

<c:if test="${zm:actionSet(param, 'actionSave')}">

    <%-- See if the forwarding to number is in the forwarding from list --%>
    <c:if test="${voiceselected=='forwarding' && param.selectiveCallForwardingActive}">
    <zm:phone var="toValid" displayVar="toNumber" errorVar="errorCode" name="${param.selectiveCallForwardingTo}"/>
    <zm:listObject phone="${param.phone}" map="${sessionScope.selectiveCallForwardingFrom}" strArr="numbers" var="bogus"/>
    <c:set var="entryTest" value="${fn:replace(toNumber, '1-(', '(')}"/>
    <c:forEach items="${numbers}" var="number">
	    <zm:phone var="success" displayVar="fromNumber" errorVar="errorCode" name="${number}"/>
	    <c:set var="collTest" value="${fn:replace(fromNumber, '1-(', '(')}"/>
	    <c:if test="${entryTest == collTest}">
		<c:set var="invalidForwardNumber" value="${true}"/>
	    </c:if>
    </c:forEach>
    <zm:phone var="anonToValid" displayVar="anonToNumber" errorVar="errorCode" name="${param.callForwardingTo}"/>
    </c:if>


    <c:choose>
        <c:when test="${voiceselected=='forwarding' && param.callForwardingActive && !empty anonToValid && !anonToValid}">
            <app:status style="Critical" html="true"><fmt:message key="invalidForwardNumber"><fmt:param value="${faqlink}"/></fmt:message></app:status>
	</c:when>

	<c:when test="${voiceselected=='forwarding' && param.selectiveCallForwardingActive && invalidForwardNumber}">
	        <app:status style="Critical" html="true"><fmt:message key="errorPhoneIsInList"><fmt:param value="${faqlink}"/></fmt:message></app:status>
	</c:when>
	
	<c:when test="${param.selectiveCallForwardingActive && !empty toValid && !toValid}">
		<app:status style="Critical" html="true"><fmt:message key="errorPhoneInvalid"><fmt:param value="${faqlink}"/></fmt:message></app:status>
	</c:when>

        <c:otherwise>
	    <c:choose>
                <c:when test="${voiceselected=='general'}">	
                    <zm:modifyCallFeatures var="result" phone="${param.phone}"
                        numberOfRings="${param.numberOfRings}"
                        autoPlayNewMsgs="${param.autoPlayNewMsgs}"
                        playDateAndTimeInMsgEnv="${param.playDateAndTimeInMsgEnv}"
                        requirePinEntry="${param.requirePinEntry}"
                        playCallerNameInMsgEnv="${param.playCallerNameInMsgEnv}"
                        promptLevel="${param.promptLevel}"
                        answeringLocale="${param.answeringLocale}"
                        userLocale="${param.userLocale}"
                        numberPerPage="${param.numberPerPage}"
                    />
                </c:when>
		
                <c:when test="${voiceselected=='notification'}">
		    <zm:listObject var="bogus" phone="${param.phone}" csep="notif" map="${sessionScope.emailNotificationAddresses}"/>
            	    <zm:modifyCallFeatures var="result" phone="${param.phone}"
                        emailnotificationactive="${!empty notif}" emailnotificationaddress="${notif}"
                    />
                </c:when>
		
                <c:when test="${voiceselected=='forwarding'}">	

			    <zm:listObject var="bogus" phone="${param.phone}" strArr="scf" map="${sessionScope.selectiveCallForwardingFrom}"/>
                	    <zm:modifyCallFeatures var="result" phone="${param.phone}"
                    		callforwardingactive="${param.callForwardingActive}" callforwardingforwardto="${param.callForwardingTo}"
                    		selectivecallforwardingactive="${param.selectiveCallForwardingActive=='TRUE'}" selectivecallforwardingforwardto="${param.selectiveCallForwardingTo}" selectivecallforwardingforwardfrom="${scf}"
			    />
                </c:when>
		
                <c:when test="${voiceselected=='screening'}">
		    <zm:listObject var="bogus" phone="${param.phone}" strArr="scr" map="${sessionScope.selectiveCallRejectionFrom}"/>
                    <zm:modifyCallFeatures var="result" phone="${param.phone}"
                        anonymouscallrejectionactive="${param.anonymousCallRejectionActive}"
                        selectivecallrejectionactive="${param.selectiveCallRejectionActive}" selectivecallrejectionrejectfrom="${scr}"
                    />
                </c:when>
            </c:choose>
			
            <c:choose>
                <c:when test="${result}">
                    <app:status><fmt:message key="optionsSaved"/></app:status>
                </c:when>
                <c:when test="${empty failure || failure==false}">
                    <app:status><fmt:message key="noOptionsChanged"/></app:status>
                </c:when>
            </c:choose>
        </c:otherwise>
    </c:choose>
</c:if>




<c:if test="${voiceselected=='notification' && zm:actionSet(param, 'actionVoiceAddNotification')}">

    <c:if test="${!empty sessionScope.emailNotificationAddresses}">
        <zm:listObject phone="${param.phone}" map="${sessionScope.emailNotificationAddresses}" strArr="addresses" var="bogus"/>
        <c:forEach items="${addresses}" var="address">
	    <c:if test="${param.emailNotificationAddAddress == address}">
	        <c:set var="addressIsInList" value="${true}"/>
	    </c:if>
	</c:forEach>
    </c:if>

    <c:choose>
	    <c:when test="${fn:length(sessionScope.emailNotificationAddresses[param.phone])>=25}">
		<app:status style="Critical" html="true"><fmt:message key="optionsVoiceNotificationsErrorMax"><fmt:param value="${faqlink}"/></fmt:message></app:status>
	    </c:when>
	    <c:when test="${fn:indexOf(param.emailNotificationAddAddress, ',')!=-1 || !zm:isValidEmailAddress(param.emailNotificationAddAddress)}">
		<app:status style="Critical" html="true"><fmt:message key="optionsVoiceNotificationsErrorInvalid"><fmt:param value="${faqlink}"/></fmt:message></app:status>
	    </c:when>
	    <c:when test="${fn:length(param.emailNotificationAddAddress)>100}">
		<app:status style="Critical" html="true"><fmt:message key="optionsVoiceNotificationsErrorLong"><fmt:param value="${faqlink}"/></fmt:message></app:status>
	    </c:when>
	    <c:when test="${addressIsInList}">
		<app:status style="Critical" html="true"><fmt:message key="optionsVoiceNotificationsErrorNotUnique"><fmt:param value="${faqlink}"/></fmt:message></app:status>
	    </c:when>
	    <c:otherwise>
		<zm:listObject phone="${param.phone}" var="emailNotificationAddresses" scope="session" map="${sessionScope.emailNotificationAddresses}" add="${param.emailNotificationAddAddress}"/>
	    </c:otherwise>
	</c:choose>
</c:if>

<c:if test="${voiceselected=='notification' && zm:actionSet(param, 'actionVoiceClearNotification')}">
    <zm:listObject phone="${param.phone}" var="emailNotificationAddresses" scope="session" map="${sessionScope.emailNotificationAddresses}" clear="${true}"/>
</c:if>

<c:if test="${voiceselected=='notification' && zm:actionSet(param, 'actionVoiceRemoveNotification')}">
    <zm:listObject phone="${param.phone}" var="emailNotificationAddresses" scope="session" map="${sessionScope.emailNotificationAddresses}" remove="${param.actionVoiceRemoveNotification}"/>
</c:if>





<c:if test="${voiceselected=='forwarding'}">
    <zm:listObject phone="${param.phone}" var="selectiveCallForwardingTo" scope="session" map="${sessionScope.selectiveCallForwardingTo}" clear="${true}"/>
    <zm:listObject phone="${param.phone}" var="selectiveCallForwardingTo" scope="session" map="${sessionScope.selectiveCallForwardingTo}" add="${param.selectiveCallForwardingTo}"/>
    
    <zm:listObject phone="${param.phone}" var="callForwardingTo" scope="session" map="${sessionScope.callForwardingTo}" clear="${true}"/>
    <zm:listObject phone="${param.phone}" var="callForwardingTo" scope="session" map="${sessionScope.callForwardingTo}" add="${param.callForwardingTo}"/>
</c:if>

<c:if test="${voiceselected=='forwarding' && zm:actionSet(param, 'addSelectiveForwarding') && !empty sessionScope.selectiveCallForwardingFrom && !empty sessionScope.selectiveCallForwardingFrom[param.phone] && fn:length(sessionScope.selectiveCallForwardingFrom[param.phone]) >= 12}">
    <app:status style="Critical" html="true"><fmt:message key="optionsCallForwardingErrorMax"><fmt:param value="${faqlink}"/></fmt:message></app:status>
    <c:set var="addSelectiveForwarding" scope="request" value="${null}"/>
</c:if>

<c:if test="${voiceselected=='forwarding' && ((zm:actionSet(param, 'actionVoiceAddSelectiveForwarding') && param.selectiveCallForwardingActive) || (zm:actionSet(param, 'actionSave') && param.selectiveCallForwardingActive))}">
    	<c:set var="useFrom" value="${zm:actionSet(param, 'actionVoiceAddSelectiveForwarding')}"/>

	<c:if test="${!empty sessionScope.selectiveCallForwardingFrom}">
	    <zm:phone var="success" displayVar="addNumber" errorVar="errorCode" name="${param.addForwardingNumber}"/>
	    <zm:listObject phone="${param.phone}" map="${sessionScope.selectiveCallForwardingFrom}" strArr="numbers" var="bogus"/>
	    <c:set var="entryTest" value="${fn:replace(addNumber, '1-(', '(')}"/>
	    <c:forEach items="${numbers}" var="number">
		<zm:phone var="success" displayVar="fromNumber" errorVar="errorCode" name="${number}"/>
		<c:set var="collTest" value="${fn:replace(fromNumber, '1-(', '(')}"/>
		<c:if test="${entryTest == collTest}">
		    <c:set var="invalidAddNumber" value="${true}"/>
		</c:if>
	    </c:forEach>
	</c:if>
	
	<zm:phone var="bogus" displayVar="thisDisplayNumber" name="${param.phone}"/>
	<zm:phone var="bogus" displayVar="toDisplayNumber" name="${param.selectiveCallForwardingTo}"/>
	<zm:phone var="success" displayVar="displayNumber" errorVar="errorCode" name="${useFrom ? param.addForwardingNumber : param.selectiveCallForwardingTo}"/>

	<c:choose>
		<c:when test="${useFrom && invalidAddNumber}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneNotUnique"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>

		<c:when test="${!useFrom && empty toDisplayNumber}">
		    <app:status style="Critical" html="true"><fmt:message key="optionsCallForwardingErrorToEmpty"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${fn:replace(thisDisplayNumber, '1-(', '(') == fn:replace(displayNumber, '1-(', '(')}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIsOwn"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${useFrom && fn:replace(toDisplayNumber, '1-(', '(') == fn:replace(displayNumber, '1-(', '(')}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIsTo"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_INTERNATIONAL_NUMBER'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIsInternational"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_BAD_NPA'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneInvalidAreaCode"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_BAD_LINE'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneInvalidExtension"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_EMERGENCY_ASSISTANCE'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIs911"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_DIRECTORY_ASSISTANCE'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIs411"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_BAD_FORMAT'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneInvalid"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${useFrom && success}">
		    <zm:listObject phone="${param.phone}" var="selectiveCallForwardingFrom" scope="session" map="${sessionScope.selectiveCallForwardingFrom}" add="${displayNumber}"/>
		</c:when>
	</c:choose>
</c:if>

<c:if test="${voiceselected=='forwarding' && zm:actionSet(param, 'actionVoiceRemoveSelectiveForwarding') && param.selectiveCallForwardingActive}">
     <zm:listObject phone="${param.phone}" var="selectiveCallForwardingFrom" scope="session" map="${sessionScope.selectiveCallForwardingFrom}" remove="${param.actionVoiceRemoveSelectiveForwarding}"/>
</c:if>






<c:if test="${voiceselected=='screening' && zm:actionSet(param, 'addSelectiveRejection') && !empty sessionScope.selectiveCallRejectionFrom && !empty sessionScope.selectiveCallRejectionFrom[param.phone] && fn:length(sessionScope.selectiveCallRejectionFrom[param.phone]) >= 12}">
    <app:status style="Critical" html="true"><fmt:message key="optionsCallRejectionErrorMax"><fmt:param value="${faqlink}"/></fmt:message></app:status>
    <c:set var="addSelectiveRejection" scope="request" value="${null}"/>
</c:if>


<c:if test="${voiceselected=='screening' && zm:actionSet(param, 'actionVoiceAddSelectiveRejection') && param.selectiveCallRejectionActive}">

	<c:if test="${!empty sessionScope.selectiveCallRejectionFrom}">
	    <zm:phone var="success" displayVar="addNumber" errorVar="errorCode" name="${param.addRejectionNumber}"/>
	    <zm:listObject phone="${param.phone}" map="${sessionScope.selectiveCallRejectionFrom}" strArr="numbers" var="bogus"/>
	    <c:set var="entryTest" value="${fn:replace(addNumber, '1-(', '(')}"/>
	    <c:forEach items="${numbers}" var="number">
		<zm:phone var="success" displayVar="fromNumber" errorVar="errorCode" name="${number}"/>
		<c:set var="collTest" value="${fn:replace(fromNumber, '1-(', '(')}"/>
		<c:if test="${entryTest == collTest}">
		    <c:set var="invalidAddNumber" value="${true}"/>
		</c:if>
	    </c:forEach>
	</c:if>

	    <zm:phone var="bogus" displayVar="thisDisplayNumber" name="${param.phone}"/>
	    <zm:phone var="success" displayVar="displayNumber" errorVar="errorCode" name="${param.addRejectionNumber}"/>
	    <c:choose>
		<c:when test="${invalidAddNumber}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneNotUniqueReject"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${fn:replace(thisDisplayNumber, '1-(', '(') == fn:replace(displayNumber, '1-(', '(')}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIsOwn"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_INTERNATIONAL_NUMBER'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIsInternational"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_BAD_NPA'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneInvalidAreaCode"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_BAD_LINE'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneInvalidExtension"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_EMERGENCY_ASSISTANCE'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIs911"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_DIRECTORY_ASSISTANCE'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIs411"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_BAD_FORMAT'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneInvalid"><fmt:param value="${faqlink}"/></fmt:message></app:status>
		</c:when>
	    
		<c:when test="${success}">
		    <zm:listObject phone="${param.phone}" var="selectiveCallRejectionFrom" scope="session" map="${sessionScope.selectiveCallRejectionFrom}" add="${displayNumber}"/>
		</c:when>
	</c:choose>
</c:if>

<c:if test="${voiceselected=='screening' && zm:actionSet(param, 'actionVoiceRemoveSelectiveRejection') && param.selectiveCallRejectionActive}">
    <zm:listObject phone="${param.phone}" var="selectiveCallRejectionFrom" scope="session" map="${sessionScope.selectiveCallRejectionFrom}" remove="${param.actionVoiceRemoveSelectiveRejection}"/>
</c:if>
