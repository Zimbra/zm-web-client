/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004 - 2011 Zimbra, Inc.
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

/*
 * The data in this file is an array of test data objects. Each object has the following properties
 *   json: The json representation of a mail message
 *   expectedBody: The expected html contents of the iframe body when that message is rendered
 */

UtMailMsgView_data = [
      //
      // Bug #67854 - HTML code in "no content" message
      //
      {
      expectedBody: '<table width="100%"><tbody><tr><td class="NoResults" style="text-align:center;"><br>The message has no text content.</td></tr></tbody></table>',
      json: {
        cid: "561",
        d: 1322781373000,
        e: [
          // [0]:
          {
            a: "vmwen1@zqa-061.eng.vmware.com",
            d: "vmwen1",
            t: "f"
           },
          // [1]:
          {
            a: "vmwen1@zqa-061.eng.vmware.com",
            d: "vmwen1",
            t: "t"
           }
         ],
        id: "560",
        l: "2",
        mid: "<5769b3ce-c285-4a44-a115-7dadc6a72d10@zqa-061>",
        mp: [
          // [0]:
          {
            body: true,
            content: "",
            ct: "text/plain",
            part: "1",
            s: 2
           }
         ],
        rev: 300,
        s: 1729,
        sd: 1322761416000,
        su: "test"
       }
    }

    //
    // Bug #67744 - XSS injecting malicious email
    //
    ,{
        expectedBody: '<pre>&lt;script&gt;alert("Bad");&lt;/script&gt;</pre><img zmforced="1" class="InlineImage" src="http://localhost:7070/service/home/%7E/?auth=co&amp;id=600&amp;part=2">',
        json:
                  {
        cid: "-600",
        cm: true,
        d: 1322799190000,
        e: [
          // [0]:
          {
            a: "p4@zcs103.zimbraqa.lab",
            d: "p4",
            t: "f"
           },
          // [1]:
          {
            a: "1@zcs103.zimbraqa.lab",
            d: "1",
            t: "t"
           }
         ],
        f: "u",
        fr: '<script>alert("Bad");</script>',
        id: "600",
        l: "2",
        mid: "<6c3594eb-a17f-493f-8b70-44b41f8336b8@zcs103.zimbraqa.lab>",
        mp: [
          // [0]:
          {
            ct: "multipart/mixed",
            mp: [
              // [0]:
              {
                body: true,
                content: '<script>alert("Bad");</script>',
                ct: "text/plain",
                part: "1",
                s: 142
               },
              // [1]:
              {
                body: true,
                cd: "inline",
                ct: "image/jpeg",
                filename: "Picture.jpg",
                part: "2",
                s: 37326
               }
             ],
            part: "TEXT"
           }
         ],
        rev: 500,
        s: 52405,
        sd: 1322574434000,
        sf: "",
        su: "subject1"
       }
    }


    //
    // Bug #66192 - Blank body with JS error on viewing some messages
    //
    ,{
        expectedBody: '<div style="font-family: times new roman, new york, times, serif; font-size: 12pt; color: #000000"><div>Here\'s an empty image:<img></div></div>',
        json: {
            cid: "612",
            d: 1322801640000,
            e: [
              // [0]:
              {
                a: "user1@dcomfort.com",
                d: "Demo",
                p: "Demo User One",
                t: "f"
               },
              // [1]:
              {
                a: "list@dcomfort.com",
                d: "list",
                exp: true,
                isGroup: true,
                t: "t"
               }
             ],
            f: "a",
            fr: "Here's an empty image:",
            id: "611",
            l: "2",
            mid: "<3fee9d31-f330-446d-b242-d0703ef83764@Dave-Cs-MacBook-Pro.local>",
            mp: [
              // [0]:
              {
                ct: "multipart/mixed",
                mp: [
                  // [0]:
                  {
                    ct: "multipart/alternative",
                    mp: [
                      // [0]:
                      {
                        ct: "text/plain",
                        part: "1.1",
                        s: 27
                       },
                      // [1]:
                      {
                        body: true,
                        content: "<html><head><style>p { margin: 0; }</style></head><body><div style=\"font-family: times new roman, new york, times, serif; font-size: 12pt; color: #000000\"><div>Here&#39;s an empty image:<img></div></div></body></html>",
                        ct: "text/html",
                        part: "1.2",
                        s: 237
                       }
                     ],
                    part: "1"
                   },
                  // [1]:
                  {
                    cd: "attachment",
                    ct: "text/plain",
                    filename: "Hello.txt",
                    part: "2",
                    s: 9
                   }
                 ],
                part: "TEXT"
               }
             ],
            rev: 523,
            s: 1646,
            sd: 1322801640000,
            su: "Hello"
       }
    }
    
    //
    // Bug #64777 - Link to show external images not shown when dfsrc is present.
    //
    ,{
        validate: function(controller, view) {
            var displayImagesBar = document.getElementById(view._displayImagesId);
            UT.notEqual(displayImagesBar && displayImagesBar.style.display, "none");
        },
        json:       {
        cid: "-623",
        cm: true,
        d: 1322866294000,
        e: [
          // [0]:
          {
            a: "user1@dcomfort.com",
            d: "Demo",
            p: "Demo User One",
            t: "f"
           },
          // [1]:
          {
            a: "list@dcomfort.com",
            d: "list",
            t: "t"
           }
         ],
        fr: "Google",
        id: "623",
        l: "2",
        mid: "<670fbd72-6dc1-4218-a47d-e0608088d50a@prome-2n-dhcp175.eng.vmware.com>",
        mp: [
          // [0]:
          {
            ct: "multipart/alternative",
            mp: [
              // [0]:
              {
                ct: "text/plain",
                part: "1",
                s: 20
               },
              // [1]:
              {
                body: true,
                content: "<html><head><style>p { margin: 0; }</style></head><body><div style=\"font-family: Times New Roman; font-size: 12pt; color: #000000\"><br><span id=\"body\"><center><div id=\"lga\"><img alt=\"Google\" id=\"hplogo\" style=\"padding-top:28px\" height=\"95\" width=\"275\" dfsrc=\"http://www.google.com/intl/en_com/images/srpr/logo3w.png\"></div><form action=\"/search\" name=\"f\"><table class=\"jhp\" cellpadding=\"0\" cellspacing=\"0\"><tbody><tr valign=\"top\"><td align=\"center\" nowrap=\"nowrap\"><div class=\"ds\" style=\"height:32px;margin:4px 0\"><input dir=\"ltr\" maxlength=\"2048\" name=\"q\" id=\"lst-ib\" class=\"lst\" title=\"Google Search\" value=\"\" size=\"57\" style=\"background: none repeat scroll 0% 0% rgb(255, 255, 255); border-width: 1px; border-style: solid; border-right: 1px solid rgb(217, 217, 217); border-color: silver rgb(217, 217, 217) rgb(217, 217, 217); -moz-border-top-colors: none; -moz-border-right-colors: none; -moz-border-bottom-colors: none; -moz-border-left-colors: none; -moz-border-image: none; color: rgb(0, 0, 0); margin: 0pt; padding: 5px 8px 0pt 6px; vertical-align: top; outline: medium none;\"></div><br style=\"line-height:0\"></td></tr></tbody></table></form><div style=\"font-size:83%;min-height:3.5em\"><br></div></center></span> <br></div></body></html>",
                ct: "text/html",
                part: "2",
                s: 1417
               }
             ],
            part: "TEXT"
           }
         ],
        rev: 550,
        s: 2594,
        sd: 1316540964000,
        sf: "",
        su: "External image"
       }
    }
];

