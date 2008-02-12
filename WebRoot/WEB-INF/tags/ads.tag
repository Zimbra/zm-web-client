<%@ tag body-content="empty" %>
<%@ attribute name="content" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<c:url var="url" value="/h/ads">
   <c:param name="f" value="${content}"/>
</c:url>
<!-- ||${content}|| -->
<iframe width="163" height="606" frameborder="0" scrolling="no" src="${url}"></iframe>