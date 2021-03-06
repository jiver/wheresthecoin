if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, scene, renderer, projector;


var cupOffset = 200;

var state = 0;
var level = 0;
var forwardtime = [150,100,50];
var timeouttime = [1900,1300,800];
var speeds = [1500,1000,600];
var finished = false;

/*
0 - ready
1 - animating cups (swapping)
2 - choose cups
3 - animating cups (showing coin)

*/

var anim;
var randomStart;
var coinPos;




function startGame(){
        //cupCount = document.getElementById("cupCountInput").value;
//	alert(document.getElementById("cupCountInput").value);
        init();
        animate();
}
function init() {

        container = document.createElement( 'div' );
        document.body.appendChild( container );
        
        //creat scene
        scene = new THREE.Scene();
        
        
        //create camera
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 5, 3000 );
        camera.position.x = 0;
        if(cupCount >= 6){
                camera.position.y = (cupCount*cupOffset)/4;
                camera.position.z = (cupCount*cupOffset)-100;
        }else {
                camera.position.y = (cupCount*cupOffset)/4;
                camera.position.z = (cupCount*(cupOffset))+50;
        }
        scene.add( camera );

        var light, object, materials;
        
        //lights
        scene.add( new THREE.AmbientLight( 0x404040 ) );

        light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 0, 500, 20 );
        //light.target.position.set( 100, 100, 1 );
        light.castShadow = true;
        light.intensity = 1;
        light.shadowDarkness = 0.1;
        //light.shadowCameraVisible = true;
        scene.add( light );
        
        //add cups
        
        var mapA = THREE.ImageUtils.loadTexture( "cup2.jpg" );
        mapA.needsUpdate = true;
        
        for(i=0,pos=((cupCount/2)-0.5)*-1;i<cupCount;i++,pos++){
                object = new THREE.Mesh( 
                                        new THREE.CylinderGeometry( 50, 75, 150, 20, 2 ), 
                                        new THREE.MeshPhongMaterial( { 
                                                map: mapA, 
                                                ambient: 0xffffff, 
                                                specular: 0xffffff,
                                                wireframe: false, 
                                                shininess: 30, 
                                                shading: THREE.SmoothShading 
                                                } 
                                        ) 
                                );
                object.position.set( pos*cupOffset, 0, 0 );
                object.castShadow = true;
                object.receiveShadow = true;
                scene.add( object );		
                //alert(object.id);
        }
        
        //add coin
        var cointex = THREE.ImageUtils.loadTexture( "grass.jpg" );
        cointex.needsUpdate = true;
        coin = new THREE.Mesh( 
                        new THREE.CylinderGeometry( 35, 35, 10, 100, 5,false), 
                        new THREE.MeshPhongMaterial({
                                map: cointex,
                                color: 0xffff00,
                                ambient: 0xffff00, 
                                //wireframe: true, 
                                opacity: 1,
                                shading: THREE.SmoothShading 
                                }
                        )
                );
        coin.position.set(0, -50, 150);
        scene.add(coin);
        
        
        //add table
        var tableTexture = THREE.ImageUtils.loadTexture( "wood2.jpg" );
        tableTexture.needsUpdate = true;
        tableTop = new THREE.Mesh(
                        new THREE.CubeGeometry(cupCount*cupOffset , 50,500,1,1,1), 
                        new THREE.MeshPhongMaterial( {
                                map: tableTexture,
                                wireframe: false, 
                                ambient: 0xa0522d, 
                                specular: 0xffffff, 
                                shininess: 30,
                                reflectivity:100, 
                                shading: THREE.SmoothShading 
                                } 
                        ) 
                );
        tableTop.receiveShadow = true;
        tableTop.position.set(0,-100,0);
        scene.add( tableTop );	
        
        //add table body
        /*var tableBodyTexture = THREE.ImageUtils.loadTexture("wood1.jpg");
        tableBodyTexture.needsUpdate = true;
        tableBody = new THREE.Mesh(
                        new THREE.CubeGeometry(2900, 1, 2000,1,1,1),
                        new THREE.MeshPhongMaterial( {
                                map: tableBodyTexture,
                                wireframe: false, 
                                ambient: 0xa0522d, 
                                specular: 0xffffff, 
                                
                                shading: THREE.SmoothShading 
                                } 
                        )
                );
        tableBody.position.set(0,-600,-500);
        scene.add( tableBody );*/
        
        
        //light2
        var light2 = new THREE.DirectionalLight( 0xffffff );
        //light2.position.set( 0, 1000, 1000 );
        light2.intensity = 0.5;
        light2.castShadow = true;
        light2.shadowDarkness = 0.5;
        //light2.shadowCameraVisible = true;		
        scene.add( light2 );


        //light target
        
        var lightTarget = new THREE.Object3D();
        lightTarget.name = "lightTarget";
        light2.target = lightTarget;
        lightTarget.position.set(10,0,0);
        
        lightTarget.add( light2 );
        light2.position.set(0,700,0);
        scene.add( lightTarget );
        lightTarget.rotation.set(0,0.8,1);
        
        var textGeo = new THREE.TextGeometry( "Where's the Coin?", {

                size: 70,
                height: 50,
                curveSegments: 10,

                font: "helvetiker",
                weight: "bold",
                style: "normal",

                bevelThickness: 1,
                bevelSize: 2,
                bevelEnabled: true

        });

        var textMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000, specular: 0xffffff, ambient: 0xaa0000 } );
        textGeo.computeBoundingBox();
        var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

        var mesh = new THREE.Mesh( textGeo, textMaterial );
        mesh.position.x = centerOffset;
        mesh.position.z = -300;
        mesh.position.y = 200;

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add( mesh );
        
        projector = new THREE.Projector();
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;

        container.appendChild( renderer.domElement );

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.bottom = '0px';

        container.appendChild( stats.domElement );
        document.addEventListener("mousedown",onDocumentMouseClick,false);
        document.addEventListener("keydown",processkeys,false);
        document.addEventListener("mousemove",mouseMove,false);
        
        var loader = new THREE.UTF8Loader();

        loader.load( "hand.utf8", function( geometry ) { callbackModel( geometry, 450, 0xff8844, 300, 150, 70 ); },
                                 { scale: 0.815141, offsetX: -0.2, offsetY: -0.25, offsetZ: -0.416061 } );

}

function callbackModel( geometry, s, color, x, y, z ) {

        var material = new THREE.MeshLambertMaterial( { color: color, 
                //map: THREE.ImageUtils.loadTexture( "grid.jpg" ), 
                combine: THREE.MixOperation, reflectivity: 0.3 } 
                
                );
        //material.shading =  THREE.FlatShading;

        var mesh = new THREE.Mesh( geometry, material );

        mesh.position.set( x, y, z );
        mesh.scale.set( s, s, s );
        mesh.name = "hand";
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        //alert(mesh.name);
        scene.add( mesh);
        //alert(mesh.id);
        setTimeout("animateCups()",1000);
}

function processkeys(event){
        var key = event.which?event.which:event.keyCode;
//	alert("cathy panget");
/*	switch(key){
                case 87:
                        //alert(scene.children[4].position.x);
                        //cupCount = 3;
                        //init();
                        //animate();
                        showCoin();
                        
                        break;
                case 88:
                        
                        animateCups();
                        break;

        
        }*/

}

function mouseMove(event){
        if(state == 2){
                var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
                projector.unprojectVector( vector, camera );
                var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
                var intersects = ray.intersectObjects( scene.children );
                
                if ( intersects.length > 0 ) {
                        var move = false;
                        for(ci=3;ci<cupCount+3;ci++){
                                if(scene.children[ci] == intersects[ 0 ].object){
                                        scene.getChildByName("hand").position.x = intersects[ 0 ].object.position.x;
                                        //document.getElementById("pos").value = intersects[ 0 ].object.position.x;
                                }
                        }
                }
        }
}

function onDocumentMouseClick(event){
        if(state == 2){
                event.preventDefault();

                var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
                projector.unprojectVector( vector, camera );

                var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
                
                
                
                var intersects = ray.intersectObjects( scene.children );
                

                if ( intersects.length > 0 ) {
                        var move = false;
                        for(ci=3;ci<cupCount+3;ci++){
                                if(scene.children[ci] == intersects[ 0 ].object){
                                        liftCup(ci);   
                                        
                                        setTimeout("returnCup("+ci+")",1000);
                                        if(intersects[ 0 ].object == scene.children[randomStart]){
                                                
                                                state = 1;
                                                level++;
                                                $('#speedtext').val(level);
                                                if(level <3){
                                                        setTimeout('alert("Congatrualtions! Next Level: Faster Swapping")',1000);
                                                        setTimeout('animateCups()',2000);
                                                }else{
                                                        setTimeout('alert("Finished! :)")',1000);
                                                        finished = true;
                                                }
                                                
                                        }else {
                                                
                                                
                                                setTimeout('showCoin()',2000);
                                                level =0;
                                                state = 1;
                                                $('#speedtext').val(level);
                                        }
                                }
                        }
                }
        }
}



function animateCups(){
        scene.getChildByName("hand").position.set(300,150,70);
        
        randomStart = Math.round(Math.random()*(cupCount-1))+3;
        
        coinPos = 3+cupCount;
        state = 1;
        
        //position coin to random cup
        preAnimateCoin(coinPos,randomStart);
        //alert('aa');
        setTimeout("hideCoin("+coinPos+")",2500);
        
        for(i=0,offset=3000;i<cupCount+4;i++,offset+=timeouttime[level]){
                var first = Math.round(Math.random()*(cupCount-1));
                while(1){
                        var sec = Math.round(Math.random()*(cupCount-1));
                        if(first != sec) break;
                        
                }
                first += 3;
                sec += 3;
                setTimeout("swap("+first+","+sec+","+coinPos+","+randomStart+")",offset);
        }
        setTimeout("unhideCoin()",offset+1000);
        //setTimeout("",offset+1000);
}

function showCoin(){
        unhideCoin();
        for(i=0,offset=0;i<cupCount;i++,offset+=600){
                var indexcoin = i+3;
                setTimeout("liftCup("+indexcoin+")",offset);

                //setTimeout("swap("+first+","+sec+","+coinPos+","+randomStart+")",offset);
        }
        
        for(i=0,offset+2500;i<cupCount;i++){
                var indexcoin = i+3;
                setTimeout("returnCup("+indexcoin+")",offset);

                //setTimeout("swap("+first+","+sec+","+coinPos+","+randomStart+")",offset);
        }
        //setTimeout("returnCups()",offset+1000);
        setTimeout('alert("Sorry, try again! (Back to 0)")',offset+1000);
        setTimeout('animateCups()',offset+2000);

}

function returnCup(cup_index){
        var time = 1000;
        
        //move coin inside cup
        var positionCr = { y : 150};
        var targetCr = { y : 0};
        var liftcupr = new TWEEN.Tween(positionCr).to(targetCr, time);//.easing(easing);
                liftcupr.easing(TWEEN.Easing.Elastic.EaseInOut);
                liftcupr.onUpdate(function(){
                        scene.children[ cup_index ].position.y = positionCr.y;
                        scene.getChildByName("hand").position.y = positionCr.y;
                });
        liftcupr.start();
}

function liftCup(index){

        var time = 1000;
        scene.getChildByName("hand").position.x = scene.children[ index ].position.x;
        //move coin inside cup
        var positionC = { y : 0};
        var targetC = { y : 150};
        var liftcup = new TWEEN.Tween(positionC).to(targetC, time);//.easing(easing);
                liftcup.easing(TWEEN.Easing.Elastic.EaseInOut);
                liftcup.onUpdate(function(){
                        scene.children[ index ].position.y = positionC.y;
                        scene.getChildByName("hand").position.y = positionC.y;
                });
        liftcup.start();
}

function hideCoin(coin){
        scene.children[ coin ].position.y = -100;
}

function unhideCoin(){
        scene.children[ coinPos ].position.y = -50;
        scene.children[ coinPos ].position.x = scene.children[ randomStart ].position.x;
        scene.children[ coinPos ].position.z = 30;
        state = 2;
}

function preAnimateCoin(coin,cup){
        //alert(coin+" "+cup);
        scene.children[ coin ].position.x = scene.children[ cup ].position.x;
        //alert('aa');
        var time = 2000;
        
        //move coin inside cup
        var positionC = { z : 150};
        
        var targetC = { z : 0};
        
        var tweenCoin = new TWEEN.Tween(positionC).to(targetC, time);//.easing(easing);
                tweenCoin.easing(TWEEN.Easing.Elastic.EaseInOut);
                tweenCoin.onUpdate(function(){
                        scene.children[ coin ].position.z = positionC.z;
                });
                
        var move_prevC = {y:0 };
        var move_newC = {y:100 };
        var moveBackwardCup = new TWEEN.Tween(move_newC).to(move_prevC, 1100).easing(TWEEN.Easing.Elastic.EaseOut);
                
                moveBackwardCup.onUpdate(function(){
                        scene.children[ cup ].position.y = move_newC.y;
                });
        var moveForwardCup = new TWEEN.Tween(move_prevC).to(move_newC, 1100).easing(TWEEN.Easing.Elastic.EaseOut);
                moveForwardCup.onUpdate(function(){
                        scene.children[ cup ].position.y = move_prevC.y;
                });
        moveForwardCup.chain(moveBackwardCup);
        
        tweenCoin.start();
        moveForwardCup.start();
}

function swap(a,b,coin,coin_pos){
    
    var a_animation = createSwapTween( a, b );
    var b_animation = createSwapTween( b, a );
    
    a_animation.start();
    b_animation.start();
}


function createSwapTween( source_cup, destination_cup ) {
    var Z_BASE = {z:0 };
    var Z_OFFSET = {z:100 };
    
    var current_location = { x : scene.children[source_cup].position.x};
    var new_location = { x : scene.children[destination_cup].position.x};

    var swaptime = speeds[level]-200;
    
    if( Math.abs( current_location.x - new_location.x ) > 400 ){
        swaptime = speeds[level];
    }

    var moveBackward = new TWEEN.Tween(Z_OFFSET).to(Z_BASE, forwardtime[level]).easing(TWEEN.Easing.Elastic.EaseOut);        
    moveBackward.onUpdate(function(){
        scene.children[ source_cup ].position.z = Z_OFFSET.z;
    });

    var tween = new TWEEN.Tween(current_location).to(new_location, swaptime).easing(TWEEN.Easing.Elastic.EaseInOut);
    tween.onUpdate(function(){
        scene.children[ source_cup].position.x = current_location.x;
    });

    var moveForward = new TWEEN.Tween(Z_BASE).to(Z_OFFSET, forwardtime[level]).easing(TWEEN.Easing.Elastic.EaseOut);
    moveForward.onUpdate(function(){
        scene.children[ source_cup].position.z = Z_BASE.z;
    });
    
    tween.chain(moveBackward);
    moveForward.chain(tween);
    
    return moveForward;
}

function generateTexture() {

        var canvas = document.createElement( 'canvas' );
        canvas.width = 256;
        canvas.height = 256;

        var context = canvas.getContext( '2d' );
        var image = context.getImageData( 0, 0, 256, 256 );

        var x = 0, y = 0;

        for ( var i = 0, l = image.data.length; i < l; i += 4 ) {


                image.data[ i ] = 50;
                image.data[ i + 1 ] = 50;
                image.data[ i + 2 ] =255;
                image.data[ i + 3 ] = 255;

        }

        //context.putImageData( image, 0, 0 );
        //var img=new Image();
        //img.src="lavatile.jpg";
        //img.onload = function(){context.drawImage(img,0,0); };
        context.putImageData( image, 0, 0 );
        
        return canvas;

}

function animate() {

        requestAnimationFrame( animate );
        
        render();
        stats.update();

}

function render() {
        if(finished){
                var timer = Date.now() * 0.0001;

                camera.position.x = Math.cos( timer ) * 800;
                camera.position.z = Math.sin( timer ) * ((cupCount*(cupOffset))+50);
        }
        camera.lookAt( scene.position );
/*
        for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

                var object = scene.children[ i ];

                object.rotation.x += 0.01;
                object.rotation.y += 0.005;

        }*/

        renderer.render( scene, camera );
        TWEEN.update();

}
