/**
 * This file needs to be kept in sync with the timezones listed in ldap.
 */
function LmTimezones () {}

LmTimezones.GMT ="(GMT) Greenwich Mean Time - Dublin / Edinburgh / Lisbon / London";


LmTimezones.valueToDisplay = {
	"(GMT-12.00) International Date Line West":							LmMsg.TZF_internationalDateLineWest,
	"(GMT-11.00) Midway Island / Samoa":									LmMsg.TZF_MidwayIsland,
	"(GMT-10.00) Hawaii":												LmMsg.TZF_Hawaii,
	"(GMT-09.00) Alaska":												LmMsg.TZF_Alaska,
	"(GMT-08.00) Pacific Time (US & Canada) / Tijuana":					LmMsg.TZF_PacificTime,
	"(GMT-07.00) Arizona":												LmMsg.TZF_Arizona,
	"(GMT-07.00) Chihuahua / La Paz / Mazatlan":							LmMsg.TZF_Chihuahua,
	"(GMT-07.00) Mountain Time (US & Canada)":							LmMsg.TZF_MountainTime,
	"(GMT-06.00) Central America":										LmMsg.TZF_CentralAmerica,
	"(GMT-06.00) Central Time (US & Canada)":							LmMsg.TZF_CentralTime,
	"(GMT-06.00) Guadalajara / Mexico City / Monterrey":					LmMsg.TZF_Guadalajara,
	"(GMT-06.00) Saskatchewan":											LmMsg.TZF_Saskatchewan,
	"(GMT-05.00) Bogota / Lima / Quito":									LmMsg.TZF_Lima,
	"(GMT-05.00) Eastern Time (US & Canada)":							LmMsg.TZF_Eastern,
	"(GMT-05.00) Indiana (East)":										LmMsg.TZF_Indiana,
	"(GMT-04.00) Atlantic Time (Canada)":								LmMsg.TZF_Atlantic,
	"(GMT-04.00) Caracas / La Paz":										LmMsg.TZF_Caracas,
	"(GMT-04.00) Santiago":												LmMsg.TZF_Santiago,
	"(GMT-03.30) Newfoundland":											LmMsg.TZF_Newfoundland,
	"(GMT-03.00) Brasilia":												LmMsg.TZF_Brasilia,
	"(GMT-03.00) Buenos Aires / Georgetown":								LmMsg.TZF_BuenosAires,
	"(GMT-03.00) Greenland":												LmMsg.TZF_Greenland,
	"(GMT-02.00) Mid-Atlantic":											LmMsg.TZF_MidAtlanitc,
	"(GMT-01.00) Azores":												LmMsg.TZF_Azores,
	"(GMT-01.00) Cape Verde Is.":										LmMsg.TZF_CapeVerde,
	"(GMT) Casablanca / Monrovia":										LmMsg.TZF_Casablanca,
	"(GMT) Greenwich Mean Time - Dublin / Edinburgh / Lisbon / London":		LmMsg.TZF_GMT,
	"(GMT+01.00) Amsterdam / Berlin / Bern / Rome / Stockholm / Vienna":		LmMsg.TZF_Amsterdam,
	"(GMT+01.00) Belgrade / Bratislava / Budapest / Ljubljana / Prague":		LmMsg.TZF_Belgrade,
	"(GMT+01.00) Brussels / Copenhagen / Madrid / Paris":					LmMsg.TZF_Brussels,
	"(GMT+01.00) Sarajevo / Skopje / Warsaw / Zagreb":						LmMsg.TZF_Sarajevo,
	"(GMT+01.00) West Central Africa":									LmMsg.TZF_WestCentralAfrica,
	"(GMT+02.00) Athens / Beirut / Istanbul / Minsk":						LmMsg.TZF_Athens,
	"(GMT+02.00) Bucharest":												LmMsg.TZF_Budapest,
	"(GMT+02.00) Cairo":													LmMsg.TZF_Cairo,
	"(GMT+02.00) Harare / Pretoria":										LmMsg.TZF_Harare,
	"(GMT+02.00) Helsinki / Kyiv / Riga / Sofia / Tallinn / Vilnius":			LmMsg.TZF_Helsinki,
	"(GMT+02.00) Jerusalem":												LmMsg.TZF_Jerusalem,
	"(GMT+03.00) Baghdad":												LmMsg.TZF_Baghdad,
	"(GMT+03.00) Kuwait / Riyadh":										LmMsg.TZF_Kuwait,
	"(GMT+03.00) Moscow / St. Petersburg / Volgograd":						LmMsg.TZF_Moscow,
	"(GMT+03.00) Nairobi":												LmMsg.TZF_Nairobi,
	"(GMT+03.30) Tehran":												LmMsg.TZF_Tehran,
	"(GMT+04.00) Abu Dhabi / Muscat":										LmMsg.TZF_AbuDhabi,
	"(GMT+04.00) Baku / Tbilisi / Yerevan":								LmMsg.TZF_Baku,
	"(GMT+04.30) Kabul":													LmMsg.TZF_Kabul,
	"(GMT+05.00) Ekaterinburg":											LmMsg.TZF_Ekaterinburg,
	"(GMT+05.00) Islamabad / Karachi / Tashkent":							LmMsg.TZF_Islamabad,
	"(GMT+05.30) Chennai / Kolkata / Mumbai / New Delhi":					LmMsg.TZF_Chennai,
	"(GMT+05.45) Kathmandu":												LmMsg.TZF_Katmandu,
	"(GMT+06:00) Almaty / Novosibirsk":									LmMsg.TZF_Almaty,
	"(GMT+06.00) Astana / Dhaka":											LmMsg.TZF_Astanda,
	"(GMT+06.00) Sri Jayawardenepura":									LmMsg.TZF_SriJaywardenepura,
	"(GMT+06.30) Rangoon":												LmMsg.TZF_Rangoon,
	"(GMT+07.00) Bangkok / Hanoi / Jakarta":								LmMsg.TZF_Bangkok,
	"(GMT+07.00) Krasnoyarsk":											LmMsg.TZF_Krasnoyarsk,
	"(GMT+08.00) Beijing / Chongqing / Hong Kong / Urumqi":					LmMsg.TZF_Beijing,
	"(GMT+08.00) Irkutsk / Ulaan Bataar":									LmMsg.TZF_Irkutsk,
	"(GMT+08.00) Kuala Lumpur / Singapore":								LmMsg.TZF_KualaLumpur,
	"(GMT+08.00) Perth":													LmMsg.TZF_Perth,
	"(GMT+08.00) Taipei":												LmMsg.TZF_Taipei,
	"(GMT+09.00) Osaka / Sapporo / Tokyo":									LmMsg.TZF_Osaka,
	"(GMT+09.00) Seoul":													LmMsg.TZF_Seoul,
	"(GMT+09.00) Yakutsk":												LmMsg.TZF_Takutsk,
	"(GMT+09.30) Adelaide":												LmMsg.TZF_Adelaide,
	"(GMT+09.30) Darwin":												LmMsg.TZF_Darwin,
	"(GMT+10.00) Brisbane":												LmMsg.TZF_Brisbane,
	"(GMT+10.00) Canberra / Melbourne / Sydney":							LmMsg.TZF_Canberra,
	"(GMT+10.00) Guam / Port Moresby":									LmMsg.TZF_Guam,
	"(GMT+10.00) Hobart":												LmMsg.TZF_Hobart,
	"(GMT+10.00) Vladivostok":											LmMsg.TZF_Vladivostok,
	"(GMT+11.00) Magadan / Solomon Is. / New Calenodia":					LmMsg.TZF_Magadan,
	"(GMT+12.00) Auckland / Wellington":									LmMsg.TZF_Aukland,
	"(GMT+12.00) Fiji / Kamchatka / Marshall Is.":							LmMsg.TZF_Fiji,
	"(GMT+13.00) Nuku'alofa":											LmMsg.TZF_Nukualofa
};

LmTimezones._fullZoneChoices = [
	{value:"(GMT-12.00) International Date Line West",							label:LmMsg.TZF_internationalDateLineWest},
	{value:"(GMT-11.00) Midway Island / Samoa",									label:LmMsg.TZF_MidwayIsland},
	{value:"(GMT-10.00) Hawaii",												label:LmMsg.TZF_Hawaii},
	{value:"(GMT-09.00) Alaska",												label:LmMsg.TZF_Alaska},
	{value:"(GMT-08.00) Pacific Time (US & Canada) / Tijuana",					label:LmMsg.TZF_PacificTime},
	{value:"(GMT-07.00) Arizona",												label:LmMsg.TZF_Arizona},
	{value:"(GMT-07.00) Chihuahua / La Paz / Mazatlan",							label:LmMsg.TZF_Chihuahua},
	{value:"(GMT-07.00) Mountain Time (US & Canada)",							label:LmMsg.TZF_MountainTime},
	{value:"(GMT-06.00) Central America",										label:LmMsg.TZF_CentralAmerica},
	{value:"(GMT-06.00) Central Time (US & Canada)",							label:LmMsg.TZF_CentralTime},
	{value:"(GMT-06.00) Guadalajara / Mexico City / Monterrey",					label:LmMsg.TZF_Guadalajara},
	{value:"(GMT-06.00) Saskatchewan",											label:LmMsg.TZF_Saskatchewan},
	{value:"(GMT-05.00) Bogota / Lima / Quito",									label:LmMsg.TZF_Lima},
	{value:"(GMT-05.00) Eastern Time (US & Canada)",							label:LmMsg.TZF_Eastern},
	{value:"(GMT-05.00) Indiana (East)",										label:LmMsg.TZF_Indiana},
	{value:"(GMT-04.00) Atlantic Time (Canada)",								label:LmMsg.TZF_Atlantic},
	{value:"(GMT-04.00) Caracas / La Paz",										label:LmMsg.TZF_Caracas},
	{value:"(GMT-04.00) Santiago",												label:LmMsg.TZF_Santiago},
	{value:"(GMT-03.30) Newfoundland",											label:LmMsg.TZF_Newfoundland},
	{value:"(GMT-03.00) Brasilia",												label:LmMsg.TZF_Brasilia},
	{value:"(GMT-03.00) Buenos Aires / Georgetown",								label:LmMsg.TZF_BuenosAires},
	{value:"(GMT-03.00) Greenland",												label:LmMsg.TZF_Greenland},
	{value:"(GMT-02.00) Mid-Atlantic",											label:LmMsg.TZF_MidAtlanitc},
	{value:"(GMT-01.00) Azores",												label:LmMsg.TZF_Azores},
	{value:"(GMT-01.00) Cape Verde Is.",										label:LmMsg.TZF_CapeVerde},
	{value:"(GMT) Casablanca / Monrovia",										label:LmMsg.TZF_Casablanca},
	{value:"(GMT) Greenwich Mean Time - Dublin / Edinburgh / Lisbon / London",		label:LmMsg.TZF_GMT},
	{value:"(GMT+01.00) Amsterdam / Berlin / Bern / Rome / Stockholm / Vienna",		label:LmMsg.TZF_Amsterdam},
	{value:"(GMT+01.00) Belgrade / Bratislava / Budapest / Ljubljana / Prague",		label:LmMsg.TZF_Belgrade},
	{value:"(GMT+01.00) Brussels / Copenhagen / Madrid / Paris",					label:LmMsg.TZF_Brussels},
	{value:"(GMT+01.00) Sarajevo / Skopje / Warsaw / Zagreb",						label:LmMsg.TZF_Sarajevo},
	{value:"(GMT+01.00) West Central Africa",									label:LmMsg.TZF_WestCentralAfrica},
	{value:"(GMT+02.00) Athens / Beirut / Istanbul / Minsk",						label:LmMsg.TZF_Athens},
	{value:"(GMT+02.00) Bucharest",												label:LmMsg.TZF_Budapest},
	{value:"(GMT+02.00) Cairo",													label:LmMsg.TZF_Cairo},
	{value:"(GMT+02.00) Harare / Pretoria",										label:LmMsg.TZF_Harare},
	{value:"(GMT+02.00) Helsinki / Kyiv / Riga / Sofia / Tallinn / Vilnius",			label:LmMsg.TZF_Helsinki},
	{value:"(GMT+02.00) Jerusalem",												label:LmMsg.TZF_Jerusalem},
	{value:"(GMT+03.00) Baghdad",												label:LmMsg.TZF_Baghdad},
	{value:"(GMT+03.00) Kuwait / Riyadh",										label:LmMsg.TZF_Kuwait},
	{value:"(GMT+03.00) Moscow / St. Petersburg / Volgograd",						label:LmMsg.TZF_Moscow},
	{value:"(GMT+03.00) Nairobi",												label:LmMsg.TZF_Nairobi},
	{value:"(GMT+03.30) Tehran",												label:LmMsg.TZF_Tehran},
	{value:"(GMT+04.00) Abu Dhabi / Muscat",										label:LmMsg.TZF_AbuDhabi},
	{value:"(GMT+04.00) Baku / Tbilisi / Yerevan",								label:LmMsg.TZF_Baku},
	{value:"(GMT+04.30) Kabul",													label:LmMsg.TZF_Kabul},
	{value:"(GMT+05.00) Ekaterinburg",											label:LmMsg.TZF_Ekaterinburg},
	{value:"(GMT+05.00) Islamabad / Karachi / Tashkent",							label:LmMsg.TZF_Islamabad},
	{value:"(GMT+05.30) Chennai / Kolkata / Mumbai / New Delhi",					label:LmMsg.TZF_Chennai},
	{value:"(GMT+05.45) Kathmandu",												label:LmMsg.TZF_Katmandu},
	{value:"(GMT+06:00) Almaty / Novosibirsk",									label:LmMsg.TZF_Almaty},
	{value:"(GMT+06.00) Astana / Dhaka",											label:LmMsg.TZF_Astanda},
	{value:"(GMT+06.00) Sri Jayawardenepura",									label:LmMsg.TZF_SriJaywardenepura},
	{value:"(GMT+06.30) Rangoon",												label:LmMsg.TZF_Rangoon},
	{value:"(GMT+07.00) Bangkok / Hanoi / Jakarta",								label:LmMsg.TZF_Bangkok},
	{value:"(GMT+07.00) Krasnoyarsk",											label:LmMsg.TZF_Krasnoyarsk},
	{value:"(GMT+08.00) Beijing / Chongqing / Hong Kong / Urumqi",					label:LmMsg.TZF_Beijing},
	{value:"(GMT+08.00) Irkutsk / Ulaan Bataar",									label:LmMsg.TZF_Irkutsk},
	{value:"(GMT+08.00) Kuala Lumpur / Singapore",								label:LmMsg.TZF_KualaLumpur},
	{value:"(GMT+08.00) Perth",													label:LmMsg.TZF_Perth},
	{value:"(GMT+08.00) Taipei",												label:LmMsg.TZF_Taipei},
	{value:"(GMT+09.00) Osaka / Sapporo / Tokyo",									label:LmMsg.TZF_Osaka},
	{value:"(GMT+09.00) Seoul",													label:LmMsg.TZF_Seoul},
	{value:"(GMT+09.00) Yakutsk",												label:LmMsg.TZF_Takutsk},
	{value:"(GMT+09.30) Adelaide",												label:LmMsg.TZF_Adelaide},
	{value:"(GMT+09.30) Darwin",												label:LmMsg.TZF_Darwin},
	{value:"(GMT+10.00) Brisbane",												label:LmMsg.TZF_Brisbane},
	{value:"(GMT+10.00) Canberra / Melbourne / Sydney",							label:LmMsg.TZF_Canberra},
	{value:"(GMT+10.00) Guam / Port Moresby",									label:LmMsg.TZF_Guam},
	{value:"(GMT+10.00) Hobart",												label:LmMsg.TZF_Hobart},
	{value:"(GMT+10.00) Vladivostok",											label:LmMsg.TZF_Vladivostok},
	{value:"(GMT+11.00) Magadan / Solomon Is. / New Calenodia",					label:LmMsg.TZF_Magadan},
	{value:"(GMT+12.00) Auckland / Wellington",									label:LmMsg.TZF_Aukland},
	{value:"(GMT+12.00) Fiji / Kamchatka / Marshall Is.",							label:LmMsg.TZF_Fiji},
	{value:"(GMT+13.00) Nuku'alofa",											label:LmMsg.TZF_Nukualofa}
];

LmTimezones._fullZoneChoices = [
	{value:"(GMT-12.00) International Date Line West",							label:LmMsg.TZF_internationalDateLineWest},
	{value:"(GMT-11.00) Midway Island / Samoa",									label:LmMsg.TZF_MidwayIsland},
	{value:"(GMT-10.00) Hawaii",												label:LmMsg.TZF_Hawaii},
	{value:"(GMT-09.00) Alaska",												label:LmMsg.TZF_Alaska},
	{value:"(GMT-08.00) Pacific Time (US & Canada) / Tijuana",					label:LmMsg.TZF_PacificTime},
	{value:"(GMT-07.00) Arizona",												label:LmMsg.TZF_Arizona},
	{value:"(GMT-07.00) Chihuahua / La Paz / Mazatlan",							label:LmMsg.TZF_Chihuahua},
	{value:"(GMT-07.00) Mountain Time (US & Canada)",							label:LmMsg.TZF_MountainTime},
	{value:"(GMT-06.00) Central America",										label:LmMsg.TZF_CentralAmerica},
	{value:"(GMT-06.00) Central Time (US & Canada)",							label:LmMsg.TZF_CentralTime},
	{value:"(GMT-06.00) Guadalajara / Mexico City / Monterrey",					label:LmMsg.TZF_Guadalajara},
	{value:"(GMT-06.00) Saskatchewan",											label:LmMsg.TZF_Saskatchewan},
	{value:"(GMT-05.00) Bogota / Lima / Quito",									label:LmMsg.TZF_Lima},
	{value:"(GMT-05.00) Eastern Time (US & Canada)",							label:LmMsg.TZF_Eastern},
	{value:"(GMT-05.00) Indiana (East)",										label:LmMsg.TZF_Indiana},
	{value:"(GMT-04.00) Atlantic Time (Canada)",								label:LmMsg.TZF_Atlantic},
	{value:"(GMT-04.00) Caracas / La Paz",										label:LmMsg.TZF_Caracas},
	{value:"(GMT-04.00) Santiago",												label:LmMsg.TZF_Santiago},
	{value:"(GMT-03.30) Newfoundland",											label:LmMsg.TZF_Newfoundland},
	{value:"(GMT-03.00) Brasilia",												label:LmMsg.TZF_Brasilia},
	{value:"(GMT-03.00) Buenos Aires / Georgetown",								label:LmMsg.TZF_BuenosAires},
	{value:"(GMT-03.00) Greenland",												label:LmMsg.TZF_Greenland},
	{value:"(GMT-02.00) Mid-Atlantic",											label:LmMsg.TZF_MidAtlanitc},
	{value:"(GMT-01.00) Azores",												label:LmMsg.TZF_Azores},
	{value:"(GMT-01.00) Cape Verde Is.",										label:LmMsg.TZF_CapeVerde},
	{value:"(GMT) Casablanca / Monrovia",										label:LmMsg.TZF_Casablanca},
	{value:"(GMT) Greenwich Mean Time - Dublin / Edinburgh / Lisbon / London",		label:LmMsg.TZF_GMT},
	{value:"(GMT+01.00) Amsterdam / Berlin / Bern / Rome / Stockholm / Vienna",		label:LmMsg.TZF_Amsterdam},
	{value:"(GMT+01.00) Belgrade / Bratislava / Budapest / Ljubljana / Prague",		label:LmMsg.TZF_Belgrade},
	{value:"(GMT+01.00) Brussels / Copenhagen / Madrid / Paris",					label:LmMsg.TZF_Brussels},
	{value:"(GMT+01.00) Sarajevo / Skopje / Warsaw / Zagreb",						label:LmMsg.TZF_Sarajevo},
	{value:"(GMT+01.00) West Central Africa",									label:LmMsg.TZF_WestCentralAfrica},
	{value:"(GMT+02.00) Athens / Beirut / Istanbul / Minsk",						label:LmMsg.TZF_Athens},
	{value:"(GMT+02.00) Bucharest",												label:LmMsg.TZF_Budapest},
	{value:"(GMT+02.00) Cairo",													label:LmMsg.TZF_Cairo},
	{value:"(GMT+02.00) Harare / Pretoria",										label:LmMsg.TZF_Harare},
	{value:"(GMT+02.00) Helsinki / Kyiv / Riga / Sofia / Tallinn / Vilnius",			label:LmMsg.TZF_Helsinki},
	{value:"(GMT+02.00) Jerusalem",												label:LmMsg.TZF_Jerusalem},
	{value:"(GMT+03.00) Baghdad",												label:LmMsg.TZF_Baghdad},
	{value:"(GMT+03.00) Kuwait / Riyadh",										label:LmMsg.TZF_Kuwait},
	{value:"(GMT+03.00) Moscow / St. Petersburg / Volgograd",						label:LmMsg.TZF_Moscow},
	{value:"(GMT+03.00) Nairobi",												label:LmMsg.TZF_Nairobi},
	{value:"(GMT+03.30) Tehran",												label:LmMsg.TZF_Tehran},
	{value:"(GMT+04.00) Abu Dhabi / Muscat",										label:LmMsg.TZF_AbuDhabi},
	{value:"(GMT+04.00) Baku / Tbilisi / Yerevan",								label:LmMsg.TZF_Baku},
	{value:"(GMT+04.30) Kabul",													label:LmMsg.TZF_Kabul},
	{value:"(GMT+05.00) Ekaterinburg",											label:LmMsg.TZF_Ekaterinburg},
	{value:"(GMT+05.00) Islamabad / Karachi / Tashkent",							label:LmMsg.TZF_Islamabad},
	{value:"(GMT+05.30) Chennai / Kolkata / Mumbai / New Delhi",					label:LmMsg.TZF_Chennai},
	{value:"(GMT+05.45) Kathmandu",												label:LmMsg.TZF_Katmandu},
	{value:"(GMT+06:00) Almaty / Novosibirsk",									label:LmMsg.TZF_Almaty},
	{value:"(GMT+06.00) Astana / Dhaka",											label:LmMsg.TZF_Astanda},
	{value:"(GMT+06.00) Sri Jayawardenepura",									label:LmMsg.TZF_SriJaywardenepura},
	{value:"(GMT+06.30) Rangoon",												label:LmMsg.TZF_Rangoon},
	{value:"(GMT+07.00) Bangkok / Hanoi / Jakarta",								label:LmMsg.TZF_Bangkok},
	{value:"(GMT+07.00) Krasnoyarsk",											label:LmMsg.TZF_Krasnoyarsk},
	{value:"(GMT+08.00) Beijing / Chongqing / Hong Kong / Urumqi",					label:LmMsg.TZF_Beijing},
	{value:"(GMT+08.00) Irkutsk / Ulaan Bataar",									label:LmMsg.TZF_Irkutsk},
	{value:"(GMT+08.00) Kuala Lumpur / Singapore",								label:LmMsg.TZF_KualaLumpur},
	{value:"(GMT+08.00) Perth",													label:LmMsg.TZF_Perth},
	{value:"(GMT+08.00) Taipei",												label:LmMsg.TZF_Taipei},
	{value:"(GMT+09.00) Osaka / Sapporo / Tokyo",									label:LmMsg.TZF_Osaka},
	{value:"(GMT+09.00) Seoul",													label:LmMsg.TZF_Seoul},
	{value:"(GMT+09.00) Yakutsk",												label:LmMsg.TZF_Takutsk},
	{value:"(GMT+09.30) Adelaide",												label:LmMsg.TZF_Adelaide},
	{value:"(GMT+09.30) Darwin",												label:LmMsg.TZF_Darwin},
	{value:"(GMT+10.00) Brisbane",												label:LmMsg.TZF_Brisbane},
	{value:"(GMT+10.00) Canberra / Melbourne / Sydney",							label:LmMsg.TZF_Canberra},
	{value:"(GMT+10.00) Guam / Port Moresby",									label:LmMsg.TZF_Guam},
	{value:"(GMT+10.00) Hobart",												label:LmMsg.TZF_Hobart},
	{value:"(GMT+10.00) Vladivostok",											label:LmMsg.TZF_Vladivostok},
	{value:"(GMT+11.00) Magadan / Solomon Is. / New Calenodia",					label:LmMsg.TZF_Magadan},
	{value:"(GMT+12.00) Auckland / Wellington",									label:LmMsg.TZF_Aukland},
	{value:"(GMT+12.00) Fiji / Kamchatka / Marshall Is.",							label:LmMsg.TZF_Fiji},
	{value:"(GMT+13.00) Nuku'alofa",											label:LmMsg.TZF_Nukualofa}
];

LmTimezones._abbreviatedZoneChoices = [
	{value:"(GMT-12.00) International Date Line West",							label:LmMsg.TZA_internationalDateLineWest},
	{value:"(GMT-11.00) Midway Island / Samoa",									label:LmMsg.TZA_MidwayIsland},
	{value:"(GMT-10.00) Hawaii",												label:LmMsg.TZA_Hawaii},
	{value:"(GMT-09.00) Alaska",												label:LmMsg.TZA_Alaska},
	{value:"(GMT-08.00) Pacific Time (US & Canada) / Tijuana",					label:LmMsg.TZA_PacificTime},
	{value:"(GMT-07.00) Arizona",												label:LmMsg.TZA_Arizona},
	{value:"(GMT-07.00) Chihuahua / La Paz / Mazatlan",							label:LmMsg.TZA_Chihuahua},
	{value:"(GMT-07.00) Mountain Time (US & Canada)",							label:LmMsg.TZA_MountainTime},
	{value:"(GMT-06.00) Central America",										label:LmMsg.TZA_CentralAmerica},
	{value:"(GMT-06.00) Central Time (US & Canada)",							label:LmMsg.TZA_CentralTime},
	{value:"(GMT-06.00) Guadalajara / Mexico City / Monterrey",					label:LmMsg.TZA_Guadalajara},
	{value:"(GMT-06.00) Saskatchewan",											label:LmMsg.TZA_Saskatchewan},
	{value:"(GMT-05.00) Bogota / Lima / Quito",									label:LmMsg.TZA_Lima},
	{value:"(GMT-05.00) Eastern Time (US & Canada)",							label:LmMsg.TZA_Eastern},
	{value:"(GMT-05.00) Indiana (East)",										label:LmMsg.TZA_Indiana},
	{value:"(GMT-04.00) Atlantic Time (Canada)",								label:LmMsg.TZA_Atlantic},
	{value:"(GMT-04.00) Caracas / La Paz",										label:LmMsg.TZA_Caracas},
	{value:"(GMT-04.00) Santiago",												label:LmMsg.TZA_Santiago},
	{value:"(GMT-03.30) Newfoundland",											label:LmMsg.TZA_Newfoundland},
	{value:"(GMT-03.00) Brasilia",												label:LmMsg.TZA_Brasilia},
	{value:"(GMT-03.00) Buenos Aires / Georgetown",								label:LmMsg.TZA_BuenosAires},
	{value:"(GMT-03.00) Greenland",												label:LmMsg.TZA_Greenland},
	{value:"(GMT-02.00) Mid-Atlantic",											label:LmMsg.TZA_MidAtlanitc},
	{value:"(GMT-01.00) Azores",												label:LmMsg.TZA_Azores},
	{value:"(GMT-01.00) Cape Verde Is.",										label:LmMsg.TZA_CapeVerde},
	{value:"(GMT) Casablanca / Monrovia",										label:LmMsg.TZA_Casablanca},
	{value:"(GMT) Greenwich Mean Time - Dublin / Edinburgh / Lisbon / London",		label:LmMsg.TZA_GMT},
	{value:"(GMT+01.00) Amsterdam / Berlin / Bern / Rome / Stockholm / Vienna",		label:LmMsg.TZA_Amsterdam},
	{value:"(GMT+01.00) Belgrade / Bratislava / Budapest / Ljubljana / Prague",		label:LmMsg.TZA_Belgrade},
	{value:"(GMT+01.00) Brussels / Copenhagen / Madrid / Paris",					label:LmMsg.TZA_Brussels},
	{value:"(GMT+01.00) Sarajevo / Skopje / Warsaw / Zagreb",						label:LmMsg.TZA_Sarajevo},
	{value:"(GMT+01.00) West Central Africa",									label:LmMsg.TZA_WestCentralAfrica},
	{value:"(GMT+02.00) Athens / Beirut / Istanbul / Minsk",						label:LmMsg.TZA_Athens},
	{value:"(GMT+02.00) Bucharest",												label:LmMsg.TZA_Budapest},
	{value:"(GMT+02.00) Cairo",													label:LmMsg.TZA_Cairo},
	{value:"(GMT+02.00) Harare / Pretoria",										label:LmMsg.TZA_Harare},
	{value:"(GMT+02.00) Helsinki / Kyiv / Riga / Sofia / Tallinn / Vilnius",			label:LmMsg.TZA_Helsinki},
	{value:"(GMT+02.00) Jerusalem",												label:LmMsg.TZA_Jerusalem},
	{value:"(GMT+03.00) Baghdad",												label:LmMsg.TZA_Baghdad},
	{value:"(GMT+03.00) Kuwait / Riyadh",										label:LmMsg.TZA_Kuwait},
	{value:"(GMT+03.00) Moscow / St. Petersburg / Volgograd",						label:LmMsg.TZA_Moscow},
	{value:"(GMT+03.00) Nairobi",												label:LmMsg.TZA_Nairobi},
	{value:"(GMT+03.30) Tehran",												label:LmMsg.TZA_Tehran},
	{value:"(GMT+04.00) Abu Dhabi / Muscat",										label:LmMsg.TZA_AbuDhabi},
	{value:"(GMT+04.00) Baku / Tbilisi / Yerevan",								label:LmMsg.TZA_Baku},
	{value:"(GMT+04.30) Kabul",													label:LmMsg.TZA_Kabul},
	{value:"(GMT+05.00) Ekaterinburg",											label:LmMsg.TZA_Ekaterinburg},
	{value:"(GMT+05.00) Islamabad / Karachi / Tashkent",							label:LmMsg.TZA_Islamabad},
	{value:"(GMT+05.30) Chennai / Kolkata / Mumbai / New Delhi",					label:LmMsg.TZA_Chennai},
	{value:"(GMT+05.45) Kathmandu",												label:LmMsg.TZA_Katmandu},
	{value:"(GMT+06.00) Almaty / Novosibirsk",									label:LmMsg.TZA_Almaty},
	{value:"(GMT+06.00) Astana / Dhaka",											label:LmMsg.TZA_Astanda},
	{value:"(GMT+06.00) Sri Jayawardenepura",									label:LmMsg.TZA_SriJaywardenepura},
	{value:"(GMT+06.30) Rangoon",												label:LmMsg.TZA_Rangoon},
	{value:"(GMT+07.00) Bangkok / Hanoi / Jakarta",								label:LmMsg.TZA_Bangkok},
	{value:"(GMT+07.00) Krasnoyarsk",											label:LmMsg.TZA_Krasnoyarsk},
	{value:"(GMT+08.00) Beijing / Chongqing / Hong Kong / Urumqi",					label:LmMsg.TZA_Beijing},
	{value:"(GMT+08.00) Irkutsk / Ulaan Bataar",									label:LmMsg.TZA_Irkutsk},
	{value:"(GMT+08.00) Kuala Lumpur / Singapore",								label:LmMsg.TZA_KualaLumpur},
	{value:"(GMT+08.00) Perth",													label:LmMsg.TZA_Perth},
	{value:"(GMT+08.00) Taipei",												label:LmMsg.TZA_Taipei},
	{value:"(GMT+09.00) Osaka / Sapporo / Tokyo",									label:LmMsg.TZA_Osaka},
	{value:"(GMT+09.00) Seoul",													label:LmMsg.TZA_Seoul},
	{value:"(GMT+09.00) Yakutsk",												label:LmMsg.TZA_Takutsk},
	{value:"(GMT+09.30) Adelaide",												label:LmMsg.TZA_Adelaide},
	{value:"(GMT+09.30) Darwin",												label:LmMsg.TZA_Darwin},
	{value:"(GMT+10.00) Brisbane",												label:LmMsg.TZA_Brisbane},
	{value:"(GMT+10.00) Canberra / Melbourne / Sydney",							label:LmMsg.TZA_Canberra},
	{value:"(GMT+10.00) Guam / Port Moresby",									label:LmMsg.TZA_Guam},
	{value:"(GMT+10.00) Hobart",												label:LmMsg.TZA_Hobart},
	{value:"(GMT+10.00) Vladivostok",											label:LmMsg.TZA_Vladivostok},
	{value:"(GMT+11.00) Magadan / Solomon Is. / New Calenodia",					label:LmMsg.TZA_Magadan},
	{value:"(GMT+12.00) Auckland / Wellington",									label:LmMsg.TZA_Aukland},
	{value:"(GMT+12.00) Fiji / Kamchatka / Marshall Is.",							label:LmMsg.TZA_Fiji},
	{value:"(GMT+13.00) Nuku'alofa",											label:LmMsg.TZA_Nukualofa}
];

LmTimezones.ruleLists = {
	 noDSTList: [
	  { name:"(GMT-12.00) International Date Line West", stdOffset: -720, hasDOffset: false },
	  { name:"(GMT-11.00) Midway Island / Samoa", stdOffset: -660,hasDOffset: false },
	  { name:"(GMT-10.00) Hawaii", stdOffset: -600, hasDOffset: false },
	  { name:"(GMT-07.00) Arizona", stdOffset: -420, hasDOffset: false },
	  { name:"(GMT-06.00) Central America", stdOffset: -360, hasDOffset:false },
	  { name:"(GMT-06.00) Saskatchewan", stdOffset: -360, hasDOffset:false },
	  { name:"(GMT-05.00) Indiana (East)", stdOffset: -300, hasDOffset:false},
	  { name:"(GMT-04.00) Atlantic Time (Canada)", stdOffset: -300, hasDOffset: false },
	  { name:"(GMT-05.00) Bogota / Lima / Quito", stdOffset: -300, hasDOffset: false },
	  { name:"(GMT-04.00) Caracas / La Paz", stdOffset: -240, hasDOffset: false },
	  { name:"(GMT-03.00) Buenos Aires / Georgetown", stdOffset: -180, hasDOffset: false },
	  { name:"(GMT-01.00) Cape Verde Is.", stdOffset: -60, hasDOffset:false },
	  { name:"(GMT) Casablanca / Monrovia",stdOffset: 0, hasDOffset:false },
	  { name:"(GMT+01.00) West Central Africa",stdOffset: 60, hasDOffset:false},
	  { name:"(GMT+02.00) Harare / Pretoria", stdOffset: 120, hasDOffset:false},
	  { name:"(GMT+02.00) Jerusalem", stdOffset: 120, hasDOffset: false },
	  { name:"(GMT+03.00) Kuwait / Riyadh", stdOffset: 180, hasDOffset:false },
	  { name:"(GMT+03.00) Nairobi", stdOffset: 180, hasDOffset:false},
	  { name:"(GMT+04.00) Abu Dhabi / Muscat", stdOffset: 240, hasDOffset:false },
	  { name:"(GMT+04.30) Kabul", stdOffset: 270, hasDOffset: false },
	  { name:"(GMT+05.00) Islamabad / Karachi / Tashkent",stdOffset: 300, hasDOffset:false },
	  { name:"(GMT+05.30) Chennai / Kolkata / Mumbai / New Delhi", stdOffset: 330, hasDOffset: false },
	  { name:"(GMT+05.45) Kathmandu", stdOffset: 345, hasDOffset:false },
	  { name:"(GMT+06.00) Astana / Dhaka", stdOffset: 360, hasDOffset: false },
	  { name:"(GMT+06.00) Sri Jayawardenepura", stdOffset: 360, hasDOffset: false },
	  { name:"(GMT+06.30) Rangoon", stdOffset: 390, hasDOffset: false },
	  { name:"(GMT+07.00) Bangkok / Hanoi / Jakarta", stdOffset: 420, hasDOffset: false },
	  { name:"(GMT+08.00) Kuala Lumpur / Singapore", stdOffset: 480, hasDOffset: false },
	  { name:"(GMT+08.00) Perth", stdOffset: 480, hasDOffset: false },
	  { name:"(GMT+08.00) Taipei", stdOffset: 480, hasDOffset: false },
	  { name:"(GMT+08.00) Beijing / Chongqing / Hong Kong / Urumqi", stdOffset: 480, hasDOffset: false },
	  { name:"(GMT+09.00) Osaka / Sapporo / Tokyo", stdOffset: +540, hasDOffset: false },
	  { name:"(GMT+09.00) Seoul", stdOffset: 540, hasDOffset: false },
	  { name:"(GMT+09.30) Darwin", stdOffset: 570, hasDOffset: false },
	  { name:"(GMT+10.00) Brisbane", stdOffset: 600, hasDOffset: false },
	  { name:"(GMT+10.00) Guam / Port Moresby", stdOffset: 600, hasDOffset: false },
	  { name:"(GMT+11.00) Magadan / Solomon Is. / New Calenodia", stdOffset: 660, hasDOffset: false },
	  { name:"(GMT+12.00) Fiji / Kamchatka / Marshall Is.", stdOffset: 720, hasDOffset: false },
	  { name:"(GMT+13.00) Nuku'alofa", stdOffset: 780, hasDOffset: false },
	  ]
	 ,
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
	   stdOffset: -240, changeStd: [2005, 2, 12],
	   dstOffset: -180, changeD: [2005, 9, 8] },
	 { name:"(GMT-03.30) Newfoundland", 
	   stdOffset: -210, changeStd: [2005, 9, 30],
	   dstOffset: -150, changeD: [2005, 3, 3] },
	 { name:"(GMT-03.00) Brasilia", 
	   stdOffset: -180, changeStd: [2005, 1, 13],
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
LmTimezones.guessMachineTimezone = function () {
	var dec1 = new Date(2005, 12, 1, 0, 0, 0);
	var jun1 = new Date(2005, 6, 1, 0, 0, 0);
	var dec1offset = dec1.getTimezoneOffset();
	var jun1offset = jun1.getTimezoneOffset();
	var pos = ((dec1.getHours() - dec1.getUTCHours()) > 0)? true: false;
	if (!pos) {
		dec1offset = dec1offset * -1;
		jun1offset = jun1offset * -1;
	}
	var tz = null;
	// if the offset for jun is the same as the offset in december,
	// then we have a timezone that doesn't deal with daylight savings.
	if (jun1offset == dec1offset) {
		var list = LmTimezones.ruleLists.noDSTList;
 		for (var i = 0; i < list.length ; ++i ){
			if (list[i].stdOffset == jun1offset) {
				tz = list[i];
				break;
			}
		}
	} else {
		// we need to find a rule that matches both offsets
		var list = LmTimezones.ruleLists.DSTList;
		var dst = Math.max(dec1offset, jun1offset);
		var std = Math.min(dec1offset, jun1offset);
		var rule;
 		for (var i = 0; i < list.length ; ++i ){
			rule = list[i];
			if (rule.stdOffset == std && rule.dstOffset == dst) {
				if (LmTimezones._compareRules(rule, std, dst, pos)) {
					tz = rule;
					break;
				}
			}
		}
	}
	return tz.name;
};

LmTimezones._compareRules = function (rule, std, dst, pos) {
	var equal = false;
	var d = new Date(rule.changeStd[0], rule.changeStd[1], (rule.changeStd[2] -1)).getTimezoneOffset();
	var s = new Date(rule.changeStd[0], rule.changeStd[1], (rule.changeStd[2] + 1)).getTimezoneOffset();
	if (!pos){
		s = s * -1;
		d = d * -1;
	}
	//alert("name = " + rule.name + ' s = ' + s + " d = " + d + " std = " + std + " dst = " + dst);
	if ( (std == s) && (dst == d) ){
		s = new Date(rule.changeD[0], rule.changeD[1], (rule.changeD[2] -1)).getTimezoneOffset();
		d = new Date(rule.changeD[0], rule.changeD[1], (rule.changeD[2] + 1)).getTimezoneOffset();
		if (!pos){
			s = s * -1;
			d = d * -1;
		}
		//alert("name = " + rule.name + ' s = ' + s + " d = " + d + " std = " + std + " dst = " + dst);
		if ( (std == s) && (dst == d) ) {
			equal = true;
		}
	}
	return equal;
};

LmTimezones.getFullZoneChoices = function () {
	return LmTimezones._fullZoneChoices;
};

LmTimezones.getAbbreviatedZoneChoices = function () {
	return LmTimezones._abbreviatedZoneChoices;
};


LmTimezones.getDefault = function () {
	// should get the user default, set via the options page.
	var appCtxt = LmAppCtxt.getFromShell(DwtShell.getShell(window));
	if (appCtxt != null) {
		return appCtxt.get(LmSetting.DEFAULT_CALENDAR_TIMEZONE);
	}
	return null;
};

LmTimezones.setDefault = function () {
	// set the default timezone
};

LmTimezones.initializeServerTimezone = function () {
	var machineTz = LmTimezones.guessMachineTimezone();
	var currentDefault = LmTimezones.getDefault();
	if (machineTz != currentDefault) {
		var appCtxt = LmAppCtxt.getFromShell(DwtShell.getShell(window));
		if (appCtxt != null) {
			var settings = appCtxt.getSettings(); 
			var setting = settings.getSetting(LmSetting.DEFAULT_CALENDAR_TIMEZONE);
			if (setting){
				setting.setValue(machineTz);
				settings.save([setting]);
			}
		}
	}
};
