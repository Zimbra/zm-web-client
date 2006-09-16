/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * This file needs to be kept in sync with the timezones listed in ldap.
 */
function ZmTimezones () {}

ZmTimezones.GMT = "(GMT) Greenwich Mean Time - Dublin / Edinburgh / Lisbon / London";

ZmTimezones._FALLBACK = "(GMT-08.00) Pacific Time (US & Canada) / Tijuana";

ZmTimezones.valueToDisplay = {
	"(GMT-12.00) International Date Line West":									ZmMsg.TZF_internationalDateLineWest,
	"(GMT-11.00) Midway Island / Samoa":										ZmMsg.TZF_MidwayIsland,
	"(GMT-10.00) Hawaii":														ZmMsg.TZF_Hawaii,
	"(GMT-09.00) Alaska":														ZmMsg.TZF_Alaska,
	"(GMT-08.00) Pacific Time (US & Canada) / Tijuana":							ZmMsg.TZF_PacificTime,
	"(GMT-07.00) Arizona":														ZmMsg.TZF_Arizona,
	"(GMT-07.00) Chihuahua / La Paz / Mazatlan":								ZmMsg.TZF_Chihuahua,
	"(GMT-07.00) Mountain Time (US & Canada)":									ZmMsg.TZF_MountainTime,
	"(GMT-06.00) Central America":												ZmMsg.TZF_CentralAmerica,
	"(GMT-06.00) Central Time (US & Canada)":									ZmMsg.TZF_CentralTime,
	"(GMT-06.00) Guadalajara / Mexico City / Monterrey":						ZmMsg.TZF_Guadalajara,
	"(GMT-06.00) Saskatchewan":													ZmMsg.TZF_Saskatchewan,
	"(GMT-05.00) Bogota / Lima / Quito":										ZmMsg.TZF_Lima,
	"(GMT-05.00) Eastern Time (US & Canada)":									ZmMsg.TZF_Eastern,
	"(GMT-05.00) Indiana (East)":												ZmMsg.TZF_Indiana,
	"(GMT-04.00) Atlantic Time (Canada)":										ZmMsg.TZF_Atlantic,
	"(GMT-04.00) Caracas / La Paz":												ZmMsg.TZF_Caracas,
	"(GMT-04.00) Santiago":														ZmMsg.TZF_Santiago,
	"(GMT-03.30) Newfoundland":													ZmMsg.TZF_Newfoundland,
	"(GMT-03.00) Brasilia":														ZmMsg.TZF_Brasilia,
	"(GMT-03.00) Buenos Aires / Georgetown":									ZmMsg.TZF_BuenosAires,
	"(GMT-03.00) Greenland":													ZmMsg.TZF_Greenland,
	"(GMT-02.00) Mid-Atlantic":													ZmMsg.TZF_MidAtlanitc,
	"(GMT-01.00) Azores":														ZmMsg.TZF_Azores,
	"(GMT-01.00) Cape Verde Is.":												ZmMsg.TZF_CapeVerde,
	"(GMT) Casablanca / Monrovia":												ZmMsg.TZF_Casablanca,
	"(GMT) Greenwich Mean Time - Dublin / Edinburgh / Lisbon / London":			ZmMsg.TZF_GMT,
	"(GMT+01.00) Amsterdam / Berlin / Bern / Rome / Stockholm / Vienna":		ZmMsg.TZF_Amsterdam,
	"(GMT+01.00) Belgrade / Bratislava / Budapest / Ljubljana / Prague":		ZmMsg.TZF_Belgrade,
	"(GMT+01.00) Brussels / Copenhagen / Madrid / Paris":						ZmMsg.TZF_Brussels,
	"(GMT+01.00) Sarajevo / Skopje / Warsaw / Zagreb":							ZmMsg.TZF_Sarajevo,
	"(GMT+01.00) West Central Africa":											ZmMsg.TZF_WestCentralAfrica,
	"(GMT+02.00) Athens / Beirut / Istanbul / Minsk":							ZmMsg.TZF_Athens,
	"(GMT+02.00) Bucharest":													ZmMsg.TZF_Budapest,
	"(GMT+02.00) Cairo":														ZmMsg.TZF_Cairo,
	"(GMT+02.00) Harare / Pretoria":											ZmMsg.TZF_Harare,
	"(GMT+02.00) Helsinki / Kyiv / Riga / Sofia / Tallinn / Vilnius":			ZmMsg.TZF_Helsinki,
	"(GMT+02.00) Jerusalem":													ZmMsg.TZF_Jerusalem,
	"(GMT+03.00) Baghdad":														ZmMsg.TZF_Baghdad,
	"(GMT+03.00) Kuwait / Riyadh":												ZmMsg.TZF_Kuwait,
	"(GMT+03.00) Moscow / St. Petersburg / Volgograd":							ZmMsg.TZF_Moscow,
	"(GMT+03.00) Nairobi":														ZmMsg.TZF_Nairobi,
	"(GMT+03.30) Tehran":														ZmMsg.TZF_Tehran,
	"(GMT+04.00) Abu Dhabi / Muscat":											ZmMsg.TZF_AbuDhabi,
	"(GMT+04.00) Baku / Tbilisi / Yerevan":										ZmMsg.TZF_Baku,
	"(GMT+04.30) Kabul":														ZmMsg.TZF_Kabul,
	"(GMT+05.00) Ekaterinburg":													ZmMsg.TZF_Ekaterinburg,
	"(GMT+05.00) Islamabad / Karachi / Tashkent":								ZmMsg.TZF_Islamabad,
	"(GMT+05.30) Chennai / Kolkata / Mumbai / New Delhi":						ZmMsg.TZF_Chennai,
	"(GMT+05.45) Kathmandu":													ZmMsg.TZF_Katmandu,
	"(GMT+06:00) Almaty / Novosibirsk":											ZmMsg.TZF_Almaty,
	"(GMT+06.00) Astana / Dhaka":												ZmMsg.TZF_Astanda,
	"(GMT+06.00) Sri Jayawardenepura":											ZmMsg.TZF_SriJaywardenepura,
	"(GMT+06.30) Rangoon":														ZmMsg.TZF_Rangoon,
	"(GMT+07.00) Bangkok / Hanoi / Jakarta":									ZmMsg.TZF_Bangkok,
	"(GMT+07.00) Krasnoyarsk":													ZmMsg.TZF_Krasnoyarsk,
	"(GMT+08.00) Beijing / Chongqing / Hong Kong / Urumqi":						ZmMsg.TZF_Beijing,
	"(GMT+08.00) Irkutsk / Ulaan Bataar":										ZmMsg.TZF_Irkutsk,
	"(GMT+08.00) Kuala Lumpur / Singapore":										ZmMsg.TZF_KualaLumpur,
	"(GMT+08.00) Perth":														ZmMsg.TZF_Perth,
	"(GMT+08.00) Taipei":														ZmMsg.TZF_Taipei,
	"(GMT+09.00) Osaka / Sapporo / Tokyo":										ZmMsg.TZF_Osaka,
	"(GMT+09.00) Seoul":														ZmMsg.TZF_Seoul,
	"(GMT+09.00) Yakutsk":														ZmMsg.TZF_Takutsk,
	"(GMT+09.30) Adelaide":														ZmMsg.TZF_Adelaide,
	"(GMT+09.30) Darwin":														ZmMsg.TZF_Darwin,
	"(GMT+10.00) Brisbane":														ZmMsg.TZF_Brisbane,
	"(GMT+10.00) Canberra / Melbourne / Sydney":								ZmMsg.TZF_Canberra,
	"(GMT+10.00) Guam / Port Moresby":											ZmMsg.TZF_Guam,
	"(GMT+10.00) Hobart":														ZmMsg.TZF_Hobart,
	"(GMT+10.00) Vladivostok":													ZmMsg.TZF_Vladivostok,
	"(GMT+11.00) Magadan / Solomon Is. / New Calenodia":						ZmMsg.TZF_Magadan,
	"(GMT+12.00) Auckland / Wellington":										ZmMsg.TZF_Aukland,
	"(GMT+12.00) Fiji / Kamchatka / Marshall Is.":								ZmMsg.TZF_Fiji,
	"(GMT+13.00) Nuku'alofa":													ZmMsg.TZF_Nukualofa
};

ZmTimezones._fullZoneChoices = [
	{value:"(GMT-12.00) International Date Line West",							label:ZmMsg.TZF_internationalDateLineWest},
	{value:"(GMT-11.00) Midway Island / Samoa",									label:ZmMsg.TZF_MidwayIsland},
	{value:"(GMT-10.00) Hawaii",												label:ZmMsg.TZF_Hawaii},
	{value:"(GMT-09.00) Alaska",												label:ZmMsg.TZF_Alaska},
	{value:"(GMT-08.00) Pacific Time (US & Canada) / Tijuana",					label:ZmMsg.TZF_PacificTime},
	{value:"(GMT-07.00) Arizona",												label:ZmMsg.TZF_Arizona},
	{value:"(GMT-07.00) Chihuahua / La Paz / Mazatlan",							label:ZmMsg.TZF_Chihuahua},
	{value:"(GMT-07.00) Mountain Time (US & Canada)",							label:ZmMsg.TZF_MountainTime},
	{value:"(GMT-06.00) Central America",										label:ZmMsg.TZF_CentralAmerica},
	{value:"(GMT-06.00) Central Time (US & Canada)",							label:ZmMsg.TZF_CentralTime},
	{value:"(GMT-06.00) Guadalajara / Mexico City / Monterrey",					label:ZmMsg.TZF_Guadalajara},
	{value:"(GMT-06.00) Saskatchewan",											label:ZmMsg.TZF_Saskatchewan},
	{value:"(GMT-05.00) Bogota / Lima / Quito",									label:ZmMsg.TZF_Lima},
	{value:"(GMT-05.00) Eastern Time (US & Canada)",							label:ZmMsg.TZF_Eastern},
	{value:"(GMT-05.00) Indiana (East)",										label:ZmMsg.TZF_Indiana},
	{value:"(GMT-04.00) Atlantic Time (Canada)",								label:ZmMsg.TZF_Atlantic},
	{value:"(GMT-04.00) Caracas / La Paz",										label:ZmMsg.TZF_Caracas},
	{value:"(GMT-04.00) Santiago",												label:ZmMsg.TZF_Santiago},
	{value:"(GMT-03.30) Newfoundland",											label:ZmMsg.TZF_Newfoundland},
	{value:"(GMT-03.00) Brasilia",												label:ZmMsg.TZF_Brasilia},
	{value:"(GMT-03.00) Buenos Aires / Georgetown",								label:ZmMsg.TZF_BuenosAires},
	{value:"(GMT-03.00) Greenland",												label:ZmMsg.TZF_Greenland},
	{value:"(GMT-02.00) Mid-Atlantic",											label:ZmMsg.TZF_MidAtlanitc},
	{value:"(GMT-01.00) Azores",												label:ZmMsg.TZF_Azores},
	{value:"(GMT-01.00) Cape Verde Is.",										label:ZmMsg.TZF_CapeVerde},
	{value:"(GMT) Casablanca / Monrovia",										label:ZmMsg.TZF_Casablanca},
	{value:"(GMT) Greenwich Mean Time - Dublin / Edinburgh / Lisbon / London",	label:ZmMsg.TZF_GMT},
	{value:"(GMT+01.00) Amsterdam / Berlin / Bern / Rome / Stockholm / Vienna",	label:ZmMsg.TZF_Amsterdam},
	{value:"(GMT+01.00) Belgrade / Bratislava / Budapest / Ljubljana / Prague",	label:ZmMsg.TZF_Belgrade},
	{value:"(GMT+01.00) Brussels / Copenhagen / Madrid / Paris",				label:ZmMsg.TZF_Brussels},
	{value:"(GMT+01.00) Sarajevo / Skopje / Warsaw / Zagreb",					label:ZmMsg.TZF_Sarajevo},
	{value:"(GMT+01.00) West Central Africa",									label:ZmMsg.TZF_WestCentralAfrica},
	{value:"(GMT+02.00) Athens / Beirut / Istanbul / Minsk",					label:ZmMsg.TZF_Athens},
	{value:"(GMT+02.00) Bucharest",												label:ZmMsg.TZF_Budapest},
	{value:"(GMT+02.00) Cairo",													label:ZmMsg.TZF_Cairo},
	{value:"(GMT+02.00) Harare / Pretoria",										label:ZmMsg.TZF_Harare},
	{value:"(GMT+02.00) Helsinki / Kyiv / Riga / Sofia / Tallinn / Vilnius",	label:ZmMsg.TZF_Helsinki},
	{value:"(GMT+02.00) Jerusalem",												label:ZmMsg.TZF_Jerusalem},
	{value:"(GMT+03.00) Baghdad",												label:ZmMsg.TZF_Baghdad},
	{value:"(GMT+03.00) Kuwait / Riyadh",										label:ZmMsg.TZF_Kuwait},
	{value:"(GMT+03.00) Moscow / St. Petersburg / Volgograd",					label:ZmMsg.TZF_Moscow},
	{value:"(GMT+03.00) Nairobi",												label:ZmMsg.TZF_Nairobi},
	{value:"(GMT+03.30) Tehran",												label:ZmMsg.TZF_Tehran},
	{value:"(GMT+04.00) Abu Dhabi / Muscat",									label:ZmMsg.TZF_AbuDhabi},
	{value:"(GMT+04.00) Baku / Tbilisi / Yerevan",								label:ZmMsg.TZF_Baku},
	{value:"(GMT+04.30) Kabul",													label:ZmMsg.TZF_Kabul},
	{value:"(GMT+05.00) Ekaterinburg",											label:ZmMsg.TZF_Ekaterinburg},
	{value:"(GMT+05.00) Islamabad / Karachi / Tashkent",						label:ZmMsg.TZF_Islamabad},
	{value:"(GMT+05.30) Chennai / Kolkata / Mumbai / New Delhi",				label:ZmMsg.TZF_Chennai},
	{value:"(GMT+05.45) Kathmandu",												label:ZmMsg.TZF_Katmandu},
	{value:"(GMT+06:00) Almaty / Novosibirsk",									label:ZmMsg.TZF_Almaty},
	{value:"(GMT+06.00) Astana / Dhaka",										label:ZmMsg.TZF_Astanda},
	{value:"(GMT+06.00) Sri Jayawardenepura",									label:ZmMsg.TZF_SriJaywardenepura},
	{value:"(GMT+06.30) Rangoon",												label:ZmMsg.TZF_Rangoon},
	{value:"(GMT+07.00) Bangkok / Hanoi / Jakarta",								label:ZmMsg.TZF_Bangkok},
	{value:"(GMT+07.00) Krasnoyarsk",											label:ZmMsg.TZF_Krasnoyarsk},
	{value:"(GMT+08.00) Beijing / Chongqing / Hong Kong / Urumqi",				label:ZmMsg.TZF_Beijing},
	{value:"(GMT+08.00) Irkutsk / Ulaan Bataar",								label:ZmMsg.TZF_Irkutsk},
	{value:"(GMT+08.00) Kuala Lumpur / Singapore",								label:ZmMsg.TZF_KualaLumpur},
	{value:"(GMT+08.00) Perth",													label:ZmMsg.TZF_Perth},
	{value:"(GMT+08.00) Taipei",												label:ZmMsg.TZF_Taipei},
	{value:"(GMT+09.00) Osaka / Sapporo / Tokyo",								label:ZmMsg.TZF_Osaka},
	{value:"(GMT+09.00) Seoul",													label:ZmMsg.TZF_Seoul},
	{value:"(GMT+09.00) Yakutsk",												label:ZmMsg.TZF_Takutsk},
	{value:"(GMT+09.30) Adelaide",												label:ZmMsg.TZF_Adelaide},
	{value:"(GMT+09.30) Darwin",												label:ZmMsg.TZF_Darwin},
	{value:"(GMT+10.00) Brisbane",												label:ZmMsg.TZF_Brisbane},
	{value:"(GMT+10.00) Canberra / Melbourne / Sydney",							label:ZmMsg.TZF_Canberra},
	{value:"(GMT+10.00) Guam / Port Moresby",									label:ZmMsg.TZF_Guam},
	{value:"(GMT+10.00) Hobart",												label:ZmMsg.TZF_Hobart},
	{value:"(GMT+10.00) Vladivostok",											label:ZmMsg.TZF_Vladivostok},
	{value:"(GMT+11.00) Magadan / Solomon Is. / New Calenodia",					label:ZmMsg.TZF_Magadan},
	{value:"(GMT+12.00) Auckland / Wellington",									label:ZmMsg.TZF_Aukland},
	{value:"(GMT+12.00) Fiji / Kamchatka / Marshall Is.",						label:ZmMsg.TZF_Fiji},
	{value:"(GMT+13.00) Nuku'alofa",											label:ZmMsg.TZF_Nukualofa}
];

ZmTimezones._abbreviatedZoneChoices = [
	{value:"(GMT-12.00) International Date Line West",							label:ZmMsg.TZA_internationalDateLineWest},
	{value:"(GMT-11.00) Midway Island / Samoa",									label:ZmMsg.TZA_MidwayIsland},
	{value:"(GMT-10.00) Hawaii",												label:ZmMsg.TZA_Hawaii},
	{value:"(GMT-09.00) Alaska",												label:ZmMsg.TZA_Alaska},
	{value:"(GMT-08.00) Pacific Time (US & Canada) / Tijuana",					label:ZmMsg.TZA_PacificTime},
	{value:"(GMT-07.00) Arizona",												label:ZmMsg.TZA_Arizona},
	{value:"(GMT-07.00) Chihuahua / La Paz / Mazatlan",							label:ZmMsg.TZA_Chihuahua},
	{value:"(GMT-07.00) Mountain Time (US & Canada)",							label:ZmMsg.TZA_MountainTime},
	{value:"(GMT-06.00) Central America",										label:ZmMsg.TZA_CentralAmerica},
	{value:"(GMT-06.00) Central Time (US & Canada)",							label:ZmMsg.TZA_CentralTime},
	{value:"(GMT-06.00) Guadalajara / Mexico City / Monterrey",					label:ZmMsg.TZA_Guadalajara},
	{value:"(GMT-06.00) Saskatchewan",											label:ZmMsg.TZA_Saskatchewan},
	{value:"(GMT-05.00) Bogota / Lima / Quito",									label:ZmMsg.TZA_Lima},
	{value:"(GMT-05.00) Eastern Time (US & Canada)",							label:ZmMsg.TZA_Eastern},
	{value:"(GMT-05.00) Indiana (East)",										label:ZmMsg.TZA_Indiana},
	{value:"(GMT-04.00) Atlantic Time (Canada)",								label:ZmMsg.TZA_Atlantic},
	{value:"(GMT-04.00) Caracas / La Paz",										label:ZmMsg.TZA_Caracas},
	{value:"(GMT-04.00) Santiago",												label:ZmMsg.TZA_Santiago},
	{value:"(GMT-03.30) Newfoundland",											label:ZmMsg.TZA_Newfoundland},
	{value:"(GMT-03.00) Brasilia",												label:ZmMsg.TZA_Brasilia},
	{value:"(GMT-03.00) Buenos Aires / Georgetown",								label:ZmMsg.TZA_BuenosAires},
	{value:"(GMT-03.00) Greenland",												label:ZmMsg.TZA_Greenland},
	{value:"(GMT-02.00) Mid-Atlantic",											label:ZmMsg.TZA_MidAtlanitc},
	{value:"(GMT-01.00) Azores",												label:ZmMsg.TZA_Azores},
	{value:"(GMT-01.00) Cape Verde Is.",										label:ZmMsg.TZA_CapeVerde},
	{value:"(GMT) Casablanca / Monrovia",										label:ZmMsg.TZA_Casablanca},
	{value:"(GMT) Greenwich Mean Time - Dublin / Edinburgh / Lisbon / London",	label:ZmMsg.TZA_GMT},
	{value:"(GMT+01.00) Amsterdam / Berlin / Bern / Rome / Stockholm / Vienna",	label:ZmMsg.TZA_Amsterdam},
	{value:"(GMT+01.00) Belgrade / Bratislava / Budapest / Ljubljana / Prague",	label:ZmMsg.TZA_Belgrade},
	{value:"(GMT+01.00) Brussels / Copenhagen / Madrid / Paris",				label:ZmMsg.TZA_Brussels},
	{value:"(GMT+01.00) Sarajevo / Skopje / Warsaw / Zagreb",					label:ZmMsg.TZA_Sarajevo},
	{value:"(GMT+01.00) West Central Africa",									label:ZmMsg.TZA_WestCentralAfrica},
	{value:"(GMT+02.00) Athens / Beirut / Istanbul / Minsk",					label:ZmMsg.TZA_Athens},
	{value:"(GMT+02.00) Bucharest",												label:ZmMsg.TZA_Budapest},
	{value:"(GMT+02.00) Cairo",													label:ZmMsg.TZA_Cairo},
	{value:"(GMT+02.00) Harare / Pretoria",										label:ZmMsg.TZA_Harare},
	{value:"(GMT+02.00) Helsinki / Kyiv / Riga / Sofia / Tallinn / Vilnius",	label:ZmMsg.TZA_Helsinki},
	{value:"(GMT+02.00) Jerusalem",												label:ZmMsg.TZA_Jerusalem},
	{value:"(GMT+03.00) Baghdad",												label:ZmMsg.TZA_Baghdad},
	{value:"(GMT+03.00) Kuwait / Riyadh",										label:ZmMsg.TZA_Kuwait},
	{value:"(GMT+03.00) Moscow / St. Petersburg / Volgograd",					label:ZmMsg.TZA_Moscow},
	{value:"(GMT+03.00) Nairobi",												label:ZmMsg.TZA_Nairobi},
	{value:"(GMT+03.30) Tehran",												label:ZmMsg.TZA_Tehran},
	{value:"(GMT+04.00) Abu Dhabi / Muscat",									label:ZmMsg.TZA_AbuDhabi},
	{value:"(GMT+04.00) Baku / Tbilisi / Yerevan",								label:ZmMsg.TZA_Baku},
	{value:"(GMT+04.30) Kabul",													label:ZmMsg.TZA_Kabul},
	{value:"(GMT+05.00) Ekaterinburg",											label:ZmMsg.TZA_Ekaterinburg},
	{value:"(GMT+05.00) Islamabad / Karachi / Tashkent",						label:ZmMsg.TZA_Islamabad},
	{value:"(GMT+05.30) Chennai / Kolkata / Mumbai / New Delhi",				label:ZmMsg.TZA_Chennai},
	{value:"(GMT+05.45) Kathmandu",												label:ZmMsg.TZA_Katmandu},
	{value:"(GMT+06.00) Almaty / Novosibirsk",									label:ZmMsg.TZA_Almaty},
	{value:"(GMT+06.00) Astana / Dhaka",										label:ZmMsg.TZA_Astanda},
	{value:"(GMT+06.00) Sri Jayawardenepura",									label:ZmMsg.TZA_SriJaywardenepura},
	{value:"(GMT+06.30) Rangoon",												label:ZmMsg.TZA_Rangoon},
	{value:"(GMT+07.00) Bangkok / Hanoi / Jakarta",								label:ZmMsg.TZA_Bangkok},
	{value:"(GMT+07.00) Krasnoyarsk",											label:ZmMsg.TZA_Krasnoyarsk},
	{value:"(GMT+08.00) Beijing / Chongqing / Hong Kong / Urumqi",				label:ZmMsg.TZA_Beijing},
	{value:"(GMT+08.00) Irkutsk / Ulaan Bataar",								label:ZmMsg.TZA_Irkutsk},
	{value:"(GMT+08.00) Kuala Lumpur / Singapore",								label:ZmMsg.TZA_KualaLumpur},
	{value:"(GMT+08.00) Perth",													label:ZmMsg.TZA_Perth},
	{value:"(GMT+08.00) Taipei",												label:ZmMsg.TZA_Taipei},
	{value:"(GMT+09.00) Osaka / Sapporo / Tokyo",								label:ZmMsg.TZA_Osaka},
	{value:"(GMT+09.00) Seoul",													label:ZmMsg.TZA_Seoul},
	{value:"(GMT+09.00) Yakutsk",												label:ZmMsg.TZA_Takutsk},
	{value:"(GMT+09.30) Adelaide",												label:ZmMsg.TZA_Adelaide},
	{value:"(GMT+09.30) Darwin",												label:ZmMsg.TZA_Darwin},
	{value:"(GMT+10.00) Brisbane",												label:ZmMsg.TZA_Brisbane},
	{value:"(GMT+10.00) Canberra / Melbourne / Sydney",							label:ZmMsg.TZA_Canberra},
	{value:"(GMT+10.00) Guam / Port Moresby",									label:ZmMsg.TZA_Guam},
	{value:"(GMT+10.00) Hobart",												label:ZmMsg.TZA_Hobart},
	{value:"(GMT+10.00) Vladivostok",											label:ZmMsg.TZA_Vladivostok},
	{value:"(GMT+11.00) Magadan / Solomon Is. / New Calenodia",					label:ZmMsg.TZA_Magadan},
	{value:"(GMT+12.00) Auckland / Wellington",									label:ZmMsg.TZA_Aukland},
	{value:"(GMT+12.00) Fiji / Kamchatka / Marshall Is.",						label:ZmMsg.TZA_Fiji},
	{value:"(GMT+13.00) Nuku'alofa",											label:ZmMsg.TZA_Nukualofa}
];

ZmTimezones.ruleLists = {
	noDSTList: [
		{ name:"(GMT-12.00) International Date Line West",				stdOffset: -720,hasDOffset: false },
		{ name:"(GMT-11.00) Midway Island / Samoa", 					stdOffset: -660,hasDOffset: false },
		{ name:"(GMT-10.00) Hawaii", 									stdOffset: -600,hasDOffset: false },
		{ name:"(GMT-07.00) Arizona",									stdOffset: -420,hasDOffset: false },
		{ name:"(GMT-06.00) Central America",							stdOffset: -360,hasDOffset: false },
		{ name:"(GMT-06.00) Saskatchewan",								stdOffset: -360,hasDOffset: false },
		{ name:"(GMT-05.00) Indiana (East)", 							stdOffset: -300,hasDOffset: false },
		{ name:"(GMT-04.00) Atlantic Time (Canada)", 					stdOffset: -300,hasDOffset: false },
		{ name:"(GMT-05.00) Bogota / Lima / Quito", 					stdOffset: -300,hasDOffset: false },
		{ name:"(GMT-04.00) Caracas / La Paz", 							stdOffset: -240,hasDOffset: false },
		{ name:"(GMT-03.00) Buenos Aires / Georgetown", 				stdOffset: -180,hasDOffset: false },
		{ name:"(GMT-01.00) Cape Verde Is.", 							stdOffset: -60, hasDOffset: false },
		{ name:"(GMT) Casablanca / Monrovia",							stdOffset: 0, 	hasDOffset: false },
		{ name:"(GMT+01.00) West Central Africa",						stdOffset: 60, 	hasDOffset: false },
		{ name:"(GMT+02.00) Harare / Pretoria", 						stdOffset: 120, hasDOffset: false },
		{ name:"(GMT+02.00) Jerusalem", 								stdOffset: 120, hasDOffset: false },
		{ name:"(GMT+03.00) Kuwait / Riyadh", 							stdOffset: 180, hasDOffset: false },
		{ name:"(GMT+03.00) Nairobi", 									stdOffset: 180, hasDOffset: false },
		{ name:"(GMT+04.00) Abu Dhabi / Muscat", 						stdOffset: 240, hasDOffset: false },
		{ name:"(GMT+04.30) Kabul", 									stdOffset: 270, hasDOffset: false },
		{ name:"(GMT+05.00) Islamabad / Karachi / Tashkent",			stdOffset: 300, hasDOffset: false },
		{ name:"(GMT+05.30) Chennai / Kolkata / Mumbai / New Delhi", 	stdOffset: 330, hasDOffset: false },
		{ name:"(GMT+05.45) Kathmandu", 								stdOffset: 345, hasDOffset: false },
		{ name:"(GMT+06.00) Astana / Dhaka", 							stdOffset: 360, hasDOffset: false },
		{ name:"(GMT+06.00) Sri Jayawardenepura", 						stdOffset: 360, hasDOffset: false },
		{ name:"(GMT+06.30) Rangoon", 									stdOffset: 390, hasDOffset: false },
		{ name:"(GMT+07.00) Bangkok / Hanoi / Jakarta", 				stdOffset: 420, hasDOffset: false },
		{ name:"(GMT+08.00) Kuala Lumpur / Singapore", 					stdOffset: 480, hasDOffset: false },
		{ name:"(GMT+08.00) Perth", 									stdOffset: 480, hasDOffset: false },
		{ name:"(GMT+08.00) Taipei", 									stdOffset: 480, hasDOffset: false },
		{ name:"(GMT+08.00) Beijing / Chongqing / Hong Kong / Urumqi",	stdOffset: 480, hasDOffset: false },
		{ name:"(GMT+09.00) Osaka / Sapporo / Tokyo", 					stdOffset: +540,hasDOffset: false },
		{ name:"(GMT+09.00) Seoul", 									stdOffset: 540, hasDOffset: false },
		{ name:"(GMT+09.30) Darwin", 									stdOffset: 570, hasDOffset: false },
		{ name:"(GMT+10.00) Brisbane", 									stdOffset: 600, hasDOffset: false },
		{ name:"(GMT+10.00) Guam / Port Moresby", 						stdOffset: 600, hasDOffset: false },
		{ name:"(GMT+11.00) Magadan / Solomon Is. / New Calenodia", 	stdOffset: 660, hasDOffset: false },
		{ name:"(GMT+12.00) Fiji / Kamchatka / Marshall Is.", 			stdOffset: 720, hasDOffset: false },
		{ name:"(GMT+13.00) Nuku'alofa", 								stdOffset: 780, hasDOffset: false },
	],

	DSTList: [
		{ name:"(GMT-09.00) Alaska", 
			stdOffset: -540, changeStd:[2005, 9, 30], 
			dstOffset: -480, changeD:[2005, 3, 3] },
		{ name:"(GMT-08.00) Pacific Time (US & Canada) / Tijuana", 
			stdOffset: -480, changeStd:[2005, 9, 30],
			dstOffset: -420, changeD: [2005, 3, 3]},
		{ name:"(GMT-07.00) Mountain Time (US & Canada)", 
			stdOffset: -420, changeStd:[2005, 9, 30], 
			dstOffset: -360, changeD: [2005, 3, 3]},
		{ name:"(GMT-06.00) Central Time (US & Canada)", 
			stdOffset: -360, changeStd: [2005, 9, 30], 
			dstOffset: -300, changeD: [2005, 3, 3]},
		{ name:"(GMT-05.00) Eastern Time (US & Canada)", 
			stdOffset: -300, changeStd: [2005, 9, 30],
			dstOffset: -240, changeD: [2005, 3, 3] },
		{ name:"(GMT-04.00) Santiago", 
			stdOffset: -240, changeStd: [2005, 2, 13],
			dstOffset: -180, changeD: [2005, 9, 9] },
		{ name:"(GMT-03.30) Newfoundland", 
			stdOffset: -210, changeStd: [2005, 9, 30],
			dstOffset: -150, changeD: [2005, 3, 3] },
		{ name:"(GMT-03.00) Brasilia", 
			stdOffset: -180, changeStd: [2005, 1, 20],
			dstOffset: -120, changeD: [2005, 9, 16] },
		{ name:"(GMT-03.00) Greenland", 
			stdOffset: -180, changeStd: [2005, 9, 30],
			dstOffset: -120, changeD: [2005, 3, 3] },
		{ name:"(GMT-02.00) Mid-Atlantic", 
			stdOffset: -120, changeStd: [2005, 8, 25],
			dstOffset: -60, changeD: [2005, 2, 27] },
		{ name:"(GMT-01.00) Azores", 
			stdOffset: -60, changeStd: [2005, 9, 30], 
			dstOffset: 0, changeD: [2005, 2, 27] },
		{ name:"(GMT) Greenwich Mean Time - Dublin / Edinburgh / Lisbon / London", 
			stdOffset: 0, changeStd: [2005, 9, 30],
			dstOffset: 60, changeD: [2005, 2, 27] },
		{ name:"(GMT+01.00) Amsterdam / Berlin / Bern / Rome / Stockholm / Vienna", 
			stdOffset: 60, changeStd: [2005, 9, 30],
			dstOffset: 120, changeD: [2005, 2, 27] },
		{ name:"(GMT+02.00) Athens / Beirut / Istanbul / Minsk", 
			stdOffset: 120, changeStd: [2005, 9, 30],
			dstOffset: 180, changeD: [2005, 2, 27] },
		{ name:"(GMT+02.00) Cairo", 
			stdOffset: 120, changeStd:  [2005, 8, 28],
			dstOffset: 180, changeD:  [2005, 4, 6] },
		{ name:"(GMT+03.00) Baghdad", 
			stdOffset: 180, changeStd: [2005, 9, 2],
			dstOffset: 240, changeD: [2005, 3, 3]},
		{ name:"(GMT+03.00) Moscow / St. Petersburg / Volgograd", 
			stdOffset: 180, changeStd: [2005, 9, 30],
			dstOffset: 240, changeD: [2005, 2, 27] },
		{ name:"(GMT+03.30) Tehran",
			stdOffset: 210, changeStd:  [2005, 8, 28], 
			dstOffset: 270, changeD:  [2005, 2, 6] },
		{ name:"(GMT+04.00) Baku / Tbilisi / Yerevan", 
			stdOffset: 240, changeStd: [2005, 9, 30],
			dstOffset: 300, changeD: [2005, 2, 27] },
		{ name:"(GMT+05.00) Ekaterinburg", 
			stdOffset: 300, changeStd:  [2005, 9, 30],
			dstOffset: 360, changeD:  [2005, 2, 27]},
		{ name:"(GMT+06.00) Almaty / Novosibirsk", 
			stdOffset: 360, changeStd:  [2005, 9, 30],
			dstOffset: 420, changeD:  [2005, 2, 27]},
		{ name:"(GMT+07.00) Krasnoyarsk", 
			stdOffset: 420, changeStd:  [2005, 9, 30],
			dstOffset: 480, changeD:  [2005, 2, 27] },
		{ name:"(GMT+08.00) Irkutsk / Ulaan Bataar", 
			stdOffset: 480, changeStd:  [2005, 9, 30],
			dstOffset: 540, changeD:  [2005, 2, 27] },
		{ name:"(GMT+09.00) Yakutsk", 
			stdOffset: 540, changeStd:  [2005, 9, 30],
			dstOffset: 600, changeD:  [2005, 2, 27] },
		{ name:"(GMT+09.30) Adelaide", 
			stdOffset: 570, changeStd:  [2005, 2, 27], 
			dstOffset: 630, changeD:  [2005, 9, 30] },
		{ name:"(GMT+10.00) Canberra / Melbourne / Sydney", 
			stdOffset: 600, changeStd: [2005, 2, 27],
			dstOffset: 660, changeD: [2005, 9, 30] },
		{ name:"(GMT+10.00) Hobart", 
			stdOffset: 600, changeStd: [2005, 2, 27],
			dstOffset: 660, changeD: [2005, 9, 2] },
		{ name:"(GMT+10.00) Vladivostok", 
			stdOffset: 600, changeStd: [2005, 9, 30], 
			dstOffset: 660, changeD: [2005, 2, 27] },
		{ name:"(GMT+12.00) Auckland / Wellington", 
			stdOffset: 720, changeStd: [2005, 2, 20],
			dstOffset: 780, changeD: [2005, 9, 2] }
	]
}
	
/**
 * One problem with firefox, is if the timezone on the machine changes,
 * the browser isn't updated. You have to restart firefox for it to get the 
 * new machine timezone.
 */
ZmTimezones.guessMachineTimezone = 
function() {
	var dec1 = new Date(2005, 12, 1, 0, 0, 0);
	var jun1 = new Date(2005, 6, 1, 0, 0, 0);
	var dec1offset = dec1.getTimezoneOffset();
	var jun1offset = jun1.getTimezoneOffset();
	var pos = ((dec1.getHours() - dec1.getUTCHours()) > 0);
	if (!pos) {
		dec1offset = dec1offset * -1;
		jun1offset = jun1offset * -1;
	}
	var tz = null;
	// if the offset for jun is the same as the offset in december,
	// then we have a timezone that doesn't deal with daylight savings.
	if (jun1offset == dec1offset) {
		var list = ZmTimezones.ruleLists.noDSTList;
 		for (var i = 0; i < list.length ; ++i ) {
			if (list[i].stdOffset == jun1offset) {
				tz = list[i];
				break;
			}
		}
	} else {
		// we need to find a rule that matches both offsets
		var list = ZmTimezones.ruleLists.DSTList;
		var dst = Math.max(dec1offset, jun1offset);
		var std = Math.min(dec1offset, jun1offset);
		var rule;
 		for (var i = 0; i < list.length ; ++i ) {
			rule = list[i];
			if (rule.stdOffset == std && rule.dstOffset == dst) {
				if (ZmTimezones._compareRules(rule, std, dst, pos)) {
					tz = rule;
					break;
				}
			}
		}
	}
	return tz ? tz.name : ZmTimezones._FALLBACK;
};

ZmTimezones._compareRules = 
function(rule, std, dst, pos) {
	var equal = false;
	var d = new Date(rule.changeStd[0], rule.changeStd[1], (rule.changeStd[2] -1)).getTimezoneOffset();
	var s = new Date(rule.changeStd[0], rule.changeStd[1], (rule.changeStd[2] + 1)).getTimezoneOffset();
	if (!pos) {
		s = s * -1;
		d = d * -1;
	}
	//alert("name = " + rule.name + ' s = ' + s + " d = " + d + " std = " + std + " dst = " + dst);
	if ( (std == s) && (dst == d) ) {
		s = new Date(rule.changeD[0], rule.changeD[1], (rule.changeD[2] -1)).getTimezoneOffset();
		d = new Date(rule.changeD[0], rule.changeD[1], (rule.changeD[2] + 1)).getTimezoneOffset();
		if (!pos) {
			s = s * -1;
			d = d * -1;
		}
		//alert("name = " + rule.name + ' s = ' + s + " d = " + d + " std = " + std + " dst = " + dst);
		if ((std == s) && (dst == d))
			equal = true;
	}
	return equal;
};

ZmTimezones.getFullZoneChoices = 
function() {
	return ZmTimezones._fullZoneChoices;
};

ZmTimezones.getAbbreviatedZoneChoices = 
function() {
	return ZmTimezones._abbreviatedZoneChoices;
};

ZmTimezones.getDefault = 
function() {
	// should get the user default, set via the options page.
	var appCtxt = ZmAppCtxt.getFromShell(DwtShell.getShell(window));
	return appCtxt ? appCtxt.get(ZmSetting.DEFAULT_CALENDAR_TIMEZONE) : null;
};

ZmTimezones.setDefault = 
function() {
	// set the default timezone
};

/**
* Sets the user's time zone to that of his machine. If it has changed, saves the
* new value to prefs.
*
* @param callback	[AjxCallback]	async callback
*/
ZmTimezones.initializeServerTimezone = 
function(callback) {
	var machineTz = ZmTimezones.guessMachineTimezone();
	var currentDefault = ZmTimezones.getDefault();
	if (machineTz != currentDefault) {
		var appCtxt = ZmAppCtxt.getFromShell(DwtShell.getShell(window));
		if (appCtxt != null) {
			var settings = appCtxt.getSettings(); 
			var setting = settings.getSetting(ZmSetting.DEFAULT_CALENDAR_TIMEZONE);
			if (setting){
				setting.setValue(machineTz);
				settings.save([setting]);
			}
		}
	}
	if (callback) callback.run();
};
