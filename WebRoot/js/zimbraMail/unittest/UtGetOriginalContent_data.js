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

// One way to generate sample data is to load the client with ?dev=1&debug=content.
// Data is printed into the debug window when a message is expanded in conv view.
// You can also just copy the content the message's body part in the SearchConvResponse.

// The code that's being tested looks for different types of blocks of content. Each test
// message will have a comment indicating whether it's text or HTML, and which blocks it has.
//
// U	UNKNOWN			Possible original content (could not be otherwise typed)
// OS	ORIG_SEP		Delimiter (eg "Original Message" or recognized <hr>)
// W	WROTE			Something like "On [date] so and so [email] wrote:"
// Q	QUOTED			Text preceded by > or |
// H	HEADER			One of the commonly quoted email headers
// L	LINE			Series of underscores, sometimes used as delimiter

// NOTE: HTML can get a bit tricky to verify since the text goes in and out of a temporary DOM node.
// We may have to account for things like different quote marks around element attributes, different
// ordering of attributes (eg in <font> tags), etc. The best approach is to use double quotes around
// attribute values, avoid HTML entities, and omit tags with multiple attributes from the output.

// The data would look much cleaner if Javascript supported HERE documents.

// Indicates that the input should be unchanged
UtZWCUtils.SAME = "SAME";

UtGetOriginalContent_data = [
	
	// 1
    // All original content
	// Text: U
    {
        input: "\
This is a new message \n\
Dave says: \"It has some interesting content\".\n\
",
        output: UtZWCUtils.SAME
    },

	// 2
    // All original content
	// HTML: U
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

	// 3
    // "Original" separator, headers, no prefix
	// Text: U OS H
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

	// 4
    // "Original" separator, headers, prefix
	// Text: U OS H Q
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

	// 5
    // "Original" separator, no headers, no prefix
	// Text: U OS U
    {
        input: "\
Plain text no headers.\n\
\n\
----- Original Message -----\n\
Message\n\
",
        output: "Plain text no headers.\n"
    },

	// 6
    // All original content, including a hyphens line and an underscores line, neither
    // of which should be treated as a separator
	// Text: U L U
    {
        input: "\
There are a number of websites that explain the 6-2 and show the different positions. \n\
\n\
--------------\n\
\n\
I'm happy to not play the 6-2 if people don't like it.\n\
______________\n\
We can always play center-set.\n\
-Conrad\n\
",
		output: UtZWCUtils.SAME
    },

	// 7
    // All original content, including a hyphens line and an underscores line, neither
    // of which should be treated as a separator
	// HTML: U L U
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
Please let us know which are\
___________<br>\
3)Ê other / in-progress<br><br>Thanks!<br>- Matt<br></div></body></html>\
",
		output: UtZWCUtils.SAME
    },

	// 8
    // Bottom post.
	// Text: Q U
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

	// 9
    // "wrote" separator with email address
	// Text: U W Q
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

	// 10
    // Inline reply.
	// Text: W Q U Q
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

	// 11
    // Bugzilla mail with no actual quoted content
	// Text: U
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
    },
		
	// 12
	// Bugzilla mail - make sure first few lines survive (bug 68066)
	// Text: U
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

	// 13
	// "... wrote:" intro without an email address
	// Text: U W Q
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
	
	// 14
	// "wrote" separator
	// HTML: U W Q
	{
		isHtml: true,
		input: "\
<html><head><style type=\"text/css\">p { margin: 0; }</style></head><body>\
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
<html><head><style type=\"text/css\">p { margin: 0; }</style></head><body>\
<div style=\"font-family: Arial; font-size: 10pt; color: #000000\">\
I'm getting the same problem.<br><br>\
-Jiho<br><br>\
</div></body></html>\
"
	},
	
	// 15
	// Middle post
	// HTML: Q U Q
	{
		isHtml: true,
		input: "\
<html><head><style>p { margin: 0; }</style></head><body>\
<div style=\"font-family: Arial; font-size: 10pt; color: #000000\">\
<br><blockquote style='border-left: 2px solid rgb(16, 16, 255); margin-left: 5px; padding-left: 5px;'>\
&gt; Hmm. For the auto-send-draft feature we had decided that the Mailbox<br>\
&gt; would not be responsible to scheduling tasks. One solution would be to<br>\
&gt; re-work the server implementation of this feature as a mailbox<br>\
&gt; listener (one of the proposals that we discussed initially).<br><br>\
Wouldn&#39;t it be much cleaner to just sync the draft up from ZD to the<br>\
ZCS immediately? &nbsp;Pushing the draft would also push autoSendTime, which<br>\
would schedule it on the ZCS instance.<br></blockquote>\
<span style=\"color: rgb(0, 128, 0);\"><br>\
I thought about that but what if ZD can&#39;t connect to ZCS at that instant?<br><br>\
Vishal<br></span>\
<br><blockquote style='border-left: 2px solid rgb(16, 16, 255); margin-left: 5px; padding-left: 5px;'><br>\
Of course, that&#39;d mean that ZD could only do deferred send for<br>mailboxes linked to ZCSes. &nbsp;If you want to enable that feature for<br>\
IMAP (etc.), I think you&#39;d have to turn on the scheduled task<br>manager in ZD.<br></blockquote><br></div></body></html>\
",
		output: "\
<html><head><style>p { margin: 0; }</style></head><body>\
<div style=\"font-family: Arial; font-size: 10pt; color: #000000\">\
<br><span style=\"color: rgb(0, 128, 0);\"><br>\
I thought about that but what if ZD can't connect to ZCS at that instant?<br><br>Vishal<br></span>\
<br><br></div></body></html>\
"
	},
	
	// 16
	// Outlook-style <hr>
	// HTML: U OS H Q
	{
		isHtml: true,
		input: "\
<html><head>\
<style>p { margin: 0; }</style></head><body>\
<p>\
Yes, thank you all for your patience!!!<br><br>And sorry for the moving target.\
   I very much look forward to getting this phase behind us.   <br><br>\
Jim</p>\
<hr size=\"2\" width=\"100%\" align=\"center\">\
<font face=\"Tahoma\" size=\"2\">\
<b>From</b>: Amber Weaver \
<br><b>To</b>: all@zimbra.com\
<br><b>Sent</b>: Tue Feb 02 12:00:05 2010<br>\
<b>Subject</b>: OFFICIAL CLOSE DATE: Friday, February 5th\
<br></font></p>\
<div style=\"font-family: Times New Roman; font-size: 12pt; color: #000000\">Hi Team:<br><br>\
It is finally official! The definitive close date is this <strong>Friday, February 5th</strong>.<br><br>\
-Amber<br>\
</div></body></html>\
",
		output: "\
<html><head>\
<style>p { margin: 0; }</style></head><body>\
<p>\
Yes, thank you all for your patience!!!<br><br>And sorry for the moving target.\
   I very much look forward to getting this phase behind us.   <br><br>\
Jim</p>\
</body></html>\
"
	},
	
	// 17
	// ZWC-style <hr>
	// HTML: U OS H Q
	{
		isHtml: true,
		input: "\
<html><head><style>p { margin: 0; }</style></head><body>\
<div style=\"font-family: Arial; font-size: 10pt; color: #000000\">\
<div>No, there isn't currently a way to turn it off either as a preference or skin change, \
though it's not present in the single message view, so if you use conversations the way they \
used to work by expanding the conversation in the list and selecting the message rather then you \
won't see the reply box.<br></div>\
<div><br>\
- Josh <br>\
<br></div>\
<hr id=\"zwchr\">\
<div style=\"color:#000;font-weight:normal;font-style:normal;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:12pt;\">\
<b>From: </b>&quot;Arnold Yee&quot; &lt;ayee@zimbra.com&gt;<br>\
<b>To: </b>&quot;Engineering&quot; &lt;engineering@zimbra.com&gt;<br>\
<b>Sent: </b>Friday, December 9, 2011 9:40:05 AM<br>\
<b>Subject: </b>D2 Web Client UI change - quick reply message pane<br><br><br>\
Hey All,<br><br>I find that the majority of the E-mails I receive do not require a reply from me.<br><br>\
--Arnold<br><br><br></div>\
</div></body></html>\
",
				output: "\
<html><head><style>p { margin: 0; }</style></head><body>\
<div style=\"font-family: Arial; font-size: 10pt; color: #000000\">\
<div>No, there isn't currently a way to turn it off either as a preference or skin change, \
though it's not present in the single message view, so if you use conversations the way they \
used to work by expanding the conversation in the list and selecting the message rather then you \
won't see the reply box.<br></div>\
<div><br>\
- Josh <br>\
<br></div>\
</div></body></html>\
"
	},

	// 18
	// Outlook sometimes uses delimiter of SPAN with ID "OLK_SRC_BODY_SECTION"
	// HTML: U OS H Q
	{
		isHtml: true,
		input: "\
<html><head></head><body>\
<div>\
<div>Didn't you ever put bugs in your mouth as a young boy exploring the outdoors? &nbsp;;)</div>\
<div>Andrew</div>\
<div>-------------------------------------------------------------------------</div>\
<div>-Andrew Smith</div>\
</div>\
<span id=\"OLK_SRC_BODY_SECTION\">\
<div>\
<span style=\"font-weight:bold\">From: </span> Jesse Smith &lt;<a href=\"mailto:jsmith@example.com\">jsmith@jsmith.com</a>&gt;<br>\
<span style=\"font-weight:bold\">Date: </span> Mon, 5 Dec 2011 16:16:33 -0800<br>\
<span style=\"font-weight:bold\">To: </span> Fun-List &lt;<a href=\"mailto:fun-list@example.com\">fun-list@example.com</a>&gt;<br>\
<span style=\"font-weight:bold\">Subject: </span> Re: [Fun-list] 5 freakish Japanese foods<br>\
</div>\
<div>Yes!</div>\
</span></body></html>\
",
				output: "\
<html><head></head><body>\
<div>\
<div>Didn't you ever put bugs in your mouth as a young boy exploring the outdoors? &nbsp;;)</div>\
<div>Andrew</div>\
<div>-------------------------------------------------------------------------</div>\
<div>-Andrew Smith</div>\
</div>\
</body></html>\
"
	},

	// 19
	// "Original Message" delimiter text within HTML
	// HTML: U OS H U
	{
		isHtml: true,
		input: "\
<html><head><style>p { margin: 0; }</style></head><body>\
<div style=\"font-family: Arial; font-size: 10pt; color: #000000\">\
If you're on-site, and are accessing the interwebs through their proxy, make sure you \
exclude *.vmware.com from your proxy settings, because you can't get to helpzilla \
through the proxy (from inside)...<br><br>\
----- Original Message -----<br>\
From: &quot;Tony Publiski&quot; &lt;tpubliski@zimbra.com&gt;<br>\
To: &quot;Jason He&quot; &lt;jmhe@zimbra.com&gt;<br>\
Sent: Monday, February 8, 2010 11:08:32 AM<br>\
Subject: Re: inbound ssh<br><br>\
Once you're connected to Network Connect, go direct to the URL (helpzilla.vmware.com) \
rather than trying to go through the sslvpn.vmware.com thing.\
</div></body></html>\
",
				output: "\
<html><head><style>p { margin: 0; }</style></head><body>\
<div style=\"font-family: Arial; font-size: 10pt; color: #000000\">\
If you're on-site, and are accessing the interwebs through their proxy, make sure you \
exclude *.vmware.com from your proxy settings, because you can't get to helpzilla \
through the proxy (from inside)...<br><br>\
</div></body></html>\
"
	},

	// 20
	// "Forwarded Message" delimiter
	// HTML: U OS H U
	{
		isHtml: true,
		input: "\
<html><head><style>p { margin: 0; }</style></head><body>\
<div style=\"font-family: Times New Roman; font-size: 12pt; color: #000000\">\
<span>Have you heard from the recruiter yet?<br><br>-Dave<br></span><br>\
----- Forwarded Message -----<br>\
From: &quot;Jim Morrisroe&quot; &lt;jim.morrisroe@zimbra.com&gt;<br>\
To: &quot;Brian Peterson&quot; &lt;brian@zimbra.com&gt;<br>\
Sent: Tuesday, February 16, 2010 12:59:14 PM<br>\
Subject: Fwd: Introduction<br><br>\
FYI<br>\
</div></body></html>\
",
		output: "\
<html><head><style>p { margin: 0; }</style></head><body>\
<div style=\"font-family: Times New Roman; font-size: 12pt; color: #000000\">\
<span>Have you heard from the recruiter yet?<br><br>-Dave<br></span><br>\
</div></body></html>\
"
	},

	// 21
	// Top posting
	// Text: U Q
	{
		input: "\
No, that's them blaming the victim.  I have a clean system, no\n\
plugins installed, and I can't submit tickets from either Safari\n\
or Firefox.  Chrome doesn't run their plugin, so that's out, too.\n\
\n\
Call me in a week when they have this stuff straightened out.\n\
\n\
> Apparently some firefox addons are known to break the ability to\n\
> submit tickets into their system.\n\
",
		output: "\
No, that's them blaming the victim.  I have a clean system, no\n\
plugins installed, and I can't submit tickets from either Safari\n\
or Firefox.  Chrome doesn't run their plugin, so that's out, too.\n\
\n\
Call me in a week when they have this stuff straightened out.\n\
"
	},

	// 22
	// Top posting
	// Text: U Q
	{
		input: "\
----- \"Parag Shah\" <pshah@zimbra.com> wrote:\n\
\n\
> So how does the server know what to return? What is the default-to\n\
> logic?\n\
\n\
soap.txt SearchRequest says the default is conversation:\n\
\n\
   {types}      = comma-separated list.  Legal values are:\n\
               conversation|message|contact|appointment|task|note|wiki|document\n\
               (default is \"conversation\")\n\
\n\
But I'd imagine if you are in the mail app you'd send either \"message\" if in message view or \"conversation\" if in conversation view.\n\
\n\
if the server behavior on search folders results really changed we should change it back, but I think types has always been optional.\n\
\n\
roland\n\
\n\
> \n\
> ----- Original Message -----\n\
> From: \"Dan Karp\" <dkarp@zimbra.com>\n\
> To: \"Parag Shah\" <pshah@zimbra.com>\n\
> Cc: \"UI Team\" <ui-team@zimbra.com>, \"Roland Schemers\"\n\
> <schemers@zimbra.com>\n\
> Sent: Friday, January 22, 2010 2:33:47 PM\n\
> Subject: Re: Problem running saved searches\n\
> \n\
> > When you click on the saved search, the client barfs b/c we always\n\
> > assume the types attr is set. My guess is the \"is:flagged\" saved\n\
> > search worked up until the most recent DF push. Any idea how/why\n\
> this\n\
> > happened? \n\
> \n\
> I don't think that a \"types\" constraint has ever been required for a\n\
> saved search...\n\
",
		output: "\
soap.txt SearchRequest says the default is conversation:\n\
\n\
   {types}      = comma-separated list.  Legal values are:\n\
               conversation|message|contact|appointment|task|note|wiki|document\n\
               (default is \"conversation\")\n\
\n\
But I'd imagine if you are in the mail app you'd send either \"message\" if in message view or \"conversation\" if in conversation view.\n\
\n\
if the server behavior on search folders results really changed we should change it back, but I think types has always been optional.\n\
\n\
roland\n\
"
	},
		
	// 23
	// "wrote" delimiter split across two lines
	// Text: U W Q
	{
		input: "\
If not fixed try to leave a comment so that me/rajesh can look into it\n\
this weekend, lite client bug are already closed\n\
\n\
-satish s\n\
\n\
On Feb 13, 2010, at 2:05 AM, Satishkumar Sugumaran\n\
<satishs@zimbra.com> wrote:\n\
\n\
>\n\
>\n\
> -satish s\n\
>\n\
> On Feb 11, 2010, at 11:55 PM, Marc MacIntyre <marcmac@zimbra.com>\n\
> wrote:\n\
>\n\
> Guys, any idea if these are going to be fixable (amid all the move\n\
> chaos)?\n\
",
		output: "\
If not fixed try to leave a comment so that me/rajesh can look into it\n\
this weekend, lite client bug are already closed\n\
\n\
-satish s\n\
"
	}
];
