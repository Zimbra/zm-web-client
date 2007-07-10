<%@ page session="false" %>
<%@ page import="com.zimbra.cs.zclient.ZAuthResult"%>
<%@ page import="java.util.List" %>
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
Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
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

    ZAuthResult authResult = (ZAuthResult) request.getAttribute("authResult");
    String localeQs = "";
    if (authResult != null) {
        java.util.List<String> localePref = authResult.getPrefs().get("zimbraPrefLocale");
        if (localePref != null && localePref.size() > 0) {
            String localeId = localePref.get(0);
            if (localeId != null) {
                int index = localeId.indexOf("_");
                if (index == -1) {
                    localeQs = "&language=" + localeId;
                } else {
                    localeQs = "&language=" + localeId.substring(0, index) +
                               "&country=" + localeId.substring(localeId.length() - 2);
                }
            }
        }
    }

%><script type="text/javascript" src="<%= contextPath %>/js/msgs/I18nMsg,AjxMsg,ZMsg,ZaMsg,ZmMsg.js<%= ext %>?v=<%= vers %><%= inSkinDebugMode || inDevMode ? "&debug=1" : "" %><%= localeQs %>"></script>
 