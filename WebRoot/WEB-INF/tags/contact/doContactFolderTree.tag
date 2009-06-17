<%@ tag body-content="empty" %>
<%@ attribute name="parentid" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="skiproot" rtexprvalue="true" required="true" %>
<%@ attribute name="skipsystem" rtexprvalue="true" required="true" %>
<%@ attribute name="skiptopsearch" rtexprvalue="true" required="false" %>
<%@ attribute name="skiptrash" rtexprvalue="true" required="false" %>
<%@ attribute name="table" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<c:set var="done" value="${false}"/>
<zm:forEachFolder var="folder" skiproot="${skiproot}" parentid="${parentid}" skipsystem="${skipsystem}" expanded="${sessionScope.expanded}" skiptopsearch="${skiptopsearch}">
    <c:if test="${folder.isContactView}">

        <c:if test="${table and not done}">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding-top:5px">
            <c:set var="done" value="${true}"/>
        </c:if>
        <app:overviewFolder folder="${folder}" types="contact"/>
    </c:if>
</zm:forEachFolder>

<c:if test="${done}">
 </table>
</c:if>
