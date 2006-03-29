<!--
***** BEGIN LICENSE BLOCK *****
Version: ZAPL 1.1

The contents of this file are subject to the Zimbra AJAX Public
License Version 1.1 ("License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
the License for the specific language governing rights and limitations
under the License.

The Original Code is: Zimbra AJAX Toolkit.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.

Contributor(s):

***** END LICENSE BLOCK *****
-->
<% String contextPath = request.getContextPath(); %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>Zimbra ALE - Prototype</title>
      <style type="text/css">
          <!--
          @import url( <%= contextPath %>/img/loRes/imgs.css );
          @import url( <%= contextPath %>/img/loRes/skins/steel/skin.css );
          @import url( <%= contextPath %>/js/zimbraMail/config/style/dwt.css );
          @import url( <%= contextPath %>/js/zimbraMail/config/style/common.css );
          @import url( <%= contextPath %>/js/zimbraMail/config/style/msgview.css );
          @import url( <%= contextPath %>/js/zimbraMail/config/style/zm.css );
          @import url( <%= contextPath %>/js/zimbraMail/config/style/spellcheck.css );
          @import url( <%= contextPath %>/skins/steel/skin.css );
          @import url( <%= contextPath %>/js/zimbraMail/config/style/dwt.css );
          @import url( style.css );
          -->
      </style>
    <script type="text/javascript" src="<%=contextPath %>/js/msgs/I18nMsg,AjxMsg,ZMsg,ZmMsg.js"></script>
    <jsp:include page="../../public/Messages.jsp"/>
    <jsp:include page="../../public/Ajax.jsp"/>
    <jsp:include page="embed_js.jsp"/>
  </head>
    <body>
    <noscript><p><b>Javascript must be enabled to use this.</b></p></noscript>
    <script type="text/javascript" language="JavaScript">
   		function launch() {
   			DBG = new AjxDebug(AjxDebug.NONE, null, false);
 	    	Test.run();
	    }
        AjxCore.addOnloadListener(launch);
    </script>
    </body>
</html>