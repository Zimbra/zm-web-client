<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="firstAttachment" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="url" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="displayName" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="contentType" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="checked" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="displaySize" rtexprvalue="true" required="false" type="java.lang.String" %>
<%@ attribute name="value" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="name" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<fmt:setBundle basename="/msgs/ZhMsg" scope='request' />
<div class="CompOrigAtt table">
    <div class="table-row">
        <c:set var="pname" value="${displayName}"/>
        <c:if test="${empty displayName}">
            <fmt:message key="unknownContentType" var="displayName">
                <fmt:param value="${contentType}"/>
            </fmt:message>
        </c:if>
        <span class="table-cell">
            <%--<mo:img altkey="ALT_ATTACHMENT" src="startup/ImgAttachment.gif"/>--%>
            <span class="Attachment">&nbsp;</span>
            <input <c:if test="${checked}">checked </c:if>type=checkbox name="${name}" value="${value}">
            <a target="_blank" href="${fn:escapeXml(url)}&amp;disp=i">${fn:escapeXml(displayName)}</a>&nbsp;<c:if test="${displaySize}">(${displaySize})</c:if>
        </span>
        </div>
</div>
