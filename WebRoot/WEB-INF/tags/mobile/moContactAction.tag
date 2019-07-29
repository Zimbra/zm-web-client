<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<zm:requirePost/>
<zm:checkCrumb crumb="${param.crumb}"/>
<zm:getMailbox var="mailbox"/>
<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/>
<c:set var="_selectedIds" scope="request" value=",${ids},"/>
<c:set var="anAction" value="${not empty paramValues.anAction[0] ? paramValues.anAction[0] :  paramValues.anAction[1]}"/>
<c:choose>
    <c:when test="${zm:actionSet(param,'moreActions') && anAction eq 'selectAll'}">
        <c:set var="select" value="all" scope="request"/>
    </c:when>
    <c:when test="${zm:actionSet(param,'moreActions') && anAction eq 'selectNone'}">
        <c:set var="select" value="none" scope="request"/>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionSave')}">
        <zm:modifyContact var="result" id="${param.id}" folderid="${param.folderid}">
            <zm:field name="firstName" value="${param.firstName}"/>
            <zm:field name="lastName" value="${param.lastName}"/>
            <%--<zm:field name="middleName" value="${param.middleName}"/>
            <zm:field name="fileAs" value="${param.fileAs}"/>--%>
            <zm:field name="jobTitle" value="${param.jobTitle}"/>
            <zm:field name="company" value="${param.company}"/>

            <zm:field name="email" value="${param.email}"/>
            <zm:field name="email2" value="${param.email2}"/>
            <zm:field name="email3" value="${param.email3}"/>

            <zm:field name="workStreet" value="${param.workStreet}"/>
            <zm:field name="workCity" value="${param.workCity}"/>
            <zm:field name="workState" value="${param.workState}"/>
            <zm:field name="workPostalCode" value="${param.workPostalCode}"/>
            <zm:field name="workCountry" value="${param.workCountry}"/>
            <zm:field name="workURL" value="${param.workURL}"/>

            <zm:field name="workPhone" value="${param.workPhone}"/>
            <zm:field name="workPhone2" value="${param.workPhone2}"/>
            <%--<zm:field name="workFax" value="${param.workFax}"/>
            <zm:field name="assistantPhone" value="${param.assistantPhone}"/>
            <zm:field name="companyPhone" value="${param.companyPhone}"/>
            <zm:field name="callbackPhone" value="${param.callbackPhone}"/>
--%>
            <zm:field name="homeStreet" value="${param.homeStreet}"/>
            <zm:field name="homeCity" value="${param.homeCity}"/>
            <zm:field name="homeState" value="${param.homeState}"/>
            <zm:field name="homePostalCode" value="${param.homePostalCode}"/>
            <zm:field name="homeCountry" value="${param.homeCountry}"/>
            <zm:field name="homeURL" value="${param.homeURL}"/>

            <zm:field name="homePhone" value="${param.homePhone}"/>
            <zm:field name="homePhone2" value="${param.homePhone2}"/>
            <zm:field name="mobilePhone" value="${param.mobilePhone}"/>

            <zm:field name="fileAs" value="${param.fileAs}" />

            <%--<zm:field name="homeFax" value="${param.homeFax}"/>
            
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
                <zm:field name="fileAs" value="${param.nickname}"/>
                <zm:field name="nickname" value="${param.nickname}"/>
                <zm:field name="dlist" value="${fn:join(paramValues.dlist,', ')}"/>
                <zm:field name="type" value="group"/>
            </c:if>--%>
        </zm:modifyContact>
        <c:if test="${(!empty param.id) and (param.folderid ne param.origFolderId)}">
                <zm:moveContact var="moveresult" id="${param.id}" folderid="${param.folderid}"/>
        </c:if>

        <c:if test="${result!=null}">
            <app:status>
                <fmt:message key="${not empty param.id ? 'contactModified': 'contactCreated'}"/>
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
    <%--<c:when test="${zm:actionSet(param, 'actionSave')}">
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
    </c:when>--%>
    <c:when test="${zm:actionSet(param,'moreActions') && empty anAction && empty param.actionDelete && empty param.actionHardDelete}">
        <mo:status style="Warning"><fmt:message key="actionNoActionSelected"/></mo:status>
    </c:when>
    <c:when test="${(zm:actionSet(param, 'actionDelete') && param.isInTrash eq 'true') || zm:actionSet(param, 'actionHardDelete') || (zm:actionSet(param,'moreActions') && anAction == 'actionHardDelete')}">
    <zm:deleteContact var="result" id="${ids}"/>
    <c:set var="op" value="x" scope="request"/>
    <mo:status>
        <fmt:message key="actionContactHardDeleted">
            <fmt:param value="${result.idCount}"/>
        </fmt:message>
    </mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionDelete') || (zm:actionSet(param,'moreActions') && anAction == 'actionDelete')}">
        <zm:trashContact var="result" id="${ids}"/>
        <c:set var="op" value="x" scope="request"/>
        <mo:status>
            <fmt:message key="actionContactMovedTrash">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'composeTo') || zm:actionSet(param, 'composeCC') || zm:actionSet(param, 'composeBCC')
                            || (zm:actionSet(param,'moreActions') && (anAction == 'composeTo' || anAction == 'composeCC' || anAction == 'composeBCC'))}">
        <c:set var="emailIds" value="" />
        <c:forEach var="id" items="${ids}">
            <zm:getContact var="contact" id="${id}"/>
            <c:choose>
                <c:when test="${contact.isGroup}">
                    <c:forEach var="member" items="${contact.groupMembers}">
                        <c:if test="${not empty emailIds}"><c:set var="grpsep" value=", " /></c:if>
                        <c:set var="memberContact" value="${zm:groupMemberById(contact, member)}"/>
                        <%--check for inline contact--%>
                        <c:choose>
                            <c:when test="${memberContact.isTypeI}">
                                <c:set var="memberContactFullAddress" value="${memberContact.id}"/>
                            </c:when>
                            <c:otherwise>
                                <c:set var="memberContactFullAddress" value="${memberContact.fullAddress}"/>
                            </c:otherwise>
                        </c:choose>
                        <c:set var="emailIds" value="${emailIds}${grpsep}${memberContactFullAddress}" />
                    </c:forEach>
                </c:when>
                <c:otherwise>
                    <c:set var="toEmail" value=""/>
                    <c:set var="homeEmail" value=""/>
                    <c:set var="workEmail" value=""/>
                    <c:if test="${not empty contact.email}">
                        <c:set var="homeEmail" value="${contact.email}"/>
                    </c:if>
                    <c:if test="${not empty contact.workEmail1}">
                        <c:set var="workEmail" value="${contact.workEmail1}"/>
                    </c:if>
                    <c:if test="${not empty contact.email2 and empty homeEmail and empty workEmail}">
                        <c:set var="homeEmail" value="${contact.email2}"/>
                    </c:if>
                    <c:if test="${not empty contact.workEmail2 and empty homeEmail and empty workEmail}">
                        <c:set var="workEmail" value="${contact.workEmail2}"/>
                    </c:if>
                    <c:if test="${not empty contact.email3 and empty homeEmail and empty workEmail}">
                        <c:set var="homeEmail" value="${contact.email3}"/>
                    </c:if>
                    <c:if test="${not empty contact.workEmail3 and empty homeEmail and empty workEmail}">
                        <c:set var="workEmail" value="${contact.workEmail3}"/>
                    </c:if>
                    <c:if test="${not empty homeEmail}">
                         <c:set var="toEmail" value="${homeEmail}${not empty toEmail ? ',' : ''}${not empty toEmail ? toEmail : ''}"/>
                    </c:if>
                    <c:if test="${empty homeEmail and not empty workEmail}">
                         <c:set var="toEmail" value="${workEmail}${not empty toEmail ? ',' : ''}${not empty toEmail ? toEmail : ''}"/>
                    </c:if>
                    <c:set var="mailsep" value="" />
                    <c:if test="${not empty emailIds}">
                        <c:set var="mailsep" value=", " />
                    </c:if>
                    <c:set var="emailIds" value="${emailIds}${mailsep}${toEmail}" />
                </c:otherwise>
            </c:choose>
        </c:forEach>
        <c:choose>
            <c:when test="${zm:actionSet(param, 'composeTo') || (zm:actionSet(param,'moreActions') && anAction == 'composeTo')}">
                <c:redirect url="/m/zmain?st=newmail&to=${emailIds}&ajax=${param.ajax}"/>
            </c:when>
            <c:when test="${zm:actionSet(param, 'composeCC') || (zm:actionSet(param,'moreActions') && anAction == 'composeCC')}">
                <c:redirect url="/m/zmain?st=newmail&cc=${emailIds}&ajax=${param.ajax}"/>
            </c:when>
            <c:when test="${zm:actionSet(param, 'composeBCC') || (zm:actionSet(param,'moreActions') && anAction == 'composeBCC')}">
                <c:redirect url="/m/zmain?st=newmail&bcc=${emailIds}&ajax=${param.ajax}"/>
            </c:when>
        </c:choose>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionFlag') || (zm:actionSet(param,'moreActions') && anAction == 'actionFlag')}">
        <zm:flagContact var="result" id="${ids}" flag="${true}"/>
        <mo:status>
            <fmt:message key="actionContactFlag">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionUnflag') || (zm:actionSet(param,'moreActions') && anAction == 'actionUnflag')}">
        <zm:flagContact var="result" id="${ids}" flag="${false}"/>
        <mo:status>
            <fmt:message key="actionContactUnflag">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionAddTag') || (zm:actionSet(param,'moreActions') && fn:startsWith(anAction,'addTag_'))}">
        <c:set var="tag" value="${param.tagId}"/>
        <c:if test="${tag == null}">
            <c:set var="tag" value="${fn:replace(anAction,'addTag_','')}"/>
        </c:if>
        <zm:tagContact tagid="${tag}" var="result" id="${ids}" tag="${true}"/>
        <mo:status>
            <fmt:message key="actionContactTag">
                <fmt:param value="${result.idCount}"/>
                <fmt:param value="${zm:getTagName(pageContext, tag)}"/>
            </fmt:message>
        </mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionRemoveTag') || (zm:actionSet(param,'moreActions') && fn:startsWith(anAction,'remTag_'))}">
        <c:set var="tag" value="${param.tagRemoveId}"/>
        <c:if test="${tag == null}">
            <c:set var="tag" value="${fn:replace(anAction,'remTag_','')}"/>
        </c:if>
        <zm:tagContact tagid="${tag}" var="result" id="${ids}" tag="${false}"/>
        <mo:status>
            <fmt:message key="actionMessageUntag">
                <fmt:param value="${result.idCount}"/>
                <fmt:param value="${zm:getTagName(pageContext, tag)}"/>
            </fmt:message>
        </mo:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionMove') || zm:actionSet(param,'moreActions')}">
        <c:choose>
            <c:when test="${fn:startsWith(anAction,'moveTo_')}">
            <c:set var="folderId" value="${fn:replace(anAction,'moveTo_','')}"/>
            <zm:moveContact folderid="${folderId}" var="result" id="${ids}"/>
                <mo:status>
                    <fmt:message key="actionContactMoved">
                        <fmt:param value="${result.idCount}"/>
                        <fmt:param value="${zm:getFolderName(pageContext, folderId)}"/>
                    </fmt:message>
                </mo:status>
                <c:set var="op" value="x" scope="request"/>
            </c:when>
            <c:when test="${empty param.folderId}">
                <mo:status style="Warning"><fmt:message key="actionNoFolderSelected"/></mo:status>
            </c:when>
            <c:otherwise>
                <zm:moveContact folderid="${param.folderId}" var="result" id="${ids}"/>
                <mo:status>
                    <fmt:message key="actionContactMoved">
                        <fmt:param value="${result.idCount}"/>
                        <fmt:param value="${zm:getFolderName(pageContext, param.folderId)}"/>
                    </fmt:message>
                </mo:status>
                <c:set var="op" value="x" scope="request"/>
            </c:otherwise>
        </c:choose>
    </c:when>
</c:choose>
