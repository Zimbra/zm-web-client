<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="numdays" rtexprvalue="true" required="true" %>
<%@ attribute name="view" rtexprvalue="true" required="true" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<rest:handleError>

    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="context" value="${null}"/>
    <fmt:message var="yearTitleFormat" key="CAL_DAY_TITLE_YEAR_FORMAT"/>
    <c:set var="firstDOW" value="${requestScope.zimbra_target_account_prefCalendarFirstDayOfWeek}"/>
    <c:set var="currentDay" value="${zm:getFirstDayOfMultiDayView(date, firstDOW, view)}"/>
    <c:set var="scheduleView" value="${view eq 'schedule'}"/>
    <c:choose>
        <c:when test="${scheduleView}">
            <fmt:message var="titleFormat" key="CAL_SCHEDULE_TITLE_FORMAT"/>
            <fmt:formatDate var="pageTitle" value="${currentDay.time}" pattern="${titleFormat}"/>
            <fmt:message var="tbTitleFormat" key="CAL_SCHEDULE_TB_TITLE_FORMAT"/>
            <fmt:formatDate var="tbTitle" value="${currentDay.time}" pattern="${tbTitleFormat}"/>
        </c:when>
        <c:when test="${numdays eq 1}">
            <fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
            <fmt:formatDate var="pageTitle" value="${currentDay.time}" pattern="${titleFormat}"/>
            <fmt:message var="tbTitleFormat" key="CAL_DAY_TB_TITLE_FORMAT"/>
            <fmt:formatDate var="tbTitle" value="${currentDay.time}" pattern="${tbTitleFormat}"/>
        </c:when>
        <c:otherwise>
            <fmt:message var="singleDayFormat" key="CAL_DAY_TB_TITLE_FORMAT"/>
            <fmt:message var="pageTitle" key="CAL_MDAY_TITLE_FORMAT">
                <fmt:param><fmt:formatDate value="${currentDay.time}" pattern="${singleDayFormat}"/></fmt:param>
                <fmt:param><fmt:formatDate value="${zm:addDay(currentDay, numdays-1).time}" pattern="${singleDayFormat}"/></fmt:param>
            </fmt:message>
            <c:set var="tbTitle" value="${pageTitle}"/>
        </c:otherwise>
    </c:choose>

    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="dayIncr" value="${(view eq 'workWeek') ? 7 : numdays}"/>
    <c:set var="prevDate" value="${zm:addDay(date, -dayIncr)}"/>
    <c:set var="nextDate" value="${zm:addDay(date,  dayIncr)}"/>

    <c:set var="rangeEnd" value="${zm:addDay(currentDay,numdays).timeInMillis}"/>
    <c:set var="checkedCalendars" value="${requestScope.zimbra_target_item_id}"/>

    <%-- fetch mini cal appts first, so they are in cache, as well as any data neded by this view --%>
    <c:set var="multiDay">
        <rest:multiDay mailbox="${mailbox}" date="${date}" numdays="${numdays}" view="${view}" timezone="${timezone}" query="${requestScope.calendarQuery}"/>
    </c:set>

</rest:handleError>

<rest:view title="${not empty requestScope.zimbra_target_item_name ? requestScope.zimbra_target_item_name : requestScope.zimbra_target_account_name}: ${pageTitle}" rssfeed="${true}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td style='padding:20px'>
                <table width="100%" style="height:100%;" cellpadding="0" cellspacing="0" border="0">
                    <c:if test="${param.notoolbar ne '1'}">
                        <tr>
                            <td class='TbTop'>
                                <rest:calendarViewToolbar timezone="${timezone}" today="${today}" date="${date}" prevDate="${prevDate}"
                                                          nextDate="${nextDate}" title="${tbTitle}" context="${context}" keys="true"/>
                            </td>
                        </tr>
                    </c:if>
                    <tr>
                        <td class='ZhAppContent'>
                                ${multiDay}
                        </td>
                    </tr>
                    <tr>
                        <td class='TbBottom'>
                            <rest:calendarViewBottomToolbar timezone="${timezone}"/>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <SCRIPT TYPE="text/javascript">
        <!--
    function zSelectRow(ev,id) {var t = ev.target || ev.srcElement;if (t&&t.nodeName != 'INPUT'){var a = document.getElementById(id); if (a) window.location = a.href;} }
    //-->
   </SCRIPT>
</rest:view>
