/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */
UT.module("AjxTimezone");


UT.test("getOffset Test", {
	
	setup: function() {
		//Southern Hemisphere 3 cases: middle, daylight start, daylight end
		//2011 DST: ended on Sunday, April 3, 2011	starts again on Sunday, September 25, 2011
		this._newZealandTz = "Pacific/Auckland";
		this._nzst = new Date("Thu Jun 23 2011 06:00:00");
		this._nzdst_start = new Date("Sun Apr 2 2011 06:00");
		this._nzdst_end = new Date("Sep 25 2011 06:00");
		
		//Northern Hemisphere
		//Phoenix has no DST in 2011
		this._arizonaTz = "America/Phoenix";
		this._azst = new Date("Thu Jun 23 2011 06:00:00");
		this._azst_start = new Date("Mar 14 2011 06:00:00");
		this._azst_end = new Date("Nov 7 2011 06:00:00");
		
		//Los Angeles has DST in 2011
		//2011 DST: Sunday, March 13, 2011	- Sunday, November 6, 2011	
		this._laTz = "America/Los_Angeles";
		this._last = new Date("Dec 1 2011 06:00:00");
		this._ladst_start = new Date("Mar 14 2011 06:00:00");
		this._ladst_end = new Date("Nov 5 2011 06:00:00");
		
		//GMT
		//2011 DST: Sunday, March 27, 2011 - Sunday, October 30, 2011
		this._londonTz = "Europe/London";
		this._londonst = new Date("Dec 1 2011 06:00:00");
		this._londondst_start = new Date("Mar 28 2011 06:00:00");
		this._londondst_end = new Date("Oct 29 2011 06:00:00");
		
		//No DST in 2011 (Tokyo)
		this._japanTz = "Asia/Tokyo";
		this._jpst = new Date("Thu Jun 23 2011 06:00:00");
		this._jpst_start = new Date("Mar 22 2011 06:00:00");
		this._jpst_end = new Date("Dec 11 2011 06:00:00");
		
	}},
	function (){
		UT.expect(15);
		
		//Southern Hemisphere
		var nz_standard_offset = AjxTimezone.getOffset(this._newZealandTz, this._nzst);
		UT.equal(nz_standard_offset, 720, "Offset = " + nz_standard_offset);
		var nz_daylight_offset = AjxTimezone.getOffset(this._newZealandTz, this._nzdst_start);
		UT.equal(nz_daylight_offset, 780, "Offset = " + nz_daylight_offset);
		var nz_daylight_offset2 = AjxTimezone.getOffset(this._newZealandTz, this._nzdst_end);
		UT.equal(nz_daylight_offset2, 780, "Offset = " + nz_daylight_offset2);
		
		//Northern Hemisphere
		var arizona_offset = AjxTimezone.getOffset(this._arizonaTz, this._azst);
		UT.equal(arizona_offset, -420, "Offset = " + arizona_offset);
		var az_dst1 = AjxTimezone.getOffset(this._arizonaTz, this._azst_start);
		UT.equal(az_dst1, -420, "Offset = " + az_dst1);
		var az_dst2 = AjxTimezone.getOffset(this._arizonaTz, this._azst_end);
		UT.equal(az_dst2, -420, "Offset = " + az_dst2);
		
		var la_offset = AjxTimezone.getOffset(this._laTz, this._last);
		UT.equal(la_offset, -480, "Offset = " + la_offset);
		var la_dst_start = AjxTimezone.getOffset(this._laTz, this._ladst_start);
		UT.equal(la_dst_start, -420, "Offset = " + la_dst_start);
		var la_dst_end = AjxTimezone.getOffset(this._laTz, this._ladst_end);
		UT.equal(la_dst_end, -420, "Offset = " + la_dst_end);
		
		//GMT
		var london_offset = AjxTimezone.getOffset(this._londonTz, this._londonst);
		UT.equal(london_offset, 0, "Offset = " + london_offset);
		var london_dst1 = AjxTimezone.getOffset(this._londonTz, this._londondst_start);
		UT.equal(london_dst1, 60, "Offset = " + london_dst1);
		var london_dst2 = AjxTimezone.getOffset(this._londonTz, this._londondst_end);
		UT.equal(london_dst2, 60, "Offset = " + london_dst2);
		
		//Japan
		var japan_offset = AjxTimezone.getOffset(this._japanTz, this._jpst);
		UT.equal(japan_offset, 540, "Offset = " + japan_offset);
		var japan_st1 = AjxTimezone.getOffset(this._japanTz, this._jpst_start);
		UT.equal(japan_offset, 540, "Offset = " + japan_offset);
		var japan_st2 = AjxTimezone.getOffset(this._japanTz, this._jpst_end);
		UT.equal(japan_st2, 540, "Offset = " + japan_st2);
	}
);
		