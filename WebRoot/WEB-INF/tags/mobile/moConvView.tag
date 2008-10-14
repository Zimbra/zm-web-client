<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'mosearch'}"/>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:message var="emptyFragment" key="fragmentIsEmpty"/>
    <fmt:message var="emptySubject" key="noSubject"/>
    <c:set var="csi" value="${param.csi}"/>

    <zm:searchConv var="convSearchResult" id="${not empty param.cid ? param.cid : context.currentItem.id}" limit="100"
                   context="${context}" fetch="none" markread="false" sort="${param.css}"/>
    <c:set var="convSummary" value="${convSearchResult.conversationSummary}"/>
    <c:set var="singleMessage" value="${convSummary.messageCount eq 1 or not empty param.mview}"/>

    <c:set var="message" value="${null}"/>
    <c:if test="${empty csi}">
        <c:set var="csi" value="${convSearchResult.fetchedMessageIndex}"/>
        <c:if test="${csi ge 0}">
            <c:set var="message" value="${convSearchResult.hits[csi].messageHit.message}"/>
        </c:if>
    </c:if>
    <c:if test="${singleMessage and (message eq null or not empty param.xim)}">
        <c:if test="${csi lt 0 or csi ge convSearchResult.size}">
            <c:set var="csi" value="0"/>
        </c:if>
        <zm:getMessage var="message" id="${not empty param.id ? param.id : convSearchResult.hits[csi].id}"
                       markread="true" neuterimages="${empty param.xim}"/>
    </c:if>

    <%-- blah, optimize this later --%>
    <c:if test="${not empty requestScope.idsMarkedUnread and not message.isUnread}">
        <c:forEach var="unreadid" items="${requestScope.idsMarkedUnread}">
            <c:if test="${unreadid eq message.id}">
                <zm:markMessageRead var="mmrresult" id="${message.id}" read="${false}"/>
                <c:set var="leaveunread" value="${true}"/>
            </c:if>
        </c:forEach>
    </c:if>
    <fmt:message var="unknownSender" key="unknownSender"/>

    <c:set var="subject" value="${not empty message ? message.subject : convSearchResult.hits[0].messageHit.subject}"/>
</mo:handleError>


<mo:view mailbox="${mailbox}" title="${subject}" context="${context}"
         scale="${true or convSummary.messageCount eq 1}">
<zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}" action="view"/>
<c:if test="${singleMessage}">
    <zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}" mview="1"
                         action="view" id="${message.id}"/>
</c:if>
<form id="actions" action="${fn:escapeXml(actionUrl)}" method="post">
<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
<input type="hidden" name="doMessageAction" value="1"/>
<script>document.write('<input name="moreActions" type="hidden" value="<fmt:message key="actionGo"/>"/>');</script>
<table cellspacing="0" cellpadding="0" width="100%" border="0">

    <%-- INCLUDE TOOLBAR TOP--%>
<c:choose>
    <c:when test="${convSummary.messageCount gt 1 and param.mview eq 1}">
        <tr>
            <td>
                <mo:convToolbar urlTarget="${context_url}" context="${context}" keys="false" isConv="false"
                                singleMessage="${singleMessage}" message="${message}" isTop="${true}"/>
            </td>
        </tr>
    </c:when>
    <c:otherwise>
        <tr>
            <td>
                <mo:convToolbar singleMessage="${singleMessage}" urlTarget="${context_url}" context="${context}"
                                keys="false" isConv="true" cid="${convSummary.id}" message="${message}"
                                isTop="${true}"/>
            </td>
        </tr>
    </c:otherwise>
</c:choose>

<c:choose>
<c:when test="${singleMessage}">
    <tr class="Stripes">
        <td class='zo_appt_view'>
            <c:set var="extImageUrl" value="${context_url}"/>
            <c:if test="${empty param.xim}">
                <zm:currentResultUrl var="extImageUrl" id="${message.id}" value="${context_url}" action="view" mview="1"
                                     context="${context}" xim="1"/>
            </c:if>
            <zm:currentResultUrl var="composeUrl" value="${context_url}" context="${context}"
                                 action="compose" paction="view" id="${message.id}"/>
            <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${message.id}"/>
            <mo:displayMessage mailbox="${mailbox}" message="${message}" externalImageUrl="${extImageUrl}"
                               showconvlink="true" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
        </td>
    </tr>
</c:when>
<c:otherwise>
    <tr>
        <td class='zo_m_cv_sub' style="padding:3px;">
            <table cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <mo:img src="mail/ImgConversation.gif" alt="conv"/>
                    </td>
                    <td style='padding-left:5px;'>
                            ${fn:escapeXml(empty subject ? emptySubject : subject)}
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td>
            <table width="100%" cellpadding="0" cellspacing="0" class='zo_m_list'>
                <c:forEach items="${convSearchResult.hits}" var="hit" varStatus="status">
                    <c:set var="mhit" value="${hit.messageHit}"/>
                    <zm:currentResultUrl var="msgUrl" value="${context_url}" cid="${convSummary.id}" id="${hit.id}"
                                         action='view' context="${context}" mview="1"
                                         cso="${convSearchResult.offset}" csi="${status.index}" css="${param.css}"/>
                    <tr>
                        <td class='zo_m_list_row'>
                            <table cellspacing="0" cellpadding="4" width="100%">
                                <tr>
                                    <td class="zo_m_chk" width="1%">
                                        <c:set value=",${mhit.id}," var="stringToCheck"/>
                                        <input type="checkbox" ${fn:contains(requestScope._selectedIds,stringToCheck)?'checked="checked"':'unchecked'}
                                               name="id" value="${mhit.id}">
                                    </td>
                                    <td class="zo_m_chk" valign="middle" align="center" width="1%">
                                        <mo:img src="${(mhit.isUnread and hit.id == message.id) ? 'startup/ImgMsgStatusRead.gif' : mhit.statusImage}"
                                                alt="status"/>
                                    </td>
                                    <td onclick='zClickLink("a${mhit.id}")'>
                                        <table cellspacing="0" width="100%">
                                            <tr class='zo_m_list_<c:if test="${mhit.isUnread}">un</c:if>read'>
                                                <td width="95%">
                                                    <c:set var="sender" value="${mhit.displaySender}"/>
                                                    <c:set var="_f" value="${empty sender ? unknownSender : sender}"/>
                                                    <c:if test="${fn:length(_f) > 20}"><c:set var="_f"
                                                                                              value="${fn:substring(_f, 0, 20)}..."/></c:if>
                                                    <a class="zo_m_list_from" id="a${mhit.id}"
                                                       href="${fn:escapeXml(msgUrl)}">${fn:escapeXml(_f)}</a>

                                                    <div class="zo_m_list_sub">
                                                        <c:set var="_f" value="${mhit.subject}"/>
                                                        <c:if test="${fn:length(_f) > 20}"><c:set var="_f"
                                                                                                  value="${fn:substring(_f, 0, 20)}..."/></c:if>
                                                            ${fn:escapeXml(_f)}
                                                    </div>
                                                    <div class='zo_m_list_frag'>
                                                        <c:set var="_f" value="${mhit.fragment}"/>
                                                        <c:if test="${fn:length(_f) > 50}"><c:set var="_f"
                                                                                                  value="${fn:substring(_f, 0, 50)}..."/></c:if>
                                                            ${fn:escapeXml(_f)}
                                                    </div>
                                                </td>
                                                <td align="center" width="2%" valign="middle"
                                                    style="padding-top: 5px;padding-left: 4px;">
                                                    <c:if test="${mhit.isFlagged}">
                                                        <mo:img src="startup/ImgFlagRed.gif" alt="flag"/>
                                                    </c:if>
                                                    <c:if test="${mhit.hasTags}">
                                                        <mo:miniTagImage
                                                                ids="${mhit.tagIds}"/>
                                                    </c:if>
                                                </td>
                                                <td nowrap="nowrap" class='zo_m_list_size' align="right" valign="top">
                                                    <fmt:formatDate timeZone="${mailbox.prefs.timeZone}" var="on_dt"
                                                                    pattern="yyyyMMdd" value="${mhit.date}"/>
                                                    <a
                                                            <c:if test="${sessionScope.uiv == '1' && mailbox.features.calendar}">href='${context_url}?st=cal&view=month&date=${on_dt}'</c:if>>
                                                            ${fn:escapeXml(zm:displayMsgDate(pageContext, mhit.date))}
                                                    </a><br/>
                                                    (${fn:escapeXml(zm:displaySize(mhit.size))})
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td style='width:5px'>&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </c:forEach>
            </table>
        </td>
    </tr>
</c:otherwise>
</c:choose>

    <%-- INCLUDE TOOLBAR BOTTOM --%>
<c:choose>
    <c:when test="${convSummary.messageCount gt 1 and param.mview eq 1}">
        <tr>
            <td>
                <mo:convToolbar urlTarget="${context_url}" context="${context}" keys="false" isConv="false"
                                singleMessage="${singleMessage}" message="${message}"/>
            </td>
        </tr>
    </c:when>
    <c:otherwise>
        <tr>
            <td>
                <mo:convToolbar singleMessage="${singleMessage}" urlTarget="${context_url}" context="${context}"
                                keys="false" isConv="true" cid="${convSummary.id}" message="${message}"/>
            </td>
        </tr>
    </c:otherwise>
</c:choose>

</table>
</form>
</mo:view>
