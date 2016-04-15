/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([
    'dojo/Evented',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dijit/_WidgetBase',
    'dijit/_OnDijitClickMixin',
    'dijit/_TemplatedMixin',
    'dojo/on',
    'dojo/text!./UploadForm.html',
    'dojo/dom-class',
    'dojo/dom-style',
    'dojo/dom-construct',
    'dojo/dom-attr'
],
function(Evented,
declare,lang,
    _WidgetBase,_OnDijitClickMixin,_TemplatedMixin,
    on,dijitTemplate,domClass,domStyle,domConstruct,domAttr) 
{
    var Widget = declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, Evented],
    {
        declaredClass: "esri.dijit.UploadForm",
        templateString : dijitTemplate,
        readers: [],
		finished : 0,
        options : {
            map: null,
            visible: true,
            progress : true,
            drag_drop: true,
        },
		_css : {
			form_container: "uploadFormContainer",
			upload_form: "uploadForm",
			file_input: "uploadFormInput",
			button_container: "uploadFormSubmitContainer",
			submit_button: "uploadFormSubmitButton",
			iframe: "uploadFormIframe",
			drop_zone: "dragDropZone"
        },
        constructor : function(options) {
            declare.safeMixin(this.options, options);
            this.domNode = domConstruct.create("div", {innerHTML:this.templateString});
            this.set('map', this.options.map);
            this.set('visible', this.options.visible);
            this.set('drag_drop', this.options.drag_drop);
            this.set('callback', this.options.callback);
            this.set('progress',this.options.progress);
        },
        startup : function() {
            if(!this.map) {
                this.destroy();
            }
            if(this.map.loaded) {
                this._init();
            } else {
                on(this.map, "load", lang.hitch(this, function() {
                    this._init();
                }));
            }
        },
        destroy : function() {
            this.inherited(arguments);
        },
        _getFilesList: function(event) {
            var files;
            if(typeof event.originalEvent !== "undefined") {
                if(typeof event.originalEvent.dataTransfer !== "undefined") {
                    files = event.originalEvent.dataTransfer.files;
                } 
            } else if(typeof event.dataTransfer !== "undefined") {
                files = event.dataTransfer.files;
            } else if(typeof event.target.files !== "undefined") {
                files = event.target.files;
            } else {
              files = [];
            }
            return files;
        },
        _createReaders: function(event) {
            if(window.File && window.FileReader && window.FileList && window.Blob) {
              var out = [];
              var files = this._getFilesList(event);
			  this.readers = [];
			  this.finished = 0;
              for(var i =0, f; f=files[i]; i++) {
                var reader = new FileReader();
                this.readers.push(reader);
                this._bindReaderListeners(f,reader);
                reader.readAsText(f);
              }
            } else {
              throw "Operation not supported by browser.";
            }
        },
        _onProgress : function() {
            domStyle.set(this._buttonContainer, "display","none");
            domStyle.set(this._dropZone, "display","none");
            domStyle.set(this._fileInput, "display","none");
        },
        _bindInputHandler : function() {
            var _t = this;
            on(this._fileInput, "change", function(event) {
                _t._createReaders(event);
                domAttr.set(_t._fileInput,"value","");
				_t.emit("upload-started", {});
                _t._formNode.reset();
            });
        },
        _bindDragDropHandler : function() {
            var that = this;
            on(this._dropZone, "dragenter", function(event) {
                event.preventDefault();
                event.stopPropagation();
            });
            on(this._dropZone, "dragleave", function(event) {
                event.preventDefault();
                event.stopPropagation();
            });
            on(this._dropZone, "dragover", function(event) {
                event.preventDefault();
                event.stopPropagation();
            });
            on(this._dropZone, "drop", function(event) {
                event.preventDefault();
                event.stopPropagation();
                that._createReaders(event);
            });
        },
        _bindReaderListeners : function(f,reader) {
            var progress = this.get("progress");
            var that = this;
            reader.onload = (function(file) {
              return function(evt) {
                var content = evt.target.result;
				that.finished++;
				that.emit("uploadFinished", {file: file, content: content});
                if(progress) {
                    that.emit("progress", { file: file, progress: 100});
                }
				if(that.finished === that.readers.length) {
					that.emit("allUploadsFinished", {});
				}
                domStyle.set(that._dropZone, "display","block");
                domStyle.set(that._fileInput, "display","block");
              };
            })(f);
            if(progress) {
              reader.onloadstart = (function(file) {
                return function(evt) {
                  that.emit("progress",{progress: 0,file:file});
                };
              })(f);
            }
            if(progress) {
              reader.onprogress = (function(file) {
                return function(evt) {
                  var percent = Math.round(100*(evt.target.loaded/evt.target.total));
                  if(isNaN(percent)) {
                    percent = 0;
                  }
                  that.emit("progress",{progress: percent,file:file});
                };
              })(f);
           }
        },
        postCreate : function() {
            this._bindInputHandler();
            if(this.get('drag_drop')) {
                this._bindDragDropHandler();
            }
        },
        _init: function() {
            this._visible();
            this.set("loaded", true);
            this.emit("load",{});
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
