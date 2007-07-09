<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>

    <zm:getMailbox var="mailbox"/>
    <fmt:message var="emptyFragment" key="fragmentIsEmpty"/>
    <fmt:message var="emptySubject" key="noSubject"/>
    <c:set var="csi" value="${param.csi}"/>

    <zm:searchConv var="convSearchResult" id="${not empty param.cid ? param.cid : context.currentItem.id}" context="${context}" fetch="${empty csi ? 'first': 'none'}" markread="true" sort="${param.css}"/>
    <c:set var="convSummary" value="${convSearchResult.conversationSummary}"/>
    <zm:computeNextPrevItem var="convCursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
    <c:set var="message" value="${null}"/>
    <c:if test="${empty csi}">
        <c:set var="csi" value="${convSearchResult.fetchedMessageIndex}"/>
        <c:if test="${csi ge 0}">
            <c:set var="message" value="${convSearchResult.hits[csi].messageHit.message}"/>
        </c:if>
    </c:if>
    <c:if test="${message eq null}">
        <c:if test="${csi lt 0 or csi ge convSearchResult.size}">
            <c:set var="csi" value="0"/>
        </c:if>
        <zm:getMessage var="message" id="${not empty param.id ? param.id : convSearchResult.hits[csi].id}" markread="true" neuterimages="${empty param.xim}"/>
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
    <c:set var="selectedRow" value="${param.selectedRow}"/>

</mo:handleError>
<mo:view mailbox="${mailbox}" title="${message.subject}" context="${context}">

    <table width=100% cellspacing="0" cellpadding="0">
        <tr>
            <td>
                <table width=100% cellspacing="0" cellpadding="0">
                    <tr class='zo_toolbar' width=100%>
                        <zm:currentResultUrl var="closeurl" value="/m/mosearch" index="${context.currentItemIndex}" context="${context}"/>

                        <td><a href="${closeurl}" class='zo_leftbutton'>${fn:escapeXml(context.backTo)}</a></td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class='zo_m_cv_sub'>
                ${fn:escapeXml(empty message.subject ? emptySubject : message.subject)}
            </td>
        </tr>
        <tr>
            <td>
    <zm:currentResultUrl var="currentUrl" value="/m/mosearch" context="${context}"/>
    <table width=100% cellpadding="0" cellspacing="0" class='zo_m_list'>


        <c:forEach items="${convSearchResult.hits}" var="hit" varStatus="status">
            <zm:currentResultUrl var="msgUrl" value="search" cid="${convSummary.id}" id="${hit.id}" action='view' context="${context}"
                                 cso="${convSearchResult.offset}" csi="${status.index}" css="${param.css}"/>

            <c:if test="${empty selectedRow and hit.id eq message.id}"><c:set var="selectedRow" value="${status.index}"/></c:if>
            <tr>
                <td class='zo_m_list_row' onclick="alert(this.getAttribute('href'))" href="${msgUrl}">
                    <table width=100%>
                        <tr>
                            <td style='width:40px; ' valign="middle" align="center">
                                <img src="/zimbra/images/mail/MsgStatusReply.gif"/>
                            </td>
                            <td>
                                <table width=100%>
                                    <tr>
                                        <td class='zo_m_list_from'>
                                              <c:set var="sender" value="${hit.messageHit.displaySender}"/>
                                                            ${fn:escapeXml(empty sender ? unknownSender : sender)}
                                        </td>
                                        <td nowrap align=right valign=top class='zo_m_list_date'>
                                            ${fn:escapeXml(zm:displayMsgDate(pageContext, hit.messageHit.date))}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class='zo_m_list_frag'>
                                            <c:out value="${zm:truncate(hit.messageHit.fragment,100,true)}"/>
                                        </td>
                                        <td nowrap class='zo_m_list_size' align=right valign="top">
                                        ${fn:escapeXml(zm:displaySize(hit.messageHit.size))}
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
    </table>
</mo:view>
