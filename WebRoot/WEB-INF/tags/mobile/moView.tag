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
<c:if test="${!requestScope.headIncluded}">
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
    <mo:head mailbox="${mailbox}" title="${title}" scale="${scale}"/>
    <body <c:if test="${not empty onload}">onload="${onload}"</c:if> <c:if test="${not empty clazz}">class="${clazz}
    "</c:if>>
    <c:set value="true" var="headIncluded" scope="request"/>
</c:if>
<c:if test="${not empty requestScope.statusMessage}">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style='padding:5px'>
                <div class='${requestScope.statusClass}'>${fn:escapeXml(requestScope.statusMessage)}</div>
            </td>
        </tr>
    </table>
</c:if>
<jsp:doBody/>
<c:if test="${!requestScope.headIncluded}">
    </body>
    <%--
    <script type="text/javascript" xml:space="preserve">
        addEventListener("load", function()
          {
              window.scrollTo(0, 1);
          }, false);
    </script>--%>
    </html>
</c:if>
