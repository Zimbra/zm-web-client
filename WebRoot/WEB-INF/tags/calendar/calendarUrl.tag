<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="var" rtexprvalue="false" required="true" type="java.lang.String" %>
<%@ attribute name="value" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="view" rtexprvalue="true" required="false" %>
<%@ attribute name="rawdate" rtexprvalue="true" required="false" type="java.util.Calendar"%>
<%@ attribute name="timezone" rtexprvalue="true" required="false" type="java.util.TimeZone"%>
<%@ attribute name="date" rtexprvalue="true" required="false" %>
<%@ attribute name="nodate" rtexprvalue="true" required="false" %>
<%@ variable name-from-attribute="var" alias='urlVar' scope="AT_BEGIN" variable-class="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:set var='view' value='${not empty view ? view : param.view}'/>
<c:url value="${not empty value ? value : '/h/calendar'}" var="urlVar">
    <c:if test="${not empty view}">
        <c:param name='view' value='${view}'/>
    </c:if>
    <c:if test="${not empty param.numdays and view eq 'day'}"><c:param name='numdays' value='${param.numdays}'/></c:if>
    <c:if test="${not empty param.tz}"><c:param name='tz' value='${param.tz}'/></c:if>
    <c:choose>
        <c:when test="${not empty rawdate}">
            <c:param name='date'><fmt:formatDate timeZone="${timezone}" value="${rawdate.time}" pattern="yyyyMMdd"/></c:param>
        </c:when>
        <c:otherwise>
            <c:if test="${(not empty date or not empty param.date) and (not nodate)}">
                <c:param name='date' value='${not empty date ? date : param.date}'/>
            </c:if>
        </c:otherwise>
    </c:choose>
    <c:forEach items="${dynattrs}" var="a">
        <c:param name='${a.key}' value='${a.value}'/>
    </c:forEach>
</c:url>
