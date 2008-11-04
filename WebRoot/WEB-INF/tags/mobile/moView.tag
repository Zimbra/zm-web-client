<%@ tag body-content="scriptless" %>
<%@ attribute name="title" rtexprvalue="true" required="true" %>
<%@ attribute name="scale" rtexprvalue="true" required="false" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="onload" rtexprvalue="true" required="false" %>
<%@ attribute name="clazz" rtexprvalue="true" required="false" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<c:if test="${requestScope.headIncluded == null}">
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
    <mo:head mailbox="${mailbox}" title="${title}" scale="${scale}"/>
    <body onload="<c:if test="${not empty onload}">${onload}</c:if>" <c:if test="${not empty clazz}">class="${clazz}
    "</c:if>>
    <zm:getUserAgent var="ua" session="true"/>
    <c:if test="${ua.isiPhone or ua.isiPod}">
        <script type="text/javascript" xml:space="preserve">
            addEventListener("load", function()
              {
                setTimeout(function() { window.scrollTo(0, 1);}, 0);
              }, false);
        </script>
    </c:if>
    <c:set value="${true}" var="headIncluded" scope="request"/>
</c:if>
<c:if test="${(not empty requestScope.statusMessage || not empty param.appmsg ) && requestScope.headIncluded != null && !requestScope.statusMsgRendered}">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style='padding:5px'>
                    <c:choose>
                        <c:when test="${not empty param.appmsg}">
                            <div class='StatusInfo'><fmt:message key="${fn:escapeXml(param.appmsg)}"/></div>
                        </c:when>
                        <c:otherwise>
                            <div class="${requestScope.statusClass}">${fn:escapeXml(requestScope.statusMessage)} </div>
                        </c:otherwise>
                    </c:choose>
            </td>
        </tr>
    </table>
    <c:set var="statusMsgRendered" scope="request" value="${true}"/>
</c:if>
<jsp:doBody/>
<c:if test="${requestScope.headIncluded == null}">
    </body>
    </html>
</c:if>

