<%@ tag body-content="scriptless" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
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
                    <input  id="searchWebField" name='<fmt:message key="searchFieldName"/>' class="searchField" maxlength="2048" value="" style="width: 97%"></td>
				<td class="ImgField_R searchwidth"></td>
				<td nowrap="nowrap">
					<button class="SearchButton" type="submit" name="search"><app:img src="startup/ImgWebSearch.gif" altkey='ALT_SEARCH'/></button>
				</td>
            </tr>
           </table>
        </form>
    </td>
  </tr>
</table>