<%@ tag body-content="scriptless" %>
<%@ attribute name="style" rtexprvalue="true" required="false" %>
<%@ attribute name="html" rtexprvalue="true" required="false" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<c:set var="statusMessage" scope="request"><jsp:doBody/></c:set>
<c:set var="statusClass" scope="request" value="Status${empty style ? 'Info' : style}"/>
<c:set var="statusHtml" scope="request" value="${empty html ? false : html}"/>
