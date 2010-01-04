<%@ tag body-content="empty" %>
<%@ attribute name="parentid" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="skiproot" rtexprvalue="true" required="true" %>
<%@ attribute name="skipsystem" rtexprvalue="true" required="true" %>
<%@ attribute name="skiptopsearch" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'mosearch'}"/>
<zm:forEachFolder var="folder" skiproot="${skiproot}" parentid="${parentid}" skipsystem="${skipsystem}"  skiptopsearch="${skiptopsearch}">
    <c:if test="${!folder.isSystemFolder and (folder.isNullView or folder.isMessageView or folder.isConversationView)}">
        <c:if test="${!folder.isSearchFolder}">
            <mo:overviewFolder base="${context_url}" folder="${folder}"/>
        </c:if>
        <c:if test="${folder.isSearchFolder and folder.depth gt 0}">
            <mo:overviewSearchFolder folder="${folder}"/>
        </c:if>
    </c:if>
</zm:forEachFolder>
