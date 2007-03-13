<%@ tag body-content="empty" %>
<%@ attribute name="rule" rtexprvalue="true" required="true" type="com.zimbra.cs.zclient.ZFilterRule" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<table width=100% cellspacing=0 cellpadding=0>
    <tr class='contactHeaderRow'>
        <td width=20><center><app:img src="mail/MailRule.gif" altkey="filterRule"/></center></td>
        <td class='contactHeader'>${fn:escapeXml(rule.name)}</td>
    </tr>
</table>

<table border="0" cellspacing="0" cellpadding="3" width="100%">
<tbody>

    <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="${rule.allConditions ?  'ifAllOfTheFollowingConditionsAreMet' : 'ifAnyOfTheFollowingConditionsAreMet'}"/></td></tr>
    <c:forEach var="condition" items="${rule.conditions}">
    <tr>
        <td width="5">&nbsp;</td>
        <td class="contactOutput">

            <c:choose>
                <c:when test="${zm:isAddressBook(condition)}">
                    <c:set var="ab" value="${zm:getAddressBook(condition)}"/>
                    <fmt:message key="FILT_COND_ADDRESSBOOK_${ab.addressBookOp}">
                        <fmt:param>${fn:escapeXml(ab.header)}</fmt:param>
                    </fmt:message>
                </c:when>
                <c:when test="${zm:isSize(condition)}">
                    <c:set var="sz" value="${zm:getSize(condition)}"/>

                    <fmt:message key="FILT_COND_SIZE_${sz.sizeOp}">
                        <fmt:param>${fn:escapeXml(sz.size)}</fmt:param>
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
                <c:when test="${zm:isBody(condition)}">
                    <c:set var="body" value="${zm:getBody(condition)}"/>
                    <fmt:message key="FILT_COND_BODY_${body.bodyOp}">
                        <fmt:param>${fn:escapeXml(body.text)}</fmt:param>
                    </fmt:message>
                </c:when>
                <c:when test="${zm:isDate(condition)}">
                    <c:set var="date" value="${zm:getDate(condition)}"/>
                    <fmt:message var="dateFmt" key="FILT_COND_DATE_FORMAT"/>
                    <fmt:formatDate pattern="${dateFmt}" value="${date.date}" var="fdate"/>
                    <fmt:message key="FILT_COND_DATE_${date.dateOp}">
                        <fmt:param>${fdate}</fmt:param>
                    </fmt:message>
                </c:when>
                <c:when test="${zm:isHeader(condition)}">
                    <c:set var="hdr" value="${zm:getHeader(condition)}"/>
                    <c:choose>
                        <c:when test="${hdr.headerName eq 'subject' or hdr.headerName eq 'to' or hdr.headerName eq 'cc' or hdr.headerName eq 'from'}">
                            <fmt:message key="FILT_COND_HEADER_${hdr.headerOp}">
                                <fmt:param><fmt:message key="FILT_COND_HEADER_${hdr.headerName}"/></fmt:param>
                                <fmt:param>${hdr.headerValue}</fmt:param>
                            </fmt:message>
                        </c:when>
                        <c:otherwise>
                            <fmt:message key="FILT_COND_GENERIC_HEADER_${hdr.headerOp}">
                                <fmt:param>${hdr.headerName}</fmt:param>
                                <fmt:param>${hdr.headerValue}</fmt:param>
                            </fmt:message>
                        </c:otherwise>
                    </c:choose>
                </c:when>
                <c:when test="${zm:isHeaderExists(condition)}">
                    <c:set var="hdrexists" value="${zm:getHeaderExists(condition)}"/>
                    <fmt:message key="FILT_COND_HEADER_${hdrexists.exists ? 'EXISTS' : 'NOT_EXISTS'}">
                        <fmt:param>${hdrexists.headerName}</fmt:param>
                    </fmt:message>
                </c:when>
                <c:when test="${zm:isAttachmentExists(condition)}">
                    <c:set var="attach" value="${zm:getAttachmentExists(condition)}"/>
                    <fmt:message key="FILT_COND_ATTACHMENT_${attach.exists ? 'EXISTS' : 'NOT_EXISTS'}"/>
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

                <c:choose>
                    <c:when test="${zm:isKeep(action)}">
                        <fmt:message key="FILT_ACTION_KEEP"/>
                    </c:when>
                </c:choose>
                <c:choose>
                    <c:when test="${zm:isDiscard(action)}">
                        <fmt:message key="FILT_ACTION_DISCARD"/>
                    </c:when>
                </c:choose>
                <c:choose>
                    <c:when test="${zm:isStop(action)}">
                        <fmt:message key="FILT_ACTION_STOP"/>
                    </c:when>
                </c:choose>
                <c:choose>
                    <c:when test="${zm:isFileInto(action)}">
                        <c:set var="fileInto" value="${zm:getFileInto(action)}"/>
                        <fmt:message key="FILT_ACTION_FILEINTO">
                            <fmt:param>${fn:startsWith(fileInto.folderPath, '/') ? fn:substring(fileInto.folderPath, 1, -1) : fileInto.folderPath}</fmt:param>
                        </fmt:message>
                    </c:when>
                </c:choose>
                <c:choose>
                    <c:when test="${zm:isTag(action)}">
                        <c:set var="tag" value="${zm:getTag(action)}"/>
                        <fmt:message key="FILT_ACTION_TAG">
                            <fmt:param>${tag.tagName}</fmt:param>
                        </fmt:message>
                    </c:when>
                </c:choose>
                <c:choose>
                    <c:when test="${zm:isRedirect(action)}">
                        <c:set var="redirect" value="${zm:getRedirect(action)}"/>
                        <fmt:message key="FILT_ACTION_REDIRECT">
                            <fmt:param>${redirect.address}</fmt:param>
                        </fmt:message>
                    </c:when>
                </c:choose>
                <c:choose>
                    <c:when test="${zm:isFlag(action)}">
                        <c:set var="flag" value="${zm:getFlag(action)}"/>
                        <fmt:message key="FILT_ACTION_FLAG_${flag.markOp}"/>
                    </c:when>
                </c:choose>
        </td>
    </tr>
    </c:forEach>
    <tr>
        <td><br></td>
    </tr>
</tbody>
</table>

