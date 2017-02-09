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

<table width="100%">
    <tr>
        <td>
            <table class="ZOptionsSectionTable" width="100%">
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
            <table width="100%" class="ZOptionsSectionMain" cellspacing="6">
                <tr>
                    <td>
                        <table width=100% class="ZPropertySheet" cellspacing="6">
                            <tr>
                                <td class='ZOptionsTableLabel'>
                                    <label><fmt:message key="optionsDisplay"/>:</label> 
                                </td>
                                <td>
                                    <table>
                                        <tr>
                                            <td>
                                                <select name="zimbraPrefContactsPerPage" id="itemsPP">
                                                    <c:set var="pageSize" value="${mailbox.prefs.contactsPerPage}"/>
                                                    <option
                                                            <c:if test="${pageSize eq 10}"> selected</c:if>
                                                            >10
                                                    </option>
                                                    <option
                                                            <c:if test="${pageSize eq 25}"> selected</c:if>
                                                            >25
                                                    </option>
                                                    <option
                                                            <c:if test="${pageSize eq 50}"> selected</c:if>
                                                            >50
                                                    </option>
                                                    <option
                                                            <c:if test="${pageSize eq 100}"> selected</c:if>
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
                        </table>
                    </td>
                </tr>
                <app:optSeparator/>

                <tr>
                    <td>
                        <table class="ZPropertySheet" cellspacing="6">
                            <tr>
                                <td class='ZOptionsTableLabel'>
                                    <label><fmt:message key="optionsAutoAdd"/>:</label>
                                </td>
                                <td>
                                    <app:optCheckbox boxfirst="true" trailingcolon="false" label="autoAddContacts" 
										pref="zimbraPrefAutoAddAddressEnabled" checked="${mailbox.prefs.autoAddAddressEnabled}"/>
                                </td>
                            </tr>
						</table>
					</td>
                </tr>
                <app:optSeparator/>
                
                <tr>
                    <td>
                        <table width="100%">
                            <tr>
								<td class='ZOptionsTableField' style='text-align:center;font-weight:bold;width:auto;'>
                                    <fmt:message key="optionsManageAddressBooks">
                                        <fmt:param><fmt:message key="optionsManageAddressBooksPre"/></fmt:param>
                                        <fmt:param><a href="maddrbooks"><fmt:message key="optionsManageAddressBooksLink"/></a></fmt:param>
                                        <fmt:param><fmt:message key="optionsManageAddressBooksPost"/></fmt:param>
                                    </fmt:message>
                                </td>
                            </tr>
                            <tr>
                                <td>&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>