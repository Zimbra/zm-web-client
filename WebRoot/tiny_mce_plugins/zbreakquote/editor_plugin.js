(function() {
	tinymce.create('tinymce.plugins.BreakQuote', {
		init : function(ed) {
			var t = this;

			ed.onKeyDown.add(function(ed, ev) {

				var doc = ed.getDoc(), se = ed.selection, s = se.getSel(), range = se.getRng();
				var element;

				if (/keydown/i.test(ev.type) && ev.keyCode==13) {
					if (tinymce.isIE) {
						if (s.type == "None" || s.type == "Text") {
							element = range.parentElement();
						} else if (s.type == "Control") {
							element = range.item(0);
						} else {
							element = doc.body;
						}
					} else {
						element = range.startContainer;
					}
					var ancestor = element;

					while (ancestor) {
						var tagname = ancestor.tagName;
						if (tagname && tagname.toLowerCase() === "blockquote")
							break;
						ancestor = ancestor.parentNode;
					}


					if (ancestor) {
						var text, offset, blockquote;
						range.collapse(false);
							
						if (tinymce.isIE) {
							text = element.innerText;
							// IE doesn't let us get the offset directly, so we count the number of times we can use moveStart() until we're out of the containing element
							var container = range.parentElement();
							var limit = 10000;
							for (var i=0; i<limit; i++) {
								if (container != range.parentElement())
									break;
								range.moveStart("character", -1);
							}
							offset = i-1;
						} else {
							element = range.startContainer.parentNode;
							text = range.startContainer.textContent;
							offset = range.startOffset;
						}
						blockquote = ancestor;

						var id = element.id = element.id || tinymce.DOM.uniqueId();
						var blockquote2 = blockquote.cloneNode(true); // Create an orphaned clone of the blockquote. This will be meddled with before getting attached to the DOM tree
						var el1 = element;
						var el2 = t.byId(id, blockquote2); // Can't use document.getElementById on orphaned trees

						el1.innerHTML = offset ? text.substring(0, offset) : "";
						el2.innerHTML = text.substring(offset);
						el2.id = null;

						// Prune off all "later" siblings in the blockquote tree
						while (el1 != blockquote) {
							while (el1.nextSibling)
								el1.parentNode.removeChild(el1.nextSibling);
							el1 = el1.parentNode;
						}

						// Prune off all "prior" siblings in the blockquote2 tree
						while (el2 != blockquote2) {
							while (el2.previousSibling)
								el2.parentNode.removeChild(el2.previousSibling);
							el2 = el2.parentNode;
						}

						// Now we've effectively cut the original blockquote in half, with the second half present in blockquote2
						if (blockquote.nextSibling) {
							blockquote.parentNode.insertBefore(blockquote2, blockquote.nextSibling);
						} else {
							blockquote.parentNode.appendChild(blockquote2);
						}
	
						if (tinymce.isIE) {
							// Hack to get IE to properly place the cursor between the two blockquotes
							var p = document.createElement("p");
							var span1 = document.createElement("span");
							var span2 = document.createElement("span");
							var br = document.createElement("br");
							span1.appendChild(span2);
							span1.appendChild(br);
							p.appendChild(span1);
							blockquote2.parentNode.insertBefore(p, blockquote2);

							range.moveToElementText(span2);
							range.collapse(0);
							range.select();
							span2.parentNode.removeChild(span2);

							return tinymce.dom.Event.cancel(ev);
						} else {
							range.setStartAfter(blockquote);
							se.setRng(range);
						}
					}
				}
			});
		},

		byId : function(id, ancestor) {
			if (ancestor == id || ancestor.id == id)
				return ancestor;
			for (var i=0; i<ancestor.childNodes.length; i++) {
				if (ancestor.childNodes[i].nodeType == 1) {
					var cnode = this.byId(id, ancestor.childNodes[i]);
					if (cnode) return cnode;
				}
			}
			return null;
		},

		getInfo : function() {
			return {
				longname : 'ZBreakQuote to break up blockquotes when newline is entered',
				author : 'Zimbra Inc.,',
				authorurl : 'http://www.zimbra.com',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('zbreakquote', tinymce.plugins.BreakQuote);
})();
