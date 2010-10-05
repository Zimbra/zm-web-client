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
<%@ tag body-content="empty" %>
<%@ attribute name="rule" rtexprvalue="true" required="true" type="com.zimbra.cs.zclient.ZFilterRule" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%--

param values:

origname      = original rule name (to detect name changes)
rulename      = current name
ruleactive    = active (true, false)
alloff        = all|any
frompost      = 1 if we should compute the rule from post values

cond0-condN   = condition type (i.e., cond0 == addressbook

condN_op/condN_header               type addressbook
condN_op/condN_value                type size
condN_op/condN_value                type body
condN_op/condN_value                type date
condN_op/condN_value/condN_header   type header
condN_op/condN_header               type headerexists
condN_op                            type attachment

condN_remove                        remove this condition

actionNewCond                       add new condition
cond_add                            condition to add (from/to/cc/subject/header/headerexists/size/date/body/attachment/addressbook

cond_count                          number of conditions

action0-actionN   = action type (i.e., rule0 == keep)

                                    type stop
                                    type keep
                                    type discard
actionN_arg                         type fileinto
actionN_arg                         type tag
actionN_arg                         type mark (READ, FLAGGED)
actionN_arg                         type redirect

action_remove                       remove this action

actionNewAction                     add new action
action_add                          action to add (keep/discard/fileinto/tag/mark/redirect)

action_count                        number of actions (includes stop)
action_stop                         stop checkbox (true)     

--%>
<input type="hidden" name="origname" value="${not empty param.origname ? fn:escapeXml(param.origname) : fn:escapeXml(rule.name) }"/>
<input type="hidden" name="frompost" value="1"/>

<table cellspacing=3 cellpadding=3>
    <tr>
        <td valign='center'><fmt:message key="filterName"/> :</td>
        <td>
            <c:choose>
                <c:when test="${not empty param.rulename}">
                    <c:set var="rulename" value="${param.rulename}"/>
                </c:when>
                <c:when test="${empty rule}">
                    <c:set var="rulename" value=""/>
                </c:when>
                <c:otherwise>
                    <c:set var="rulename" value="${rule.name}"/>
                </c:otherwise>
            </c:choose>
            <input name='rulename' type='text' autocomplete='off' size='20' value="${fn:escapeXml(rulename)}">
        </td>
        <td align='right'>
             <c:set var="ruleActive" value="${not empty param.ruleactive ? param.ruleactive : (not empty rule ? rule.active : 'true')}"/>
            <input name='ruleactive' type='checkbox' value="true" <c:if test="${ruleActive}"> CHECKED </c:if>>
        </td>
        <td>
            <fmt:message key="filterActiveHint"/>
        </td>
    </tr>
</table>

<table border="0" cellspacing="3" cellpadding="3">
    <tbody>
        <tr>
            <td><fmt:message key="EFILT_ALLCOND_PRE"/></td>
            <td>
                <select name="allof">
                    <option <c:if test="${rule.allConditions}">selected</c:if> value="all"><fmt:message key="EFILT_all"/>
                    <option <c:if test="${not rule.allConditions}">selected</c:if> value="any"><fmt:message key="EFILT_any"/>
                </select>
            </td>
            <td><fmt:message key="EFILT_ALLCOND_POST"/></td>
        </tr>
    </tbody>
</table>
<table border="0" cellspacing="3" cellpadding="3">
<tbody>
<tr>
<td width="5">&nbsp;</td>
<td  class="ZhEditRuleContent">
<table border="0" cellspacing="0" cellpadding="5" class='RuleList' width=100%>
<tbody>
<c:forEach var="condition" items="${rule.conditions}" varStatus="condStatus">
<c:set var="condi" value="cond${condStatus.index}"/>
<tr>
<c:choose>
<c:when test="${zm:isAddressBookCondition(condition)}">
    <c:set var="ab" value="${zm:getAddressBook(condition)}"/>
    <td>
        <input type="hidden" name="${condi}" value="addressbook"/>
        <c:set var="selected" value="${ab.header}"/>
        <select name="${condi}_header" style='width:100%'>
            <option <c:if test="${selected eq 'from'}">selected</c:if> value="from">
                    <fmt:message key="EFILT_COND_addressIn"><fmt:param><fmt:message key="from"/></fmt:param></fmt:message>
            <option <c:if test="${selected eq 'to'}">selected</c:if> value="to">
                    <fmt:message key="EFILT_COND_addressIn"><fmt:param><fmt:message key="to"/></fmt:param></fmt:message>
            <option <c:if test="${selected eq 'cc'}">selected</c:if> value="cc">
                    <fmt:message key="EFILT_COND_addressIn"><fmt:param><fmt:message key="cc"/></fmt:param></fmt:message>
            <option <c:if test="${selected eq 'to,cc'}">selected</c:if> value="to,cc">
                    <fmt:message key="EFILT_COND_addressIn"><fmt:param><fmt:message key="tocc"/></fmt:param></fmt:message>
            <option <c:if test="${selected eq 'bcc'}">selected</c:if> value="bcc">
                    <fmt:message key="EFILT_COND_addressIn"><fmt:param><fmt:message key="bcc"/></fmt:param></fmt:message>
        </select>
    </td>
    <td colspan='3'>
        <select name="${condi}_op">
            <option <c:if test="${ab.addressBookOp eq 'IN'}">selected</c:if> value="IN"><fmt:message key="EFILT_COND_ADDRESS_IN"/>
            <option <c:if test="${ab.addressBookOp eq 'NOT_IN'}">selected</c:if> value="NOT_IN"><fmt:message key="EFILT_COND_ADDRESS_NOT_IN"/>
        </select>
    </td>
</c:when>
<c:when test="${zm:isSizeCondition(condition)}">
    <c:set var="sz" value="${zm:getSize(condition)}"/>
    <td>
        <input type="hidden" name="${condi}" value="size"/>
        <select name="${condi}_op">
            <option <c:if test="${sz.sizeOp eq 'UNDER'}">selected</c:if> value="UNDER"><fmt:message key="EFILT_COND_SIZE_UNDER"/>
            <option <c:if test="${sz.sizeOp eq 'NOT_UNDER'}">selected</c:if> value="NOT_UNDER"><fmt:message key="EFILT_COND_SIZE_NOT_UNDER"/>
            <option <c:if test="${sz.sizeOp eq 'OVER'}">selected</c:if> value="OVER"><fmt:message key="EFILT_COND_SIZE_OVER"/>
            <option <c:if test="${sz.sizeOp eq 'NOT_OVER'}">selected</c:if> value="NOT_OVER"><fmt:message key="EFILT_COND_SIZE_NOT_OVER"/>
        </select>
    </td>
    <td colspan='3' nowrap>
        <input name='${condi}_value' type='text' autocomplete='off' size='20' value="${fn:escapeXml(sz.sizeNoUnits)}">
        <select name="${condi}_units">
            <option <c:if test="${sz.units eq 'B'}">selected</c:if> value="">B
            <option <c:if test="${sz.units eq 'K'}">selected</c:if> value="K">KB
            <option <c:if test="${sz.units eq 'M'}">selected</c:if> value="M">MB
        </select>
    </td>
</c:when>
<c:when test="${zm:isBodyCondition(condition)}">
    <c:set var="body" value="${zm:getBody(condition)}"/>
    <td>
        <input type="hidden" name="${condi}" value="body"/>
        <select name="${condi}_op">
            <option <c:if test="${body.bodyOp eq 'CONTAINS'}">selected</c:if> value="CONTAINS"><fmt:message key="EFILT_COND_BODY_CONTAINS"/>
            <option <c:if test="${body.bodyOp eq 'NOT_CONTAINS'}">selected</c:if> value="NOT_CONTAINS"><fmt:message key="EFILT_COND_BODY_NOT_CONTAINS"/>
        </select>
    </td>
    <td colspan='3'>
        <input name="${condi}_value" type='text' autocomplete='off' size='20' value="${fn:escapeXml(body.text)}">
    </td>
</c:when>
<c:when test="${zm:isDateCondition(condition)}">
    <c:set var="date" value="${zm:getDate(condition)}"/>
    <fmt:message var="dateFmt" key="FILT_COND_DATE_FORMAT"/>
    <fmt:formatDate pattern="${dateFmt}" value="${date.date}" var="fdate"/>
    <td>
        <input type="hidden" name="${condi}" value="date"/>
        <select name="${condi}_op">
            <option <c:if test="${date.dateOp eq 'BEFORE'}">selected</c:if> value="BEFORE"><fmt:message key="EFILT_COND_DATE_BEFORE"/>
            <option <c:if test="${date.dateOp eq 'NOT_BEFORE'}">selected</c:if> value="NOT_BEFORE"><fmt:message key="EFILT_COND_DATE_NOT_BEFORE"/>
            <option <c:if test="${date.dateOp eq 'AFTER'}">selected</c:if> value="AFTER"><fmt:message key="EFILT_COND_DATE_AFTER"/>
            <option <c:if test="${date.dateOp eq 'NOT_AFTER'}">selected</c:if> value="NOT_AFTER"><fmt:message key="EFILT_COND_DATE_NOT_AFTER"/>
        </select>
    </td>
    <td colspan='3'>
        <input name='${condi}_value' type='text' autocomplete='off' size='20' value="${fn:escapeXml(fdate)}"> 
    </td>
</c:when>
<c:when test="${zm:isHeaderCondition(condition)}">
    <c:set var="hdr" value="${zm:getHeader(condition)}"/>
    <c:choose>
        <c:when test="${hdr.headerName eq 'subject' or hdr.headerName eq 'to' or hdr.headerName eq 'cc' or hdr.headerName eq 'to,cc' or hdr.headerName eq 'from'}">
            <td>
                <select name='${condi}_header'>
                    <option <c:if test="${hdr.headerName eq 'subject'}">selected</c:if> value="subject"><fmt:message key="FILT_COND_HEADER_subject"/>
                    <option <c:if test="${hdr.headerName eq 'to'}">selected</c:if> value="to"><fmt:message key="FILT_COND_HEADER_to"/>
                    <option <c:if test="${hdr.headerName eq 'cc'}">selected</c:if> value="cc"><fmt:message key="FILT_COND_HEADER_cc"/>
                    <option <c:if test="${hdr.headerName eq 'to,cc'}">selected</c:if> value="to,cc"><fmt:message key="FILT_COND_HEADER_to,cc"/>
                    <option <c:if test="${hdr.headerName eq 'from'}">selected</c:if> value="from"><fmt:message key="FILT_COND_HEADER_from"/>
                </select>
            </td>
        </c:when>
        <c:otherwise>
            <td nowrap>
                <select name="${condi}_headernamed">
                    <option selected value="headernamed"><fmt:message key="EFILT_COND_HEADER_headerNamed"/>
                </select>
                <input name="${condi}_header" type='text' autocomplete='off' size='20' value="${fn:escapeXml(hdr.headerName)}">
            </td>
        </c:otherwise>
    </c:choose>
    <td>
        <select name="${condi}_op">
            <option <c:if test="${hdr.headerOp eq 'IS'}">selected</c:if> value="IS"><fmt:message key="EFILT_COND_HEADER_IS"/>
            <option <c:if test="${hdr.headerOp eq 'NOT_IS'}">selected</c:if> value="NOT_IS"><fmt:message key="EFILT_COND_HEADER_NOT_IS"/>
            <option <c:if test="${hdr.headerOp eq 'CONTAINS'}">selected</c:if> value="CONTAINS"><fmt:message key="EFILT_COND_HEADER_CONTAINS"/>
            <option <c:if test="${hdr.headerOp eq 'NOT_CONTAINS'}">selected</c:if> value="NOT_CONTAINS"><fmt:message key="EFILT_COND_HEADER_NOT_CONTAINS"/>
            <option <c:if test="${hdr.headerOp eq 'MATCHES'}">selected</c:if> value="MATCHES"><fmt:message key="EFILT_COND_HEADER_MATCHES"/>
            <option <c:if test="${hdr.headerOp eq 'NOT_MATCHES'}">selected</c:if> value="NOT_MATCHES"><fmt:message key="EFILT_COND_HEADER_NOT_MATCHES"/>
        </select>
    </td>
    <td colspan=2>
        <input name='${condi}_value' type='text' autocomplete='off' size='20' value="${fn:escapeXml(hdr.headerValue)}">
        <input type="hidden" name="${condi}" value="header"/>
    </td>
</c:when>
<c:when test="${zm:isHeaderExistsCondition(condition)}">
    <c:set var="hdrexists" value="${zm:getHeaderExists(condition)}"/>
    <td>
        <input type="hidden" name="${condi}" value="headerexists"/>
        <select name="${condi}_op">
            <option <c:if test="${hdrexists.exists}">selected</c:if> value="EXISTS"><fmt:message key="EFILT_COND_HEADER_EXISTS"/>
            <option <c:if test="${not hdrexists.exists}">selected</c:if> value="NOT_EXISTS"><fmt:message key="EFILT_COND_HEADER_NOT_EXISTS"/>
        </select>
    </td>
    <td colspan='3'>
        <input name='${condi}_header' type='text' autocomplete='off' size='20' value="${fn:escapeXml(hdrexists.headerName)}">
    </td>
</c:when>
<c:when test="${zm:isAttachmentExistsCondition(condition)}">
    <c:set var="attach" value="${zm:getAttachmentExists(condition)}"/>
    <td colspan='1'>
        <input type="hidden" name="${condi}" value="attachment"/>
        <select name="${condi}_op">
            <option <c:if test="${attach.exists}">selected</c:if> value="EXISTS"><fmt:message key="EFILT_COND_ATTACHMENT_EXISTS"/>
            <option <c:if test="${not attach.exists}">selected</c:if> value="NOT_EXISTS"><fmt:message key="EFILT_COND_ATTACHMENT_NOT_EXISTS"/>
        </select>
    </td>
    <td colspan='3'>&nbsp;
    </td>
</c:when>
</c:choose>
<td align='right'>
    <c:if test="${condStatus.last}">
        <input type="hidden" name="cond_count" value="${condStatus.count}"/>
    </c:if>

    <input class='tbButton' type="submit"
           name="${condi}_remove" value="<fmt:message key="EFILT_remove"/>">
</td>
</tr>


</c:forEach>
<tr>
    <td colspan="1" nowrap>
        <select name="cond_add">
            <option value="select"><fmt:message key="EFILT_NEW_COND_SELECT"/>
            <option value="from"><fmt:message key="EFILT_NEW_COND_FROM"/>
            <option value="to"><fmt:message key="EFILT_NEW_COND_TO"/>
            <option value="cc"><fmt:message key="EFILT_NEW_COND_CC"/>
            <option value="to,cc"><fmt:message key="EFILT_NEW_COND_TOCC"/>
            <option value="subject"><fmt:message key="EFILT_NEW_COND_SUBJECT"/>
            <option value="header"><fmt:message key="EFILT_NEW_COND_HEADER"/>
            <option value="headerexists"><fmt:message key="EFILT_NEW_COND_HEADER_EXISTS"/>
            <option value="size"><fmt:message key="EFILT_NEW_COND_SIZE"/>
            <option value="date"><fmt:message key="EFILT_NEW_COND_DATE"/>
            <option value="body"><fmt:message key="EFILT_NEW_COND_BODY"/>
            <option value="attachment"><fmt:message key="EFILT_NEW_COND_ATTACHMENT"/>
            <c:if test="${mailbox.features.contacts}">
            <option value="addressbook"><fmt:message key="EFILT_NEW_COND_ADDRESS_IN"/>
            </c:if>
        </select>
        <input class='tbButton' type="submit"
               name="actionNewCond" value="<fmt:message key="EFILT_add"/>">
    </td>
    <td colspan=4>
        &nbsp;
    </td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr><td><br></td></tr>

<tr><td colspan="4"><fmt:message key="performTheFollowingActions"/></td></tr>

<tr>
    <td width="5">&nbsp;</td>
    <td  class="ZhEditRuleContent">
        <table border="0" cellspacing="0" cellpadding="5" class='RuleList'  width=100%>
            <tbody>
                <c:set var="hasStop" value="${false}"/>
                <c:forEach var="action" items="${rule.actions}" varStatus="actionStatus">
                    <c:set var="acti" value="action${actionStatus.index}"/>
                    <c:choose>
                        <c:when test="${zm:isStopAction(action)}">
                            <c:set var="hasStop" value="${true}"/>
                            <input type="hidden" name="${acti}" value="stop"/>
                            <c:if test="${actionStatus.last}">
                                <input type="hidden" name="action_count" value="${actionStatus.count}"/>
                            </c:if>
                        </c:when>
                        <c:otherwise>
                            <tr>
                                <c:choose>
                                    <c:when test="${zm:isKeepAction(action)}">
                                        <td>
                                            <input type="hidden" name="${acti}" value="keep"/>
                                            <fmt:message key="EFILT_ACTION_KEEP"/>
                                        </td>
                                        <td>&nbsp;</td>
                                    </c:when>
                                </c:choose>
                                <c:choose>
                                    <c:when test="${zm:isDiscardAction(action)}">
                                        <td>
                                            <input type="hidden" name="${acti}" value="discard"/>
                                            <fmt:message key="EFILT_ACTION_DISCARD"/>
                                        </td>
                                        <td>&nbsp;</td>
                                    </c:when>
                                </c:choose>
                                <c:choose>
                                    <c:when test="${zm:isFileIntoAction(action)}">
                                        <c:set var="fileInto" value="${zm:getFileIntoAction(action)}"/>
                                        <td>
                                            <input type="hidden" name="${acti}" value="fileinto"/>
                                            <fmt:message key="EFILT_ACTION_FILEINTO"/>
                                        </td>
                                        <td>
                                            <select  name="${acti}_arg">
                                                <c:set var="path" value="${fn:toLowerCase(fn:startsWith(fileInto.folderPath, '/') ? fn:substring(fileInto.folderPath, 1, -1) : fileInto.folderPath)}"/>
                                                <zm:forEachFolder var="folder">
                                                    <c:if test="${folder.isConversationMoveTarget}">
                                                        <fmt:message key="${fn:toLowerCase(fn:escapeXml(folder.rootRelativePath))}" var="rootPath" />
                                                        <option value="${fn:escapeXml(folder.rootRelativePath)}"
                                                                <c:if test="${fn:toLowerCase(folder.rootRelativePath) eq path}"> selected </c:if>
                                                                >${fn:escapeXml(fn:startsWith(rootPath,'???') ? folder.rootRelativePath : rootPath)}</option>
                                                    </c:if>
                                                </zm:forEachFolder>
                                            </select>
                                        </td>
                                    </c:when>
                                </c:choose>
                                <c:choose>
                                    <c:when test="${zm:isTagAction(action)}">
                                        <c:set var="tagaction" value="${zm:getTagAction(action)}"/>
                                        <td>
                                            <input type="hidden" name="${acti}" value="tag"/>
                                            <fmt:message key="EFILT_ACTION_TAG"/>
                                        </td>
                                        <td>
                                            <select name='${acti}_arg'>
                                            <zm:forEachTag var="tag">
                                                <option value="${fn:escapeXml(tag.name)}" <c:if test="${tag.name eq tagaction.tagName}"> selected</c:if>/>${fn:escapeXml(tag.name)}
                                            </zm:forEachTag>
                                            </select>
                                        </td>
                                    </c:when>
                                </c:choose>
                                <c:choose>
                                    <c:when test="${zm:isRedirectAction(action)}">
                                        <c:set var="redirect" value="${zm:getRedirectAction(action)}"/>
                                        <td>
                                            <input type="hidden" name="${acti}" value="redirect"/>
                                            <fmt:message key="EFILT_ACTION_REDIRECT"/>
                                        </td>
                                        <td>
                                            <input name='${acti}_arg' type='text' autocomplete='off' size='20' value="${fn:escapeXml(redirect.address)}">
                                        </td>
                                    </c:when>
                                </c:choose>
                                <c:choose>
                                    <c:when test="${zm:isFlagAction(action)}">
                                        <c:set var="flag" value="${zm:getFlagAction(action)}"/>
                                        <td>
                                            <input type="hidden" name="${acti}" value="mark"/>
                                            <select name="${acti}_arg">
                                                <option <c:if test="${flag.markOp eq 'READ'}">selected</c:if> value="READ">
                                                        <fmt:message key="EFILT_ACTION_FLAG_READ"/>
                                                <option <c:if test="${flag.markOp eq 'FLAGGED'}">selected</c:if> value="FLAGGED">
                                                    <fmt:message key="EFILT_ACTION_FLAG_FLAGGED"/>
                                            </select>
                                        </td>
                                        <td>&nbsp;</td>
                                    </c:when>
                                </c:choose>
                                <td align='right'>
                                    <c:if test="${actionStatus.last}">
                                        <input type="hidden" name="action_count" value="${actionStatus.count}"/>
                                    </c:if>
                                    <input class='tbButton' type="submit"
                                           name="${acti}_remove" value="<fmt:message key="EFILT_remove"/>">
                                </td>
                            </tr>
                        </c:otherwise>
                    </c:choose>
                </c:forEach>
                <tr>
                    <td colspan=3 nowrap>
                        <select name="action_add">
                            <option value="select"><fmt:message key="EFILT_NEW_ACTION_SELECT"/>
                            <option value="keep"><fmt:message key="EFILT_NEW_ACTION_KEEP"/>
                            <option value="discard"><fmt:message key="EFILT_NEW_ACTION_DISCARD"/>
                            <option value="fileinto"><fmt:message key="EFILT_NEW_ACTION_FILEINTO"/>
                            <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
                            <option value="tag"><fmt:message key="EFILT_NEW_ACTION_TAG"/>
                            </c:if>
                            <option value="mark"><fmt:message key="EFILT_NEW_ACTION_MARK"/>
                            <c:if test="${mailbox.features.mailForwardingInFilter}">
                            <option value="redirect"><fmt:message key="EFILT_NEW_ACTION_REDIRECT"/>
                            </c:if>
                        </select>
                        <input class='tbButton' type="submit"
                               name="actionNewAction" value="<fmt:message key="EFILT_add"/>">
                    </td>
                </tr>
            </tbody>
        </table>
    </td>
</tr>
<tr>
    <td colspan="1">
            <input type=checkbox name="action_stop" value="true"
                <c:if test="${hasStop or requestScope.stopChecked}"> CHECKED </c:if>>
    </td>
    <td colspan="3">
    <fmt:message key="EFILT_ACTION_STOP"/>
    </td>
</tr>
</tbody>
</table>
