/*
 * ***** Begin LICENSE BLOCK *****
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

UtZWCUtils.SAME = "SAME";

UtGetOriginalContent_data = [
		
    // Plain text, all original content
    {
        input: "\
This is a new message \n\
Dave says: \"It has some interesting content\".\n\
",
        output: UtZWCUtils.SAME
    },

    // Html, all original content
    {
        isHtml: true,
        input: "\
<html><head><style>p { margin: 0; }</style></head>\
<body><div style=\"font-family: times new roman, new york, times, serif; font-size: 12pt; color: #000000\">\
<div>This is a new message</div>\
<div>Dave says: \"It has some interesting content\".</div>\
<div><br></div></div></body></html>\
",
		output: UtZWCUtils.SAME
    },

    // Plain text: "Original" separator, headers, no prefix
    {
        input: "\
Reply.\n\
\n\
----- Original Message -----\n\
From: \"Demo User One\" <user1@example.com>\n\
To: list@example.com\nSent: Tuesday, December 13, 2011 4:51:48 PM\n\
Subject: Re: Grrrrrr\n\
\n\
\n\
This is a new message \n\
Dave says: \"It has some interesting content\".\n\
",
        output: "Reply.\n"
    },

    // Plain text: "Original" separator, headers, prefix
    {
        input: "\
Reply with prefix?\n\
\n\
----- Original Message -----\n\
> From: \"Demo User One\" <user1@example.com>\n\
> To: list@dcomfort.com\n\
> Sent: Tuesday, December 13, 2011 8:30:28 PM\n\
> Subject: Plain text\n\
> \n\
> Message\n\
",
        output: "Reply with prefix?\n"
    },

    // Plain text: "Original" separator, no headers, no prefix
    {
        input: "\
Plain text no headers.\n\
\n\
----- Original Message -----\n\
Message\n\
",
        output: "Plain text no headers.\n"
    },

    // Plain text, all original content, including a "----" which should not be treated as a separator
    {
        input: "\
There are a number of websites that explain the 6-2 and show the different positions. \n\
\n\
--------------\n\
\n\
I'm happy to not play the 6-2 if people don't like it.\n\
-Conrad\n\
",
		output: UtZWCUtils.SAME
    },

    // HTML, all original content, including a "----" which should not be treated as a separator
    {
        isHtml: true,
        input: "\
<html><head>\
<style>p { margin: 0; }</style>\
</head><body>\
<div style=\"font-family: Arial; font-size: 10pt; color: #000000\">\
Hi Conrad (& Dave).<br>\
<br>\
We have two bugs that we'd like you to consider for mainline and GnR.<br>\
-----------<br>\
3)Ê other / in-progress<br><br>Thanks!<br>- Matt<br></div></body></html>\
",
		output: UtZWCUtils.SAME
    },

    // Plain text, bottom post.
    {
        input: "\
> I have two saved searches:\n\
> \n\
> 1. is:flagged\n\
> 2. in:(inbox or sent)\n\
> \n\
> If I click on the first, it doesn't run, only the search box changes.\n\
> If I click on the second, it seems to always run.\n\
\n\
Actually, same here.  The first one just updates the search box, the second one runs.\n\
\n\
Browser is Chrome 4.0 on MacOS 10.6.\n\
",
        output: "\
Actually, same here.  The first one just updates the search box, the second one runs.\n\
\n\
Browser is Chrome 4.0 on MacOS 10.6.\n\
"
    },

    // Plain text, "wrote" separator with email address
    {
        input: "\
No need. Thanks!\n\
\n\
----- 'Joanne Haggerty' <joanneh@example.com> wrote:\n\
\n\
> Conrad,\n\
> \n\
> Since you returned the other trophies, do you want a trophy for the Flag Football League?\n\
> \n\
> Joanne\n\
",
        output: "No need. Thanks!\n"
    },

    // Plain text, inline reply.
    {
        input: "\
\n\
----- \"Parag Shah\" <pshah@example.com> wrote:\n\
\n\
> So how does the server know what to return? What is the default-to\n\
> logic?\n\
\n\
soap.txt SearchRequest says the default is conversation.\n\
\n\
> \n\
> ----- Original Message -----\n\
> From: \"Dan Karp\" <dkarp@example.com>\n\
> \n\
> > When you click on the saved search, the client barfs b/c we always\n\
> > assume the types attr is set.\n\
",
        output: "soap.txt SearchRequest says the default is conversation.\n"
    },

    // Bugzilla mail with no actual quoted content
    {
        input: "\
| DO NOT REPLY TO THIS EMAIL\n\
|\n\
| https://bugzilla.zimbra.com/show_bug.cgi?id=68357\n\
\n\
\n\
Dave Comfort <dcomfort@zimbra.com> changed:\n\
\n\
		   What    |Removed                     |Added\n\
----------------------------------------------------------------------------\n\
		 AssignedTo|bugs.mail.web.client@zimbra.|cdamon@zimbra.com\n\
				   |com                         |\n\
			 Status|NEW                         |ASSIGNED\n\
		   Keywords|                            |D3\n\
   Target Milestone|---                         |IronMaiden\n\
\n\
\n\
\n\
-- \n\
Configure bugmail: http://bugzilla.zimbra.com/userprefs.cgi?tab=email\n\
------- You are receiving this mail because: -------\n\
You are the assignee for the bug.\n\
",
		output: UtZWCUtils.SAME
    }/*,
		
	// Bugzilla mail - make sure first few lines survive (bug 68066)
	{
		input: "\
| DO NOT REPLY TO THIS EMAIL\n\
|\n\
| https://bugzilla.zimbra.com/show_bug.cgi?id=62211\n\
\n\
\n\
--- Comment #20 from Lawrence Smith <lawrence@example.com>  2011-12-08 03:04:48 ---\n\
Created an attachment (id=36658)\n\
 --> (http://bugzilla.zimbra.com/attachment.cgi?id=36658)\n\
An example of a missing embedded image in Zimbra webmail in 7.1.3\n\
\n\
\n\
-- \n\
Configure bugmail: http://bugzilla.zimbra.com/userprefs.cgi?tab=email\n\
------- You are receiving this mail because: -------\n\
You are on the CC list for the bug.\n\
",
		output: UtZWCUtils.SAME
	},

	// "... wrote:" intro without an email address
	{
		input: "\
What you see in the output are the only accounts we deploy.\n\
\n\
-bp\n\
On Dec 8, 2011, at 3:36 PM, Patrick Brien wrote:\n\n\
> \n\
> He also seems to indicate that there are other accounts besides root and zimbra... \n\
>\n\
", 
		output:	"\
What you see in the output are the only accounts we deploy.\n\
\n\
-bp\n\
"
	},
	
	// HTML: "wrote" separator
	{
		isHtml: true,
		input: "\
<html><head><style type='text/css'>p { margin: 0; }</style></head><body>\
<div style='font-family: Arial; font-size: 10pt; color: #000000'>\
I'm getting the same problem.<br><br>\
-Jiho<br><br>\
----- \"Marc MacIntyre\" &lt;marcmac@zimbra.com&gt; wrote:<br>\
<blockquote style=\"border-left: 2px solid rgb(16, 16, 255); margin-left: 5px; padding-left: 5px;\">\
<style>p { margin: 0; }</style><div style=\"font-family: Arial; font-size: 10pt; color: rgb(0, 0, 0);\">\
anyone get inbound ssh to ssh7/8.engx.vmare.com working?&nbsp; Keeps rejecting my RSA (but the java vpn \
browser thing works fine).<span><br><br>\
-- <br>Marc MacIntyre<br>marcmac@zimbra.com<br></span></div></blockquote><br></div></body></html>\
",
		output: "\
<html><head><style type='text/css'>p { margin: 0; }</style></head><body>\
<div style='font-family: Arial; font-size: 10pt; color: #000000'>\
I'm getting the same problem.<br><br>\
-Jiho<br><br>\
"
	}
*/
];
