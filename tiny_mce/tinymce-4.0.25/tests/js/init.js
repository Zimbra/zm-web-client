/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the “License”);
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an “AS IS” basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * 
 * ***** END LICENSE BLOCK *****
 */
(function() {
	var coverObjects = [], modulesExecuted = {}, log = [], currentModule;

	QUnit.config.reorder = false;
	QUnit.config.hidepassed = true;

	var oldModule = module;

	QUnit.moduleStart(function(details) {
		currentModule = details.name;
		modulesExecuted[details.name] = true;

		tinymce.remove();
		document.getElementById('view').innerHTML = '<textarea></textarea>';
	});

	QUnit.moduleDone(function() {
		tinymce.remove();
		window.editor = window.inlineEditor = null;
	});

	// Sauce labs
	QUnit.testStart(function(testDetails) {
		QUnit.log = function(details) {
			if (!details.result) {
				details.name = currentModule + ':' + testDetails.name;
				log.push(details);
			}
		};
	});

	QUnit.done(function(results) {
		document.getElementById("view").style.display = 'none';

		if (window.__$coverObject) {
			coverObjects.push(window.__$coverObject);

			$('<button>Coverage report</button>').on('click', function() {
				window.open('coverage/index.html', 'coverage');
			}).appendTo(document.body);
		}

		// Sauce labs
		var tests = [];
		for (var i = 0; i < log.length; i++) {
			tests.push({
				name: log[i].name,
				result: log[i].result,
				expected: log[i].expected,
				actual: log[i].actual,
				source: log[i].source
			});
		}

		results.tests = tests;
		window.global_test_results = results;
	});

	window.module = function(name, settings) {
		settings = settings || {};

		if (settings.setupModule) {
			QUnit.moduleStart(function(details) {
				if (details.name == name) {
					settings.setupModule();
				}
			});
		}

		if (settings.teardownModule) {
			QUnit.moduleDone(function(details) {
				if (details.name == name) {
					settings.teardownModule();
				}
			});
		}

		oldModule(name, settings);
	};

	window.getCoverObject = function() {
		var coverObject = {}, fileName, gaps, gap, count, targetModuleName;
		var isScoped = document.location.search.indexOf('module=') != -1;

		for (var i = 0, length = coverObjects.length; i < length; i++) {
			for (fileName in coverObjects[i]) {
				gaps = coverObjects[i][fileName];

				if (isScoped && fileName.indexOf('js/tinymce/classes') === 0) {
					targetModuleName = "tinymce." + fileName.substr('js/tinymce/classes'.length + 1).replace(/\//g, '.');
					targetModuleName = targetModuleName.replace(/\.js$/, '');

					if (!modulesExecuted[targetModuleName]) {
						continue;
					}
				}

				if (!coverObject.hasOwnProperty(fileName))	{
					coverObject[fileName] = gaps;
				} else {
					for (gap in gaps) {
						if (gap === '__code') {
							continue;
						}

						count = gaps[gap];

						if (!coverObject[fileName].hasOwnProperty(gap)) {
							coverObject[fileName][gap] = count;
						} else {
							coverObject[fileName][gap] += count;
						}
					}
				}
			}
		}

		return coverObject;
	};
})();
