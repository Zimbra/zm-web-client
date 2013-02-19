Ext.define('ZCS.view.ux.ZtIframe', {

	extend: 'Ext.Component',

	xtype: 'iframe',

	config: {
		name: '',       // name for IFRAME provided by caller
		iframeEl: null  // the IFRAME Ext.dom.Element
	},

	initialize: function() {

		var iframe = this.element.createChild({
			tag: 'iframe',
			scrolling: 'no',
			frameborder: 0,
			width: '100%',
			name: this.getName()
		});

		this.setIframeEl(iframe);

		Ext.Logger.info('IFRAME ID: ' + iframe.dom.id);

		// not sure yet if we need to relay events
//		this.relayEvents(iframe, '*');
	},

	getDoc: function() {
		var el = this.getIframeEl();
		return el ? el.dom.contentDocument : null;
	},

	getBody: function() {
		var doc = this.getDoc();
		return doc ? doc.body : null;
	},

	setContent: function(html) {

		var doc = this.getDoc(),
			body = this.getBody();

		if (doc && body) {
			doc.open();
			doc.write(html);
			doc.close();
			body = this.getBody();
			body.style.margin = '0';
			body.style.height = 'auto';
			this.fixSize();
		}
	},

	resizeToContent: function() {

		if (this.hasBeenSized) {
//			return;
		}

		var doc = this.getDoc(),
			body = this.getBody(),
			docEl = doc.documentElement,
			contentHeight = body ? body.scrollHeight : 0,
			contentWidth = body ? body.scrollWidth : 0,
			iframe = this.getIframeEl(),
			iframeWidth = iframe.getWidth();

		if (contentWidth > iframeWidth) {
			iframe.setWidth(contentWidth);
		}

		// TODO: Revisit. For now, always use heights of child nodes to figure out the height of the actual content.
		var height = Math.max(docEl.scrollHeight, contentHeight);
		if (true || height === ZCS.constant.DEFAULT_IFRAME_HEIGHT) {
			// handle content whose height is less than 150
			var styleObj = doc.defaultView.getComputedStyle(body);
			height = parseInt(styleObj.height);
			if (true || !height || height === ZCS.constant.DEFAULT_IFRAME_HEIGHT) {
				height = 0;
				var ln = body.childNodes.length,
					i, el;
				for (i = 0; i < ln; i++) {
					el = body.childNodes[i];
					if (el && el.nodeType === Node.ELEMENT_NODE) {
						height += el.offsetHeight;
						styleObj = doc.defaultView.getComputedStyle(el);
						if (styleObj) {
							height += parseInt(styleObj.marginTop) + parseInt(styleObj.marginBottom);
						}
					}
				}
			}
			if (height > 0 && height < 150) {
				height += 12;	// fudge to make sure nothing is cut off
				Ext.Logger.info('Resizing msg view body IFRAME height to ' + height);
				iframe.setHeight(height);
				this.hasBeenSized = true;
			}
		}
		else {
			iframe.setHeight(height);
			this.hasBeenSized = true;
		}

		var newHeight = Math.max(body.scrollHeight, docEl.scrollHeight);
		if (newHeight > height) {
			Ext.Logger.warn('New iframe height not as expected, set to ' + height + ' but is now ' + newHeight);
			iframe.setHeight(newHeight);
		}
	},

	fixSize: function() {
		Ext.defer(this.resizeToContent, 200, this);
	}
});
