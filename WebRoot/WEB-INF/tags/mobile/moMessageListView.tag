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
    <mo:searchTitle var="title" context="${context}"/>
    <fmt:message key="noSubject" var="noSubject"/>
    <fmt:message var="unknownSender" key="unknownSender"/>
    <zm:currentResultUrl var="currentUrl" value="${context_url}" context="${context}"/>
    <c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
    <c:if test="${false and mailbox.prefs.readingPaneEnabled}">
        <zm:getMessage var="msg" id="${not empty param.id ? param.id : context.currentItem.id}" markread="true"
                       neuterimages="${empty param.xim}"/>
        <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}"
                                index="${context.currentItemIndex}"/>
        <c:set var="ads" value='${msg.subject} ${msg.fragment}'/>
    </c:if>
    <fmt:message var="emptySubject" key="noSubject"/>
</mo:handleError>

<mo:view mailbox="${mailbox}" title="${title}" context="${context}" scale="${true}">
    <zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}"/>
    <form id="actions" action="${fn:escapeXml(actionUrl)}" method="post">
        <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
        <input type="hidden" name="doMessageAction" value="1"/>
        <script>document.write('<input name="moreActions" type="hidden" value="<fmt:message key="actionGo"/>"/>');</script>
        <table cellspacing="0" cellpadding="0" width="100%">
            <%--<c:if test="${context.searchResult.size gt 0}">--%>
                <tr>
                    <td>
                        <mo:toolbar urlTarget="${context_url}" context="${context}" isTop="true"/>
                    </td>
                </tr>
          <%--  </c:if>--%>
            <tr>
                <td>
                    <table width="100%" cellpadding="0" cellspacing="0" class='zo_m_list'>

                        <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                            <c:set var="mhit" value="${hit.messageHit}"/>
                            <c:choose>
                                <c:when test="${mhit.isDraft}">
                                    <zm:currentResultUrl index="${status.index}" var="msgUrl" value="${context_url}"
                                                         action="compose"
                                                         context="${context}" id="${mhit.id}"/>
                                </c:when>
                                <c:otherwise>
                                    <zm:currentResultUrl index="${status.index}" var="msgUrl" value="${context_url}"
                                                         action="view"
                                                         context="${context}" id="${mhit.id}"/>
                                </c:otherwise>
                            </c:choose>
                            <tr id="msg${mhit.id}">
                                <td class='zo_m_list_row'>
                                    <table width="100%" cellpadding="4">
                                        <tr>
                                            <td width="1%" class="zo_m_chk">
                                                <c:set value=",${mhit.id}," var="stringToCheck"/>
                                                <input type="checkbox" ${fn:contains(requestScope._selectedIds,stringToCheck)?'checked="checked"':'unchecked'}
                                                       name="id" value="${mhit.id}">
                                            </td>
                                            <td class="zo_m_chk" valign="middle" align="center" width="1%">
                                                <mo:img src="mail/ImgEnvelope${mhit.isUnread?'':'Gray'}.gif"/>
                                            </td>
                                            <td onclick='zClickLink("a${mhit.id}")'>
                                                <table cellspacing="0" width="100%">
                                                    <tr class='zo_m_list_<c:if test="${mhit.isUnread}">un</c:if>read'>
                                                        <td width="95%">
                                                            <c:set var="sender" value="${mhit.displaySender}"/>
                                                            <c:set var="_f"
                                                                   value="${empty sender ? unknownSender : sender}"/>
                                                            <c:if test="${fn:length(_f) > 25}"><c:set var="_f"
                                                                                                      value="${fn:substring(_f, 0, 25)}..."/></c:if>
                                                            <a class="zo_m_list_from" id="a${mhit.id}"
                                                               href="${fn:escapeXml(msgUrl)}">${fn:escapeXml(_f)}</a>

                                                            <div class="zo_m_list_sub">
                                                                <c:set var="_f" value="${mhit.subject}"/>
                                                                <c:if test="${fn:length(_f) > 25}"><c:set var="_f"
                                                                                                          value="${fn:substring(_f, 0, 25)}..."/></c:if>
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
                                                        <td nowrap="nowrap" class='zo_m_list_size' align="right"
                                                            valign="top">
                                                            <fmt:formatDate timeZone="${mailbox.prefs.timeZone}"
                                                                            var="on_dt" pattern="yyyyMMdd"
                                                                            value="${mhit.date}"/>
                                                            <a
                                                                    <c:if test="${sessionScope.uiv == '1' && mailbox.features.calendar}">href='${context_url}?st=cal&view=month&date=${on_dt}'</c:if>>
                                                                    ${fn:escapeXml(zm:displayMsgDate(pageContext, mhit.date))}
                                                            </a><br/>
                                                            (${fn:escapeXml(zm:displaySize(mhit.size))})
                                                        </td>
                                                        <!--<td class="zo_ab_list_arrow">&nbsp;</td>-->
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </c:forEach>
                    </table>
                    <c:if test="${context.searchResult.size == 0}">
                        <div class='zo_noresults'><fmt:message key="noResultsFound"/></div>
                    </c:if>
                </td>
            </tr>
            <%--<c:if test="${context.searchResult.size gt 0}">--%>
                <tr>
                    <td>
                        <mo:toolbar urlTarget="${context_url}" context="${context}" isTop="false"/>
                    </td>
                </tr>
           <%-- </c:if>--%>
        </table>
    </form>
</mo:view>

