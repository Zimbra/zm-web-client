    <%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<fmt:setBundle basename='/messages/TzMsg' var='TzMsg' scope='request' />
<table width="100%">
<tr>
<td>
<table class="ZOptionsSectionTable" width="100%">
    <tr class="ZOptionsHeaderRow">
        <td class="ImgPrefsHeader_L">
            &nbsp;
        </td>
        <td class='ZOptionsHeader ImgPrefsHeader' >
            <fmt:message key="optionsLoginOptions"/>
        </td>
        <td class="ImgPrefsHeader_R">
            &nbsp;
        </td>
    </tr>
</table>
<table width="100%" class="ZOptionsSectionMain" cellspacing="6">
    <tr>
        <td class='ZOptionsTableLabel'>
            <label><fmt:message key="optionsClientType"/>:</label> <!-- ${mailbox.prefs.clientType} -->
        </td>
        <td>
            <table>
                <tr>
                    <td>
                        <input id="clientA" type="radio" name="zimbraPrefClientType" value="advanced" <c:if test="${mailbox.prefs.isAdvancedClient}">checked</c:if>/>
                    </td>
                    <td>
                        <label for="clientA"><fmt:message key="optionsClientAdvanced"/></label>
                    </td>
                    <td>
                        <input id="clientS" type="radio" name="zimbraPrefClientType" value="standard" <c:if test="${mailbox.prefs.isStandardClient}">checked</c:if>/>
                    </td>
                    <td>
                        <label for="clientS"><fmt:message key="optionsClientStandard"/></label>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <c:if test="${mailbox.features.skinChange}">
    <tr>
        <td class='ZOptionsTableLabel'>
            <label for="skinPref"><fmt:message key="SKIN_uiTheme"/>:</label>
        </td>
        <td>
            <select name="zimbraPrefSkin" id="skinPref">
                <c:set var="skin" value="${mailbox.prefs.skin}"/>
                <c:forEach var="name" items="${mailbox.availableSkins}">
                    <fmt:message var="displayName" key="SKIN_${name}"/>
                    <option
                            <c:if test="${name eq skin}">selected</c:if>
                            value="${fn:escapeXml(name)}">${fn:escapeXml(fn:startsWith(displayName,'???') ? name : displayName)}</option>
                </c:forEach>
            </select>
        </td>
    </tr>
    </c:if>
    <tr>
        <td class='ZOptionsTableLabel'>
            <label for="timeZone"><fmt:message key="timeZonePref"/>:</label>
        </td>
        <td>
            <select name="zimbraPrefTimeZoneId" id="timeZone">
                <c:set var="tzpref" value="${mailbox.prefs.timeZoneCanonicalId}"/>
                <zm:forEachTimeZone var="tz">
                    <fmt:message var="displayName" bundle='${TzMsg}' key="${tz.id}"/>
                    <option
                            <c:if test="${tzpref eq tz.id}">selected</c:if>
                            value="${fn:escapeXml(tz.id)}">${fn:escapeXml(displayName)}</option>
                </zm:forEachTimeZone>
            </select>
        </td>
    </tr>
    
    <c:if test="${mailbox.features.changePassword}">
        <app:optSeparator/>
        <tr>
            <td class='ZOptionsTableLabel'>
                <label><fmt:message key="changePassword"/>:</label>
            </td>
            <td>
                <c:choose>
                    <c:when test="${mailbox.accountInfo.changePasswordURL ne null}">
                        <c:set var="changePassUrl" value="${mailbox.accountInfo.changePasswordURL}" />
                    </c:when>
                    <c:otherwise>
                        <c:set var="changePassUrl" value="${mailbox.accountInfo.publicURL}/h/changepass" />
                    </c:otherwise>
                </c:choose>
                <a href="${changePassUrl}" target="_blank"><fmt:message key="changePassword"/></a>
            </td>
        </tr>
    </c:if>
    <tr>
        <td colspan="2">
            &nbsp;
        </td>
    </tr>
</table>
<br/>
<table class="ZOptionsSectionTable" width="100%">
    <tr class="ZOptionsHeaderRow">
        <td class="ImgPrefsHeader_L">&nbsp;</td>
        <td class='ZOptionsHeader ImgPrefsHeader'>
            <fmt:message key="optionsSearches"/>
        </td>
        <td class="ImgPrefsHeader_R">&nbsp;</td>
    </tr>
</table>
<table width="100%" class="ZOptionsSectionMain" cellspacing="6">
	<c:if test="${zm:isMailEnabled(mailbox)}">
	<tr>
        <td class='ZOptionsTableLabel'>
            <label><fmt:message key="optionsSearchFolders"/>:</label>
        </td>
        <c:if test="${mailbox.features.spam}">
        <td>
            <app:optCheckbox boxfirst="true" label="includeJunkFolder" pref="zimbraPrefIncludeSpamInSearch"
                             checked="${mailbox.prefs.includeSpamInSearch}"/>
        </td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        </c:if>
        <td>
            <app:optCheckbox boxfirst="true" label="includeTrashFolder" pref="zimbraPrefIncludeTrashInSearch"
                             checked="${mailbox.prefs.includeTrashInSearch}"/>
        </td>
    </tr>
    <app:optSeparator/>
	</c:if>
	<tr>
        <td class='ZOptionsTableLabel'>
			<fmt:message key="optionsSearchLanguage"/>:
		</td>
        <td>
            <app:optCheckbox boxfirst="true" label="showSearchString" pref="zimbraPrefShowSearchString"
                             checked="${mailbox.prefs.showSearchString}"/>
        </td>
    </tr>
    <tr>
        <td colspan="2">&nbsp;</td>
    </tr>
</table>
<br/>
<table class="ZOptionsSectionTable" width="100%">
    <tr class="ZOptionsHeaderRow">
        <td class="ImgPrefsHeader_L">&nbsp;</td>
        <td class='ZOptionsHeader ImgPrefsHeader'>
            <fmt:message key="other"/>
        </td>
        <td class="ImgPrefsHeader_R">&nbsp;</td>
    </tr>
</table>
<table width="100%" class="ZOptionsSectionMain" cellspacing="6">
    <tr>
    <td class='ZOptionsTableLabel'>
        <label for="printFont"><fmt:message key="printFontSizePref"/>:</label>
    </td>
    <td>
        <select name="zimbraPrefDefaultPrintFontSize" id="printFont">
            <c:set var="printpref" value="${mailbox.prefs.defaultPrintFontSize}"/>
            <option <c:if test="${printpref eq '8pt'}"> selected</c:if> value="8pt">8pt</option>
            <option <c:if test="${printpref eq '10pt'}"> selected</c:if> value="10pt">10pt</option>
            <option <c:if test="${printpref eq '12pt'}"> selected</c:if> value="12pt">12pt</option>
            <option <c:if test="${printpref eq '14pt'}"> selected</c:if> value="14pt">14pt</option>
            <option <c:if test="${printpref eq '18pt'}"> selected</c:if> value="18pt">18pt</option>
            <option <c:if test="${printpref eq '24pt'}"> selected</c:if> value="24pt">24pt</option>
            <option <c:if test="${printpref eq '36pt'}"> selected</c:if> value="36pt">36pt</option>
        </select>
    </td>
    </tr>
</table>
</td>
</tr>
</table>
