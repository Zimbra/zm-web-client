Ext.define('ZCS.common.ZtTemplate', {

	singleton: true,

	loadTemplates: function(callback) {
		Ext.Ajax.request({
			url: '/t/resources/templates/zcs.tpl',
			async: false,
			success: function(response){
				var text = response.responseText,
					lines = text.split('\n'),
					m, curId;

				Ext.each(lines, function(line) {
					line = Ext.String.trim(line);
					if (line && (line.indexOf('#') !== 0)) {
						if (line.indexOf('<template ') === 0) {
							m = line.match(/^<template id=['"](\w+)['"]/);
							if (m[1]) {
								curId = m[1];
								ZCS.template[curId] = '';
							}
						}
						else if (line === '</template>') {
							curId = null;
						}
						else if (curId) {
							ZCS.template[curId] += line + '\n';
						}
					}
				});

				if (callback) {
					callback();
				}
			}
		});
	}
});

ZCS.template = ZCS.common.ZtTemplate;
