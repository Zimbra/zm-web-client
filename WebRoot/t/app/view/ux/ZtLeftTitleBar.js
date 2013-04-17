Ext.define('ZCS.view.ux.ZtLeftTitleBar', {
	extend: 'Ext.TitleBar',
	alias: 'widget.lefttitlebar',
	config: {
		cls: 'zcs-left-align-titlebar zcs-item-titlebar'
	},
	refreshTitlePosition: function() {
        var titleElement = this.titleComponent.renderElement;

        titleElement.setWidth(null);
        titleElement.setLeft(null);

        //set the min/max width of the left button
        var leftBox = this.leftBox,
            leftButton = leftBox.down('button'),
            singleButton = leftBox.getItems().getCount() == 1,
            leftBoxWidth, maxButtonWidth;

        if (leftButton && singleButton) {
            if (leftButton.getWidth() == null) {
                leftButton.renderElement.setWidth('auto');
            }

            leftBoxWidth = leftBox.renderElement.getWidth();
            maxButtonWidth = this.getMaxButtonWidth();

            if (leftBoxWidth > maxButtonWidth) {
                leftButton.renderElement.setWidth(maxButtonWidth);
            }
        }

        var spacerBox = this.spacer.renderElement.getPageBox(),
            titleBox = titleElement.getPageBox(),
            widthDiff = titleBox.width - spacerBox.width,
            titleLeft = titleBox.left,
            titleRight = titleBox.right,
            halfWidthDiff, leftDiff, rightDiff;

        if (widthDiff > 0) {
            titleElement.setWidth(spacerBox.width);
        }

        //Do not do any positioning of the title in javascript.

        titleElement.repaint();
    }
});