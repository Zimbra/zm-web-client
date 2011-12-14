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

// To generate more sample data, load the client with ?dev=1&debug=content.
// Data is printed into the debug window when a message is expanded in conv view.
// I'm not sure why but sometimes you have to edit the text to escape '"' characters.

UtGetOriginalContent_data = [
    // Plain text, all original content
    {
        "input": "\r\nThis is a new message \r\nDave says: \"It has some interesting content\". \r\n\r\n",
        "isHtml": false,
        "output": "\r\nThis is a new message \r\nDave says: \"It has some interesting content\". \r\n\r\n"
    },

    // Html, all original content
    {
        "input": "<html><head><style>p { margin: 0; }</style></head><body><div style=\"font-family: times new roman, new york, times, serif; font-size: 12pt; color: #000000\"><div>This is a new message</div><div>Dave says: \"It has some interesting content\".</div><div><br></div></div></body></html>",
        "isHtml": true,
        "output": "<html><head><style>p { margin: 0; }</style></head><body><div style=\"font-family: times new roman, new york, times, serif; font-size: 12pt; color: #000000\"><div>This is a new message</div><div>Dave says: \"It has some interesting content\".</div><div><br></div></div></body></html>"
    },

    // Plain text reply without prefix
    {
        "input": "Reply.\n\n----- Original Message -----\nFrom: \"Demo User One\" <user1@dcomfort.com>\nTo: list@dcomfort.com\nSent: Tuesday, December 13, 2011 4:51:48 PM\nSubject: Re: Grrrrrr\n\n\nThis is a new message \nDave says: \"It has some interesting content\". ",
        "isHtml": false,
        "output": "Reply.\n"
    },

    // Plain text reply with prefix
    {
        "input": "Reply with prefix?\n----- Original Message -----\n> From: \"Demo User One\" <user1@dcomfort.com>\n> To: list@dcomfort.com\n> Sent: Tuesday, December 13, 2011 8:30:28 PM\n> Subject: Plain text\n> \n> Message\n> \n> \n",
        "isHtml": false,
        "output": "Reply with prefix?"
    },

    // Plain text reply with no headers
    {
        "input": "Plain text no headers.\r\n\r\n----- Original Message -----\r\nMessage\r\n\r\n\r\n",
        "isHtml": false,
        "output": "Plain text no headers.\n"
    }
];
