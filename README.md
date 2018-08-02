# TweenCanvas
Use the canvas element the same way as working with DOM-elements and your preferred tween library. Easily create objects, animate their properties and don't worry about canvas drawing, context-transformation and font-loading.

# Usage
Download the [library](https://raw.githubusercontent.com/3dimm/TweenCanvas/master/TweenCanvas.min.js) and include it in your code:

```html
<script src="js/TweenCanvas.min.js"></script>
```

Include your preferred tween library. In this example [TweenLite](https://greensock.com/) is doing the job.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.19.1/TweenLite.min.js"></script>
```

```html
<script>

/* Initialize and append TweenCanvas */

var myCanvas = TweenCanvas.create(400,400,'black');
document.body.appendChild(myCanvas);

/* Create objects as needed */

var bg = TweenCanvas.createObject({
    imageObj:{
        url:"images/myBg.jpg"
    }
});
        
var pointObject = TweenCanvas.createObject({
    x:150,
    y:150,
    pointObj:{
        points:[[0,0],[100,0],[100,100],[0,100]]
    }
});

/* Wait for images/fonts being loaded */

TweenCanvas.preload(startAnimation);

/* Animate object attributes  */

function startAnimation() {
    TweenCanvas.start();
    TweenLite.to(pointObject,2,{scaleX:2,scaleY:2,rotation:90,ease:Power2.easeIn});
    TweenLite.to(pointObject,2,{scaleX:1,scaleY:1,rotation:0,ease:Power2.easeOut,delay:2,onComplete:startAnimation});
}

</script>

```

## Methods

| Methods  | Discription | Return |
| :------------ | :------------ | :------------ |
| TweenCanvas.create( width, height, fillColor )        | Create new TweenCanvas | Canvas |
| TweenCanvas.createObject( {ObjectParams} )              | Create new TweenCanvas object with specified params | Object |
| TweenCanvas.deleteObject( object )                  | Delete object from being rendered | null |
| TweenCanvas.listObjects()                         | Log all objects in the console | null |
| TweenCanvas.setMask( object, maskobject )                  | Set maskobject as mask of object | null |
| TweenCanvas.preload( callback )                  | Preload images and call callback function when done | null |
| TweenCanvas.start()                  | Starts rendering | null |
| TweenCanvas.pause()                  | Pause rendering | null |

## {ObjectParams} 

| {ObjectParams}        | Discription                           | Type      | Default       |
| :------------     | :------------                         | :-------- | :------------ |
| x                 | Object position X                            | Number    | 1             |
| y                 | Object position Y                            | Number    | 1             |
| scaleX            | Object scale X                               | Number    | 1             |
| scaleY            | Object scale Y                               | Number    | 1             |
| rotation          | Object rotation in degrees                    | Number    | 0             |
| alpha             | Object alpha value                           | Number    | 1             |
| transformOrigin   | Object transform origin 'X Y'                | String    | '0.5 0.5'     |
| invertMask   | Invert masking of object                | Boolean    | false     |
| blendmode   | Set blendmode of object - not all ie compatible                | String    | empty     |
| filter   | Set object filter - no ie, safari, opera               | String    | empty     |
| {textObj}           | Object for displaying text            | Object    | null          |
| {pointObj}          | Object for drawing lines & shapes     | Object    | null          |
| {arcObj}             | Object for drawing arcs and circles   | Object    | null          |
| {imageObj}           | Object for drawing images             | Object    | null          |

## {textObj} 

| {textObj}           | Discription                           | Type      | Default       |
| :------------     | :------------                         | :-------- | :------------ |
| text              | The text to be shown                            | String    | empty             |
| font              | If you want to use a webfont be sure to define it in css file                           | String    | 'Arial'             |
| fontSize          | Font size in px                               | Number    | 10             |
| lineHeight        | Line height in px                              | Number    | 10             |
| textAlign         | Align of text                    | String    | 'left'            |
| bitmapText        | Draw text as bitmap                   | Boolean   | false            |
| {fill}              | Object with fill propertys                  | Object   | {color:'white'}            |
| {stroke}              | Object with stroke propertys                  | Object   | null            |

## {pointObj} 

| pointObj           | Discription                           | Type      | Default       |
| :------------     | :------------                         | :-------- | :------------ |
| points              | Array of point-arrays eg [[0,0],[10,0],[5,10]]                          | Array    | empty             |
| closePath              |                            | Boolean    | false             |          |
| {fill}              | Object with fill propertys                  | Object   | {color:'white'}            |
| {stroke}              | Object with stroke propertys                  | Object   | null            |

## {arcObj} 

| {arcObj}           | Discription                           | Type      | Default       |
| :------------     | :------------                         | :-------- | :------------ |
| radius              | Array of point-arrays eg [[0,0],[10,0],[5,10]]                          | Array    | empty             |
| startAngle              | Angle to start in degrees                           | Number    | 0             |          |
| endAngle              | Angle to end in degrees                  | Number   | 0           |
| counterclockwise              | Draw clockwise or counterclockwise                  | Boolean   | false            |
| {fill}             | Object with fill propertys                  | Object   | {color:'white'}            |
| {stroke}              | Object with stroke propertys                  | Object   | null            |

## {imageObj} 

| {imageObj}           | Discription                           | Type      | Default       |
| :------------     | :------------                         | :-------- | :------------ |
| url              | Path to the image                          | String    | empty             |

## {fill} 

| {fill}           | Discription                           | Type      | Default       |
| :------------     | :------------                         | :-------- | :------------ |
| color              | Color of fill - name or hex                          | String    | 'white'             |
| {gradient}              | Object with gradient propertys                          | Object    | null             |

## {stroke} 

| {stroke}           | Discription                           | Type      | Default       |
| :------------     | :------------                         | :-------- | :------------ |
| color              | Color of stroke -  name or hex                          | String    | 'white'             |
| width              | Linewidth                          | Number    | 1            |
| {gradient}              | Object with gradient propertys                          | Object    | null             |

## {gradient}

| {gradient}           | Discription                           | Type      | Default       |
| :------------     | :------------                         | :-------- | :------------ |
| type              | Type of gradient - linear / radial                          | String    |             |
| startX              | X-Coordinate to start                          | Number    |             |
| startY             | Y-Coordinate to start                        | Number    |             |
| startRadius             | Radius at start (radial only)                        | Number    |             |
| endX            | X-Coordinate to end                        | Number    |             |
| endY             | Y-Coordinate to end                        | Number    |             |
| endRadius             | Radius at end (radial only)                        | Number    |             |
| colorStop             | Array of stops eg [[0,'blue'],[1,'red']]                        | Array    |             |
