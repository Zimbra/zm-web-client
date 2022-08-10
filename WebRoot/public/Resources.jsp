<%@ page session="false" %>
<%@ page import="java.util.regex.Pattern" %>
<%@ page import="com.zimbra.cs.taglib.bean.BeanUtils" %>
<!--
***** BEGIN LICENSE BLOCK *****
Zimbra Collaboration Suite Web Client
Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2015, 2016 Synacor, Inc.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software Foundation,
version 2 of the License.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this program.
If not, see <https://www.gnu.org/licenses/>.
***** END LICENSE BLOCK *****
-->
<%
    String contextPath = request.getContextPath();
    if(contextPath.equals("/")) {
        contextPath = "";
    }

    String isDev = (String) request.getParameter("dev");
    if (isDev != null) {
        request.setAttribute("mode", "mjsf");
    }

    String mode = (String) request.getAttribute("mode");
    boolean inDevMode = (mode != null) && (mode.equalsIgnoreCase("mjsf"));
    boolean inSkinDebugMode = (mode != null) && (mode.equalsIgnoreCase("skindebug"));

   String vers = (String)request.getAttribute("version");
   String ext = (String)request.getAttribute("fileExtension");
   if (vers == null){
      vers = "";
   }
   if (ext == null){
      ext = "";
   }

    String localeQs = "";
    String localeId = (String) request.getAttribute("localeId");
	if (localeId == null) localeId = request.getParameter("localeId");
	if (localeId != null) {
	    localeId = localeId.replaceAll("[^A-Za-z_]","");
	    localeId = BeanUtils.cook(localeId);
        int index = localeId.indexOf("_");
        if (index == -1) {
            localeQs = "&language=" + localeId;
        } else {
            localeQs = "&language=" + localeId.substring(0, index) +
                       "&country=" + localeId.substring(localeId.length() - 2);
        }
    }

	String skin = request.getParameter("skin");
	if (skin == null || !Pattern.matches("^[0-9A-Za-z]+$", skin)) {
		skin = application.getInitParameter("zimbraDefaultSkin");
	}

	String resources = (String)request.getAttribute("res");
	if (resources == null) {
		resources = request.getParameter("res");
	}
    resources = resources.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll("\"", "&quot;");
    
    String query = "v="+vers+"&debug="+(inSkinDebugMode||inDevMode)+localeQs+"&skin="+skin;

%><script type="text/javascript" src="<%=contextPath%>/res/<%=resources%>.js<%=ext%>?<%=query%>"></script>
 