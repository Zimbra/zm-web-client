<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="rule" rtexprvalue="true" required="true" type="com.zimbra.client.ZFilterRule" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
    <td class='ZhBottomSep'>
        <table width="100%" cellspacing="0" cellpadding="0">
    <tr class='contactHeaderRow'>
        <td width="20"><center><app:img src="mail/ImgMailRule.png" altkey="filterRule"/></center></td>
        <td class='contactHeader'>${fn:escapeXml(rule.name)}</td>
    </tr>
</table>
    </td>
</tr>
<tr>
    <td>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
<tbody>

    <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="${rule.allConditions ?  'ifAllOfTheFollowingConditionsAreMet' : 'ifAnyOfTheFollowingConditionsAreMet'}"/></td></tr>
    <c:forEach var="condition" items="${rule.conditions}">
    <tr>
        <td width="5">&nbsp;</td>
        <td class="contactOutput">

            <c:choose>
                <c:when test="${zm:isAddressBookCondition(condition)}">
                    <c:set var="ab" value="${zm:getAddressBook(condition)}"/>
                    <fmt:message key="FILT_COND_ADDRESSBOOK_${ab.addressBookOp}">
                        <fmt:param>${fn:escapeXml(ab.header)}</fmt:param>
                    </fmt:message>
                </c:when>
                <c:when test="${zm:isSizeCondition(condition)}">
                    <c:set var="sz" value="${zm:getSize(condition)}"/>

                    <fmt:message key="FILT_COND_SIZE_${sz.sizeOp}">
                        <fmt:param>${fn:escapeXml(sz.sizeNoUnits)}</fmt:param>
                        <fmt:param>
                            <c:choose>
                                <c:when test="${sz.units eq 'M'}">MB</c:when>
                                <c:when test="${sz.units eq 'K'}">KB</c:when>
                                <c:when test="${sz.units eq 'G'}">GB</c:when>
                                <c:otherwise>B</c:otherwise>
                            </c:choose>
                        </fmt:param>
                    </fmt:message>
                </c:when>
                <c:when test="${zm:isBodyCondition(condition)}">
                    <c:set var="body" value="${zm:getBody(condition)}"/>
                    <fmt:message key="FILT_COND_BODY_${body.bodyOp}">
                        <fmt:param>${fn:escapeXml(body.text)}</fmt:param>
                    </fmt:message>
                </c:when>
                <c:when test="${zm:isDateCondition(condition)}">
                    <c:set var="date" value="${zm:getDate(condition)}"/>
                    <fmt:message var="dateFmt" key="FILT_COND_DATE_FORMAT"/>
                    <fmt:formatDate pattern="${dateFmt}" value="${date.date}" var="fdate"/>
                    <fmt:message key="FILT_COND_DATE_${date.dateOp}">
                        <fmt:param>${fdate}</fmt:param>
                    </fmt:message>
                </c:when>
                <c:when test="${zm:isHeaderCondition(condition)}">
                    <c:set var="hdr" value="${zm:getHeader(condition)}"/>
                    <c:choose>
                        <c:when test="${hdr.headerName eq 'subject' or hdr.headerName eq 'to' or hdr.headerName eq 'cc' or hdr.headerName eq 'to,cc' or hdr.headerName eq 'from'}">
                            <fmt:message key="FILT_COND_HEADER_${hdr.headerOp}">
                                <fmt:param><fmt:message key="FILT_COND_HEADER_${hdr.headerName}"/></fmt:param>
                                <fmt:param>${fn:escapeXml(hdr.headerValue)}</fmt:param>
                            </fmt:message>
                        </c:when>
                        <c:otherwise>
                            <fmt:message key="FILT_COND_GENERIC_HEADER_${hdr.headerOp}">
                                <fmt:param>${fn:escapeXml(hdr.headerName)}</fmt:param>
                                <fmt:param>${fn:escapeXml(hdr.headerValue)}</fmt:param>
                            </fmt:message>
                        </c:otherwise>
                    </c:choose>
                </c:when>
                <c:when test="${zm:isHeaderExistsCondition(condition)}">
                    <c:set var="hdrexists" value="${zm:getHeaderExists(condition)}"/>
                    <fmt:message key="FILT_COND_HEADER_${hdrexists.exists ? 'EXISTS' : 'NOT_EXISTS'}">
                        <fmt:param>${fn:escapeXml(hdrexists.headerName)}</fmt:param>
                    </fmt:message>
                </c:when>
                <c:when test="${zm:isAttachmentExistsCondition(condition)}">
                    <c:set var="attach" value="${zm:getAttachmentExists(condition)}"/>
                    <fmt:message key="FILT_COND_ATTACHMENT_${attach.exists ? 'EXISTS' : 'NOT_EXISTS'}"/>
                </c:when>
                <c:when test="${zm:isAddressCondition(condition)}">
                    <c:set var="addr" value="${zm:getAddress(condition)}"/>
                    <c:choose>
                        <c:when test="${addr.headerName eq 'to' or addr.headerName eq 'cc' or addr.headerName eq 'to,cc' or addr.headerName eq 'from'}">
                            <fmt:message key="FILT_COND_HEADER_${addr.headerOp}">
                                <fmt:param><fmt:message key="FILT_COND_HEADER_${addr.headerName}"/></fmt:param>
                                <fmt:param>${fn:escapeXml(addr.headerValue)}</fmt:param>
                            </fmt:message>
                        </c:when>
                        <c:otherwise>
                            <fmt:message key="FILT_COND_GENERIC_HEADER_${addr.headerOp}">
                                <fmt:param>${fn:escapeXml(addr.headerName)}</fmt:param>
                                <fmt:param>${fn:escapeXml(addr.headerValue)}</fmt:param>
                            </fmt:message>
                        </c:otherwise>
                    </c:choose>
                </c:when>
            </c:choose>
        </td>
    </tr>
    </c:forEach>
    <tr><td><br></td></tr>


    <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="performTheFollowingActions"/></td></tr>
    <c:forEach var="action" items="${rule.actions}">
    <tr>
        <td width="5">&nbsp;</td>
        <td valign="top" width="385" class="contactOutput">
            <c:if test="${zm:isKeepAction(action)}">
                <fmt:message key="FILT_ACTION_KEEP"/>
            </c:if>

            <%--Display discard action only if zimbraFeatureDiscardInFiltersEnabled is true--%>            
            <c:if test="${mailbox.features.discardFilterEnabled eq true and zm:isDiscardAction(action)}">
                <fmt:message key="FILT_ACTION_DISCARD"/>
            </c:if>

            <c:if test="${zm:isStopAction(action)}">
                <fmt:message key="FILT_ACTION_STOP"/>
            </c:if>

            <c:if test="${zm:isFileIntoAction(action)}">
                <c:set var="fileInto" value="${zm:getFileIntoAction(action)}"/>
                <c:set var="path" value="${fn:toLowerCase(fn:startsWith(fileInto.folderPath, '/') ? fn:substring(fileInto.folderPath, 1, -1) : fileInto.folderPath)}"/>
                <fmt:message key="${fn:toLowerCase(fn:escapeXml(path))}" var="rootPath" />
                <fmt:message key="FILT_ACTION_FILEINTO">
                    <fmt:param>${fn:escapeXml(fn:startsWith(rootPath,'???') ? path : rootPath)}</fmt:param>
                </fmt:message>
            </c:if>

            <c:if test="${zm:isTagAction(action)}">
                <c:set var="tag" value="${zm:getTagAction(action)}"/>
                <fmt:message key="FILT_ACTION_TAG">
                    <fmt:param>${fn:escapeXml(tag.tagName)}</fmt:param>
                </fmt:message>
            </c:if>

            <c:if test="${zm:isRedirectAction(action)}">
                <c:set var="redirect" value="${zm:getRedirectAction(action)}"/>
                <fmt:message key="FILT_ACTION_REDIRECT">
                    <fmt:param>${fn:escapeXml(redirect.address)}</fmt:param>
                </fmt:message>
            </c:if>

            <c:if test="${zm:isFlagAction(action)}">
                <c:set var="flag" value="${zm:getFlagAction(action)}"/>
                <fmt:message key="FILT_ACTION_FLAG_${flag.markOp}"/>
            </c:if>
        </td>
    </tr>
    </c:forEach>
    <tr>
        <td><br></td>
    </tr>
</tbody>
</table>
    </td>
</tr>
</table>
