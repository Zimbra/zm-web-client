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
<%@ tag body-content="scriptless" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:catch var="actionException">
    <jsp:doBody/>
</c:catch>
<c:if test="${!empty actionException}">
    <zm:getException var="error" exception="${actionException}"/>
    <c:choose>
        <c:when test="${error.code eq 'ztaglib.SERVER_REDIRECT'}">
            <c:redirect url="${not empty requestScope.SERVIER_REDIRECT_URL ? requestScope.SERVIER_REDIRECT_URL : '/'}"/>
        </c:when>
        <c:when test="${error.code eq 'service.AUTH_EXPIRED' or error.code eq 'service.AUTH_REQUIRED'}">
            <c:choose>
                <c:when test="${not empty (paramValues.ajax[0]||param.ajax)}">
                    <script type="text/javascript">
                        var logouturl = "<c:url value="/?loginOp=relogin&client=mobile&loginErrorCode=${error.code}"/>";
                        window.location.href = logouturl;
                    </script>
                </c:when>
                <c:otherwise>
                    <c:redirect url="/?loginOp=relogin&client=mobile&loginErrorCode=${error.code}"/>
                </c:otherwise>
            </c:choose>
        </c:when>
        <c:otherwise>
            <mo:status style="Critical">
                <fmt:message key="${error.code}"/>
            </mo:status>
            <!-- ${fn:escapeXml(error.id)} -->
        </c:otherwise>
    </c:choose>
</c:if>
