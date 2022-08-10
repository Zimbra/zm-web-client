/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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