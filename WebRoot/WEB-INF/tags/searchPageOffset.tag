<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="searchResult" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZSearchResultBean"%>
<%@ attribute name="max" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:set var="first" value="${searchResult.size eq 0 ? 0 : searchResult.offset+1}"/>
<c:set var="last" value="${searchResult.offset+searchResult.size}"/>    
<span class='Paging'>
${first} <c:if test="${first ne last}"> - ${last}</c:if>
<c:if test="${!empty max}"> of ${max} </c:if>
<c:if test="${empty max and !searchResult.hasMore}">&nbsp;<fmt:message key="of"/>&nbsp;${last} </c:if>
</span>
