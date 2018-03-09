tinymce.PluginManager.add("zemoticons",function(b,a){function c(){var f;
f=['<table role="presentation" class="mce-grid">'];
var h=[];
for(var g in tinyMCE.emoticon_map){h.push(g)
}while(h.length){f.push("<tr>");
var j=h.splice(0,4);
for(var e=0;
e<j.length;
e++){var g=j[e];
var d=tinyMCE.emoticon_map[g];
f.push('<td><a href="#" data-mce-url="');
f.push(d);
f.push('" tabindex="-1"><img src="');
f.push(d);
f.push('" style="width: 18px; height: 18px" alt="');
f.push(g);
f.push('">');
f.push("</a></td>")
}f.push("</tr>")
}f.push("</table>");
return f.join("")
}b.addButton("zemoticons",{type:"panelbutton",panel:{autohide:true,html:c,onclick:function(d){var f=b.dom.getParent(d.target,"a");
if(f){var g=b.settings.paste_data_images;
b.settings.paste_data_images=true;
b.insertContent('<img src="'+f.getAttribute("data-mce-url")+'" />');
b.settings.paste_data_images=g;
this.hide()
}}},icon:"emoticons",tooltip:"Emoticons"})
});