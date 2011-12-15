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
    },

    // Plain text, all original content, including a "----"
    {
        "input": "There are a number of websites that explain the 6-2 and show the different positions. We run the offense in a slightly simpler way,\r\nwithout specialists (with specialists, everyone moves as soon as they can to their designated position - for example, Nalin and\r\nAbhishek would probably be middle blockers and always play in the middle when in the front row).\r\n\r\nI think the 6-2 can be explained very easily. There are six positions to play on defense:\r\n\r\nFL      FM      FR\r\n\r\nBL              S\r\n\r\n        BM\r\n\r\n(F = front, B = back, S = setter)\r\n\r\nThe front players are all at the net when the other team is attacking, and try to put up a double block. The front player who is\r\nnot blocking comes off the net a little. FM always blocks.\r\n\r\nThe BL (back left) and S (setter) cover short balls and hits that go down the line. The BM (back middle) stands near or on the back\r\nline and covers the entire back third of the court, from corner to corner. It's best to start deep, so that you don't have to run\r\nbackwards to play a deep ball. The back row will move a little bit depending where the other team is attacking from. There is a big\r\nhole in the center of the court, but the blockers will prevent any hard-hit balls from going there. It takes some discipline for the\r\nBM not to creep up into the middle of the court - to avoid that, just picture balls being hit into the deep corners, and decide where\r\nit's best to start to get to those.\r\n\r\nIn the back row, the setter always plays the right side. The other two players play BL and BM.\r\n\r\nIf the ball comes to S, he passes it and calls \"Setter Out!\" If the ball comes to someone else, the setter runs up between FM and FR,\r\nand the person passing tries to pass it to that spot. The setter can then set FL, FM, or FR.\r\n\r\nThe setter always gets the second ball, so it's important to make sure he has a clear path to the ball. If you're not playing the\r\nball, turn toward it so you can see what's going on. If the pass is bad, the setter calls \"Help!\", and whoever is closest calls for\r\nthe ball and saves it or sets it.\r\n\r\nFor a free ball (one that the other team is forced to just pass over rather than hit), everyone goes to where they receive serve\r\n(except the setter, who can just go up to his spot near the net). Someone will generally call \"Free!\" to remind people to back up.\r\n\r\n--------------\r\n\r\nI'm happy to not play the 6-2 if people don't like it. But I think it leads to better and longer rallies because players are\r\npositioned better and have a good idea what they are supposed to do. I'm willing to bet that the class Sandeep mentions will be\r\nteaching the 6-2, at least at the intermediate and possibly at the beginner level.\r\n\r\n-Conrad\r\n\r\n",
        "isHtml": false,
        "output": "There are a number of websites that explain the 6-2 and show the different positions. We run the offense in a slightly simpler way,\r\nwithout specialists (with specialists, everyone moves as soon as they can to their designated position - for example, Nalin and\r\nAbhishek would probably be middle blockers and always play in the middle when in the front row).\r\n\r\nI think the 6-2 can be explained very easily. There are six positions to play on defense:\r\n\r\nFL      FM      FR\r\n\r\nBL              S\r\n\r\n        BM\r\n\r\n(F = front, B = back, S = setter)\r\n\r\nThe front players are all at the net when the other team is attacking, and try to put up a double block. The front player who is\r\nnot blocking comes off the net a little. FM always blocks.\r\n\r\nThe BL (back left) and S (setter) cover short balls and hits that go down the line. The BM (back middle) stands near or on the back\r\nline and covers the entire back third of the court, from corner to corner. It's best to start deep, so that you don't have to run\r\nbackwards to play a deep ball. The back row will move a little bit depending where the other team is attacking from. There is a big\r\nhole in the center of the court, but the blockers will prevent any hard-hit balls from going there. It takes some discipline for the\r\nBM not to creep up into the middle of the court - to avoid that, just picture balls being hit into the deep corners, and decide where\r\nit's best to start to get to those.\r\n\r\nIn the back row, the setter always plays the right side. The other two players play BL and BM.\r\n\r\nIf the ball comes to S, he passes it and calls \"Setter Out!\" If the ball comes to someone else, the setter runs up between FM and FR,\r\nand the person passing tries to pass it to that spot. The setter can then set FL, FM, or FR.\r\n\r\nThe setter always gets the second ball, so it's important to make sure he has a clear path to the ball. If you're not playing the\r\nball, turn toward it so you can see what's going on. If the pass is bad, the setter calls \"Help!\", and whoever is closest calls for\r\nthe ball and saves it or sets it.\r\n\r\nFor a free ball (one that the other team is forced to just pass over rather than hit), everyone goes to where they receive serve\r\n(except the setter, who can just go up to his spot near the net). Someone will generally call \"Free!\" to remind people to back up.\r\n\r\n--------------\r\n\r\nI'm happy to not play the 6-2 if people don't like it. But I think it leads to better and longer rallies because players are\r\npositioned better and have a good idea what they are supposed to do. I'm willing to bet that the class Sandeep mentions will be\r\nteaching the 6-2, at least at the intermediate and possibly at the beginner level.\r\n\r\n-Conrad\r\n\r\n"
    },

    // Html, all original content, including a '-----'
    {
        "input": "<html><head><style>p { margin: 0; }</style></head><body><div style=\"font-family: Arial; font-size: 10pt; color: #000000\"><span>Hi Conrad (& Dave).<br><br>We have two bugs that we'd like you to consider for mainline and GnR.  If you agree with the scope, then please assign them to Cabo (Lars or Steffen) if they are not currently feasible for the core team.   We are working on a separate PO/SOW with Cabo for our Comcast PSO engagement<br><br>1)  <strong>bug 57904</strong> - </span>Investigate integration of ZmVoiceApp customizations<br><span>      This bug  is needed for Comcast's voice system config --- the change accomodates additional cases that they need to handle (so that they don't hack the installation/startup file).<br>                </span><span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">#c2 - </span><span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">We request that it be integrated into mainline and 6.0.latest.  Phil is testing the fix with Comcast (via our 6.0.10.Comcast branch/builds).<br><br>2)   <span style=\"font-weight: bold;\">bug 56802</span> - </span>When using a deep-link to a message (view=msg&id=X) close tab buttons do not work<br><span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">                #c7 - suggest backport to GnR... for stated reasons.  </span><span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">Comcast has tested/verified the fix on their system (via our 6.0.10.Comcast branch/builds).</span><br><span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">-----------<br>3)  other / in-progress<br><span style=\"font-weight: bold;\">bug 57695 </span>- </span>Call manager options are present on Preferences for HSI only user.<br>          This one is currently assigned to Lars/Cabo to integrate to 6.0.13.  <span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">Phil is testing the fix with Comcast (via our 6.0.10.Comcast branch/builds).</span><br><br><br>Thanks!<br>- Matt<br><span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">-- <br><span></span>\n<p style=\"margin: 8px 16px 8px 0px; font-family: Arial,Helvetica,sans-serif; font-size: 12px; color: rgb(102, 102, 102);\" align=\"left\">\n<font color=\"#000000\"><b>Matthew Fonck</b></font><br>\n<i>Engagement Manager, Zimbra PSO</i><br>\n<a href=\"mailto:your.email@vmware.com\" style=\"color: rgb(83, 129, 172); text-decoration: none;\" target=\"_blank\">mfonck@vmware.com</a><br>\n3401 Hillview Avenue, Palo Alto, CA 94304<br>\n+1-650-888-0116 Mobile<br>\n</p>\n\n<p> <a href=\"http://www.vmware.com/\" target=\"_blank\"><img width=\"460\" border=\"0\" height=\"80\" dfsrc=\"http://campaign.vmware.com/email_imgs/eSignatures/VMW-SIG-Email-YourCloud-101-M.png\"></a>\n</p>\n<span></span><br><br>Zimbra Blog: New SugarCRM Extension in Zimbra Gallery http://bit.ly/ePynbp</span></div></body></html>",
        "isHtml": true,
        "output": "<html><head><style>p { margin: 0; }</style></head><body><div style=\"font-family: Arial; font-size: 10pt; color: #000000\"><span>Hi Conrad (& Dave).<br><br>We have two bugs that we'd like you to consider for mainline and GnR.  If you agree with the scope, then please assign them to Cabo (Lars or Steffen) if they are not currently feasible for the core team.   We are working on a separate PO/SOW with Cabo for our Comcast PSO engagement<br><br>1)  <strong>bug 57904</strong> - </span>Investigate integration of ZmVoiceApp customizations<br><span>      This bug  is needed for Comcast's voice system config --- the change accomodates additional cases that they need to handle (so that they don't hack the installation/startup file).<br>                </span><span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">#c2 - </span><span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">We request that it be integrated into mainline and 6.0.latest.  Phil is testing the fix with Comcast (via our 6.0.10.Comcast branch/builds).<br><br>2)   <span style=\"font-weight: bold;\">bug 56802</span> - </span>When using a deep-link to a message (view=msg&id=X) close tab buttons do not work<br><span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">                #c7 - suggest backport to GnR... for stated reasons.  </span><span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">Comcast has tested/verified the fix on their system (via our 6.0.10.Comcast branch/builds).</span><br><span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">-----------<br>3)  other / in-progress<br><span style=\"font-weight: bold;\">bug 57695 </span>- </span>Call manager options are present on Preferences for HSI only user.<br>          This one is currently assigned to Lars/Cabo to integrate to 6.0.13.  <span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">Phil is testing the fix with Comcast (via our 6.0.10.Comcast branch/builds).</span><br><br><br>Thanks!<br>- Matt<br><span id=\"77aca105-854b-4fff-b3ee-6f0950bd315e\">-- <br><span></span>\n<p style=\"margin: 8px 16px 8px 0px; font-family: Arial,Helvetica,sans-serif; font-size: 12px; color: rgb(102, 102, 102);\" align=\"left\">\n<font color=\"#000000\"><b>Matthew Fonck</b></font><br>\n<i>Engagement Manager, Zimbra PSO</i><br>\n<a href=\"mailto:your.email@vmware.com\" style=\"color: rgb(83, 129, 172); text-decoration: none;\" target=\"_blank\">mfonck@vmware.com</a><br>\n3401 Hillview Avenue, Palo Alto, CA 94304<br>\n+1-650-888-0116 Mobile<br>\n</p>\n\n<p> <a href=\"http://www.vmware.com/\" target=\"_blank\"><img width=\"460\" border=\"0\" height=\"80\" dfsrc=\"http://campaign.vmware.com/email_imgs/eSignatures/VMW-SIG-Email-YourCloud-101-M.png\"></a>\n</p>\n<span></span><br><br>Zimbra Blog: New SugarCRM Extension in Zimbra Gallery http://bit.ly/ePynbp</span></div></body></html>"
    },

    // Plain text, bottom post.
    {
        "input": "> I have two saved searches:\r\n> \r\n> 1. is:flagged\r\n> 2. in:(inbox or sent)\r\n> \r\n> If I click on the first, it doesn't run, only the search box changes.\r\n> If I click on the second, it seems to always run.\r\n\r\nActually, same here.  The first one just updates the search box, the second one runs.\r\n\r\nBrowser is Chrome 4.0 on MacOS 10.6.\r\n\r\n",
        "isHtml": false,
        "output": "Actually, same here.  The first one just updates the search box, the second one runs.\n\nBrowser is Chrome 4.0 on MacOS 10.6.\n\n"
    },

    // Plain text, ----- "User Name" <user@domain.com> wrote:
    {
        "input": "No need. Thanks!\r\n\r\n----- \"Joanne Haggerty\" <joanneh@yahoo-inc.com> wrote:\r\n\r\n> Conrad,\r\n> \r\n> \r\n> \r\n> Since you returned the other trophies, do you want a trophy for the\r\n> Flag Football League?\r\n> \r\n> \r\n> \r\n> \r\n> \r\n> \r\n> \r\n> Joanne\r\n\r\n",
        "isHtml": false,
        "output": "No need. Thanks!\n"
    },

    // Plain text, inline reply.
    {
        "input": "\r\n----- \"Parag Shah\" <pshah@zimbra.com> wrote:\r\n\r\n> So how does the server know what to return? What is the default-to\r\n> logic?\r\n\r\nsoap.txt SearchRequest says the default is conversation:\r\n\r\n   {types}      = comma-separated list.  Legal values are:\r\n               conversation|message|contact|appointment|task|note|wiki|document\r\n               (default is \"conversation\")\r\n\r\nBut I'd imagine if you are in the mail app you'd send either \"message\" if in message view or \"conversation\" if in conversation view.\r\n\r\nif the server behavior on search folders results really changed we should change it back, but I think types has always been optional.\r\n\r\nroland\r\n\r\n> \r\n> ----- Original Message -----\r\n> From: \"Dan Karp\" <dkarp@zimbra.com>\r\n> To: \"Parag Shah\" <pshah@zimbra.com>\r\n> Cc: \"UI Team\" <ui-team@zimbra.com>, \"Roland Schemers\"\r\n> <schemers@zimbra.com>\r\n> Sent: Friday, January 22, 2010 2:33:47 PM\r\n> Subject: Re: Problem running saved searches\r\n> \r\n> > When you click on the saved search, the client barfs b/c we always\r\n> > assume the types attr is set. My guess is the \"is:flagged\" saved\r\n> > search worked up until the most recent DF push. Any idea how/why\r\n> this\r\n> > happened? \r\n> \r\n> I don't think that a \"types\" constraint has ever been required for a\r\n> saved search...\r\n\r\n",
        "isHtml": false,
        "output": "soap.txt SearchRequest says the default is conversation:\n\n   {types}      = comma-separated list.  Legal values are:\n               conversation|message|contact|appointment|task|note|wiki|document\n               (default is \"conversation\")\n\nBut I'd imagine if you are in the mail app you'd send either \"message\" if in message view or \"conversation\" if in conversation view.\n\nif the server behavior on search folders results really changed we should change it back, but I think types has always been optional.\n\nroland\n"
    },

    // Bugzilla mail that whose url is not hidden (does not suffer from bug #68066).
    {
        "input": "| DO NOT REPLY TO THIS EMAIL\r\n|\r\n| https://bugzilla.zimbra.com/show_bug.cgi?id=68357\r\n\r\n\r\nDave Comfort <dcomfort@zimbra.com> changed:\r\n\r\n           What    |Removed                     |Added\r\n----------------------------------------------------------------------------\r\n         AssignedTo|bugs.mail.web.client@zimbra.|cdamon@zimbra.com\r\n                   |com                         |\r\n             Status|NEW                         |ASSIGNED\r\n           Keywords|                            |D3\r\n   Target Milestone|---                         |IronMaiden\r\n\r\n\r\n\r\n\r\n-- \r\nConfigure bugmail: http://bugzilla.zimbra.com/userprefs.cgi?tab=email\r\n------- You are receiving this mail because: -------\r\nYou are the assignee for the bug.\r\n\r\n",
        "isHtml": false,
        "output": "| DO NOT REPLY TO THIS EMAIL\r\n|\r\n| https://bugzilla.zimbra.com/show_bug.cgi?id=68357\r\n\r\n\r\nDave Comfort <dcomfort@zimbra.com> changed:\r\n\r\n           What    |Removed                     |Added\r\n----------------------------------------------------------------------------\r\n         AssignedTo|bugs.mail.web.client@zimbra.|cdamon@zimbra.com\r\n                   |com                         |\r\n             Status|NEW                         |ASSIGNED\r\n           Keywords|                            |D3\r\n   Target Milestone|---                         |IronMaiden\r\n\r\n\r\n\r\n\r\n-- \r\nConfigure bugmail: http://bugzilla.zimbra.com/userprefs.cgi?tab=email\r\n------- You are receiving this mail because: -------\r\nYou are the assignee for the bug.\r\n\r\n"
    }
];
