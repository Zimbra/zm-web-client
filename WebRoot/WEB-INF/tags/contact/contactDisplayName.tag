<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ tag import="java.util.*" %>
<%@ tag import="com.zimbra.cs.taglib.bean.BeanUtils,com.zimbra.cs.taglib.bean.ZContactBean" %>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%-- NOTE: Keep in sync with mo:contactDisplayName --%>
<c:choose>
    <c:when test="${contact.isGroup}">
        ${fn:escapeXml(contact.displayFileAs)}
    </c:when>
    <c:otherwise>
        <fmt:bundle basename="/messages/ZmMsg">
            <c:choose>
                <c:when test="${not empty contact.nameSuffix}">
                    <c:choose>
                        <c:when test="${not empty contact.maidenName and contact.maidenName ne ''}">
                            <fmt:message var="pattern" key="fullnameMaidenSuffix" />
                        </c:when>
                        <c:otherwise>
                            <fmt:message var="pattern" key="fullnameSuffix" />
                        </c:otherwise>
                    </c:choose>
                </c:when>
                <c:when test="${not empty contact.maidenName and contact.maidenName ne ''}">
                    <fmt:message var="pattern" key="fullnameMaiden" />
                </c:when>
                <c:otherwise>
                    <fmt:message var="pattern" key="fullname" />
                </c:otherwise>
            </c:choose>
        </fmt:bundle>
        <%
            PageContext pageContext = (PageContext)getJspContext();

            // get contact fields
            ZContactBean contact = (ZContactBean)pageContext.findAttribute("contact");
            String[] rubyPairs = {
                contact.getNamePrefix(),    null,
                contact.getFirstName(),     contact.getPhoneticFirstName(),
                contact.getMiddleName(),    null,
                contact.getMaidenName(),    null,
                contact.getLastName(),      contact.getPhoneticLastName(),
                contact.getNameSuffix(),    null
            };

            // print segments
            String pattern = (String)pageContext.findAttribute("pattern");
            for (Object segment : getPatternSegments(pattern)) {
                if (segment instanceof Integer) {
                    int index = ((Integer)segment).intValue();
                    pageContext.setAttribute("base", rubyPairs[index*2], PageContext.PAGE_SCOPE);
                    pageContext.setAttribute("text", rubyPairs[index*2+1], PageContext.PAGE_SCOPE);
                    %><app:ruby base="${base}" text="${text}" /><%
                }
                else {
                    out.print(String.valueOf(segment));
                }
            }
        %>
    </c:otherwise>
</c:choose>
<%!
/**
 * Parses a simple MessageFormat pattern and returns a list of
 * the segments. Each element in the returned list will either
 * be a String literal or an Integer index of the replacement
 * parameter.
 */
static List getPatternSegments(String pattern) {
    List list = new LinkedList();

    int length = pattern.length();
    int offset = 0;
    while (offset < length) {
        // find replacement arg
        int ocurly = pattern.indexOf('{', offset);
        if (ocurly == -1) break;
        int ccurly = pattern.indexOf('}', ocurly + 1);
        if (ccurly == -1) break;

        // add leading text
        if (offset < ocurly) {
            list.add(pattern.substring(offset, ocurly));
        }

        // add replacement arg index
        try {
            list.add(Integer.parseInt(pattern.substring(ocurly + 1, ccurly).trim()));
        }
        catch (NumberFormatException e) {
            list.add(pattern.substring(ocurly, ccurly + 1));
        }

        // keep going
        offset = ccurly + 1;
    }

    // add trailing text
    if (offset < length) {
        list.add(pattern.substring(offset));
    }

    return list;
}
%>
