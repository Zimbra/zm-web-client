<%@ tag body-content="empty" %>
<%@ attribute name="folders" rtexprvalue="true" required="false" %>
<%@ attribute name="searches" rtexprvalue="true" required="false" %>
<%@ attribute name="contacts" rtexprvalue="true" required="false" %>
<%@ attribute name="voice" rtexprvalue="true" required="false" %>
<%@ attribute name="calendars" rtexprvalue="true" required="false" %>
<%@ attribute name="tasks" rtexprvalue="true" required="false" %>
<%@ attribute name="minical" rtexprvalue="true" required="false" %>
<%@ attribute name="date" rtexprvalue="true" required="false" type="java.util.Calendar" %>
<%@ attribute name="editmode" rtexprvalue="true" required="false" %>
<%@ attribute name="tags" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:if test="${folders}"><app:folderTree keys="${keys}" editmode="${editmode}"/></c:if>
<c:if test="${calendars}"><app:calendarFolderTree keys="${keys}" editmode="${editmode}"/></c:if>
<c:if test="${tasks}"><app:taskFolderTree keys="${keys}" editmode="${editmode}"/></c:if>
<c:if test="${contacts}"><app:contactFolderTree keys="${keys}" editmode="${editmode}"/></c:if>
<c:if test="${voice}"><app:voiceFolderTree keys="${keys}" editmode="${editmode}"/></c:if>
<c:if test="${mailbox.features.savedSearches}">
<c:if test="${searches}"><app:searchFolderTree keys="${keys}" editmode="${editmode}"/></c:if>
</c:if>
<c:if test="${mailbox.features.tagging}">
<c:if test="${tags}"><app:tagTree calendars="${calendars}" keys="${keys}" editmode="${editmode}"/></c:if>
</c:if>
<c:if test="${minical}"><br><app:miniCal date="${not empty date ? date : zm:getToday(mailbox.prefs.timeZone)}"/></c:if>
