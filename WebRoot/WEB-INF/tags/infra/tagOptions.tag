<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:if test="${mailbox.features.tagging and mailbox.hasTags}">
    <option disabled /><fmt:message key="actionOptSep"/>
    <option disabled /><fmt:message key="actionAddTag"/>
    <zm:forEachTag var="tag">
        <option <c:if test="${keys}">id="OPTAG${tag.id}"</c:if> value="t:${tag.id}" />${fn:escapeXml(tag.name)}
    </zm:forEachTag>
    <option disabled /><fmt:message key="actionOptSep"/>
    <option disabled /><fmt:message key="actionRemoveTag"/>
    <zm:forEachTag var="tag">
        <option <c:if test="${keys}">id="OPUNTAG${tag.id}"</c:if> value="u:${tag.id}" />${fn:escapeXml(tag.name)}
    </zm:forEachTag>
    <option value="u:all" />all
</c:if>
