<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
<%@ tag body-content="scriptless" %>
<%@ attribute name="query" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="calendars" rtexprvalue="true" required="false" %>
<%@ attribute name="tasks" rtexprvalue="true" required="false" %>
<%@ attribute name="briefcases" rtexprvalue="true" required="false" %>
<%@ attribute name="voice" rtexprvalue="true" required="false" %>
<%@ attribute name="web" rtexprvalue="true" required="false" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<table width="100%" cellspacing="0" border="0" align="right">
<tr style="height:35px">
    <td height="25" nowrap class="SearchBar">
        <c:choose>
            <c:when test="${calendars}">
                <app:calendarUrl var="searchUrl"/>
            </c:when>
            <c:otherwise>
                <c:url var="searchUrl" value="/h/search"/>
            </c:otherwise>
        </c:choose>
        <form method="get" onsubmit="return searchClick(this);" action="${fn:escapeXml(zm:replaceAll(searchUrl,'javascript:',''))}">
            <c:set var="query">${fn:escapeXml((!empty query and mailbox.prefs.showSearchString and empty param.incShared) ? query : param.sq)}</c:set>
            <c:if test="${voice}">
                <c:set var="query"/>
            </c:if>
            <c:if test="${zm:boolean(param.hideSearchString)}">
                <c:set var="query" value=""/>
            </c:if>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
            <td nowrap="nowrap">
            <label for="searchField"><fmt:message key="find"/>&nbsp;:&nbsp;</label>
			</td>
           <td class="ImgField_L searchwidth"></td>
            <td class="SearchFieldWidth"><input id="searchField" class="searchField" maxlength="2048" name="sq" value="${query}"></td>
            <td class="ImgField_R searchwidth"></td>
            <td nowrap="nowrap"><input type="checkbox" name="incShared" value="1" <c:if test="${not empty param.incShared}"> checked </c:if> /></td><td nowrap="nowrap">&nbsp;<fmt:message key="includeShared"/></td>    
            <c:if test="${mailbox.features.mail||mailbox.features.contacts||mailbox.features.calendar||mailbox.features.tasks}">    
            <td nowrap="nowrap" style="padding-left: 2px;">&nbsp;<fmt:message key="in"/>&nbsp;</td>
            <td style="padding-left: 2px;">
            <c:choose>
                <c:when test="${param.st eq 'contact' || fn:endsWith(pageContext.request.requestURI,'maddrbooks') }"><c:set var="isContact" value="${true}"/></c:when>
                <c:otherwise><c:set var="isMail" value="${true}"/></c:otherwise>
            </c:choose>
            <select name="st">
                <c:if test="${zm:boolean(web)}">
                    <option value="web"/><fmt:message key="searchWeb"/>
                </c:if>
                <c:if test="${zm:isMailEnabled(mailbox)}">
                    <option <c:if test="${zm:boolean(isMail)}">selected </c:if>value="${mailbox.features.conversations ? mailbox.prefs.groupMailBy : 'message'}"/><fmt:message key="searchMail"/>
                </c:if>
                <c:if test="${mailbox.features.contacts}">
                    <option <c:if test="${zm:boolean(isContact)}">selected </c:if>value="contact"/><fmt:message key="searchPersonalContacts"/>
                </c:if>
                <c:if test="${mailbox.features.gal}">
                    <option <c:if test="${param.st eq 'gal'}">selected </c:if>value="gal"/><fmt:message key="GAL"/>
                </c:if>
                <c:if test="${mailbox.features.calendar}">
                    <option <c:if test="${zm:boolean(calendars)}">selected </c:if> value="appointment"/><fmt:message key="searchPersonalCalendars"/>
                </c:if>
                <c:if test="${mailbox.features.tasks}">
                    <option <c:if test="${zm:boolean(tasks)}">selected </c:if> value="task"/><fmt:message key="searchPersonalTaskLists"/>
                </c:if>
            </select>
            </td>
            </c:if>    
            <td style="padding-left: 10px;">
            <input class="SearchButton" type="submit" name="search" value="<fmt:message key="search"/>">
            <c:if test="${calendars}">
				<c:if test="${not empty param.tz}"><input type="hidden" name="tz" value='${fn:escapeXml(param.tz)}'/></c:if>
                <c:if test="${not empty param.date}"><input type="hidden" name="date" value='${fn:escapeXml(param.date)}'/></c:if>
                <c:if test="${not empty param.view}"><input type="hidden" name="view" value='${fn:escapeXml(param.view)}'/></c:if>
            </c:if>
            </td>
            </tr></table>
        </form>
    </td>
</tr>
</table>
<fmt:message var="searchUrl" key="searchURL" />
<fmt:message var="searchParam" key="searchFieldName" />
<script type="text/javascript">
searchClick = function(_form){
      if(_form.st.options[_form.st.selectedIndex].value == "web"){
          window.open("${searchUrl}?${searchParam}="+_form.sq.value);
          return false;
      }else{
          return true;
      }
}
</script>
