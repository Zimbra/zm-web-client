<%@ page session="false" %>
<!--
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.2

The contents of this file are subject to the Zimbra Public License
Version 1.2 ("License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
the License for the specific language governing rights and limitations
under the License.

The Original Code is: Zimbra Collaboration Suite Web Client

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
All Rights Reserved.

Contributor(s):

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
    if (localeId != null) {
        int index = localeId.indexOf("_");
        if (index == -1) {
            localeQs = "&language=" + localeId;
        } else {
            localeQs = "&language=" + localeId.substring(0, index) +
                       "&country=" + localeId.substring(localeId.length() - 2);
        }
    }

%><script type="text/javascript" src="<%= contextPath %>/js/msgs/I18nMsg,AjxMsg,ZMsg,ZaMsg,ZmMsg.js<%= ext %>?v=<%= vers %><%= inSkinDebugMode || inDevMode ? "&debug=1" : "" %><%= localeQs %>"></script>
 