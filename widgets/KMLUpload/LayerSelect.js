define([
	'dojo/query',
	'dojo/Evented',
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_OnDijitClickMixin',
    'dijit/_TemplatedMixin',
	'dojo/dom-construct',
    'dojo/dom-attr',
	'dojo/dom-style',
    'dojo/text!./LayerSelect.html'
], function(
	query,
	Evented,
	declare, 
	_WidgetBase, 
	_OnDijitClickMixin, 
	_TemplatedMixin, 
	domConstruct,
	domAttr,
	domStyle,
	dijitTemplate
){
	var Widget = declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, Evented],
    {
		templateString : dijitTemplate,
		items : [],
		options : {
			visible : false
		},
		_css : {
			layerList : "layer-list",
			container : "layerListContainer",
			buttonContainer : "buttonContainer",
			errorMessage : "errorMessage",
			buttonBack : "buttonBack"
		},
		_setGeometryTypeAttr: {
			node: "_geometryType", 
			type: "innerHTML"
		},
		constructor : function(options) {
			declare.safeMixin(this.options, options);
            this.domNode = domConstruct.create("div", {innerHTML:this.templateString});
		},
		startup : function() {
			//this.createWidgets();
			this._visible();
		},
		_saveClicked : function() {
			this.emit("save", this.getSelected());
		},
		_cancelClicked : function() {
			this.emit("cancel", {});
		},
		_back : function() { 
			this.emit("back", {});
		},
		updateList : function(layers) {
			this.items = layers;
			if(this.items.length > 0) {
				this.hideErrorMessage();
				this.injectListItems();
			} else {
				this.showErrorMessage();
			}
		},
		hideErrorMessage : function() {
			domStyle.set(this._layerList, "display", "block");
			domStyle.set(this._buttonContainer,"display", "block");
			domStyle.set(this._errorMessage, "display", 'none');
		},
		showErrorMessage : function() {
			domStyle.set(this._layerList, "display", "none");
			domStyle.set(this._buttonContainer, "display", "none");
			domStyle.set(this._errorMessage, 'display', 'block');
		},
		injectListItems : function() {
			this._layerList.innerHTML = "";
			for(var i = 0; i < this.items.length; i++){
				var input = domConstruct.create("input");
				domAttr.set(input, "type", "checkbox");
				domAttr.set(input, "name", this.items[i].name);
				domAttr.set(input, "value", this.items[i].layerId);
				var label = domConstruct.create("label", {innerHTML: this.items[i].label});
				var li = domConstruct.create("li");
				domConstruct.place(input, li);
				domConstruct.place(label,li);
				domConstruct.place(li, this._layerList);
			}
		},
		getSelected : function() {
			var checked = query("input:checked", this._layerList);
			var layerIds = [];
			for(var i = 0; i < checked.length; i++) {
				layerIds.push(domAttr.get(checked[i], "value"));
			}
			return layerIds;
		},
		_visible:function() {
            if(this.get("visible")) {
                domStyle.set(this.domNode, "display",'block');
            } else {
                domStyle.set(this.domNode,'display','none');
            }
        }
	});
	return Widget;
});