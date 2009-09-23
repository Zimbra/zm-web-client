<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:set var="showMovedTrash" value="${param.action eq 'actionMessageMovedTrash'}"/>
<app:handleError>
	<c:if test="${not showMovedTrash}">
		<zm:requirePost/>
		<zm:checkCrumb crumb="${param.crumb}"/>
		<zm:getMailbox var="mailbox"/>
		<c:set var="ids" value="${zm:deserializeVoiceMailItemIds(paramValues.voiceId, paramValues.phone)}"/>
		<c:set var="phone" value="${fn:join(paramValues.phone, ',')}"/>
		<c:set var="folderId" value="${not empty paramValues.folderId[0] ? paramValues.folderId[0] : paramValues.folderId[1]}"/>
		<c:set var="actionOp" value="${not empty paramValues.actionOp[0] ? paramValues.actionOp[0] :  paramValues.actionOp[1]}"/>
	</c:if>

<c:choose>
	<c:when test="${showMovedTrash}">
		<app:status>	
			<fmt:message key="actionVoiceMailMovedTrash1"/>
		</app:status>
	</c:when>
    <c:when test="${zm:actionSet(param, 'actionDelete')}">
        <zm:trashVoiceMail var="result" phone="${phone}" id="${ids}"/>
        <app:status>
            <fmt:message key="actionVoiceMailMovedTrash">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionUndelete')}">
        <zm:untrashVoiceMail var="result" phone="${phone}" id="${ids}"/>
        <app:status>
            <fmt:message key="actionVoiceMailMovedInbox">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionHardDelete')}">
        <zm:emptyVoiceMailTrash var="result" phone="${phone}" folderId="${folderId}"/>
        <app:status>
			<fmt:message key="folderEmptied">
				<fmt:param><fmt:message key="trash"/></fmt:param>
			</fmt:message>
        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionMarkHeard')}">
        <zm:markVoiceMailHeard var="result" phone="${phone}" id="${ids}" heard="true"/>
        <app:status>
            <fmt:message key="actionVoiceMailMarkedHeard">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>

        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionMarkUnheard')}">
        <zm:markVoiceMailHeard var="result" phone="${phone}" id="${ids}" heard="false"/>
        <app:status>
            <fmt:message key="actionVoiceMailMarkedUnheard">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionAddToForward')}">
	<c:set var="firstAccount" value="true"/>
	<zm:forEachPhoneAccount var="account">
	    <c:set var="selected" value="${(empty phone and firstAccount) or (phone == account.phone.name)}"/>
	    <c:set var="firstAccount" value="false"/>
	    <c:if test="${selected}">
		<app:getCallFeatures account="${account}" var="features"/>
	    </c:if>
	</zm:forEachPhoneAccount>
        
	<%-- Not exactly pretty --%>
	<c:set var="selectiveCallForwardingFrom" value=""/>
	<c:forEach items="${features.selectiveCallForwarding.forwardFrom}" var="number">
	    <c:if test="${!empty selectiveCallForwardingFrom}"><c:set var="selectiveCallForwardingFrom" value="${selectiveCallForwardingFrom},"/></c:if>
	    <c:set var="selectiveCallForwardingFrom" value="${selectiveCallForwardingFrom}${number}"/>
	</c:forEach>

	<c:set var="items" value="${zm:deserializeVoiceMailItemHits(paramValues.voiceId, paramValues.phone)}"/>
	<c:set var="newcount" value="${0}"/>
	<c:set var="errorcount" value="${0}"/>
	<c:set var="alreadycount" value="${0}"/>
	<c:forEach items="${items}" var="item">
	    <c:set var="number" value="${item.caller.name}"/>
	    
	    <zm:phone var="bogus" displayVar="thisDisplayNumber" name="${phone}"/>
	    <zm:phone var="success" displayVar="displayNumber" errorVar="errorCode" name="${number}"/>
	    
	    <c:choose>
		<c:when test="${fn:contains(selectiveCallForwardingFrom, displayNumber)}">
		    <c:set var="alreadycount" value="${alreadycount+1}"/>
		</c:when>
		<c:when test="${!success}">
		    <c:set var="errorcount" value="${errorcount+1}"/>
		</c:when>
		<c:when test="${fn:replace(thisDisplayNumber, '1-(', '(') != fn:replace(displayNumber, '1-(', '(')}">
			<c:if test="${!empty selectiveCallForwardingFrom}"><c:set var="selectiveCallForwardingFrom" value="${selectiveCallForwardingFrom},"/></c:if>
			<c:set var="selectiveCallForwardingFrom" value="${selectiveCallForwardingFrom}${displayNumber}"/>
			<c:set var="newcount" value="${newcount+1}"/>
		</c:when>
	    </c:choose>
	</c:forEach>
	
	<c:if test="${!empty selectiveCallForwardingFrom && newcount>0}">
	    <c:set var="from" value="${fn:split(selectiveCallForwardingFrom, ',')}"/>
	
		<%-- selectivecallforwardingactive="${features.selectiveCallForwarding.isActive && !empty features.selectiveCallForwarding.forwardFrom && !empty features.selectiveCallForwarding.forwardTo}"--%>
	    <zm:modifyCallFeatures var="result" phone="${phone}"
		selectivecallforwardingactive="${true}"
		selectivecallforwardingforwardto="${features.selectiveCallForwarding.forwardTo}"
		selectivecallforwardingforwardfrom="${from}"/>
	</c:if>
	
	
	    <c:choose>
		<c:when test="${result && newcount==1}">
		    <app:status><fmt:message key="actionCallerAddedToForwardSi"/></app:status>
		</c:when>
		<c:when test="${result && newcount>1}">
        	    <app:status><fmt:message key="actionCallerAddedToForwardPl">
        		<fmt:param value="${newcount}"/>
    		    </fmt:message></app:status>
		</c:when>
		<c:when test="${alreadycount>0}">
		    <app:status><fmt:message key="actionCallerAlreadyInForward"/></app:status>
		</c:when>
		<c:otherwise>
		    <app:status style="Error"><fmt:message key="actionCallerAddForwardError"/></app:status>
		</c:otherwise>
	    </c:choose>
	
	
    </c:when>
    
    <c:when test="${zm:actionSet(param, 'actionAddToReject')}">
	<c:set var="firstAccount" value="true"/>
	<zm:forEachPhoneAccount var="account">
	    <c:set var="selected" value="${(empty phone and firstAccount) or (phone == account.phone.name)}"/>
	    <c:set var="firstAccount" value="false"/>
	    <c:if test="${selected}">
		<app:getCallFeatures account="${account}" var="features"/>
	    </c:if>
	</zm:forEachPhoneAccount>
        
	<%-- Not exactly pretty --%>
	<c:set var="selectiveCallRejectionFrom" value=""/>
	<c:forEach items="${features.selectiveCallRejection.rejectFrom}" var="number">
	    <c:if test="${!empty selectiveCallRejectionFrom}"><c:set var="selectiveCallRejectionFrom" value="${selectiveCallRejectionFrom},"/></c:if>
	    <c:set var="selectiveCallRejectionFrom" value="${selectiveCallRejectionFrom}${number}"/>
	</c:forEach>

	<c:set var="items" value="${zm:deserializeVoiceMailItemHits(paramValues.voiceId, paramValues.phone)}"/>
	<c:set var="newcount" value="${0}"/>
	<c:set var="errorcount" value="${0}"/>
	<c:set var="alreadycount" value="${0}"/>
	<c:forEach items="${items}" var="item">
	    <c:set var="number" value="${item.caller.name}"/>
	    
	    <zm:phone var="bogus" displayVar="thisDisplayNumber" name="${phone}"/>
	    <zm:phone var="success" displayVar="displayNumber" errorVar="errorCode" name="${number}"/>
	    
	    <c:choose>
		<c:when test="${fn:contains(selectiveCallForwardingFrom, displayNumber)}">
		    <c:set var="alreadycount" value="${alreadycount+1}"/>
		</c:when>
		<c:when test="${!success}">
		    <c:set var="errorcount" value="${errorcount+1}"/>
		</c:when>
		<c:when test="${fn:replace(thisDisplayNumber, '1-(', '(') != fn:replace(displayNumber, '1-(', '(')  &&  success}">
		    <c:if test="${!empty selectiveCallRejectionFrom}"><c:set var="selectiveCallRejectionFrom" value="${selectiveCallRejectionFrom},"/></c:if>
		    <c:set var="selectiveCallRejectionFrom" value="${selectiveCallRejectionFrom}${displayNumber}"/>
		</c:when>
	    </c:choose>
	</c:forEach>
	
	<c:if test="${!empty selectiveCallRejectionFrom}">
		<%--selectivecallrejectionactive="${features.selectiveCallRejection.isActive && !empty features.selectiveCallRejection.rejectFrom}"--%>
	    <zm:modifyCallFeatures var="result" phone="${phone}"
		selectivecallrejectionactive="${true}"
		selectivecallrejectionrejectfrom="${fn:split(selectiveCallRejectionFrom, ',')}"/>
	</c:if>
	
	    <c:choose>
		<c:when test="${result && newcount==1}">
		    <app:status><fmt:message key="actionCallerAddedToRejectSi"/></app:status>
		</c:when>
		<c:when test="${result && newcount>1}">
        	    <app:status><fmt:message key="actionCallerAddedToRejectPl">
        		<fmt:param value="${newcount}"/>
    		    </fmt:message></app:status>
		</c:when>
		<c:when test="${alreadycount>0}">
		    <app:status><fmt:message key="actionCallerAlreadyInReject"/></app:status>
		</c:when>
		<c:otherwise>
		    <app:status style="Error"><fmt:message key="actionCallerAddRejectError"/></app:status>
		</c:otherwise>
	    </c:choose>
	
    </c:when>
    
	<c:otherwise>
		<app:status style="Warning"><fmt:message key="actionNoActionSelected"/></app:status>
	</c:otherwise>
</c:choose>

</app:handleError>
