/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

UT.module("AjxUtil");

UtAjxUtil = function() {};

UtAjxUtil.formatSizeForUnits = function() {
	ZmUnitTestUtil.log("starting AjxUtil.formatSizeForUnits test");

	UT.expect(8);
	//US Locale options
	I18nMsg.formatNumber = "#,##0.###";
	I18nMsg.numberSeparatorDecimal = ".";
	var us_mb1 = AjxUtil.formatSizeForUnits(52743372.8, AjxUtil.SIZE_MEGABYTES, false, 1); //50.3 mb
	UT.equal(us_mb1, "50.3", "US locale 50.3MB");
	
	var us_mb2 = AjxUtil.formatSizeForUnits(52428800, AjxUtil.SIZE_MEGABYTES, false, 1); //50 mb
	UT.equal(us_mb2, "50", "US locale 50 MB");
	
	var us_mb3 = AjxUtil.formatSizeForUnits(524288, AjxUtil.SIZE_MEGABYTES, false, 1); //.5 mb
	UT.equal(us_mb3, "0.5", "US locale .5 MB");
	
	var us_mb4 = AjxUtil.formatSizeForUnits(2622069145.5, AjxUtil.SIZE_MEGABYTES, false, 1); //2,500.6MB or 2.44GB
	UT.equal(us_mb4, "2500.6", "US locale 2,500.6 MB");
	
	//Spanish Locale options
	I18nMsg.formatNumber = "#.##0,###";
	I18nMsg.numberSeparatorDecimal = ",";
	var es_mb1 = AjxUtil.formatSizeForUnits(52743372.8, AjxUtil.SIZE_MEGABYTES, false, 1);
	UT.equal(es_mb1, "50,3", "Spanish locale 50.3 MB");

	var es_mb2 = AjxUtil.formatSizeForUnits(52428800, AjxUtil.SIZE_MEGABYTES, false, 1);
	UT.equal(es_mb2, "50", "Spanish locale 50 MB");

	var es_mb3 = AjxUtil.formatSizeForUnits(524288, AjxUtil.SIZE_MEGABYTES, false, 1); //.5 mb
	UT.equal(es_mb3, "0,5", "Spanish locale half MB");

	var es_mb4 = AjxUtil.formatSizeForUnits(2622069145.5, AjxUtil.SIZE_MEGABYTES, false, 1); //2,500.6MB or 2.44GB
	UT.equal(es_mb4, "2500,6", "Spanish locale 2,500.6 MB");
};

UT.test("AjxUtil.formatSizeForUnits", UtAjxUtil.formatSizeForUnits);