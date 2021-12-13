import { Mesh } from "three"

declare module '*.png';
declare module '*.jpg';

declare interface ImgStoreElement {
    img: HTMLImageElement,
    mesh: Mesh,
    top: number,
    left: number,
    width: number,
    height: number,
}

declare interface screenSpaceFX {
    vertexShader: string,
    fragmentShader: string,
    uniforms: {
        tDiffuse: {
            value: number;
        },
        scrollSpeed: {
            value: number;
        }
    },
}