
ZmSpreadSheetChart = function(parent, spreadsheet, type, cData){

    DwtComposite.call(this, parent, "ZmSpreadSheetChart", Dwt.ABSOLUTE_STYLE);

    this._type = type;
    this._cData = cData;
    this._spreadsheet = spreadsheet;

    this._createHtml();

    this.setZIndex(Dwt.Z_VIEW);
    this.setVisible(false);

};

ZmSpreadSheetChart.prototype = new DwtComposite;
ZmSpreadSheetChart.prototype.constructor = ZmSpreadSheetChart;

ZmSpreadSheetChart.BAR = "bar";
ZmSpreadSheetChart.PIE = "pie";
ZmSpreadSheetChart.LINE = "line";

ZmSpreadSheetChart.prototype.getChartType =
function(){
    return this._type;
};

ZmSpreadSheetChart.prototype.getChartRange =
function(){
    var data = this._cData;
    return {
        sRow: data.sRow,
        sCol: data.sCol,
        eRow: data.eRow,
        eCol: data.eCol
    }
};

ZmSpreadSheetChart.prototype.getChartPos =
function(){
    var bounds = this.getBounds();
    return {x: bounds.x, y:bounds.y};
};

ZmSpreadSheetChart.prototype._showChart =
function(type, containerId, yDataSource, attributes){
    var chart;
    switch(type){
        case ZmSpreadSheetChart.BAR:
            chart = new YAHOO.widget.BarChart(containerId , yDataSource , attributes);
            break;
        case ZmSpreadSheetChart.PIE:
            chart = new YAHOO.widget.PieChart(containerId , yDataSource , attributes);
            break;
        case ZmSpreadSheetChart.LINE:
            chart = new YAHOO.widget.LineChart(containerId, yDataSource, attributes);
            break;
    }
    return chart;
};

ZmSpreadSheetChart.prototype._getDataSource =
function(data){ //Array of Array's Table Format

    var dataSrc = new Array();

    var rows = data.length;
    var cols = data[0].length;

    var fields = new Array();
    fields.push("rowlabels");
    for(var i=1; i<cols; i++){
        fields.push(data[0][i]);
    }
    
    this._dataFields = fields;

    for(var i=1; i<rows; i++){
        dataSrc[i-1] ={};
        for(var j=0; j<cols; j++){
            dataSrc[i-1][fields[j]] = data[i][j];
        }
    }

    YAHOO.example.sheetData = dataSrc;

    dataSrc = this._dataSrc = new YAHOO.util.DataSource(YAHOO.example.sheetData);
    dataSrc.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
	dataSrc.responseSchema = { fields: this._dataFields }; 

    return dataSrc;

};

ZmSpreadSheetChart.prototype.show =
function(type, params){

    type = type || this._type;
    this._type = type;

    var dataSource = this._getDataSource(this._cData.data);
    params = this._getAttributes(type, params);

    this.setBounds(params.posX, params.posY);
    this.setVisible(true);

    this._showChart(type, this._containerId, dataSource, params);

};

ZmSpreadSheetChart.prototype._getAttributes =
function(type, params){

    switch(type) {
        case ZmSpreadSheetChart.BAR:
            var seriesDef = new Array();
            var fieldsLen = this._dataFields.length;
            for(var i=1; i< fieldsLen; i++){
                seriesDef.push({xField:this._dataFields[i], displayName:this._dataFields[i]});
            }
            params.series = seriesDef;
            params.yField = this._dataFields[0];
            params.style = {
                legend: {
                    display: 'bottom',
                    font:{
                        family: "Arial",
                        size: 10
                    }
                }
            };
            break;

        case ZmSpreadSheetChart.PIE:
            params.categoryField = this._dataFields[0];
            params.dataField = this._dataFields[1];
            params.series = [{}];
            params.style = {
                legend: {
                    display: 'right',
                    font:{
                        family: "Arial",
                        size: 10
                    }
                }
            };
            break;

        case ZmSpreadSheetChart.LINE:
            var seriesDef = new Array();
            var fieldsLen = this._dataFields.length;
            for(var i=1; i< fieldsLen; i++){
                seriesDef.push({yField:this._dataFields[i], displayName:this._dataFields[i]});
            }
            params.series = seriesDef;
            params.xField = this._dataFields[0];
            params.style = {
                legend: {
                    display: 'bottom',
                    font: {
                        family: "Arial",
                        size: 10
                    }
                }
            };
            break;
    }

    return params;
};

ZmSpreadSheetChart.prototype._createHtml =
function(){
     var html = [];
     var idx = 0;

    this._headerId = Dwt.getNextId();
    this._containerId = Dwt.getNextId();

    html[idx++] = "<div class='ZmSpreadSheetChartHeader' id ='"+this._headerId+"'>";
    html[idx++] =   "<div class='ZmSpreadSheetChartName' id='"+this._headerId+"_name'>Sample Chart:"+this.getHTMLElId()+"</div>";
    html[idx++] =   "<div class='ImgCancel ZmSpreadSheetChartClose' id='"+this._headerId+"_close'></div>"
    html[idx++] = "</div>";

    html[idx++] = "<div id='"+this._containerId+"' class='ZmSpreadSheetChartContainer'></div>";

    this.setContent(html.join(''));

    Dwt.setHandler(Dwt.byId(this._headerId+"_close"), DwtEvent.ONCLICK, AjxCallback.simpleClosure(this._closeListener, this));

};

ZmSpreadSheetChart.prototype._closeListener = function(ev){
    this._spreadsheet.removeChart(this.getHTMLElId());
    this.setContent("");
    this.dispose();
};

ZmSpreadSheetChart.prototype.makeDraggable =
function(params){
    this._dnd = new YAHOO.util.DD(this.getHTMLElId());    
};

