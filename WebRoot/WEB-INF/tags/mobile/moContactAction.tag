<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<zm:requirePost/>
<zm:checkCrumb crumb="${param.crumb}"/>
<zm:getMailbox var="mailbox"/>
<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/>
<c:set var="actionOp" value="${not empty paramValues.actionOp[0] ? paramValues.actionOp[0] :  paramValues.actionOp[1]}"/>
<c:choose>
    <c:when test="${zm:actionSet(param, 'actionAdd')}">
        <zm:createContact var="result">
            <zm:field name="firstName" value="${param.firstName}"/>
            <zm:field name="lastName" value="${param.lastName}"/>
            <zm:field name="email" value="${param.email}"/>
            <zm:field name="mobilePhone" value="${param.mobilePhone}"/>
        </zm:createContact>
        <c:if test="${result!=null}">
            <app:status>
                <fmt:message key="contactCreated"/>
            </app:status>
            <c:set var="currentContactId" value="${result}" scope="request"/>
        </c:if>
        <c:if test="${result==null}">
             <c:set var="contactAddError" scope="request"/>
        </c:if>
    </c:when>
    <c:when test="${empty ids}">
        <mo:status style="Warning"><fmt:message key="actionNoContactSelected"/></mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionSave')}">
        <zm:modifyContact var="result" id="${param.id}">
            <zm:field name="firstName" value="${param.firstName}"/>
            <zm:field name="lastName" value="${param.lastName}"/>
            <zm:field name="email" value="${param.email}"/>
            <zm:field name="mobilePhone" value="${param.mobilePhone}"/>
        </zm:modifyContact>
        <c:if test="${result!=null}">
            <app:status>
                <fmt:message key="contactModified"/>
            </app:status>
            <c:set var="currentContactId" value="${result}" scope="request"/>
        </c:if>
        <c:if test="${result==null}">
             <c:set var="currentContactId" value="${result}" scope="request"/>
        </c:if>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionDelete')}">
        <zm:trashContact var="result" id="${ids}"/>
        <mo:status>
            <fmt:message key="actionContactMovedTrash">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </mo:status>
    </c:when>
</c:choose>
