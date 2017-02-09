/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

UT.module("SearchHighlighterZimlet");

UtSearchZimlet = function() {};
UtSearchZimlet._searchHighlighterZimlet = new SearchHighlighterZimlet();

UtSearchZimlet._performTest = function (queryExpArr, expectedRegexLength, lineArr, resultArr) {
	var base,ret;
	for (var i = 0; i < queryExpArr.length; i++) {
		UtSearchZimlet._searchHighlighterZimlet._searchController.currentSearch.query = queryExpArr[i].query;
		UtSearchZimlet._searchHighlighterZimlet._setRegExps();	
		if (expectedRegexLength==0 || (UtSearchZimlet._searchHighlighterZimlet._regexps.length == 0)) {
			UT.equal(UtSearchZimlet._searchHighlighterZimlet._regexps.length, expectedRegexLength, 
					"For query='" + queryExpArr[i].query + "' length of _regexps array should be " + expectedRegexLength);
		}
		else {
			UT.equal(UtSearchZimlet._searchHighlighterZimlet._regexps.length, expectedRegexLength, 
					"For query='" + queryExpArr[i].query + "' length of _regexps array should be " + expectedRegexLength);
			UT.equal(UtSearchZimlet._searchHighlighterZimlet._regexps[0].toString(), queryExpArr[i].regexp, 
					"For query='" + queryExpArr[i].query + "' check the generated regular expression");
			base = (lineArr.length * i);
			for (var j = 0; j < lineArr.length; j++) {
				ret = UtSearchZimlet._searchHighlighterZimlet.match(lineArr[j], 0);
				UT.equal(ret != null, resultArr[base + j], "For query='" + queryExpArr[i].query + "' match result for line='" + lineArr[j] + "'");	
			}
		}
	}
};

UtSearchZimlet.test = function() {
	
	//17queries
	var queryExpArr = [
					 {query:"2015", regexp: "/\\b(2015)\\b/gi"}, 
					 {query:"*2015", regexp: "/\\b(2015)\\b/gi"}, 
					 {query:"+2015", regexp: "/\\b(2015)\\b/gi"}, 
					 {query:"?2015", regexp: "/\\b(2015)\\b/gi"}, 
					 {query:"2015*", regexp: "/\\b(2015\\S*)\\b/gi"}, 
					 {query:"2015+", regexp: "/\\b(2015)\\b/gi"}, 
					 {query:"2015?", regexp: "/\\b(2015)\\b/gi"},
					 {query:"20*15", regexp: "/\\b(20\\*15)\\b/gi"}, 
					 {query:"20+15", regexp: "/\\b(20\\+15)\\b/gi"},  
					 {query:"20?15", regexp: "/\\b(20\\?15)\\b/gi"}, 
					 {query:"**??+2015", regexp: "/\\b(2015)\\b/gi"}, 
					 {query:"2015**", regexp: "/\\b(2015\\S*)\\b/gi"}, 
					 {query:"2015?*", regexp: "/\\b(2015\\S*)\\b/gi"}, 
					 {query:"2015+*", regexp: "/\\b(2015\\S*)\\b/gi"},
					 {query:"2015*?", regexp: "/\\b(2015)\\b/gi"}, 
					 {query:"2015+?", regexp: "/\\b(2015)\\b/gi"}, 
					 {query:"2015*+", regexp: "/\\b(2015)\\b/gi"}
				   ];
	
	//13lines
	var lineArr = [
					"2015", "*2015", "2015*", "20*15", "+2015", "2015+", "20+15", 
                    "?2015", "2015?", "20?15", "abc2015", "2015abc", "abc2015xyz"
				  ];
	
	//Every query will match with every corresponding line so (17x13 results)
	var resultArr = [
			         //=========query 1= "2015"================
					   true, true, true, false, true, true, false, true, true, false, false ,false, false,
					 //=========query 2= "*2015"================
					   true, true, true, false, true, true, false, true, true, false, false ,false, false,
					 //=========query 3= "+2015"================
					   true, true, true, false, true, true, false, true, true, false, false ,false, false,
					 //=========query 4= "?2015"================
					   true, true, true, false, true, true, false, true, true, false, false ,false, false,
					 //=========query 5= "2015*"================
					   true, true, true, false, true, true, false, true, true, false, false ,true, false,
					 //=========query 6= "2015+"================
					   true, true, true, false, true, true, false, true, true, false, false ,false, false,
					 //=========query 7= "2015?"================
					   true, true, true, false, true, true, false, true, true, false, false ,false, false,
					 //=========query 8= "20*15"================
					   false, false, false, true, false, false, false, false, false, false, false ,false, false,
					 //=========query 9= "20+15"================
					   false, false, false, false, false, false, true, false, false, false, false ,false, false,
					 //=========query 10= "20?15"================
					   false, false, false, false, false, false, false, false, false, true, false ,false, false,
					 //=========query 11= "**??+2015"================
					   true, true, true, false, true, true, false, true, true, false, false ,false, false,
					 //=========query 12= "2015**"================
					   true, true, true, false, true, true, false, true, true, false, false ,true, false,
					 //=========query 13= "2015?*"================
					   true, true, true, false, true, true, false, true, true, false, false ,true, false,
					 //=========query 14= "2015+*"================
					   true, true, true, false, true, true, false, true, true, false, false ,true, false,
					 //=========query 15= "2015*?"================
					   true, true, true, false, true, true, false, true, true, false, false ,false, false,
					 //=========query 16= "2015+?"================
					   true, true, true, false, true, true, false, true, true, false, false ,false, false,
					 //=========query 17= "2015*+"================
					   true, true, true, false, true, true, false, true, true, false, false ,false, false
					];
	
	UtSearchZimlet._searchHighlighterZimlet._searchController = appCtxt.getSearchController();
	UtSearchZimlet._performTest(queryExpArr, 1, lineArr, resultArr);
	
	//Query=bigger:2
	UtSearchZimlet._performTest([{query:"bigger:2", regexp: ""}], 0);
	
	//Query="not health"
	UtSearchZimlet._performTest([{query:"not health", regexp: ""}], 0);
	
	//Query="not in:inbox health"
	UtSearchZimlet._performTest([{query:"not in:inbox health", regexp: "/\\b(health)\\b/gi"}], 1, ["health"], [true]);
	
	//Test For exact word search.
	var ret = null;
	var query ="happy";
	var line ="hap happ happying abchappy Happy";
	UtSearchZimlet._searchHighlighterZimlet._searchController.currentSearch.query = query;
	ret = UtSearchZimlet._searchHighlighterZimlet.match(line, 0);
	UT.equal(UtSearchZimlet._searchHighlighterZimlet._regexps[0].toString(), "/\\b(happy)\\b/gi", 
			"For query='" + query + "' check the generated regular expression");
	UT.equal(ret.index, 27, "For query='" + query + "' check match index for line='" + line + "'");	
	
	//Test for multiple words: To show all the keywords in the search query are independently searched. 
	query ="happy republic";
	line ="happy testing abc republic";
	UtSearchZimlet._searchHighlighterZimlet._searchController.currentSearch.query = query;
	ret = UtSearchZimlet._searchHighlighterZimlet.match(line, 0);
	UT.equal(UtSearchZimlet._searchHighlighterZimlet._regexps[0].toString(), "/\\b(happy|republic)\\b/gi", 
			"For query='" + query + "' check the generated regular expression");
	UT.equal(ret.index, 0, "For query='" + query + "' check match index for line='" + line +
			"'.  This shows all the keywords in the search query are independently searched.");
		
	//Test for multiple words: To show order of keywords in search query does not matter.
	query ="happy republic";
	line ="republic testing hello happy";
	UtSearchZimlet._searchHighlighterZimlet._searchController.currentSearch.query = query;
	ret = UtSearchZimlet._searchHighlighterZimlet.match(line, 0);
	UT.equal(UtSearchZimlet._searchHighlighterZimlet._regexps[0].toString(), "/\\b(happy|republic)\\b/gi", 
			"For query='" + query + "' check the generated regular expression");
	UT.equal(ret.index, 0, "For query='" + query + "' check match index for line='" + line + 
			"'.  This shows order of keywords in search query does not matter.");
};

UT.test("SearchHightlighter Zimlet tests", UtSearchZimlet.test);