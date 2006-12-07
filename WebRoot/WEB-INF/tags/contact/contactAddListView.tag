<%@ tag body-content="empty" %>
<%@ attribute name="searchResult" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZSearchResultBean"%>
<%@ attribute name="searchGalResult" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZSearchGalResultBean"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>



<div class=List>
    <table width=100% cellpadding=2 cellspacing=0>
        <tr>
            <th width=1%>&nbsp;
            <th width=2%><fmt:message key="to"/>:
            <th width=2%><fmt:message key="cc"/>:
            <th width=2%><fmt:message key="bcc"/>:
            <th width=1%>&nbsp;
            <th width=1%>&nbsp;
            <th width=1%>&nbsp;
            <c:choose>
            <c:when test="${not empty searchGalResult}">
            <th nowrap><fmt:message key="email"/>
            </c:when>
            <c:otherwise>
            <th width=20% nowrap><fmt:message key="name"/>
            <th ><fmt:message key="email"/>
            </c:otherwise>
            </c:choose>
        </tr>
        <c:forEach items="${searchResult.contactHits}" var="contactHit" varStatus="status">
            <tr>
                <td width=1%>&nbsp;</td>
                <td width=2% nowrap><input type=checkbox  name="addTo" value="${fn:escapeXml(contactHit.fullAddress)}"></td>
                <td width=2% nowrap><input type=checkbox name="addCc" value="${fn:escapeXml(contactHit.fullAddress)}"></td>
                <td width=2% nowrap><input type=checkbox  name="addBcc" value="${fn:escapeXml(contactHit.fullAddress)}"></td>
                <td width=1%><app:miniTagImage ids="${contactHit.tagIds}"/></td>
                <td width=1%><app:img src="${contactHit.image}" alt="Contact"/></td>
                <td width=1%>&nbsp;</td>
                <td width=20%>
                        ${fn:escapeXml(empty contactHit.fileAsStr ? '' : contactHit.fileAsStr)}
                </td>
                <td ><c:if test="${empty contactHit.displayEmail}">
                    &nbsp;</c:if>${fn:escapeXml(contactHit.displayEmail)}</td>
            </tr>
        </c:forEach>
        <c:forEach items="${searchGalResult.contacts}" var="contact" varStatus="status">
            <tr>
                <td width=1%>&nbsp;</td>
                <td width=2% nowrap><input type=checkbox  name="addTo" value="${fn:escapeXml(contact.galFullAddress)}"></td>
                <td width=2% nowrap><input type=checkbox name="addCc" value="${fn:escapeXml(contact.galFullAddress)}"></td>
                <td width=2% nowrap><input type=checkbox  name="addBcc" value="${fn:escapeXml(contact.galFullAddress)}"></td>
                <td width=1%><app:miniTagImage ids="${contact.tagIds}"/></td>
                <td width=1%><app:img src="${contact.image}" alt="Contact"/></td>
                <td width=1%>&nbsp;</td>
                <td >
                        ${fn:escapeXml(contact.galFullAddress)}
                </td>
            </tr>
        </c:forEach>
    </table>
    <c:choose>
        <c:when test="${searchResult eq null and searchGalResult eq null}">
            <div class='InitialContactSearch'><fmt:message key="enterContactToSearchFor"/></div>
        </c:when>
    <c:when test="${(searchResult ne null and searchResult.contactSize eq 0) or (searchGalResult ne null and searchGalResult.size eq 0)}">
        <div class='NoResults'><fmt:message key="noResultsFound"/></div>
    </c:when>
    </c:choose>
</div> <%-- list --%>

