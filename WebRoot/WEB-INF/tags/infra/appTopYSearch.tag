<%@ tag body-content="scriptless" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<table>
   <tr>
	<td><div style='width:15px'></div></td>
    <td height="25" nowrap class="SearchBar" style='width:300px'>
        <form method="get" action="http://search.yahoo.com/search" target='_blank'>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
				<td nowrap="nowrap">
					<label for="searchWebField">Search web:&nbsp;</label>
				</td>
				<td width="100%" nowrap="nowrap">
                    <input type="hidden" name="fr" value="zim-mails" />
                    <input  id="searchWebField" name='p' class="searchField" maxlength="2048" value=""></td>
				<td style="padding-left: 5px;" nowrap="nowrap">
					<button class="SearchButton" type="submit" name="search"><div class='ImgWebSearch'></div></button>
				</td>
            </tr>
           </table>
        </form>
    </td>
  </tr>
</table>