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

<c:set var="selectiveCallForwardingActive" scope="request" value="${param.selectiveCallForwardingActive=='TRUE' ? 'TRUE':'FALSE'}"/>
<c:set var="callForwardingActive" scope="request" value="${param.callForwardingActive=='TRUE' ? 'TRUE':'FALSE'}"/>
<c:set var="addSelectiveForwarding" scope="request" value="${param.addSelectiveForwarding}"/>

<c:set var="anonymousCallRejectionActive" scope="request" value="${param.anonymousCallRejectionActive=='TRUE' ? 'TRUE':'FALSE'}"/>
<c:set var="selectiveCallRejectionActive" scope="request" value="${param.selectiveCallRejectionActive=='TRUE' ? 'TRUE':'FALSE'}"/>
<c:set var="addSelectiveRejection" scope="request" value="${param.addSelectiveRejection}"/>


<c:if test="${zm:actionSet(param, 'actionSave')}">
    <c:choose>

        <c:when test="${voiceselected=='notification' && param.emailNotificationActive && empty sessionScope.emailNotificationAddress}">
            <app:status style="Critical"><fmt:message key="missingEmailAddress"/></app:status>
            <c:set var="emailNotificationAddress" scope="request" value=""/>
            <c:set var="emailNotificationActive" scope="request" value="FALSE"/>
        </c:when>

        <c:when test="${voiceselected=='notification' && param.emailNotificationActive && !zm:isValidEmailAddress(sessionScope.emailNotificationAddress)}">
            <app:status style="Critical"><fmt:message key="invalidEmailAddress"/></app:status>
            <c:set var="emailNotificationAddress" scope="request" value="${sessionScope.emailNotificationAddress}"/>
            <c:set var="emailNotificationActive" scope="request" value="FALSE"/>
        </c:when>

        <c:when test="${voiceselected=='forwarding' && param.callForwardingAllActive && !zm:isValidPhoneNumber(param.callForwardingAllNumber)}">
            <app:status style="Critical"><fmt:message key="invalidForwardNumber"/></app:status>
            <c:set var="badCallForwardingAll" scope="request" value="${param.callForwardingAllNumber}"/>
	</c:when>

	<c:when test="${voiceselected=='forwarding' && param.selectiveCallForwardingActive && !zm:isValidPhoneNumber(param.selectiveCallForwardingTo)}">
	    <app:status style="Critical"><fmt:message key="invalidForwardNumber"/></app:status>
	    <c:set var="selectiveCallForwardingActive" scope="request" value="FALSE"/>
	    <c:set var="badSelectiveCallForwardingTo" scope="request" value="${true}"/>
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
                        numberPerPage="${param.numberPerPage}"
                    />
                    <%-- userLocale="${param.userLocale}" --%>
                </c:when>
		
                <c:when test="${voiceselected=='notification'}">	
                    <zm:modifyCallFeatures var="result" phone="${param.phone}"
                        emailnotificationactive="${param.emailNotificationActive}" emailnotificationaddress="${sessionScope.emailNotificationAddress}"
                    />
                </c:when>
		
                <c:when test="${voiceselected=='forwarding'}">	

		    <c:if test="${!param.selectiveCallForwardingActive && !zm:isValidPhoneNumber(param.selectiveCallForwardingTo)}">
			<c:set var="selectiveCallForwardingActive" scope="request" value="FALSE"/>
			<c:set var="badSelectiveCallForwardingTo" scope="request" value="${true}"/>
		    </c:if>

                    <zm:modifyCallFeatures var="result" phone="${param.phone}"
                        callforwardingactive="${param.callForwardingActive}" callforwardingforwardto="${param.callForwardingTo}"
                        selectivecallforwardingactive="${param.selectiveCallForwardingActive}" selectivecallforwardingforwardto="${param.selectiveCallForwardingTo}" selectivecallforwardingforwardfrom="${fn:split(sessionScope.selectiveCallForwardingFrom, ',')}"
                    />
                    <c:set var="selectiveCallForwardingFrom" scope="session" value="${null}"/>
                    <c:set var="selectiveCallForwardingFetched" scope="session" value="${false}"/>
                </c:when>
		
                <c:when test="${voiceselected=='screening'}">	
                    <zm:modifyCallFeatures var="result" phone="${param.phone}"
                        anonymouscallrejectionactive="${param.anonymousCallRejectionActive}"
                        selectivecallrejectionactive="${param.selectiveCallRejectionActive}" selectivecallrejectionrejectfrom="${fn:split(sessionScope.selectiveCallRejectionFrom, ',')}"
                    />
                </c:when>
            </c:choose>
			
            <c:choose>
                <c:when test="${voiceselected=='notification' && !param.emailNotificationActive && zm:isValidEmailAddress(sessionScope.emailNotificationAddress)}">
                    <app:status><fmt:message key="lostEmailNotification"/></app:status>
                </c:when>

                <c:when test="${result}">
                    <app:status><fmt:message key="optionsSaved"/></app:status>
                </c:when>

                <c:otherwise>
                    <app:status><fmt:message key="noOptionsChanged"/></app:status>
                </c:otherwise>
            </c:choose>
        </c:otherwise>
    </c:choose>
</c:if>


<c:if test="${voiceselected=='notification' && zm:actionSet(param, 'actionVoiceAddNotification')}">
    <c:if test="${fn:indexOf(sessionScope.emailNotificationAddress, param.emailNotificationAddAddress)==-1}">
	<c:choose>
	    <c:when test="${fn:length(fn:split(sessionScope.emailNotificationAddress, ','))>=25}">
		<app:status style="Critical"><fmt:message key="optionsVoiceNotificationsErrorMax"/></app:status>
	    </c:when>
	    <c:when test="${fn:length(param.emailNotificationAddAddress)>100 || fn:indexOf(param.emailNotificationAddAddress, '@')==-1}">
		<app:status style="Critical"><fmt:message key="optionsVoiceNotificationsErrorInvalid"/></app:status>
	    </c:when>	    
	    <c:otherwise>
		<c:set var="emailNotificationAddress" scope="session" value="${sessionScope.emailNotificationAddress},${param.emailNotificationAddAddress}"/>
	    </c:otherwise>
	</c:choose>
    </c:if>
</c:if>

<c:if test="${voiceselected=='notification' && zm:actionSet(param, 'actionVoiceRemoveNotification')}">
    <c:set var="tmp" value=""/>
    <c:forEach items="${sessionScope.emailNotificationAddress}" var="email">
	<c:if test="${fn:trim(email) != fn:trim(param.actionVoiceRemoveNotification)}">
	    <c:if test="${!empty tmp}">
	    <c:set var="tmp" value="${tmp},"/>
	    </c:if>
	    <c:set var="tmp" value="${tmp}${email}"/>
	</c:if>
    </c:forEach>
    <c:set var="emailNotificationAddress" scope="session" value="${tmp}"/>
</c:if>


<c:if test="${voiceselected=='forwarding' && zm:actionSet(param, 'addSelectiveForwarding') && !empty sessionScope.selectiveCallForwardingFrom && fn:length(fn:split(sessionScope.selectiveCallForwardingFrom, ',')) >= 12}">
	<app:status style="Critical"><fmt:message key="optionsCallForwardingErrorMax"/></app:status>
	<c:set var="addSelectiveForwarding" scope="request" value="${null}"/>
</c:if>

<c:if test="${voiceselected=='forwarding' && (zm:actionSet(param, 'actionVoiceAddSelectiveForwarding') || zm:actionSet(param, 'actionSave'))}">
    	<c:set var="useFrom" value="${zm:actionSet(param, 'actionVoiceAddSelectiveForwarding')}"/>

	<fmt:message var="faqlink" key="errorPhoneFAQLink"/>
	<fmt:message var="faqurl" key="errorPhoneFAQURL"/>
	<c:set var="faqlink" value="&nbsp;${fn:replace(faqlink, '{1}', faqurl)}"/>
	
	<zm:phone var="bogus" displayVar="thisDisplayNumber" name="${param.phone}"/>
	<zm:phone var="success" displayVar="displayNumber" errorVar="errorCode" name="${useFrom ? param.addForwardingNumber : param.selectiveCallForwardingTo}"/>

	<c:set var="collTest" value=",${fn:replace(sessionScope.selectiveCallForwardingFrom, '1-(', '(')},"/>
	<c:set var="entryTest" value=",${fn:replace(displayNumber, '1-(', '(')},"/>

	<c:choose>
		<c:when test="${useFrom && fn:indexOf(collTest, entryTest)!=-1}">
		    <app:status style="Critical"><fmt:message key="errorPhoneNotUnique"/></app:status>
		</c:when>
	    
		<c:when test="${fn:replace(thisDisplayNumber, '1-(', '(') == fn:replace(displayNumber, '1-(', '(')}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIsOwn"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_INTERNATIONAL_NUMBER'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIsInternational"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_BAD_NPA'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneInvalidAreaCode"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_BAD_LINE'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneInvalidExtension"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_EMERGENCY_ASSISTANCE'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIs911"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_DIRECTORY_ASSISTANCE'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIs411"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_BAD_FORMAT'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneInvalid"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${useFrom && success}">
		    <c:set var="selectiveCallForwardingFrom" scope="session" value="${sessionScope.selectiveCallForwardingFrom},${displayNumber}"/>
		</c:when>
	</c:choose>
</c:if>

<c:if test="${voiceselected=='forwarding' && zm:actionSet(param, 'actionVoiceRemoveSelectiveForwarding')}">
    <c:set var="tmp" value=""/>
    <c:forEach items="${sessionScope.selectiveCallForwardingFrom}" var="number">
	<c:if test="${fn:trim(number) != fn:trim(param.actionVoiceRemoveSelectiveForwarding)}">
	    <c:if test="${!empty tmp}">
	    <c:set var="tmp" value="${tmp},"/>
	    </c:if>
	    <c:set var="tmp" value="${tmp}${number}"/>
	</c:if>
    </c:forEach>
    <c:set var="selectiveCallForwardingFrom" scope="session" value="${tmp}"/>
</c:if>

<c:if test="${voiceselected=='screening' && zm:actionSet(param, 'addSelectiveRejection') && (!empty sessionScope.selectiveRejectionNumber) && fn:length(fn:split(sessionScope.selectiveRejectionNumber,',')) >= 12}">
    <app:status style="Critical"><fmt:message key="optionsCallRejectionErrorMax"/></app:status>
    <c:set var="addSelectiveRejection" scope="request" value="${null}"/>
</c:if>

<c:if test="${voiceselected=='screening' && zm:actionSet(param, 'actionVoiceAddSelectiveRejection')}">
    
        <fmt:message var="faqlink" key="errorPhoneFAQLink"/>
        <fmt:message var="faqurl" key="errorPhoneFAQURL"/>    
        <c:set var="faqlink" value="&nbsp;${fn:replace(faqlink, '{1}', faqurl)}"/>
	
	<zm:phone var="bogus" displayVar="thisDisplayNumber" name="${param.phone}"/>
	<zm:phone var="success" displayVar="displayNumber" errorVar="errorCode" name="${param.addRejectionNumber}"/>

	<c:set var="collTest" value=",${fn:replace(sessionScope.selectiveRejectionNumber, '1-(', '(')},"/>
	<c:set var="entryTest" value=",${fn:replace(displayNumber, '1-(', '(')},"/>

	<c:choose>
		<c:when test="${fn:indexOf(collTest, entryTest)!=-1}">
		    <app:status style="Critical"><fmt:message key="errorPhoneNotUnique"/></app:status>
		</c:when>
	    
		<c:when test="${fn:replace(thisDisplayNumber, '1-(', '(') == fn:replace(displayNumber, '1-(', '(')}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIsOwn"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_INTERNATIONAL_NUMBER'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIsInternational"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_BAD_NPA'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneInvalidAreaCode"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_BAD_LINE'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneInvalidExtension"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_EMERGENCY_ASSISTANCE'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIs911"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_DIRECTORY_ASSISTANCE'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneIs411"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${errorCode == 'voice.INVALID_PHNUM_BAD_FORMAT'}">
		    <app:status style="Critical" html="true"><fmt:message key="errorPhoneInvalid"/> ${faqlink}</app:status>
		</c:when>
	    
		<c:when test="${success}">
		    <c:set var="selectiveRejectionNumber" scope="session" value="${sessionScope.selectiveRejectionNumber},${displayNumber}"/>
		</c:when>
	</c:choose>
</c:if>

<c:if test="${voiceselected=='screening' && zm:actionSet(param, 'actionVoiceRemoveSelectiveRejection')}">
    <c:set var="tmp" value=""/>
    <c:forEach items="${sessionScope.selectiveRejectionNumber}" var="number">
	<c:if test="${fn:trim(number) != fn:trim(param.actionVoiceRemoveSelectiveRejection)}">
	    <c:if test="${!empty tmp}">
	    <c:set var="tmp" value="${tmp},"/>
	    </c:if>
	    <c:set var="tmp" value="${tmp}${number}"/>
	</c:if>
    </c:forEach>
    <c:set var="selectiveRejectionNumber" scope="session" value="${tmp}"/>
</c:if>
