<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<table border="0" cellpadding="0" cellspacing="10" width="100%">
    <tr>
        <td>
            <table class="ZOptionsSectionTable" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr class="ZOptionsHeaderRow">
                    <td class="ImgPrefsHeader_L">
                        &nbsp;
                    </td>
                    <td class='ZOptionsHeader ImgPrefsHeader' >
                        <fmt:message key="optionsContacts"/>
                    </td>
                    <td class="ImgPrefsHeader_R">
                        &nbsp;
                    </td>
                </tr>
            </table>

            <table width="100%" cellpadding="3" class="ZOptionsSectionMain">
                <tr>
                    <td class='ZOptionsTableLabel'>
                        <fmt:message key="optionsDisplay"/> :
                    </td>
                    <td>
                        <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td>
                                    <select name="zimbraPrefMailItemsPerPage" id="itemsPP">
                                        <c:set var="mailItemsPP" value="${mailbox.prefs.mailItemsPerPage}"/>
                                        <option
                                                <c:if test="${mailItemsPP eq 10}"> selected</c:if>
                                                >10
                                        </option>
                                        <option
                                                <c:if test="${mailItemsPP eq 25}"> selected</c:if>
                                                >25
                                        </option>
                                        <option
                                                <c:if test="${mailItemsPP eq 50}"> selected</c:if>
                                                >50
                                        </option>
                                        <option
                                                <c:if test="${mailItemsPP eq 100}"> selected</c:if>
                                                >100
                                        </option>
                                    </select>
                                </td>
                                <td style='padding-left:5px'>
                                    <label for="itemsPP"><fmt:message key="optionsContactsPerPage"/></label>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <app:optSeparator/>
                <tr>
                    <td class='ZOptionsTableLabel'>
                    </td>
                    <td>
                        <app:optCheckbox boxfirst="true" trailingcolon="true"  label="autoAddContacts" pref="zimbraPrefAutoAddAddressEnabled"
                                         checked="${mailbox.prefs.autoAddAddressEnabled}"/>
                    </td>
                </tr>
                <app:optSeparator/>
                <tr>
                    <td colspan=2 style='text-align:left;font-weight:bold;'>
                        <fmt:message key="optionsManageAddressBooks">
                            <fmt:param><fmt:message key="optionsManageAddressBooksPre"/></fmt:param>
                            <fmt:param><a href="maddrbooks"><fmt:message key="optionsManageAddressBooksLink"/></a></fmt:param>
                            <fmt:param><fmt:message key="optionsManageAddressBooksPost"/></fmt:param>
                        </fmt:message>
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