<!--
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License
Version 1.1 ("License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
the License for the specific language governing rights and limitations
under the License.

The Original Code is: Zimbra Collaboration Suite Web Client

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.

Contributor(s):

***** END LICENSE BLOCK *****
-->
<div style='position:absolute;width:1px;height:1px;visibility:hidden;overflow:hidden;'>
<% String hiRes = (String) request.getParameter("hiRes");
   if (hiRes != null) { %>
<jsp:include page='CacheHiRes.html' />
<jsp:include page='../skins/steel/CacheHiRes.html' />
<% } else { %>
<jsp:include page='CacheLoRes.html' />
<jsp:include page='../skins/steel/CacheLoRes.html' />
<% } %>
<img src="/zimbra/img/animated/wait_16.gif"/>
<img src="/zimbra/img/animated/wait_32.gif"/>
<img src="/zimbra/img/animated/wait_64.gif"/>
<img src="/zimbra/img/animated/BarberPole_216.gif"/>
<img src="/zimbra/img/hiRes/dwt/Critical_32.gif"/>
<img src="/zimbra/img/hiRes/dwt/ButtonSmallUp__H.gif"/>
<img src="/zimbra/img/hiRes/dwt/ButtonSmallDown__H.gif"/>
<img src="/zimbra/img/hiRes/dwt/ButtonUpDefault__H.gif"/>
<img src="/zimbra/img/hiRes/dwt/ButtonDownDefault__H.gif"/>
<img src="/zimbra/img/hiRes/dwt/ButtonDown__H.gif"/>
<img src="/zimbra/img/hiRes/dwt/ButtonUp__H.gif"/>
<img src="/zimbra/skins/steel/images/tree_header_bg.gif"/>
<img src="/favicon.ico"/>
</div>