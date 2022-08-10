tinyMCE.getlanguage=function(a){if(tinymce.inArray(tinyMCE.locale_list,a)>=0){return a
}var e=a.split("_",1)[0];
if(tinymce.inArray(tinyMCE.locale_list,e)>=0){return e
}if(a==="zh_HK"&&tinymce.inArray(tinyMCE.locale_list,"zh_TW")>=0){return"zh_TW"
}for(var b=0,d=tinyMCE.locale_list.length;
b<d;
b++){if(tinyMCE.locale_list[b].substr(0,2)===e){return tinyMCE.locale_list[b]
}}return"en"
};