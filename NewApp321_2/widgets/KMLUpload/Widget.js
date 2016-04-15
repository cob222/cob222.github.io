define([
	'dojo/_base/declare',
	'jimu/BaseWidget',
	'dojo/dom-style',
	'dojo/request',
	'dojo/_base/array',
	'dojo/Evented',
	'dijit/_WidgetsInTemplateMixin',
	'./UploadForm',
	'./LayerSelect',
	"esri/tasks/FeatureSet",
	"esri/layers/GraphicsLayer",
	"esri/geometry/Extent",
	"esri/graphic"
],function(
	declare,
	BaseWidget,
	domStyle,
	Request,
	arrayUtils,
	Evented,
	_WidgetsInTemplateMixin,
	UploadForm,
	LayerSelect,
	FeatureSet,
	GraphicsLayer, 
	Extent,
	Graphic
) {
	return declare([BaseWidget, _WidgetsInTemplateMixin, Evented], {
		baseClass : "jimu-widget-kmlupload",
		readers: [],
		uploadForm : null,
		layerList : null,
		temp_layer : null,
		constructor: function() {
			this._css = {
				uploadFormContainer : 'upload-form-container',
				layerListContainer : 'layer-list-container',
				messages : "message-container"
            };
		},
		postCreate: function() {
			this.inherited(arguments);
		},
		startup : function() {
			this.inherited(arguments);
			this.createStorageLayer();
			this.createWidgets();
			this.bindHandlers();
		},
		createStorageLayer : function() {
			this.temp_layer = new GraphicsLayer();
			this.temp_layer.id = this.temp_layer_name;
			this.map.addLayer(this.temp_layer);
		},
		handleFileContents : function(file, content) {
			var that = this;
			Request.post("https://utility.arcgis.com/sharing/kml",{
			  data : {
				"kmlString" : encodeURI(content),
				"refresh" : true
			  },
			  headers : {
				"Accept" : "*/*",
				"Accept-Language" : "en-US;en;q=0.8",
				"X-Requested-With" : null,
				"Content-Type" : "application/x-www-form-urlencoded; charset=UTF-8"
			  }
			}).then(function(data) {
				that.saveToTempLayer(data);
			});
		},
		saveToTempLayer : function(data) {
			var that = this;
			var json = JSON.parse(data);
			var featureSet = new FeatureSet(json);
			var extent = new Extent(featureSet.lookAtExtent);
			var point = extent.getCenter();
			var layers = featureSet.featureCollection.layers;
			var polygonSymbol = this.config.polygon;
			var pointSymbol = this.config.point;
			var cont = true;
			var geometryType = null;
			this.temp_layer.clear();
			this.temp_layer.show();
			arrayUtils.forEach(layers, function(layer,index) {
				if(layer.featureSet.features.length > 0 && cont){
					geometryType = layer.featureSet.geometryType;
					arrayUtils.forEach(layer.featureSet.features, function(feature, index) {
						that.temp_layer.add(new Graphic({
							geometry: feature.geometry,
							attributes : feature.attributes,
							symbol : (geometryType === "esriGeometryPoint") ? pointSymbol : polygonSymbol
						}));
					});
					cont = false;
				}
			});
			that.map.centerAndZoom(point,14);
			if(geometryType) {
				this.emit('add-to-temp-finished', {geometryType : geometryType});
			} else {
				throw "No features found in KML file.";
			}
		},
		bindHandlers : function() {
			var that = this;
			this.uploadForm.on("uploadFinished", function(data) {
				that.handleFileContents(data.file, data.content);
				that.uploadForm.set("visible", false);
				that.uploadForm._visible();
			});
			this.on("add-to-temp-finished", function(data) {
				that.layerList.set("geometryType", data.geometryType);
				that.layerList.updateList(that.getEligibleLayers(data.geometryType));
				that.layerList.set("visible", true);
				that.layerList._visible();
			});
			this.layerList.on("back", function() {
				that.temp_layer.clear();
				that.layerList.set("visible", false);
				that.layerList._visible();
				that.uploadForm.set("visible", true);
				that.uploadForm._visible();
			});
			this.uploadForm.on("upload-started", function() {
				that.uploadForm.set("visible", false);
				that.uploadForm._visible();
			});
			this.layerList.on("save", function(data) {
				if(data.length > 0) {
					that.layerList.set("visible", false);
					that.layerList._visible();
					for(var i = 0; i < data.length; i++) {
						that.copyToFeatureLayer(data[i]);
					}
				}
			});
			this.layerList.on("cancel", function(data) {
				that.temp_layer.clear();
				that.layerList.set("visible", false);
				that.layerList._visible();
				that.uploadForm.set("visible", true);
				that.uploadForm._visible();
			});
		},
		getEligibleLayers : function(geometryType) {
			var layerIds = this.map.graphicsLayerIds;
			var eligibleIds = [];
			for(var i = 0; i < layerIds.length; i++) {
				var layer = this.map.getLayer(layerIds[i]);
				if(layer.capabilities) {
					var capabilities = layer.capabilities.toLowerCase();
					if(layer.type === "Feature Layer" 
							&& capabilities.indexOf("create") > -1
							&& layer.geometryType === geometryType) {
						eligibleIds.push( {
							layerId : layer.id,
							label : layer.name
						});
					}
				}
			}
			return eligibleIds;
		},
		createWidgets : function() {
			this.uploadForm = new UploadForm({map: this.map});
			this.uploadForm.placeAt(this._uploadFormContainer);
			this.uploadForm._visible();
			this.uploadForm.startup();
			this.layerList = new LayerSelect();
			this.layerList.startup();
			this.layerList.placeAt(this._layerListContainer);
		},
		_restart : function() {
			this.uploadForm.set("visible", true);
			this.uploadForm._visible();
			domStyle.set(this._messagesContainer, "display", "none");
		},
		getAttributeDefaults : function(layer) {
			var attributes = {};
			var that = this;
			var name = this.config.defaultTypeAttribute.attributeName;
			var fields = layer.fields[name] ? 
				[layer.fields[name]] : layer.fields;
			dojo.forEach(fields, function(field, i) {
				if(field.type === "esriFieldTypeString" && field.domain) {
					if(field.domain.codedValues) {
						var codedValues = field.domain.codedValues;
						var name = that.config.defaultTypeAttribute.attributeValue;
						for(var v = 0; v < codedValues.length; v++){
							if(codedValues[v].name === name){
								attributes = {};
								attributes[field.name] = codedValues[v].code;
								break;
							}
						}
						if(!attributes[field.name]) {
							attributes[field.name] = codedValues[0].code;
						}
					}
				}
			});
			return attributes;
		},
		copyToFeatureLayer : function(layerId) {
			var layer = this.map.getLayer(layerId);
			var source = this.temp_layer.graphics[0];
			console.log(source.attributes);
			source.attributes = this.getAttributeDefaults(layer);
			console.log(source.attributes);
			var that = this;
			this.temp_layer.hide();
			dojo.forEach(source, function(elt, i) {
				that.map.graphics.add(elt);
			});
			layer.applyEdits([source], null,null, function(data) {
				if(data) {
					domStyle.set(that._messagesContainer, "display", "block");
					that.uploadForm.set("visible", false);
					that.layerList.set("visible", false);
					that.uploadForm._visible();
					that.layerList._visible();
					
				}
				that.map.graphics.redraw();
			}, function(error) {
				console.log(error);
			});
		}
	});
});
