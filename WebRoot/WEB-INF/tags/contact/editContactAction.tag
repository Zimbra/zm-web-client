<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
<%@ tag body-content="empty" %>
<%@ attribute name="id" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:if test="${(!empty id) and (param.folderid ne param.origFolderId)}">
    <zm:moveContact var="result" id="${id}" folderid="${param.folderid}"/>
</c:if>

<zm:modifyContact var="id" id="${id}" replace="true" folderid="${param.folderid}">
    <zm:field name="firstName" value="${param.firstName}"/>
    <zm:field name="phoneticFirstName" value="${param.phoneticFirstName}"/>
    <zm:field name="lastName" value="${param.lastName}"/>
    <zm:field name="phoneticLastName" value="${param.phoneticLastName}"/>
    <zm:field name="middleName" value="${param.middleName}"/>
    <zm:field name="fileAs" value="${param.fileAs}"/>
    <zm:field name="jobTitle" value="${param.jobTitle}"/>
    <zm:field name="company" value="${param.company}"/>
    <zm:field name="phoneticCompany" value="${param.phoneticCompany}"/>

    <zm:field name="email" value="${fn:replace(param.email,'\"','')}"/>
    <zm:field name="email2" value="${fn:replace(param.email2,'\"','')}"/>
    <zm:field name="email3" value="${fn:replace(param.email3,'\"','')}"/>

    <zm:field name="workStreet" value="${param.workStreet}"/>
    <zm:field name="workCity" value="${param.workCity}"/>
    <zm:field name="workState" value="${param.workState}"/>
    <zm:field name="workPostalCode" value="${param.workPostalCode}"/>
    <zm:field name="workCountry" value="${param.workCountry}"/>
    <zm:field name="workURL" value="${param.workURL}"/>

    <zm:field name="workPhone" value="${param.workPhone}"/>
    <zm:field name="workPhone2" value="${param.workPhone2}"/>
    <zm:field name="workFax" value="${param.workFax}"/>
    <zm:field name="assistantPhone" value="${param.assistantPhone}"/>
    <zm:field name="companyPhone" value="${param.companyPhone}"/>
    <zm:field name="callbackPhone" value="${param.callbackPhone}"/>

    <zm:field name="homeStreet" value="${param.homeStreet}"/>
    <zm:field name="homeCity" value="${param.homeCity}"/>
    <zm:field name="homeState" value="${param.homeState}"/>
    <zm:field name="homePostalCode" value="${param.homePostalCode}"/>
    <zm:field name="homeCountry" value="${param.homeCountry}"/>
    <zm:field name="homeURL" value="${param.homeURL}"/>

    <zm:field name="homePhone" value="${param.homePhone}"/>
    <zm:field name="homePhone2" value="${param.homePhone2}"/>
    <zm:field name="homeFax" value="${param.homeFax}"/>
    <zm:field name="mobilePhone" value="${param.mobilePhone}"/>
    <zm:field name="pager" value="${param.pager}"/>
    <zm:field name="carPhone" value="${param.carPhone}"/>
    <zm:field name="tollFree" value="${param.tollFree}"/>

    <zm:field name="otherStreet" value="${param.otherStreet}"/>
    <zm:field name="otherCity" value="${param.otherCity}"/>
    <zm:field name="otherState" value="${param.otherState}"/>
    <zm:field name="otherPostalCode" value="${param.otherPostalCode}"/>
    <zm:field name="otherCountry" value="${param.otherCountry}"/>
    <zm:field name="otherURL" value="${param.otherURL}"/>

    <zm:field name="otherPhone" value="${param.otherPhone}"/>
    <zm:field name="otherFax" value="${param.otherFax}"/>
    <zm:field name="notes" value="${param.notes}"/>

    <c:if test="${not empty param.dlist and param.isgroup}">
        <zm:field name="fileAs" value="8:${param.nickname}"/>
        <zm:field name="nickname" value="${param.nickname}"/>
        <zm:field name="dlist" value="${fn:join(paramValues.dlist,', ')}"/>
        <zm:field name="type" value="group"/>
    </c:if>
    
</zm:modifyContact>
