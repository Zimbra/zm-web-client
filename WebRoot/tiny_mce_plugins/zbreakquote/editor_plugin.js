(function() {
	tinymce.create('tinymce.plugins.BreakQuote', {
		init : function(ed) {
			var t = this;

			ed.onKeyDown.add(function(ed, ev) {

				var doc = ed.getDoc(), se = ed.selection, s = se.getSel(), range = se.getRng();
				var element;

				if (/keydown/i.test(ev.type)) {
					if (ev.keyCode==13) {
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
							t.splitBlockquote(ancestor, element, ed);
							if (tinymce.isIE)
								return tinymce.dom.Event.cancel(ev);
						}
					}

					if (ev.keyCode==8 || ev.keyCode==46) { // Backspace or delete
						setTimeout(AjxCallback.simpleClosure(function() { // Waiting for the other event handlers (including the browser's own) to finish tends to clean up the DOM for us
							var blockquote1, blockquote2;
							for (var child=doc.body.firstChild; child && child.nextSibling; child=child.nextSibling) {
								var child2 = child.nextSibling;
								if (child2 && child2.tagName && child2.tagName.toLowerCase()=="p" && this.elementIsIEFiller(child2.firstChild))
									child2 = child2.nextSibling;

								if (child2 && child.tagName && child2.tagName && child.tagName.toLowerCase()=="blockquote" && child2.tagName.toLowerCase()=="blockquote") {
									t.mergeBlockquotes(child, child2, ed);
								}
							}
						}, this), 5);
						if (ev.keyCode==46) {
//							if (ev.preventDefault)
//								ev.preventDefault();

							if (!tinymce.isIE) {
								var el = range.startContainer.childNodes[range.startOffset];
								if (el && el.tagName && el.tagName.toLowerCase()=="br") {
									t.removeElement(el);
								}
							}
//							rv=false;
						}
					}
				}
			});
		},

		splitBlockquote : function(blockquote, element, ed) {
			var selection = ed.selection, range = selection.getRng();
			var el, offset=null, coffset=null;
			var text1, text2;
			range.collapse(false);
				
			if (tinymce.isIE) {
				el = element;
				// IE doesn't let us get the offset directly, so we paste a dummy string in and find it's position in the HTML code
				var dummy = "###"+tinymce.DOM.uniqueId()+"###";
				range.pasteHTML(dummy);
				offset = el.innerHTML.indexOf(dummy);
				el.innerHTML = el.innerHTML.replace(dummy,"");
				text1 = offset ? el.innerHTML.substring(0, offset) : "";
				text2 = el.innerHTML.substring(offset);
			} else {
				var type = range.startContainer.nodeType;
				if (type==3 || type==4 || type==8) {
					offset = range.startOffset;
					el = range.startContainer.parentNode;
					text1 = offset ? range.startContainer.textContent.substring(0, offset) : ""; // Extract text before and after breakpoint
					text2 = range.startContainer.textContent.substring(offset);
					var _el = range.startContainer.previousSibling;
					while (_el) {
						text1 = this.getElementHTML(_el) + text1; // offset is relative to local TextNode, but we need to use the entire text of the surrounding element
						_el = _el.previousSibling; // so we extract the text from all siblings and put it together
					}
					_el = range.startContainer.nextSibling;
					while (_el) {
						text2 = text2 + this.getElementHTML(_el); // Same for text after the breakpoint
						_el = _el.nextSibling;
					}
				} else {
					coffset = range.startOffset; // Breakpoint is not inside a TextNode, store the element offset instead
					el = range.startContainer;
				}
			}

			var id = el.id = el.id || tinymce.DOM.uniqueId();
			var blockquote2 = blockquote.cloneNode(true); // Create an orphaned clone of the blockquote. This will be meddled with before getting attached to the DOM tree
			var el1 = el;
			var el2 = this.byId(id, blockquote2); // Can't use document.getElementById on orphaned trees
			el2.removeAttribute("id");

			if (offset!==null) {
				el1.innerHTML = text1; // Insert the text we extracted earlier
				el2.innerHTML = text2;
			} else if (coffset!==null) {
				this.removeNextSiblings(el1.childNodes[coffset]); // cut away all siblings after breakpoint for el1
				var c2 = el2.childNodes[coffset];
				this.removePreviousSiblings(c2); // and all sibling before breakpoint for el2
				this.removeElement(c2);
			}

			// Prune off all "later" siblings in the blockquote tree
			while (el1 != blockquote) {
				this.removeNextSiblings(el1);
				el1 = el1.parentNode;
			}

			// Prune off all "prior" siblings in the blockquote2 tree
			while (el2 != blockquote2) {
				this.removePreviousSiblings(el2);
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

				this.setIEFiller(span1); // We need to remove this element when we want to reconnect the blockquotes, so give it something we can find again

				range.moveToElementText(span2);
				range.collapse(0);
				//range.select();
				selection.setRng(range);
				span2.parentNode.removeChild(span2);

			} else {
				if (tinymce.isSafari) {
					var t = this;
					setTimeout(function(){
						var p;
						if (blockquote.lastChild && blockquote.lastChild.childElementCount==1 && blockquote.lastChild.firstChild instanceof HTMLBRElement)
							p = blockquote.lastChild;
						else if (blockquote2.firstChild && blockquote2.firstChild.childElementCount==1 && blockquote2.firstChild.firstChild instanceof HTMLBRElement)
							p = blockquote2.firstChild;
						if (p) {
							blockquote.parentNode.insertBefore(p, blockquote2);
							range.setStart(p,0);
							selection.removeAllRanges();
							selection.addRange(range);
						}
					},5);
				}
				range.setStartAfter(blockquote);
				selection.setRng(range);
			}
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

		elementIsIEFiller : function(el) {
			if (el.attributes) {
				for (var i=0; i<el.attributes.length; i++) {
					if (el.attributes[i].name=="_ieFiller") {
						return true;
					}
				}
			}
		},

		setIEFiller : function(el) {
			if (el) el.setAttribute("_ieFiller","");
		},

		removeIEFiller : function(el) {
			if (el) {
				if (this.elementIsIEFiller(el)) {
					el.parentNode.removeChild(el);
				}
				for (var i=0; i<el.children.length; i++) {
					this.removeIEFiller(el.children[i]);
				}
			}
		},

		getElementHTML : function(el) {
			if (tinymce.isIE) return el.outerHTML;
			var parent = document.createElement(el.parentNode.tagName);
			parent.appendChild(el.cloneNode(true));
			return parent.innerHTML;
		},

		removeElement : function(el) {
			if (el && el.parentNode) {
				el.parentNode.removeChild(el);
			}
		},

		removePreviousSiblings : function(el) {
			if (el && el.parentNode) {
				while (el.previousSibling) {
					this.removeElement(el.previousSibling);
				}
			}
		},
		
		removeNextSiblings : function(el) {
			if (el && el.parentNode) {
				while (el.nextSibling) {
					this.removeElement(el.nextSibling);
				}
			}
		},

		/*selectNode : function(el, range) {
			var set;
			var range = this.ed.selection.getRng();
			while (!set && el) {
				try {
					range.setStartBefore(el);
					set = true;
				} catch (ex) {
					el = el.parentNode;
					set = false;
				}
			}
		},*/

		nextElement : function(el) {
			if (el.childNodes && el.childNodes.length)
				return el.childNodes[0];
			if (el.nextSibling)
				return el.nextSibling;
			var p = el.parentNode;
			while (!el.nextSibling) {
				el = el.parentNode;
				if (!el) return null;
			}
			return el.nextSibling;
		},

		mergeBlockquotes : function(blockquote1, blockquote2, ed) {
			var selection = ed.selection, range = selection.getRng();

			if (tinymce.isIE) {
				this.removeIEFiller(blockquote1.lastChild);
			}

			var el1 = blockquote1;
			var depth1 = 0;
			while (el1.childNodes.length) { // Descend into blockquote1, finding the very last leaf node in the tree
				el1 = el1.childNodes[el1.childNodes.length-1];
				while (el1.previousSibling && el1.tagName=="BR")
					el1 = el1.previousSibling;
				depth1++;
			}

			var el2 = blockquote2;
			var depth2 = 0;
			while (el2.childNodes.length) { // Descend into blockquote2, finding the very first leaf node in the tree
				el2 = el2.childNodes[0];
				depth2++;
			}

			if (el1.nodeType==3) { // If it's a TextNode, go one up
				el1 = el1.parentNode;
				depth1--;
			}
			if (el2.nodeType==3) {
				el2 = el2.parentNode;
				depth2--;
			}

			if (depth1==depth2) { // Simplest case, just append the contents of el2 to el1.

				var text = [el1.innerHTML, el2.innerHTML];
				var dummy = "###"+tinymce.DOM.uniqueId()+"###";
				el1.innerHTML = text.join(dummy);
				var offset = el1.innerHTML.replace(/<br>/ig," ").replace(/<\/?[^>]+>/g,"").indexOf(dummy);
				el1.innerHTML = text.join("");
				if (tinymce.isIE) {
					range.moveToElementText(el1);
					range.moveStart("character", offset);
				} else {
					var p;
					for (p = el1; p != null && offset > 0; p = this.nextElement(p)) { // Walk through elements, decrementing offset as we go, and set the range when we find an element where the remaining offset fits
						var type = p.nodeType;
						var textContent = p.textContent || p.innerText || p.innerHTML || "";

						if (type==3 || type==4 || type==8) {
							if (offset <= textContent.length)
								break;
							offset -= textContent.length;
						} else {
							if (p.tagName.toLowerCase()=="br")
								offset--;
							if (offset==0)
								break;
						}
					}
					range.setStart(p, offset);
				}
			} else if (depth1==depth2+1) { // We're merging at a node border, append all children of el2 to el1's parent (making them siblings of el1)
				while (el2.firstChild) {
					el1.parentNode.appendChild(el2.firstChild);
				}
				if (tinymce.isIE) {
					var type = p.nodeType;
					var offset = 1;
					if (type==3 || type==4 || type==8) {
						offset = p.length;
						p = p.parentNode;
					}
					range.moveToElementText(p);
					range.moveStart("character",offset);
				} else {
					if (el1.tagName && el1.tagName.toLowerCase()=="br")
						range.setStartBefore(el1);
					else
						range.setStartAfter(el1);
				}
				el1 = el1.parentNode;

			} else if (depth1+1==depth2) { // We're merging at a node border, append el2 and all its siblings to el1 (making them children of el1)
				var p = el1.childNodes.length ? el1.childNodes[el1.childNodes.length-1] : el1;
				el2 = el2.parentNode;
				while (el2.firstChild) {
					el1.appendChild(el2.firstChild);
				}
				if (tinymce.isIE) {
					var type = p.nodeType;
					var offset = 1;
					if (type==3 || type==4 || type==8) {
						offset = p.length;
						p = p.parentNode;
					}
					range.moveToElementText(p);
					range.moveStart("character",offset);
				} else {
					if (p.tagName && p.tagName.toLowerCase()=="br")
						range.setStartBefore(p);
					else
						range.setStartAfter(p);
				}
			} else { // We don't handle nodes that are further apart
				return;
			}
			
			while (el1 != blockquote1 && el2 != blockquote2) { // Ascend up the tree, appending nodes from blockquote2's tree to blockquotes1's tree
				while (el2.nextSibling) {
					el1.parentNode.appendChild(el2.nextSibling);
				}
				el1 = el1.parentNode;
				el2 = el2.parentNode;
			}
			this.removeElement(blockquote2); // All significant contents have been transferred, kill blockquote2
			range.collapse(true);
			selection.setRng(range);
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
