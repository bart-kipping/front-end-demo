// Three imports
import { Scene, Camera, Mesh, LinearFilter, Texture, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Raycaster, ShaderMaterial, Vector2, WebGL1Renderer, DoubleSide } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OrbitControls } from "three/examples/jsm/controls/orbitcontrols.js";
import * as THREE from "three";

// Utils import
import { FovfromHeight } from "./utils/calculate";
import * as imagesLoaded from "imagesloaded";
import Scroll from "./scroll";

// shaders
import fragment from "../glsl/fragment.glsl";
import vertex from "../glsl/vertex.glsl";
import screenSpaceVert from '../glsl/screenSpaceVert.glsl'
import screenSpaceFrag from '../glsl/screenSpaceFrag.glsl'

// types
import { ImgStoreElement, screenSpaceFX } from "../../declare";

export default class Sketch {
    scene: Scene;
    wrapper: HTMLDivElement;
    width: number;
    height: number;
    initHeigth: number;
    deltaHeight: number;

    cameraDist: number;
    fov: number;
    camera: PerspectiveCamera;
    controls: OrbitControls;

    material: ShaderMaterial;
    materials: ShaderMaterial[];
    composer: EffectComposer;
    renderPass: RenderPass;
    screenSpaceFX: screenSpaceFX;
    screenSpacePass: ShaderPass;
    renderer: WebGL1Renderer;

    images: HTMLImageElement[];
    imageStore: ImgStoreElement[];

    scroll: Scroll;
    currentScroll: number;
    raycaster: Raycaster;
    mouse: Vector2;

    time: number;

    constructor(pars: { dom: HTMLElement, images?: HTMLImageElement[] }) {
        this.time = 0;

        this.setCanvas(pars.dom);
        this.setCamera(100);
        this.setRender();
        this.setControls(this.camera, false, false, false);

        this.preloadImages().then(() => {
            console.log('webGL ready for take-off');
            this.scroll = new Scroll()
            this.fillImageStore();
            this.syncImagery();
            this.onResize();
            this.mouseMovement();
            this.renderScreenSpacePass();
            this.render();
        })
    }


    setCanvas(wrapper: HTMLElement): void {
        this.scene = new Scene();
        this.wrapper = wrapper as HTMLDivElement;
        this.width = this.wrapper.offsetWidth;
        this.height = this.wrapper.offsetHeight;
        this.initHeigth = window.innerHeight;
    }
    setCamera(distance: number): void {
        this.cameraDist = distance;
        this.fov = FovfromHeight({
            height: this.height,
            camDistance: this.cameraDist,
        });
        this.camera = new PerspectiveCamera(
            this.fov,
            this.width / this.height,
            0.1,
            10000
        );
        this.camera.position.set(0, 0, this.cameraDist)
    }
    setRender(): void {
        this.renderer = new WebGL1Renderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.wrapper.appendChild(this.renderer.domElement);
    }
    setControls(cam: Camera, zoom: boolean, rotate: boolean, pan: boolean): void {
        // webGL
        this.controls = new OrbitControls(cam, this.renderer.domElement);
        this.controls.enableZoom = zoom;
        this.controls.enableRotate = rotate;
        this.controls.enablePan = pan;

        // DOM
        this.currentScroll = 0;
        this.raycaster = new Raycaster();
        this.mouse = new Vector2();
    }
    preloadImages(): Promise<unknown> {
        const preloadImages = new Promise((resolve, reject) => {
            imagesLoaded(
                document.querySelectorAll("img"),
                { background: true },
                resolve
            );
        });
        return preloadImages
    }
    onResize(): void {
        window.addEventListener("resize", this.resize.bind(this));
    }
    resize(): void {
        document.querySelector<HTMLElement>("#wrapper").style.height = `${document.querySelector("body").offsetHeight
            }px`;
        this.width = this.wrapper.offsetWidth;
        this.height = this.wrapper.offsetHeight;
        this.renderer.setSize(this.width, this.height);

        this.camera.fov = this.fov = FovfromHeight({
            height: this.height,
            camDistance: this.cameraDist,
        });
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.syncImagery()

    }
    mouseMovement(): void {
        window.addEventListener(
            "mousemove",
            (e) => {
                this.mouse.x = (e.clientX / this.width) * 2 - 1;
                this.mouse.y = -(e.clientY / this.height) * 2 + 1;

                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObjects(this.scene.children);

                if (intersects.length > 0) {
                    let obj = intersects[0].object as Mesh;
                    let mat = obj.material as ShaderMaterial;
                    mat.uniforms.uHover.value = intersects[0].uv;
                }
            },
            false
        );
    }
    fillImageStore(): void {
        this.images = [...document.images]

        this.material = new ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                uImage: { value: 0 },
                uHover: { value: new Vector2(0.5, 0.5) },
                uHoverState: { value: 0 },
                uClick: { value: 0 },
                scrollSpeed: { value: null },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            side: DoubleSide,
            // wireframe: true,
            alphaTest: 0.1,
        });

        this.materials = [];
        this.imageStore = this.images.map((img) => {
            let bounds = document.getElementById(img.alt) ? document.getElementById(img.alt).querySelector('img').getBoundingClientRect() : {
                img: img,
                mesh: Mesh,
                top: 0,
                left: 0,
                width: 0,
                height: 0,
            };
            let geometry = new PlaneGeometry(
                bounds.width,
                bounds.height,
                10,
                10,

            );
            let parent = img.parentNode as HTMLElement
            geometry.name = parent.id;

            let texture = new Texture(img);
            texture.needsUpdate = true;
            texture.minFilter = LinearFilter;
            texture.generateMipmaps = true;



            let material = this.material.clone();

            material.transparent = true;
            material.uniforms.uImage.value = texture;

            this.materials.push(material);

            let mesh = new Mesh(geometry, material);
            mesh.rotation.x = 0;
            this.scene.add(mesh);

            return {
                img: img,
                mesh: mesh,
                top: bounds.top,
                left: bounds.left,
                width: bounds.width,
                height: bounds.height,
            };
        });
    }
    updateImageStore(container: HTMLElement): void {
        let currentImages = this.imageStore;
        let wantedImages = container.querySelectorAll('img');
        currentImages.length < 3 &&
            wantedImages.forEach((img: HTMLImageElement) => {
                currentImages.forEach((cImg: any) => {
                    if (img.alt !== cImg.img.alt) {
                        this.images = [
                            ...this.images,
                            container.querySelector(`img[alt=${img.alt}]`),
                        ];
                        let bounds = img.getBoundingClientRect();
                        let geometry = new PlaneGeometry(
                            bounds.width,
                            bounds.height,
                            30,
                            10
                        );
                        const parent = img.parentNode as HTMLElement;
                        geometry.name = parent.id;
                        let texture = new Texture(img);
                        texture.needsUpdate = true;
                        texture.minFilter = LinearFilter;
                        texture.generateMipmaps = true;
                        let material = this.material.clone();

                        material.transparent = true;
                        material.uniforms.uImage.value = texture;
                        this.materials.push(material);
                        let solid = new MeshBasicMaterial({
                            color: 0xff0000,
                            //map: texture,
                        });
                        let mesh = new Mesh(geometry, material);
                        // mesh.visible = false;
                        // img.style.scale = '0';
                        this.scene.add(mesh);
                        const newImgData = {
                            img: img,
                            mesh: mesh,
                            top: bounds.top,
                            left: bounds.left,
                            width: bounds.width,
                            height: bounds.height,
                        };
                        this.imageStore = [...this.imageStore, newImgData];
                    }
                })

            })
    }
    syncImagery(): void {
        this.imageStore.forEach((o: ImgStoreElement) => {
            let bounds = o.img.getBoundingClientRect()
            o.mesh.position.y = - bounds.top + (this.height / 2 - bounds.height / 2);
            o.mesh.position.x = bounds.left - this.width / 2 + bounds.width / 2;
            o.mesh.scale.x = bounds.width / o.width;
            o.mesh.scale.y = bounds.height / o.height;
        });
    }
    syncImageryToDetail(targetID: string, ref: HTMLImageElement): void {
        this.imageStore.forEach((o: ImgStoreElement) => {
            let bounds = ref.getBoundingClientRect()
            if (targetID === o.mesh.geometry.name) {
                o.mesh.position.y = - bounds.top + (this.height / 2 - bounds.height / 2);
                o.mesh.position.x = bounds.left - this.width / 2 + bounds.width / 2;
                o.mesh.scale.x = bounds.width / o.width;
                o.mesh.scale.y = bounds.height / o.height;
            }
        });
    }
    syncImageryToIndex(data: HTMLElement): void {
        this.imageStore.forEach((o: ImgStoreElement) => {
            let bounds = data.querySelector(`img[alt=${o.img.alt}]`).getBoundingClientRect()
            o.mesh.position.y = - bounds.top + (this.height / 2 - bounds.height / 2);
            o.mesh.position.x = bounds.left - this.width / 2 + bounds.width / 2;
            o.mesh.scale.x = bounds.width / o.width;
            o.mesh.scale.y = bounds.height / o.height;
        });

    }
    renderScreenSpacePass(): void {
        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        this.screenSpaceFX = {
            uniforms: {
                tDiffuse: { value: null },
                scrollSpeed: { value: null },
            },
            vertexShader: screenSpaceVert,
            fragmentShader: screenSpaceFrag,
        };

        this.screenSpacePass = new ShaderPass(this.screenSpaceFX);
        this.screenSpacePass.renderToScreen = true;

        this.composer.addPass(this.screenSpacePass);
    }
    render(): void {
        this.scroll.render();

        this.time += 0.005;
        this.materials.forEach((m) => {
            m.uniforms.time.value = this.time;
            m.uniforms.scrollSpeed.value = this.scroll.speedTarget;

        });
        this.screenSpacePass.uniforms.scrollSpeed.value = this.scroll.speedTarget;
        this.composer.render();

        requestAnimationFrame(this.render.bind(this));
    }
}