define([
    'dojo/_base/declare',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidgetSetting',
	'dojo/dom-attr'
  ],
function(
    declare,
    _WidgetsInTemplateMixin,
    BaseWidgetSetting,
	domAttr
) {
	return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], { 
		baseClass: 'jimu-widget-demo-setting',
		postCreate: function(){
		  //the config object is passed in
		  this.inherited(arguments);
		  console.log(this.config);
		  this.setConfig(this.config);
		  domAttr.set(this.polygonFillR, "value", this.config.polygon.color[0]);
		  domAttr.set(this.polygonFillG, "value", this.config.polygon.color[1]);
		  domAttr.set(this.polygonFillB, "value", this.config.polygon.color[2]);
		  domAttr.set(this.polygonFillA, "value", this.config.polygon.color[3]);
		  
		  domAttr.set(this.polygonOutlineR, "value", this.config.polygon.outline.color[0]);
		  domAttr.set(this.polygonOutlineG, "value", this.config.polygon.outline.color[1]);
		  domAttr.set(this.polygonOutlineB, "value", this.config.polygon.outline.color[2]);
		  domAttr.set(this.polygonOutlineA, "value", this.config.polygon.outline.color[3]);
		  
		  domAttr.set(this.pointFillR, "value", this.config.point.color[0]);
		  domAttr.set(this.pointFillG, "value", this.config.point.color[1]);
		  domAttr.set(this.pointFillB, "value", this.config.point.color[2]);
		  domAttr.set(this.pointFillA, "value", this.config.point.color[3]);
		  
		  domAttr.set(this.pointOutlineR, "value", this.config.point.outline.color[0]);
		  domAttr.set(this.pointOutlineG, "value", this.config.point.outline.color[1]);
		  domAttr.set(this.pointOutlineB, "value", this.config.point.outline.color[2]);
		  domAttr.set(this.pointOutlineA, "value", this.config.point.outline.color[3]);
		  
		  domAttr.set(this.attributeName, "value", this.config.defaultTypeAttribute.attributeName)
		  domAttr.set(this.attributeValue, "value", this.config.defaultTypeAttribute.attributeValue);
		  
		},

		setConfig: function(config){
		  this.config = config;
		},

		getConfig: function(){
		  //WAB will get config object through this method
		  this.config.polygon.color[0] = this.polygonFillR.value;
		  this.config.polygon.color[1] = this.polygonFillG.value;
		  this.config.polygon.color[2] = this.polygonFillB.value;
		  this.config.polygon.color[3] = this.polygonFillA.value;
		  
		  this.config.polygon.outline.color[0] = this.polygonOutlineR.value;
		  this.config.polygon.outline.color[1] = this.polygonOutlineG.value;
		  this.config.polygon.outline.color[2] = this.polygonOutlineB.value;
		  this.config.polygon.outline.color[3] = this.polygonOutlineA.value;
		  
		  this.config.point.color[0] = this.pointFillR.value;
		  this.config.point.color[1] = this.pointFillG.value;
		  this.config.point.color[2] = this.pointFillB.value;
		  this.config.point.color[3] = this.pointFillA.value;
		  
		  this.config.point.outline.color[0] = this.pointOutlineR.value;
		  this.config.point.outline.color[1] = this.pointOutlineG.value;
		  this.config.point.outline.color[2] = this.pointOutlineB.value;
		  this.config.point.outline.color[3] = this.pointOutlineA.value;
		  
		  this.config.defaultTypeAttribute.attributeName = this.attributeName.value;
		  this.config.defaultTypeAttribute.attributeValue = this.attributeValue.value;
		  return this.config;
		}
	});
});