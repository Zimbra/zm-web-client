<%@ tag body-content="empty" %>
<%@ attribute name="account" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZPhoneAccountBean" %>
<%@ attribute name="var" rtexprvalue="false" required="true" type="java.lang.String" %>
<%@ variable name-from-attribute="var" alias='outputVar' scope="AT_BEGIN" variable-class="com.zimbra.cs.taglib.bean.ZCallFeaturesBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:choose>
    <c:when test="${param.haveForwardFromList and !zm:actionSet(param, 'actionSave')}">
        <zm:createCallFeatures var="newFeatures" phone="${param.phone}"
            emailnotificationactive="${param.emailNotificationActive}" emailnotificationaddress="${param.emailNotificationAddress}"
            callforwardingactive="${param.callForwardingAllActive}" callforwardingforwardto="${param.callForwardingAllNumber}"
            selectivecallforwardingactive="${param.selectiveCallForwardingActive}" selectivecallforwardingforwardto="${param.selectiveCallForwardingNumber}"
            selectivecallforwardingforwardfrom="${paramValues.forwardNumbers}" numberPerPage="${param.numberPerPage}"
        />
        <c:set var="outputVar" value="${newFeatures}"/>
    </c:when>
    <c:otherwise>
        <c:set var="outputVar" value="${account.callFeatures}"/>
    </c:otherwise>
</c:choose>

