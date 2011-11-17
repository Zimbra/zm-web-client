/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

UT.module("MailMsg");

// List-ID header
UT.test("Get List-ID header", {

	teardown: function() {

	}},

	function() {
		UT.expect(4);
		var mailMsg = new ZmMailMsg();
		var id = mailMsg.getListIdHeader();
		UT.equal(id, null, "no List-Id header");
		mailMsg.attrs = {};
		mailMsg.attrs["List-ID"] = "Ant Users List <user.ant.apache.org>";
		id = mailMsg.getListIdHeader();
		UT.equal(id, "user.ant.apache.org", "Apache Ant List-ID");
		
		mailMsg.attrs["List-ID"] = "<mylist@zimbra.com>";
		id = mailMsg.getListIdHeader();
		UT.equal(id, "mylist@zimbra.com", "Zimbra List-ID");
		
		mailMsg.attrs["List-ID"] = "This is the less than list (<). <test.legal.list>";
		id = mailMsg.getListIdHeader();
		UT.notEqual(id, "test.legal.list", "Angle bracket test. I'm hoping this is not a valid description");
	}
);

//X-Zimbra-DL header
UT.test("Get X-Zimbra-DL header",
	function() {
		UT.expect(7);
		var mailMsg = new ZmMailMsg();
		var xId = mailMsg.getXZimbraDLHeader();
		UT.equal(xId, null, "no X-Zimbra-DL header");
		
		mailMsg.attrs = {};
		mailMsg.attrs["X-Zimbra-DL"] = "Server Team <server-team@example.zimbra.com>";
		xId = mailMsg.getXZimbraDLHeader();
		var good = xId.good.getArray();
		UT.equal(good.length, 1, "Mail message should have 1 X-Zimbra-DL value");
		UT.equal(good[0].address, "server-team@example.zimbra.com", "mail message X-Zimbra-DL header should be server-team@example.zimbra.com");
		
		mailMsg = new ZmMailMsg();
		mailMsg.attrs = {};
		mailMsg.attrs["X-Zimbra-DL"] = "Server Team <server-team@example.zimbra.com>, ui-team@example.zimbra.com";
		xId = mailMsg.getXZimbraDLHeader();
		good = xId.good.getArray();
		UT.equal(good.length, 2, "Mail message should have 2 X-Zimbra-DL values");
		UT.equal(good[0].address, "server-team@example.zimbra.com", "mail mesage X-Zimbra-DL header should have have server-team@example.zimbra.com");
		UT.equal(good[1].address, "ui-team@example.zimbra.com", "mail message X-Zimbra-DL header should have ui-team@example.zimbrea.com");
		
		mailMsg = new ZmMailMsg();
		mailMsg.attrs = {};
		mailMsg.attrs["X-Zimbra-DL"] = "badaddress";
		xId = mailMsg.getXZimbraDLHeader();
		good = xId.good.getArray();
		UT.equal(good.length, 0, "Mail message should not have any good X-Zimbra-DL values");
	}		
);

UT.test("Unfang Internal Test: Copy/Paste Inline Image", {
	
	teardown: function() {
	}},
	
	function() {
		UT.expect(2);
		
		var node =    {
						cid: "570",
						d: 1316619883000,
						e: [
						   {
							a: "user1@prome-2n-dhcp138.eng.vmware.com",
							d: "Demo",
							p: "Demo User One",
							t: "f"
						   },
						  {
							a: "user1",
							d: "user1",
							t: "t"
						   }
						 ],
						f: "sa",
						id: "568",
						l: "5",
						mid: "<49b7b6b4-0783-4da5-8e25-aacc6c5e3f1f@prome-2n-dhcp138.eng.vmware.com>",
						mp: [
						  {
							ct: "multipart/alternative",
							mp: [
							  {
								ct: "text/plain",
								part: "1",
								s: 1
							   },
							   {
								ct: "multipart/related",
								mp: [
								 {
									body: true,
									content: "<html><head><style>p { margin: 0; }</style></head><body><div style=\"font-family: Times New Roman; font-size: 12pt; color: #000000\"><div><img src=\"cid:2eaca8a7d2cd054b66ea5be106299b74bd313773@zimbra\" alt=\"\"></div></div></body></html>",
									ct: "text/html",
									part: "2.1",
									s: 249
								   },
								   {
									cd: "attachment",
									ci: "<2eaca8a7d2cd054b66ea5be106299b74bd313773@zimbra>",
									ct: "image/png",
									filename: "1316619883060",
									part: "2.2",
									s: 20235
								   }
								 ],
								part: "2"
							   }
							 ],
							part: "TEXT"
						   }
						 ],
						rev: 314,
						s: 29174,
						sd: 1316619883000,
						su: "copy/paste image"
					   };
	   //var node = JSON.parse(nodeStr);
	   var args = {};
	   args.list = [];
	   var mailMsg = ZmMailMsg.createFromDom(node, args);
	   var bodyPart = mailMsg.getBodyPart(ZmMimeTable.TEXT_HTML);
	   var div = document.createElement("div");
	   div.innerHTML = bodyPart.content;
	   var images = div.getElementsByTagName("img");
       for(var i=0; i<images.length; i++) {
	     var isExternal = ZmMailMsgView._isExternalImage(images[i]);
	     UT.equal(isExternal, false, "src=cid:xxxx is not external");  
         var unfang = ZmMailMsgView.__unfangInternalImage(mailMsg, images[i], "src");
	     var src = images[i].getAttribute("src");
	     var hasCid = src.match("cid:");  //cid should be removed
	     UT.equal(hasCid, null, "src=" + src);
       }
	}	
);

UT.test("Unfang Internal Test: External Image", {
	
	teardown: function() {
	}},
	
	function() {
		UT.expect(2);
		
		var node =  { 
		cid: "-560",
        cm: true,
        d: 1316619774000,
        e: [
           {
            a: "user1@dcomfort.com",
            d: "Demo",
            p: "Demo User One",
            t: "f"
           },
          {
            a: "list@dcomfort.com",
            d: "list",
            t: "t"
           }
         ],
        fr: "Google",
        id: "560",
        l: "2",
        mid: "<670fbd72-6dc1-4218-a47d-e0608088d50a@prome-2n-dhcp175.eng.vmware.com>",
        mp: [
         {
            ct: "multipart/alternative",
            mp: [
              {
                ct: "text/plain",
                part: "1",
                s: 20
               },
              {
                body: true,
                content: '<html><head><style>p { margin: 0; }</style></head><body><div style="font-family: Times New Roman; font-size: 12pt; color: #000000"><br><span id="body"><center><div id="lga"><img alt="Google" id="hplogo" style="padding-top:28px" height="95" width="275" dfsrc="http://www.google.com/intl/en_com/images/srpr/logo3w.png"></div><form action="/search" name="f"><table class="jhp" cellpadding="0" cellspacing="0"><tbody><tr valign="top"><td align="center" nowrap="nowrap"><div class="ds" style="height:32px;margin:4px 0"><input dir="ltr" maxlength="2048" name="q" id="lst-ib" class="lst" title="Google Search" value="" size="57" style="background: none repeat scroll 0% 0% rgb(255, 255, 255); border-width: 1px; border-style: solid; border-right: 1px solid rgb(217, 217, 217); border-color: silver rgb(217, 217, 217) rgb(217, 217, 217); -moz-border-top-colors: none; -moz-border-right-colors: none; -moz-border-bottom-colors: none; -moz-border-left-colors: none; -moz-border-image: none; color: rgb(0, 0, 0); margin: 0pt; padding: 5px 8px 0pt 6px; vertical-align: top; outline: medium none;"></div><br style="line-height:0"></td></tr></tbody></table></form><div style="font-size:83%;min-height:3.5em"><br></div></center></span> <br></div></body></html>',
                ct: "text/html",
                part: "2",
                s: 1417
               }
             ],
            part: "TEXT"
           }
         ],
        rev: 300,
        s: 2613,
        sd: 1316540964000,
        sf: "",
        su: "External image"
       }
	   var args = {};
	   args.list = [];
	   var mailMsg = ZmMailMsg.createFromDom(node, args);
	   var bodyPart = mailMsg.getBodyPart(ZmMimeTable.TEXT_HTML);
	   var div = document.createElement("div");
	   div.innerHTML = bodyPart.content;
	   var images = div.getElementsByTagName("img");
       for(var i=0; i<images.length; i++) {
	     var isExternal = ZmMailMsgView._isExternalImage(images[i]);
	     UT.equal(isExternal, true, "dfsrc=URL is external");  
	     var unfang = ZmMailMsgView.__unfangInternalImage(mailMsg, images[i], "src");
	     var src = images[i].getAttribute("dfsrc");
	     UT.equal(src, "http://www.google.com/intl/en_com/images/srpr/logo3w.png", "dfsrc=http://www.google.com/intl/en_com/images/srpr/logo3w.png");  
       }
	}	
);

UT.test("Unfang Internal Test: Inline Attachment", {
	
	teardown: function() {
	}},
	
	function() {
		UT.expect(2);
		
		var node =  {
		cid: "566",
        d: 1316619840000,
        e: [
          {
            a: "user1@prome-2n-dhcp138.eng.vmware.com",
            d: "Demo",
            p: "Demo User One",
            t: "f"
           },
          {
            a: "user1@prome-2n-dhcp138.eng.vmware.com",
            d: "Demo",
            p: "Demo User One",
            t: "t"
           }
         ],
        f: "sa",
        id: "564",
        l: "5",
        mid: "<d8ae52d5-71f4-4b9b-a2b7-33f9aa6bd02b@prome-2n-dhcp138.eng.vmware.com>",
        mp: [
          {
            ct: "multipart/alternative",
            mp: [
             {
                ct: "text/plain",
                part: "1",
                s: 2
               },
              {
                ct: "multipart/related",
                mp: [
                  {
                    body: true,
                    content: '<html><head><style>p { margin: 0; }</style></head><body><div style="font-family: Times New Roman; font-size: 12pt; color: #000000"><div><img src="cid:29e427a6ce209cef3387c9a3aa5a4e689ab50d9c@zimbra"><br></div></div></body></html>',
                    ct: "text/html",
                    part: "2.1",
                    s: 308
                   },
                  {
                    cd: "attachment",
                    ci: "<29e427a6ce209cef3387c9a3aa5a4e689ab50d9c@zimbra>",
                    ct: "image/png",
                    filename: "Tag Icons.png",
                    part: "2.2",
                    s: 16692
                   }
                 ],
                part: "2"
               }
             ],
            part: "TEXT"
           }
         ],
        rev: 308,
        s: 24525,
        sd: 1316619840000,
        su: "inline attachment"
       }
	   var args = {};
	   args.list = [];
	   var mailMsg = ZmMailMsg.createFromDom(node, args);
	   var bodyPart = mailMsg.getBodyPart(ZmMimeTable.TEXT_HTML);
	   var div = document.createElement("div");
	   div.innerHTML = bodyPart.content;
	   var images = div.getElementsByTagName("img");
       for(var i=0; i<images.length; i++) {
	     var isExternal = ZmMailMsgView._isExternalImage(images[i]);
	     UT.equal(isExternal, false, "Image is inline and should not be external");
         var unfang = ZmMailMsgView.__unfangInternalImage(mailMsg, images[i], "src");
	     var src = images[i].getAttribute("src");
	     UT.equal(src, "http://localhost:7070/service/home/~/?auth=co&id=564&part=2.2", "src value should be converted from cid to server path reference");
       }
	}	
);

