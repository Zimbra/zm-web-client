<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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
<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="id" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<c:set var="id" value="${id != null ?id : param.id}"/>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'zmain'}"/>
<zm:currentResultUrl var="closeUrl" value="${context_url}" context="${context}"/>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:getUserAgent var="ua" session="true"/>
    <c:choose>
        <c:when test="${not empty mailbox.prefs.locale}">
            <fmt:setLocale value='${mailbox.prefs.locale}' scope='request'/>
        </c:when>
        <c:otherwise>
            <fmt:setLocale value='${pageContext.request.locale}' scope='request'/>
        </c:otherwise>
    </c:choose>
    <fmt:setBundle basename="/messages/ZhMsg" scope='request'/>
    <fmt:message var="title" key="contact"/>
    <c:choose>
        <c:when test="${!empty id or requestScope.contactId}">
            <zm:getContact var="contact" id="${id}"/>
        </c:when>
        <c:otherwise>
            <c:set var="contact" value="${null}"/>
        </c:otherwise>
    </c:choose>
</mo:handleError>
<fmt:message var="addedit" key="${empty contact ? 'add' : 'edit'}"/>
<c:set var="title" value="${title} : ${addedit}"  scope="request"/>
<c:url var="caction" value="${prevUrl}">
    <c:if test="${param.pid!=null}">
        <c:param name="action" value="view"/>
        <c:param name="id" value="${param.pid}"/>
    </c:if>
</c:url>

<c:if test="${!fn:containsIgnoreCase(caction, '_back=1')}">
<c:url value="${caction}" var="caction">
    <c:param name="_back" value="1"/>
</c:url>
</c:if>
<form action="${currentUrl}" method="post" accept-charset="utf-8" onsubmit="return submitForm(this);">
<input type="hidden" name="doContactAction" value="1"/>
<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
<div class="tb tbl">
    <div class="tr">
        <span class='zo_tb_submit td toolbar'>
                <c:choose>
                    <c:when test="${ua.isiPad == false}">
                        <a id="cancel" href="${caction}"><fmt:message key="cancel"/></a>
                    </c:when>
                    <c:otherwise>
                        <div class="buttonRight button"><a id="cancel" href="${caction}"><span onclick="return zClickLink('cancel')"><fmt:message key="cancel"/></span></a></div>
                    </c:otherwise>
                </c:choose>
                <div class="compose button"><input class="zo_button" name="actionSave" type="submit" value="<fmt:message key="save"/>"></div>
        </span>
    </div>
</div>
<div class="wrap-dcontent" id="wrap-dcontent-view">
<div id="dcontent-view" style="padding-bottom:5px;">
<div class="Stripes cont_view">
<c:if test="${contact!=null}">
    <div class="View header">
            <div class="tbl cont_sum_table">
            <div class="tr">
                <span class="td Person48 aleft">&nbsp;</span>
                <span class="td aleft">
                   <div>
                       <b>${fn:escapeXml(contact.displayFileAs)}</b>
                   </div>
                   <c:if test="${not empty contact.jobTitle}">
                        <div>${fn:escapeXml(contact.jobTitle)}</div>
                   </c:if>
                   <c:if test="${not empty contact.company}">
                        <div>${fn:escapeXml(contact.company)}</div>
                    </c:if>
             </span>
            </div>
            </div>
            <c:if test="${contact.isFlagged || (contact.hasTags && mailbox.features.tagging)}">
            <div class="tbl">
            <div class="tr nr">
                <span class="td">
                <c:if test="${contact.isFlagged}">
                                &nbsp;<mo:img src="startup/ImgFlagRed.gif" alt="flag"/></c:if>
                <c:if test="${contact.hasTags and mailbox.features.tagging}">
                        <c:set var="tags" value="${zm:getTags(pageContext, contact.tagIds)}"/>
                        <c:forEach items="${tags}" var="tag">
                        <span><mo:img src="${tag.miniImage}" alt='${fn:escapeXml(tag.name)}'/>
                                ${fn:escapeXml(tag.name)}</span>
                        </c:forEach>
                </c:if>
                </span>
            </div>
          </div>
          </c:if>
    </div>
</c:if>
<c:if test="${contact==null}">
   <div class="header">
    <div class="sectionLbl contactHeader">
        <fmt:message key="newContact"/>
    </div>
   </div> 
</c:if>
<div class="View  msgBody">
    <div class="tbl">
        <mo:contactEditField label="AB_FIELD_lastName" contact="${contact}" field="lastName" index="0"/>
        <mo:contactEditField label="AB_FIELD_firstName" contact="${contact}" field="firstName"/>
        <mo:contactEditField label="AB_FIELD_jobTitle" contact="${contact}" field="jobTitle"/>
        <mo:contactEditField label="AB_FIELD_company" contact="${contact}" field="company"/>
        <mo:contactEditField label="AB_FIELD_email" contact="${contact}" field="email"/>
        <mo:contactEditField label="AB_FIELD_email2" contact="${contact}" field="email2"/>
        <mo:contactEditField label="AB_FIELD_email3" contact="${contact}" field="email3"/>
        <mo:contactEditField label="AB_FIELD_mobilePhone" contact="${contact}" field="mobilePhone"/>
        <div class="tr nr">
            <span class="td label"><label for="folderSelect"><fmt:message key="addressBookLabel"/></label></span>
            <span class="td value">
                <input type="hidden" name="origFolderId" value="${empty contact ? '': contact.folderId}"/>
                <select name="folderid" id="folderSelect"><c:set var="count" value="${0}"/>
                    <zm:forEachFolder var="folder">
                        <c:if test="${count lt sessionScope.F_LIMIT and folder.isContactCreateTarget}">
                            <option <c:if test="${(empty contact and ((context.selectedId eq folder.id) or param.folderid eq folder.id or (empty context.selectedId and folder.isContacts))) or (!empty contact and contact.folderId eq folder.id)}">selected="selected"</c:if> value="${folder.id}" />
                            ${fn:escapeXml(folder.rootRelativePath)}<c:set var="count" value="${count+1}"/>
                        </c:if>
                    </zm:forEachFolder>
                </select>
            </span>
        </div>
    </div>
    <div class="View">
        <div class="tbl">
            <mo:contactEditField label="AB_FIELD_workPhone" contact="${contact}" field="workPhone" index="0"/>
            <mo:contactEditField label="AB_FIELD_workPhone2" contact="${contact}" field="workPhone2"/>
            <mo:contactEditField label="AB_FIELD_workStreet" contact="${contact}" field="workStreet" address="true"/>
            <mo:contactEditField label="AB_FIELD_workCity" contact="${contact}" field="workCity"/>
            <mo:contactEditField label="AB_FIELD_workState" contact="${contact}" field="workState"/>
            <mo:contactEditField label="AB_FIELD_workPostalCode" contact="${contact}" field="workPostalCode"/>
            <mo:contactEditField label="AB_FIELD_workCountry" contact="${contact}" field="workCountry"/>
            <mo:contactEditField label="AB_FIELD_workURL" contact="${contact}" field="workURL"/>
        </div>
    </div>
    <div class="View">
        <div class="tbl">
            <mo:contactEditField label="AB_FIELD_homePhone" contact="${contact}" field="homePhone" index="0"/>
            <mo:contactEditField label="AB_FIELD_homePhone2" contact="${contact}" field="homePhone2"/>
            <mo:contactEditField label="AB_FIELD_homeStreet" contact="${contact}" field="homeStreet" address="true"/>
            <mo:contactEditField label="AB_FIELD_homeCity" contact="${contact}" field="homeCity"/>
            <mo:contactEditField label="AB_FIELD_homeState" contact="${contact}" field="homeState"/>
            <mo:contactEditField label="AB_FIELD_homePostalCode" contact="${contact}" field="homePostalCode"/>
            <mo:contactEditField label="AB_FIELD_homeCountry" contact="${contact}" field="homeCountry"/>
            <mo:contactEditField label="AB_FIELD_homeURL" contact="${contact}" field="homeURL"/>
        </div>
    </div>
</div>
</div>
</div>
</div>

<c:if test="${ua.isiPad == false}">
<div class="tb tbl">
    <div class="tr">
        <span class='zo_tb_submit td'>
            <a href="${caction}" class="zo_button"><fmt:message key="cancel"/></a> <input class="zo_button" name="actionSave" type="submit" value="<fmt:message key="save"/>">
        </span>
    </div>
</div>
</c:if> 
<input type="hidden" name="id" value="${fn:escapeXml(contact.id)}"/> 
</form>
                                    