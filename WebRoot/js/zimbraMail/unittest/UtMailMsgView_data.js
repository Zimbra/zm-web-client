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
      expectedBody: "\nThe message has no text content.",
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
        expectedBody: "<script>alert('Bad');</script>",
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
        fr: "<script>alert('Bad');</script>",
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
                content: "<script>alert('Bad');</script>",
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
        expectedBody: "Here's an empty image:",
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
];

