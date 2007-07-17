<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <mo:searchTitle var="title" context="${context}"/>
    <fmt:message key="noSubject" var="noSubject"/>
    <fmt:message var="unknownSender" key="unknownSender"/>
    <zm:currentResultUrl var="currentUrl" value="/m/mosearch" context="${context}"/>
    <c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
    <c:if test="${false and mailbox.prefs.readingPaneEnabled}">
        <zm:getMessage var="msg" id="${not empty param.id ? param.id : context.currentItem.id}" markread="true"
                       neuterimages="${empty param.xim}"/>
        <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}"
                                index="${context.currentItemIndex}"/>
        <c:set var="ads" value='${msg.subject} ${msg.fragment}'/>
    </c:if>
</mo:handleError>

<mo:view mailbox="${mailbox}" title="${title}" context="${context}" scale="${true}">

    <table width=100% cellspacing="0" cellpadding="0">
        <tr>
            <td>
                <table width=100% cellspacing="0" cellpadding="0">
                    <tr class='zo_toolbar'>
                        <td>
                            <table cellspacing="0" cellpadding="0">
                                <tr>
                                    <td><a href="main" class='zo_leftbutton'>
                                        <fmt:message key="MO_MAIN"/>
                                    </a></td>
                                    <td>
                                        <mo:searchPageLeft urlTarget="mosearch" context="${context}" keys="false"/>
                                    </td>
                                    <td>
                                        <mo:searchPageRight urlTarget="mosearch" context="${context}" keys="false"/>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <table width=100% cellpadding="0" cellspacing="0" class='zo_m_list'>

                    <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                        <zm:currentResultUrl index="${status.index}" var="msgUrl" value="/m/mosearch" action="view" context="${context}" id="${hit.messageHit.id}"/>

                        <tr id="msg${hit.messageHit.id}">
                            <td class='zo_m_list_row' onclick='window.location="${zm:jsEncode(msgUrl)}"'>
                                <table width=100%>
                                    <tr>
                                        <td style='width:40px; ' valign="middle" align="center">
                                            <mo:img src="${(hit.messageHit.isUnread and hit.id == msg.id) ? 'mail/MsgStatusRead.gif' : hit.messageHit.statusImage}"/>
                                        </td>
                                        <td>
                                            <table width=100%>
                                                <tr
                                                        <c:if test="${hit.messageHit.isUnread}">
                                                            class='zo_m_list_unread'
                                                        </c:if>
                                                        >
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
        <tr>
            <td>
                <table width=100% cellspacing="0" cellpadding="0">
                    <tr class='zo_toolbar'>
                        <td>
                            <table cellspacing="0" cellpadding="0">
                                <tr>
                                    <td><a href="main" class='zo_leftbutton'>
                                        <fmt:message key="MO_MAIN"/>
                                    </a></td>
                                    <td>
                                        <mo:searchPageLeft urlTarget="mosearch" context="${context}" keys="false"/>
                                    </td>
                                    <td>
                                        <mo:searchPageRight urlTarget="mosearch" context="${context}" keys="false"/>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>  
    </table>
</mo:view>

