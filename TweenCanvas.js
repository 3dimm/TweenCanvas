'use strict';
var TweenCanvas = {
    
    defaults:{
        width:0,
        height:0,
        fill:0,
        canvas:0,
        tempCanvas:0,
        ctx:0,
        tempctx:0,
        paused:false,
        objects:[],
        preload:[],
        idCount:0
    },
  
    create: function(_width,_height,_fill) {
        
        /* Constructor */
        
        var _this=this;
        this.defaults.width=_width;
        this.defaults.height=_height;
        if (_fill) this.defaults.fill=_fill;
        this.defaults.canvas = document.createElement('canvas');
        this.defaults.tempCanvas = document.createElement('canvas');
        this.defaults.canvas.width  = _width;
        this.defaults.canvas.height = _height;
        this.defaults.canvas.style.position = "absolute";
        this.defaults.tempCanvas.width  = _width;
        this.defaults.tempCanvas.height = _height;
        this.defaults.ctx = this.defaults.canvas.getContext("2d");
        this.defaults.tempctx = this.defaults.tempCanvas.getContext("2d");
        this.rafFix();
        
        return this.defaults.canvas;
    },
    
    rafFix: function() {
        
        /* polyfill requestanimationframe */
        
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame =
            window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        };

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };  
    },
    
    extend: function (obj, src) {
        
        /* Extend the default object with creation settings */
        
        for (var key in src) {
            if (typeof src[key] ==='object' && !Array.isArray(src[key])) {              
                for (var subkey in src[key]) {
                    if (src[key].hasOwnProperty(subkey)) obj[key][subkey] = src[key][subkey];
                }  
            }
            else {
                if (src.hasOwnProperty(key)) obj[key] = src[key];
            }
        }
        return obj;
    },
    
    createEmptyObject: function(prefs) {
        
        /* Create and return default object with initial sttings */
        
        var obj = {
            id:0,
            x:0,
            y:0,
            scaleX:1,
            scaleY:1,
            centerX:0,
            centerY:0,
            transformOrigin:'',
            rotation:0,
            alpha:1,
            mask:[],
            invertMask:false,
            blendmode:'source-over',
            filter:'none'
        };
        if (prefs.imageObj)     obj.imageObj={url:0,src:0};
        if (prefs.pointObj)     obj.pointObj={points:[],closePath:true,fill:{color:'white'},stroke:0};
        if (prefs.textObj)      obj.textObj={text:0,font:'Arial',fontSize:10,lineHeight:0,textWidth:0,textHeight:0,textAlign:'left',lines:[],fill:{color:'white'},stroke:0,fontLoaded:0,bitmapText:0,bitMap:0};
        if (prefs.arcObj)       obj.arcObj={radius:0,startAngle:0,endAngle:0,counterclockwise:false,stroke:{color:'white',width:0}};
        obj = this.extend(obj, prefs || {});
        return obj;
    },

    createObject: function(prefs) {
        
        /* Create default object with initial settings */
        
        var obj = this.createEmptyObject(prefs);
        
        /* if object is type of image push image to preloadArray */
        
        if (obj.imageObj || obj.textObj) this.defaults.preload.push(obj);
        else this.calcCenter(obj);
        
        /* If no object-ID is set generate unique object-ID */
        
        if (!obj.id) obj.id=this.defaults.idCount++;
        if (obj.textObj) {
            obj.textObj.lines=obj.textObj.text.split('<br>');
            if (!obj.textObj.lineHeight) obj.textObj.lineHeight=obj.textObj.fontSize;
        }
        
        /* store object in objects-array */
        
        this.defaults.objects.push(obj);
        return obj;
    },
    
    deleteObject: function(obj) {
        
        /* search for object and remove it from objects-array */
        
        for (var i=0;i<this.defaults.objects.length;i++) {
            if (this.defaults.objects[i].id === obj.id) {
                this.defaults.objects.splice(i,1);
                break;
            }
        }
    },
    
    setMask: function (obj,maskObj) {
        
        /* push maskObj to maskArray of object and remove it from objects-array */
        
        var _this = this;
        for (var i=0;i<this.defaults.objects.length;i++) {
            if (this.defaults.objects[i].id === maskObj.id) {
                obj.mask.push(this.defaults.objects.splice(i,1)[0]);
                break;
            }
        }
    },
    
    preload: function (callback) {
        var _this = this;
        if (this.defaults.preload.length) {
            var obj = this.defaults.preload.pop();
            if (obj.imageObj) {
                var img = new Image();
                img.onload = function () {
                   obj.imageObj.src=this;
                    _this.calcCenter(obj);
                    _this.preload(callback);
                };
                img.onerror = function () {
                    console.warn('Image doesnt exist: '+ this.src);
                    _this.preload(callback);
                };
                img.src = obj.imageObj.url;
            }
            if (obj.textObj) {
                var measureObj=this.createTextMeasuringObj(obj);
                document.body.appendChild(measureObj);
                var timer=setInterval(function(){ 
                    _this.defaults.ctx.font = obj.textObj.fontSize + 'pt ' + obj.textObj.font;
                    if (_this.fontLoaded(measureObj,obj.textObj.font)) {
                        clearInterval(timer);
                        obj.textObj.textWidth=measureObj.clientWidth;
                        obj.textObj.textHeight=measureObj.clientHeight;
                        obj.textObj.fontLoaded=true;
                        document.body.removeChild(measureObj);
                        if (obj.textObj.bitmapText) {
                            _this.defaults.tempCanvas.width  = obj.textObj.textWidth;
                            _this.defaults.tempCanvas.height = obj.textObj.textHeight;
                            var tempObj = {
                                id:0,
                                x:0,
                                y:0,
                                scaleX:1,
                                scaleY:1,
                                centerX:0,
                                centerY:0,
                                rotation:0,
                                alpha:1,
                                textObj:obj.textObj
                            };
                            _this.drawObject(tempObj,_this.defaults.tempctx);
                            var img = new Image();
                            img.src = _this.defaults.tempCanvas.toDataURL();
                            obj.textObj.bitMap=img;
                            _this.defaults.tempctx.clearRect(0,0,_this.defaults.width,_this.defaults.height);
                            _this.defaults.tempCanvas.width=_this.defaults.width;
                            _this.defaults.tempCanvas.height=_this.defaults.height;
                        }
                        _this.calcCenter(obj);
                        _this.preload(callback);
                    }                         
                }, 100);
                
            }
        }
        else if (callback) callback();
    },
    
    calcCenter: function(obj) {
        
        /* calculate objects pivot for scale/rotation transformation by its bounding box and transformOrigin */
        
        var _this = this;
        if (obj.pointObj) {
            var len = obj.pointObj.points.length, maxX = -Infinity, maxY = -Infinity, minX = Infinity, minY = Infinity;
            while (len--) {
                if (obj.pointObj.points[len][0] > maxX) maxX = obj.pointObj.points[len][0];
                if (obj.pointObj.points[len][1] > maxY) maxY = obj.pointObj.points[len][1];
                if (obj.pointObj.points[len][0] < minX) minX = obj.pointObj.points[len][0];
                if (obj.pointObj.points[len][1] < minY) minY = obj.pointObj.points[len][1];
            }
            obj.centerX=(maxX+minX)/2;
            obj.centerY=(maxY+minY)/2;
            if (obj.transformOrigin) this.setTransformOrigin(obj);
        }
        if (obj.arcObj) {
            obj.centerX=obj.centerY=obj.arcObj.radius/2;
            if (obj.transformOrigin) this.setTransformOrigin(obj);
        }
        if (obj.imageObj) {
            obj.centerX=obj.imageObj.src.width/2;
            obj.centerY=obj.imageObj.src.height/2;
            if (obj.transformOrigin) this.setTransformOrigin(obj);
        }
        if (obj.textObj) {
            obj.centerX=obj.textObj.textWidth/2;
            obj.centerY=obj.textObj.textHeight/2;
            if (obj.transformOrigin) this.setTransformOrigin(obj);
        }
    },
    
    createTextMeasuringObj: function(obj) {
        
        /* create temporary dom-object for text width and height calculation  */
        
        var span = document.createElement("span");
        span.style.width = 'auto';
        span.style.height = "auto";
        span.style.display = 'inline-block';
        span.style.whiteSpace = 'nowrap';
        span.style.position = "absolute";
        span.style.fontFamily = obj.textObj.font;
        span.style.fontSize = obj.textObj.fontSize + 'pt';
        span.style.lineHeight = obj.textObj.lineHeight + 'pt';
        span.style.top = "-3000px";
        span.style.left = "-3000px";
        span.style.color = "black";
        span.style.border = "1px solid red";   
        span.innerHTML = obj.textObj.text;
       return span; 
    },
    
    setTransformOrigin: function(obj) {
        var str = obj.transformOrigin.replace(/%/gi,'');
        var vals = str.split(' ');
        if (vals.length == 2 && !isNaN(Number(vals[0])) && !isNaN(Number(vals[1]))) {
            obj.centerX = (Number(vals[0])/100)*obj.centerX*2;
            obj.centerY = (Number(vals[1])/100)*obj.centerY*2;
        }
        else {
            console.warn('transformOrigin values incorrect: ' + obj.transformOrigin);
        }
    },
    
    fontLoaded: function(obj,fontName) {
        var fbFonts = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'];  
        var actFont = 0;
        var prevFont = 0;

        for(var i=0;i<fbFonts.length;++i)
            {
                obj.style.fontFamily = '"' + fontName + '",' + fbFonts[i];
                actFont = obj.offsetWidth;
                if (i > 0 && actFont != prevFont) return false;
                prevFont = actFont;
            }
            return true;
    },
    
    clear: function() {
        this.defaults.ctx.clearRect(0,0,this.defaults.width,this.defaults.height);
    },
    
    listObjects: function() {
        for (var i=0;i<this.defaults.objects.length;i++) {
            console.log(this.defaults.objects[i]);
        }
    },

    render: function() {
        if(this.defaults.paused) return;
        var _this = this;
        this.clear();
        this.defaults.ctx.save();
        if (this.defaults.fill) {
            this.defaults.ctx.fillStyle = this.defaults.fill;
            this.defaults.ctx.fillRect(0, 0, this.defaults.width, this.defaults.height);
        }
        this.defaults.ctx.restore();
        for (var i=0;i<this.defaults.objects.length;i++) {
            this.defaults.ctx.save();
            if (this.defaults.objects[i].mask.length) {
                this.defaults.tempctx.clearRect(0,0,this.defaults.width,this.defaults.height);
                this.defaults.objects[i].mask.forEach(function (element, i) { 
                    _this.defaults.tempctx.save();
                    _this.drawObject(element,_this.defaults.tempctx);
                    _this.defaults.tempctx.restore();
                }); 
                if (this.defaults.objects[i].invertMask) this.defaults.tempctx.globalCompositeOperation="source-out";
                else this.defaults.tempctx.globalCompositeOperation="source-in";
                this.defaults.tempctx.save();
                this.drawObject(this.defaults.objects[i],this.defaults.tempctx);
                this.defaults.tempctx.restore();
                this.defaults.ctx.globalCompositeOperation = this.defaults.objects[i].blendmode;
                this.defaults.ctx.drawImage(this.defaults.tempCanvas,0,0);
                this.defaults.tempctx.globalCompositeOperation = "source-over";
                this.defaults.ctx.globalCompositeOperation = "source-over";
            }
            else {
                this.defaults.ctx.globalCompositeOperation = this.defaults.objects[i].blendmode;
                this.defaults.ctx.filter=this.defaults.objects[i].filter;
                this.drawObject(this.defaults.objects[i],this.defaults.ctx);
                this.defaults.ctx.filter='none';
                this.defaults.ctx.globalCompositeOperation = "source-over";
            }
            this.defaults.ctx.restore();
        }
        
        window.requestAnimationFrame(this.render.bind(this));
    },
    
    drawObject: function(obj,target) {
        target.translate(obj.x+obj.centerX,obj.y+obj.centerY);
        target.rotate(obj.rotation*Math.PI/180);    
        target.scale(obj.scaleX,obj.scaleY);
        target.translate(-obj.centerX,-obj.centerY);
        target.globalAlpha = obj.alpha;
        if (obj.pointObj) {
            target.beginPath();
            target.moveTo(obj.pointObj.points[0][0],obj.pointObj.points[0][1]);
            for (var p=1;p<obj.pointObj.points.length;p++) {
                target.lineTo(obj.pointObj.points[p][0],obj.pointObj.points[p][1]);
            }
            if (obj.pointObj.closePath) target.closePath();
            if (obj.pointObj.fill) {
                if (obj.pointObj.fill.gradient) target.fillStyle=this.gradient(obj.pointObj.fill.gradient,target);
                else target.fillStyle = obj.pointObj.fill.color;
                target.fill();
            }
            if (obj.pointObj.stroke) {
                if (obj.pointObj.stroke.gradient) target.strokeStyle=this.gradient(obj.pointObj.fill.gradient,target);
                else target.strokeStyle = obj.pointObj.stroke.color;
                target.lineWidth = obj.pointObj.stroke.width;
                target.stroke();
            }
        }
        if (obj.arcObj) {
            target.beginPath();
            target.arc(0,0,obj.arcObj.radius,(obj.arcObj.startAngle/180)*Math.PI,(obj.arcObj.endAngle/180)*Math.PI,obj.arcObj.counterclockwise);
            if (obj.arcObj.fill) {
                if (obj.arcObj.fill.gradient) target.fillStyle=this.gradient(obj.arcObj.fill.gradient,target);
                else target.fillStyle = obj.arcObj.fill.color;
                target.fill();
            }
            if (obj.arcObj.stroke) {
                if (obj.arcObj.stroke.gradient) target.strokeStyle=this.gradient(obj.arcObj.stroke.gradient,target);
                else target.strokeStyle = obj.arcObj.stroke.color;
                target.lineWidth = obj.arcObj.stroke.width;
                target.stroke();
            }
        }
        if (obj.textObj && obj.textObj.fontLoaded) {
            if (!obj.textObj.bitMap) {
                target.font = obj.textObj.fontSize + 'pt ' + obj.textObj.font;
                target.textBaseline = "alphabetic";
                target.textAlign=obj.textObj.textAlign; 

                if (obj.textObj.fill) {
                    target.fillStyle = obj.textObj.fill.color;
                }
                if (obj.textObj.stroke) {
                    target.strokeStyle = obj.textObj.stroke.color;
                    target.lineWidth = obj.textObj.stroke.width;
                }
                obj.textObj.lines.forEach(function(line, i) {
                    if (obj.textObj.fill) {
                        if (obj.textObj.textAlign==='left') target.fillText(line, 0, (i+1.25) * obj.textObj.lineHeight);
                        if (obj.textObj.textAlign==='center') target.fillText(line, obj.textObj.textWidth/2, (i+1) * obj.textObj.lineHeight);
                        if (obj.textObj.textAlign==='right') target.fillText(line, obj.textObj.textWidth, (i+1) * obj.textObj.lineHeight);
                    }
                    if (obj.textObj.stroke) {
                        if (obj.textObj.textAlign==='left') target.strokeText(line, 0, (i+1.25) * obj.textObj.lineHeight);
                        if (obj.textObj.textAlign==='center') target.strokeText(line, obj.textObj.textWidth/2, (i+1) * obj.textObj.lineHeight);
                        if (obj.textObj.textAlign==='right') target.strokeText(line, obj.textObj.textWidth, (i+1) * obj.textObj.lineHeight);
                    }
                });
            }
            else target.drawImage(obj.textObj.bitMap,0,0,obj.textObj.bitMap.width,obj.textObj.bitMap.height);
        }
        if (obj.imageObj) {
            target.drawImage(obj.imageObj.src,0,0,obj.imageObj.src.width,obj.imageObj.src.height);
        }
    },
    
    gradient: function(obj,target) {
        var grd;
        if (obj.type == 'radial') {
            grd=target.createRadialGradient(obj.startX,obj.startY,obj.startRadius,obj.endX,obj.endY,obj.endRadius);
            obj.colorStop.forEach(function (element, i) { 
                grd.addColorStop(obj.colorStop[i][0],obj.colorStop[i][1]);      
            });                                           
        }
        if (obj.type == 'linear') {
            grd=target.createLinearGradient(obj.startX,obj.startY,obj.endX,obj.endY);
            obj.colorStop.forEach(function (element, i) { 
                grd.addColorStop(obj.colorStop[i][0],obj.colorStop[i][1]);      
            });                                           
        }
        return grd;
    },
    
    pause: function() {
        this.defaults.paused=true;
        window.cancelAnimationFrame(this.render);
    },
    
    start: function() {
        this.defaults.paused=false;
        window.requestAnimationFrame(this.render.bind(this));
    }
};
    