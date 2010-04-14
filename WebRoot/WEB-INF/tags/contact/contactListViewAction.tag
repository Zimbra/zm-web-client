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
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
<zm:getMailbox var="mailbox"/>

<c:set var="ids" value="${fn:join(paramValues.id, ',')}"/>
<c:if test="${param.st eq 'gal'}">                  <%-- gal contact id contains , so will replace the id's , with | to avoid the conflict with delimiter , used for forEach--%>
    <c:set var="paraids" value="${fn:join(paramValues.id, '#')}"/>
    <c:set var="paraids" value="${fn:replace(paraids, ',','|')}"/>
    <c:set var="ids" value="${fn:replace(paraids, '#',',')}"/>
</c:if>
<c:set var="folderId" value="${not empty paramValues.folderId[0] ? paramValues.folderId[0] : paramValues.folderId[1]}"/>
<c:set var="actionOp" value="${not empty paramValues.actionOp[0] ? paramValues.actionOp[0] :  paramValues.actionOp[1]}"/>
<c:set var="searchQuery" value="${not empty paramValues.contactsq[0] ? paramValues.contactsq[0] :  paramValues.contactsq[1]}"/>
<c:set var="contactError" value="${false}"/>

<c:choose>
   <c:when test="${ (zm:actionSet(param, 'actionCreate') or zm:actionSet(param, 'actionModify')) and (param.isgroup and empty fn:trim(param.nickname))}">
       <c:set var="contactError" value="true"/>
        <app:status>
            <fmt:message key="noContactGroupName"/>
        </app:status>
    </c:when>
    <c:when test="${ (zm:actionSet(param, 'actionCreate') or zm:actionSet(param, 'actionModify')) and (param.isgroup and empty fn:trim(param.dlist))}">
        <c:set var="contactError" value="true"/>
        <app:status>
            <fmt:message key="noContactGroupMembers"/>
        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionSearch')}">
        <c:redirect url="/h/search?st=${not empty param.st ? param.st : 'contact' }&search=Search"> <%-- st can be gal for gal search --%>
            <c:param name="sq" value="${fn:escapeXml(searchQuery)}"/>
        </c:redirect>
    </c:when>
</c:choose>

<c:choose>
    <c:when test="${zm:actionSet(param, 'actionEmpty') and (param.contextFolderId eq mailbox.trash.id) and (param.confirmed ne '1')}">
        <zm:checkCrumb crumb="${param.crumb}"/>
        <app:status html="true" block="true">
            <fmt:message key="confirmEmptyTrashFolder">
                <fmt:param value="<form style='padding:0px;margin:0px;' action='?doContactListViewAction=1&actionEmpty=true&${pageContext.request.queryString}' method='post'><input type='hidden' name='confirmed' value='1'/><input type='hidden' name='crumb' value='${fn:escapeXml(mailbox.accountInfo.crumb)}'/><input type='hidden' name='contextFolderId' value='${param.contextFolderId}'/>"/>
                <fmt:param value="<input type='submit' value='yes'>"/>
                <fmt:param value="</form>"/>
            </fmt:message>
        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionEmpty') and (param.confirmed eq '1') and (param.contextFolderId eq mailbox.trash.id or param.contextFolderId eq mailbox.spam.id)}">
        <zm:checkCrumb crumb="${param.crumb}"/>
        <zm:emptyFolder id="${param.contextFolderId}"/>
        <app:status>
            <fmt:message key="folderEmptied">
                <fmt:param value="${zm:getFolderName(pageContext, param.contextFolderId)}"/>
            </fmt:message>
        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionCreate') and not contactError}">
        <zm:checkCrumb crumb="${param.crumb}"/>
        <app:editContactAction id="${param.id}"/>
        <app:status><fmt:message key="${not empty param.dlist and param.isgroup ? 'contactGroupCreated' :'contactCreated'}"/></app:status>
        <zm:clearSearchCache type="contact"/>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionModify') and not contactError}">
        <zm:checkCrumb crumb="${param.crumb}"/>
        <app:editContactAction id="${param.id}"/>
        <app:status><fmt:message key="${not empty param.dlist and param.isgroup ? 'contactGroupModified' :'contactModified'}"/></app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionCancelCreate')}">
        <app:status style="Warning"><fmt:message key="contactCancelCreate"/></app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionCancelModify')}">
        <app:status style="Warning"><fmt:message key="contactCancelModify"/></app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionNew') or param.action eq 'newcontact'}">
        <jsp:forward page="/h/econtact"/>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionNewGroup') or param.action eq 'newcontactgroup'}">
        <jsp:forward page="/h/egroup"/>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionEdit')}">
        <jsp:forward page="/h/econtact"/>
    </c:when>
    <c:when test="${empty ids}">
        <app:status style="Warning"><fmt:message key="actionNoContactSelected"/></app:status>
    </c:when>
    <c:otherwise>
        <zm:checkCrumb crumb="${param.crumb}"/>
        <c:choose>
            <c:when test="${zm:actionSet(param, 'actionDelete')}">
                <zm:requirePost/>
                <c:choose>
                    <c:when test="${zm:getIsMyCard(pageContext, ids)}">
                        <app:status style="Critical">
                            <fmt:message key="errorMyCardDelete"/>
                        </app:status>
                    </c:when>
                    <c:otherwise>
                        <zm:trashContact  var="result" id="${ids}"/>
                        <app:status>
                            <fmt:message key="actionContactMovedTrash">
                                <fmt:param value="${result.idCount}"/>
                            </fmt:message>
                        </app:status>
                    </c:otherwise>
                </c:choose>
            </c:when>
            <c:when test="${zm:actionSet(param, 'actionHardDelete')}">
                <zm:requirePost/>
                <c:choose>
                    <c:when test="${zm:getIsMyCard(pageContext, ids)}">
                        <app:status style="Critical">
                            <fmt:message key="errorMyCardDelete"/>
                        </app:status>
                    </c:when>
                    <c:otherwise>
                        <zm:deleteContact  var="result" id="${ids}"/>
                        <app:status>
                            <fmt:message key="actionContactHardDeleted">
                                <fmt:param value="${result.idCount}"/>
                            </fmt:message>
                        </app:status>
                    </c:otherwise>
                </c:choose>
            </c:when>
            <c:when test="${zm:actionSet(param, 'actionCompose')}">
                <c:set var="contactIds" value="" />
                <c:forEach items="${ids}" var="id">
                    <c:if test="${not empty contactIds}"><c:set var="sep" value=", " /></c:if>
                     <c:choose>
                        <c:when test="${param.st eq 'contact'}"><zm:getContact id="${id}" var="contact"/></c:when>
                        <c:when test="${param.st eq 'gal'}">
                            <zm:searchGal var="result" query="${empty param.email ? '*' : param.email}"/>      <%--!TODO optiomizartion needed--%>
                            <c:forEach items="${result.contacts}" var="acontact">
                                <c:if test="${fn:replace(acontact.id,',','|') eq id}">
                                    <c:set var="contact" value="${acontact}"/>
                                </c:if>
                            </c:forEach>
                        </c:when>
                    </c:choose>
                    <c:choose>
                        <c:when test="${contact.isGroup}">
                            <c:set var="emailIds" value="" />
                            <c:forEach var="member" items="${contact.groupMembers}">
                                <c:if test="${not empty emailIds}"><c:set var="grpsep" value=", " /></c:if>
                                <c:set var="emailIds" value="${emailIds}${grpsep}${member}" /> 
                                </tr>
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
                            <c:set var="emailIds" value="${toEmail}" />
                        </c:otherwise>
                    </c:choose>
                    <c:set var="contactIds" value="${contactIds}${sep}${emailIds}" />
                </c:forEach>
                <c:redirect url="/h/search?action=compose&to=${contactIds}" />
            </c:when>
            <c:when test="${fn:startsWith(actionOp, 't:') or fn:startsWith(actionOp, 'u:')}">
                <c:set var="untagall" value="${fn:startsWith(actionOp, 'u:all')}"/>
                <c:choose>
                    <c:when test="${untagall}" >
                        <zm:forEachTag var="eachtag">
                            <zm:tagContact tagid="${eachtag.id}" var="result" id="${ids}" tag="false"/>
                        </zm:forEachTag>
                        <app:status>
                            <fmt:message key="${'actionContactUntagAll'}">
                                <fmt:param value="${result.idCount}"/>
                            </fmt:message>
                        </app:status>
                    </c:when>
                    <c:otherwise>
                <c:set var="tag" value="${fn:startsWith(actionOp, 't')}"/>
                <c:set var="tagid" value="${fn:substring(actionOp, 2, -1)}"/>
                <zm:tagContact tagid="${tagid}"var="result" id="${ids}" tag="${tag}"/>
                <app:status>
                    <fmt:message key="${tag ? 'actionContactTag' : 'actionContactUntag'}">
                        <fmt:param value="${result.idCount}"/>
                        <fmt:param value="${zm:getTagName(pageContext, tagid)}"/>
                    </fmt:message>
                </app:status>
                   </c:otherwise>
                </c:choose>
            </c:when>
            <c:when test="${fn:startsWith(folderId, 'm:')}">
                <c:choose>
                    <c:when test="${zm:getIsMyCard(pageContext, ids)}">
                        <app:status style="Critical">
                            <fmt:message key="errorMyCardMove"/>
                        </app:status>
                    </c:when>
                    <c:otherwise>
                        <c:set var="folderid" value="${fn:substring(folderId, 2, -1)}"/>
                        <zm:moveContact folderid="${folderid}"var="result" id="${ids}"/>
                        <app:status>
                            <fmt:message key="actionContactMoved">
                                <fmt:param value="${result.idCount}"/>
                                <fmt:param value="${zm:getFolderName(pageContext, folderid)}"/>
                            </fmt:message>
                        </app:status>
                    </c:otherwise>
                </c:choose>
            </c:when>
            <c:when test="${zm:actionSet(param, 'actionMove')}">
                <app:status style="Warning"><fmt:message key="actionNoFolderSelected"/></app:status>
            </c:when>
            <c:otherwise>
                <app:status style="Warning"><fmt:message key="actionNoActionSelected"/></app:status>
            </c:otherwise>
        </c:choose>
    </c:otherwise>
</c:choose>
</app:handleError>
