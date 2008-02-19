<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="isConv" rtexprvalue="true" required="false" %>
<%@ attribute name="cid" rtexprvalue="true" required="false" %>
<%@ attribute name="isTop" rtexprvalue="true" required="false" %>
<%@ attribute name="singleMessage" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:if test="${isConv != null && isConv}">
    <zm:searchConv var="convSearchResult" id="${not empty param.cid ? param.cid : context.currentItem.id}" limit="100"
                   context="${context}" fetch="none" markread="false" sort="${param.css}"/>
</c:if>

<table class="ToolbarBg" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>

<td align="left">
<table cellpadding="0" cellspacing="0" border="0">
<tr>
<c:if test="${isConv==null || !isConv }">
    <zm:currentResultUrl var="closeUrl" value="${urlTarget}" action='view' context="${context}"
                         cso="${param.cso}" csi="${param.csi}" css="${param.css}"/>
    <td class="Padding"><a href="${fn:escapeXml(closeUrl)}" class='zo_leftbutton'><fmt:message key="backToConv"/></a></td>
</c:if>
<c:if test="${isConv!=null && isConv}">
    <zm:currentResultUrl var="closeurl" value="${urlTarget}"
                         index="${context.currentItemIndex}"
                         context="${context}"/>
</c:if>
<td class="Padding">
    <c:if test="${isConv != null && isConv}">
        <zm:currentResultUrl var="closeurl" value="${urlTarget}"
                             index="${context.currentItemIndex}"
                             context="${context}"/>
        <a href="${fn:escapeXml(closeurl)}#conv${cid}" class='zo_leftbutton'>
                ${fn:escapeXml(zm:truncate(context.shortBackTo,15,true))}
        </a>
    </c:if>
    <c:if test="${(singleMessage == null || singleMessage)}">
        <!-- a class='zo_button' href="#action"><fmt:message key="MO_actions"/></a -->
    </c:if>
</td>
<c:if test="${isConv !=null && isConv}">
    <td class="Padding">
        <zm:computeNextPrevItem var="convCursor" searchResult="${context.searchResult}"
                                index="${context.currentItemIndex}"/>
        <c:choose>
            <c:when test="${context.hasPrevItem}">
                <zm:prevItemUrl var="prevItemUrl" value="${urlTarget}" action="view"
                                cursor="${convCursor}" context="${context}"
                                css="${param.css}"/>
                <a class='zo_button' href="${fn:escapeXml(prevItemUrl)}">
                    <fmt:message key="MO_PREV"/>
                </a>
            </c:when>
            <c:otherwise>
                <a class='zo_button_disabled'>
                    <fmt:message key="MO_PREV"/>
                </a>
            </c:otherwise>
        </c:choose>
    </td>
</c:if>
<c:if test="${isConv == null || !isConv}">
    <td class="Padding">
        <zm:computeNextPrevItem var="messCursor" searchResult="${convSearchResult}"
                                index="${param.csi}"/>
        <c:choose>
            <c:when test="${messCursor.hasPrev}">
                <zm:currentResultUrl var="prevMsgUrl" value="${urlTarget}" action='view'
                                     context="${context}" mview="1"
                                     cso="${messCursor.prevOffset}"
                                     csi="${messCursor.prevIndex}" css="${param.css}"/>
                <a class='zo_button' href="${fn:escapeXml(prevMsgUrl)}">
                    <fmt:message key="MO_PREV"/>
                </a>
            </c:when>
            <c:otherwise>
                <a class='zo_button_disabled'>
                    <fmt:message key="MO_PREV"/>
                </a>
            </c:otherwise>
        </c:choose>
    </td>
</c:if>
<c:if test="${isConv !=null && isConv}">
    <td class="Padding">
        <zm:computeNextPrevItem var="convCursor" searchResult="${context.searchResult}"
                                index="${context.currentItemIndex}"/>
        <c:choose>
            <c:when test="${context.hasNextItem}">
                <zm:nextItemUrl var="nextItemUrl" value="${urlTarget}" action="view"
                                cursor="${convCursor}" context="${context}"
                                css="${param.css}"/>
                <a class='zo_button' href="${fn:escapeXml(nextItemUrl)}">
                    <fmt:message key="MO_NEXT"/>
                </a>
            </c:when>
            <c:otherwise>
                <a class='zo_button_disabled'>
                    <fmt:message key="MO_NEXT"/>
                </a>
            </c:otherwise>
        </c:choose>
    </td>
</c:if>
<c:if test="${isConv == null || !isConv}">
    <td class="Padding">
        <c:choose>
            <c:when test="${messCursor.hasNext}">
                <zm:currentResultUrl var="nextMsgUrl" value="${urlTarget}" action="view"
                                     context="${context}" mview="1"
                                     cso="${messCursor.nextOffset}"
                                     csi="${messCursor.nextIndex}" css="${param.css}"/>
                <a class='zo_button' href="${fn:escapeXml(nextMsgUrl)}">
                    <fmt:message key="MO_NEXT"/>
                </a>
            </c:when>
            <c:otherwise>
                <a class='zo_button_disabled'>
                    <fmt:message key="MO_NEXT"/>
                </a>
            </c:otherwise>
        </c:choose>
    </td>
</c:if>
</tr>
</table>
</td>
<td class="Padding" align="right">
    <c:if test="${uiv != '1' && isTop != null && isTop}">
                <a href="#action" class='zo_button'>
                    <fmt:message key="MO_actions"/>
                </a>
            </c:if>
    <c:if test="${uiv == '1'}">
    <c:if test="${context.st=='message' || context.st=='conversation'}">
        <c:url var="composeUrl" value="${urlTarget}?action=compose"/>
        <a href="${composeUrl}">
            <fmt:message key="compose"/>
        </a>
    </c:if>
    <c:if test="${context.st=='contact'}">
        <c:url var="composeUrl" value="${urlTarget}?action=add"/>
        <a href="${composeUrl}">
            <fmt:message key="add"/>
        </a>
    </c:if>
    </c:if>
</td>
</tr>
</table>
