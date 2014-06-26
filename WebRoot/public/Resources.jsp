<%@ page session="false" %>
<!--
***** BEGIN LICENSE BLOCK *****
Zimbra Collaboration Suite Web Client
Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014 Zimbra, Inc.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software Foundation,
version 2 of the License.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this program.
If not, see <http://www.gnu.org/licenses/>.
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

	String userAgent = request.getHeader("User-Agent");
	boolean isIE = userAgent == null || userAgent.indexOf("MSIE") != -1;

   String vers = (String)request.getAttribute("version");
   String ext = (String)request.getAttribute("fileExtension");
   if (vers == null){
      vers = "";
   }
   if (ext == null || isIE){
      ext = "";
   }

    String localeQs = "";
    String localeId = (String) request.getAttribute("localeId");
	if (localeId == null) localeId = request.getParameter("localeId");
	if (localeId != null) {
		localeId = localeId.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll("\"", "&quot;");
        int index = localeId.indexOf("_");
        if (index == -1) {
            localeQs = "&language=" + localeId;
        } else {
            localeQs = "&language=" + localeId.substring(0, index) +
                       "&country=" + localeId.substring(localeId.length() - 2);
        }
    }

	String skin = request.getParameter("skin");
	if (skin == null) {
		skin = application.getInitParameter("zimbraDefaultSkin");
	}
	skin = skin.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll("\"", "&quot;");

	String resources = (String)request.getAttribute("res");
	if (resources == null) {
		resources = request.getParameter("res");
	}
    resources = resources.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll("\"", "&quot;");
    
    String query = "v="+vers+"&debug="+(inSkinDebugMode||inDevMode)+localeQs+"&skin="+skin;

%><script type="text/javascript" src="<%=contextPath%>/res/<%=resources%>.js<%=ext%>?<%=query%>"></script>
 