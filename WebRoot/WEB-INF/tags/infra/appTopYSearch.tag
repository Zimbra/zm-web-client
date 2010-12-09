<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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