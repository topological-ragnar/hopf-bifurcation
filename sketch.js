const $ = require('jquery')
const THREE = require('three')
OrbitControls = require('three-orbit-controls')
const dat = require('dat.gui')
const loop = require('raf-loop')
const WindowResize = require('three-window-resize')
const { timers } = require('jquery')


class Sketch {

    constructor() {
        this.gui = new dat.GUI()
        this.params = this.gui.addFolder('parameters');
        this.gui.show()
        this.params.a = 0
        this.params.b = 1
        this.params.c = 0
        // this.params.d = 0
        this.params.speed = 0.1
        this.gui.add(this.params, 'a', -10, 10, 0.1);
        this.gui.add(this.params, 'b', -10, 10, 0.1);
        // this.gui.add(this.params, 'c', -10, 10, 0.1);
        this.gui.add(this.params, 'c', -10, 10, 0.1);
        this.gui.add(this.params, 'speed', 0, 1,0.01);
        var self = this
        // var button = { reset: self.resetParticles };

        this.gui.add(this, 'resetParticles');
        this.gui.add(this, 'toggleFade');
        
        this.fade = 0.03

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        // this.projector = new THREE.Projector()
        this.renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true })
        this.renderer.autoClearColor = false
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        var windowResize = new WindowResize(this.renderer, this.camera)

        var fadeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: this.fade
        });
        var fadePlane = new THREE.PlaneBufferGeometry(20, 20);
        this.fadeMesh = new THREE.Mesh(fadePlane, fadeMaterial);
        // Create Object3D to hold camera and transparent plane
        var camGroup = new THREE.Object3D();
        var camera = new THREE.PerspectiveCamera();
        camGroup.add(camera);
        camGroup.add(this.fadeMesh);

        // Put plane in front of camera
        this.fadeMesh.position.z = -0.1;

        // Make plane render before particles
        this.fadeMesh.renderOrder = -1;

        // Add camGroup to scene
        this.scene.add(camGroup);
        
        this.clock = new THREE.Clock();
        this.clock.getDelta();

        var geometry = new THREE.BoxGeometry(2,1,1);
        // var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var material = new THREE.MeshNormalMaterial()
        // this.cube = new THREE.Mesh(geometry, material);
        // this.scene.add(this.cube);
        this.camera.position.z = 5

        // this.numCubes = 0
        // this.cubes = []
        // for(var i = 0; i < this.numCubes; i++){
        //     this.cubes.push(new THREE.Mesh(geometry, material))
        //     this.scene.add(this.cubes[i])
        // }


        const map = new THREE.TextureLoader().load('textures/sprite.png');
        const spritematerial = new THREE.SpriteMaterial({ map: map, color: 0xffffff });

        var graphMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
        this.graph = new THREE.BufferGeometry()
        var line = new THREE.Line(this.graph, graphMaterial)
        this.scene.add(line)


        this.sprites = []
        this.trails = []
        this.trailPoints = []
        this.numSprites = 20
        this.spacing = 3
        for (var i = 0; i < this.numSprites; i++){
            for (var j = 0; j < this.numSprites; j++){
                const sprite = new THREE.Sprite(spritematerial);
                sprite.scale.set(0.03, 0.03, 1)
                this.scene.add(sprite)
                this.sprites.push(sprite)
                sprite.position.x = i / this.spacing - this.numSprites / (this.spacing * 2)
                sprite.position.y = j / this.spacing - this.numSprites / (this.spacing * 2)
                sprite.position.z = 0
            }
        }
        this.nextSprite = 0
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);



        // var axis = new THREE.BufferGeometry()
        // var points = []
        // for (var i = -50; i < 50; i++) {
        //     points.push(new THREE.Vector3(i / 5, 0, 0))
        // }
        // axis.setFromPoints(points)
        var axisMaterial = new THREE.LineDashedMaterial({
            color: 0x0fe0ee,
            linewidth: 1,
            scale: 1,
            dashSize: 3,
            gapSize: 2})
        // var axisObject = new THREE.Line(axis,axisMaterial)
        // this.scene.add(axisObject)

        // this.discrim = new THREE.BufferGeometry()
        // var points = []
        // for (var i = -50; i < 50; i++) {
        //     points.push(new THREE.Vector3(
        //         Math.sqrt(Math.abs(this.params.a/this.params.b)) * Math.cos(i /49 * Math.PI),
        //         Math.sqrt(Math.abs(this.params.a/this.params.b)) * Math.sin(i /49 * Math.PI),
        //         0
        //     ))
        // }
        // this.discrim.setFromPoints(points)
        // this.discrimObject = new THREE.Line(this.discrim, axisMaterial)
        // this.scene.add(this.discrimObject)
        // this.paramPoint = new THREE.Sprite(spritematerial)
        // this.paramPoint.scale.set(0.1, 0.1, 1)
        // this.scene.add(this.paramPoint)

        document.addEventListener('mousedown', (event) => {

            event.preventDefault();

            // console.log(1 - 2 * event.clientY / window.innerHeight)

            var vector = new THREE.Vector3(
                2 * event.clientX / window.innerWidth - 1,
                 1 - 2 * event.clientY / window.innerHeight,
                  0.5
                  ).unproject(self.camera);

            // vector.normalize()
            vector.sub(self.camera.position).normalize()

            vector.multiplyScalar(-5/vector.z)
                
            self.sprites[self.nextSprite].position.x = vector.x
            self.sprites[self.nextSprite].position.y = vector.y
            self.nextSprite++
            self.nextSprite = self.nextSprite % (self.numSprites * self.numSprites)
        }
            , false);

    }

    start() {
        $(window).on('load', () => {
            $('#loading-screen').hide()
            console.log('it begins!')
        })
        loop((dt) => {
            this.render()
            // if (this.environment.controls) {
            //     this.environment.controls.update(dt)
            // }
        }).start()
    }

    toggleFade(){
        if (this.fade > 0) {
            this.fade = 0
        } else {
            this.fade = 0.03
        }
        this.fadeMesh.material.opacity = this.fade
    }

    resetParticles(){
        // console.log(this.numSprites)
        for (var i = 0; i < this.numSprites; i++) {
            // console.log('meow')
            for (var j = 0; j < this.numSprites; j++){
                var index = i*this.numSprites+j
                this.sprites[index].position.x = i / this.spacing - this.numSprites / (this.spacing * 2)
                this.sprites[index].position.y = j / this.spacing - this.numSprites / (this.spacing * 2)
            }
        }
    }

    xpotential(x,y) {
        return this.params.c + (this.params.a) * x - this.params.b * y -  x * (x * x + y * y) 
    }

    ypotential(x,y) {
        return this.params.a * y + this.params.b * x - y * (x * x + y * y)
    }

    setGraph() {
        var points = []
        for (var i = -50; i < 50; i++) {
            points.push(new THREE.Vector3(
                Math.sqrt(Math.abs(this.params.a/this.params.b)) * Math.cos(i /49 * Math.PI),
                Math.sqrt(Math.abs(this.params.a/this.params.b)) * Math.sin(i /49 * Math.PI),
                0
            ))
        }
        this.discrim.setFromPoints(points)
        this.discrimObject.visible = true
    }

    render() {
        // requestAnimationFrame(this.animate);
        var dt = this.clock.getDelta()*this.params.speed;

        this.renderer.render(this.scene, this.camera);

        // if(this.params.b < 0 && this.params.a > 0 || this.params.b > 0 && this.params.a < 0){
        //     this.setGraph()
        // } else {
        //     this.discrimObject.visible = false
        // }

        // this.paramPoint.position.x = this.params.a/10-3
        // this.paramPoint.position.y = this.params.b/ 10 - 3

        this.sprites.forEach(sprite => {

        })
        for (var i = 0; i < this.numSprites * this.numSprites; i++){
            var x = this.sprites[i].position.x
            var y = this.sprites[i].position.y
            this.sprites[i].position.x += dt*this.xpotential(x,y)
            this.sprites[i].position.y += dt * this.ypotential(x, y)
            // if(Math.abs(this.potential(x))< this.params.speed){
            //     this.sprites[i].position.x = i / this.spacing - this.numSprites / (this.spacing * 2)
            // }
        }
        // this.controls.update();

        // this.updateTrails()

        
    }
    

}

module.exports = Sketch
