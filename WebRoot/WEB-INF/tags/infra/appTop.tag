<%@ tag body-content="scriptless" %>
<%@ attribute name="query" rtexprvalue="true" required="false" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<zm:getMailbox var="mailbox"/>

<tr height=35 >
    <td style='width:80%' height=25 nowrap>
        <div class='SearchBar'>
            <c:url var="searchUrl" value="/h/search"/>
            <form method="get" action="${searchUrl}">
                <c:set var="query">${fn:escapeXml((!empty query and mailbox.prefs.showSearchString) ? query : param.sq)}</c:set>
                    &nbsp;<fmt:message key="find"/> :
                    <input class="searchField" style='width:50%' maxlength=2048 name=sq accesskey="q" value="${query}">
                    &nbsp;<fmt:message key="in"/>&nbsp;
                    <c:choose>
                        <c:when test="${param.st eq 'contact'}"><c:set var="isContact" value="${true}"/></c:when>
                        <c:otherwise><c:set var="isMail" value="${true}"/></c:otherwise>
                    </c:choose>
                    <select name="st">
                        <option <c:if test="${isMail}">selected </c:if>value="${mailbox.features.conversations ? mailbox.prefs.groupMailBy : 'message'}"/><fmt:message key="searchMail"/>
                        <option <c:if test="${isContact}">selected </c:if>value="contact"/><fmt:message key="searchPersonalContacts"/>
                    </select>
                    <input class="SearchButton" type=submit name=search value="<fmt:message key="search"/>">
            </form>
        </div>
    </td>
    <td align=right>
        <c:set var="max" value="${mailbox.attrs.zimbraMailQuota[0]}"/>
        <fmt:message var="unlimited" key="unlimited"/>
        <fmt:message key="quotaUsage">
            <fmt:param value="${zm:displaySize(mailbox.size)}"/>
            <fmt:param value="${max==0 ? unlimited : zm:displaySize(max)}"/>
        </fmt:message>
    </td>
</tr>

