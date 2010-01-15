<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
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
            selectivecallforwardingforwardfrom="${paramValues.forwardNumbers}"
        />
        <c:set var="outputVar" value="${newFeatures}"/>
    </c:when>
    <c:otherwise>
        <c:set var="outputVar" value="${account.callFeatures}"/>
    </c:otherwise>
</c:choose>

