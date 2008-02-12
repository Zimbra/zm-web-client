<%@ tag body-content="empty" %>
<%@ attribute name="flagged" rtexprvalue="true" required="true" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:choose><c:when test="${flagged}"><app:img altkey="ALT_FLAGGED" src="startup/ImgFlagRed.gif" /></c:when><c:otherwise>&nbsp;</c:otherwise></c:choose>
