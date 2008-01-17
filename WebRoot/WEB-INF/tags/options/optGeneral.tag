<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<fmt:setBundle basename='/messages/AjxMsg' var='AjxMsg' scope='session' />
<table width="100%" cellpadding="10" cellspacing="10">
<tr>
<td>
<table class="ZOptionsSectionTable" border="0" cellpadding="0" cellspacing="0" width="100%">
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
<table cellpadding="3" border="0" class="ZOptionsSectionMain" cellspacing="0" width="100%">
    <tr>
        <td class='ZOptionsTableLabel'>
            <fmt:message key="optionsClientType"/>: <!-- ${mailbox.prefs.clientType} -->
        </td>
        <td>
            <table border="0" cellpadding="0" cellspacing="3">
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
    <tr>
        <td class='ZOptionsTableLabel'>
            <label for="skinPref"><fmt:message key="SKIN_uiTheme"/>
                :</label>
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
    <tr>
        <td class='ZOptionsTableLabel'>
            <label for="timeZone"><fmt:message key="timeZonePref"/>
                :</label>
        </td>
        <td>
            <select name="zimbraPrefTimeZoneId" id="timeZone">
                <c:set var="tzpref" value="${mailbox.prefs.timeZoneWindowsId}"/>
                <zm:forEachTimeZone var="tz">
                    <fmt:message var="displayName" bundle='${AjxMsg}' key="${tz.javaId}"/>
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
                <fmt:message key="changePassword"/>
                :
            </td>
            <td>
                <c:url var="changePassUrl" value="${zm:getChangePasswordUrl(pageContext, '/h/changepass')}"/>
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
<table class="ZOptionsSectionTable" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr class="ZOptionsHeaderRow">
        <td class="ImgPrefsHeader_L">
            &nbsp;
        </td>
        <td class='ZOptionsHeader ImgPrefsHeader'>
            <fmt:message key="optionsSearches"/>
        </td>
        <td class="ImgPrefsHeader_R">
            &nbsp;
        </td>
    </tr>
</table>
<table cellpadding="3" width="100%" class="ZOptionsSectionMain">
    <tr>
        <td class='ZOptionsTableLabel'>
            <fmt:message key="optionsSearchFolders"/>
            :
        </td>
        <td>
            <app:optCheckbox boxfirst="true" label="includeJunkFolder" pref="zimbraPrefIncludeSpamInSearch"
                             checked="${mailbox.prefs.includeSpamInSearch}"/>
        </td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td>
            <app:optCheckbox boxfirst="true" label="includeTrashFolder" pref="zimbraPrefIncludeTrashInSearch"
                             checked="${mailbox.prefs.includeTrashInSearch}"/>
        </td>
    </tr>
    <app:optSeparator/>
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
        <td colspan="2">
            &nbsp;
        </td>
    </tr>
</table>
</td>
</tr>
</table>
