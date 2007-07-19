<%@ tag body-content="empty" %>
<%@ attribute name="tag" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZTagBean" %>
<%@ attribute name="label" rtexprvalue="true" required="false" %>
<%@ attribute name="icon" rtexprvalue="true" required="false" %>
<%@ attribute name="types" rtexprvalue="true" required="false" %>
<%@ attribute name="calendars" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="types" value="${not empty types ? types : not empty param.st ? param.st : ''}"/>
<tr>
    <c:choose>
        <c:when test="${calendars}">
            <mo:calendarUrl var="url" sq='tag:"${tag.name}"'/>
        </c:when>
        <c:otherwise>
            <c:url value="/m/mosearch" var="url">
                <c:param name="sti" value="${tag.id}"/>
                <c:if test="${not empty types}"><c:param name='st' value='${types}'/></c:if>
            </c:url>
        </c:otherwise>
    </c:choose>
    <td class='zo_fldr${tag.hasUnread ? ' zo_unread' : ''}' onclick='window.location="${zm:jsEncode(url)}"'>
        <mo:img src="${tag.image}" alt='${fn:escapeXml(tag.name)}'/>
        ${fn:escapeXml(tag.name)}
        <c:if test="${tag.hasUnread}"> (${tag.unreadCount}) </c:if>
    </td>
</tr>
 