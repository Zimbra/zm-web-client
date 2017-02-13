<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<table width="100%" cellpadding="0" cellspacing="0">
   <tr>
	<td><div style='width:15px'></div></td>
    <td height="25" nowrap class="SearchBar">
        <form method="get" action="<fmt:message key="searchURL"/>" target='_blank'>
            <table cellpadding="0" cellspacing="0" border="0">
            <tr>
				<td nowrap="nowrap" style="padding-right: 2px;">
					<label for="searchWebField"><fmt:message key="searchWeb"/> :</label>
				</td>
		    	<td class="ImgField_L searchwidth"></td>
				<td class='SearchFieldWidth' nowrap="nowrap">
                    <input type="hidden" name="fr" value="zim-mails" />
                    <input  id="searchWebField" name='<fmt:message key="searchFieldName"/>' class="YsearchField" maxlength="2048" value=""></td>
				<td class="ImgField_R searchwidth"></td>
				<td nowrap="nowrap">
					<button class="SearchButton" type="submit" name="search"><app:img src="startup/ImgWebSearch.png" altkey='ALT_SEARCH'/></button>
				</td>
            </tr>
           </table>
        </form>
    </td>
  </tr>
</table>