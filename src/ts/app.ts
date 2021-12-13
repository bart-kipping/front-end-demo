require("../style/style.scss");
import Sketch from "./webGL";
import barba, { ITransitionData } from "@barba/core";
import barbaPrefetch from "@barba/prefetch";
import gsap from "gsap";
import { filterNonTargets } from "./utils/calculate";

import { enterFromIndexAni, leaveIndexAni, toIndexAni } from "./utils/barbaTransits";
import { ShaderMaterial } from "three";
import { ImgStoreElement } from "../../declare";
console.warn("app is geactiveerd!");


// set listeners
const setListeners = (container: Document | HTMLElement) => {
  container.querySelectorAll("img").forEach((img: HTMLImageElement) => {
    img.addEventListener("mouseenter", (e) => {
      let x = e.target as HTMLImageElement

      webGL.imageStore.forEach((imgGL: ImgStoreElement) => {
        let mat = imgGL.mesh.material as ShaderMaterial;

        imgGL.mesh.geometry.name === x.alt &&
          gsap.to(mat.uniforms.uHoverState, {
            duration: 0.6,
            value: 1,
            ease: "power3.inout",
          });
      });
    });
    img.addEventListener("mouseleave", (e) => {
      let x = e.target as HTMLImageElement

      webGL.imageStore.forEach((imgGL: ImgStoreElement) => {
        let mat = imgGL.mesh.material as ShaderMaterial
        imgGL.mesh.geometry.name === x.alt &&
          gsap.to(mat.uniforms.uHoverState, {
            duration: 0.6,
            value: 0,
            ease: "power2.inout",
          });
      });
    });
    img.addEventListener("mousedown", (e) => {
      let x = e.target as HTMLImageElement
      const tl = gsap.timeline();
      webGL.imageStore.forEach((imgGL: ImgStoreElement) => {
        let mat = imgGL.mesh.material as ShaderMaterial;
        if (imgGL.mesh.geometry.name === x.alt) {
          tl.to(mat.uniforms.uClick, {
            duration: 0.6,
            value: (mat.uniforms.uClick.value + 1) % 2,
            ease: "power3.inout",
          })
            .to(imgGL.mesh.rotation, { x: -.1, duration: .3 }, .1)
        }
        // currentSlug != x.alt && barba.go(`/${x.alt}`)
      });
    });
  });
};
setListeners(document);

history.scrollRestoration = "manual";

let webGL: Sketch;
webGL = new Sketch({ dom: document.getElementById("wrapper") });
document.addEventListener("scroller", () => webGL.syncImagery());

barba.use(barbaPrefetch);

barba.init({
  transitions: [
    {
      name: "fromIndex",
      to: {
        namespace: ["strepen", "stippen", "sterren"],
      },
      sync: true,

      beforeLeave(data) {
        const target = data.next.url.path.split("/")[1];
        document.removeEventListener("scroller", () => webGL.syncImagery());
        webGL.scroll.ease = 1;
        window.scrollTo({ top: 0 })
        webGL.scroll.DOM.scrollable = data.next.container.querySelector("div[data-scroll]");

        return leaveIndexAni(data);
      },

      leave() {
        webGL.scroll.ease = 0.062;
      },

      afterLeave(data) {
        const target = data.next.url.path.split("/")[1];
        setListeners(data.next.container);
        document.addEventListener("scroller", () =>
          webGL.syncImageryToDetail(
            target,
            data.next.container.querySelector(`#${target}`).querySelector("img")
          )
        );
      },

      enter(data) {
        webGL.scroll.setSize()
        enterFromIndexAni(data)
      },
      afterEnter(data) {
        const target = data.next.url.path.split("/")[1];

        const nextTitle = data.next.container.querySelector(`#${target}`).querySelector('h1');
        gsap.set(nextTitle, { visibility: 'visible' })
      }
    },
    {
      name: "toIndex",
      from: {
        namespace: ["sterren", "strepen", "stippen"],
      },

      leave(data) {
        const target = data.current.url.path.split("/")[1];

        gsap.to(data.current.container.querySelector('.project-tekst'), { scale: 30, y: 3000, duration: 100 })
        gsap.to(data.current.container.querySelector('.project-tekst'), { opacity: 0, duration: 3 })
        gsap.set(data.next.container.querySelector(`#${target}`).querySelector('p'), { visibility: 'hidden' })
        gsap.set(data.next.container.querySelector(`#${target}`).querySelector('a'), { visibility: 'hidden' })


      },
      beforeEnter(data): void {
        webGL.updateImageStore(data.next.container)
      },

      enter(data): any {
        setListeners(data.next.container);
        document.removeEventListener("scroller", () => webGL.syncImagery());

        webGL.scroll.ease = 1;
        webGL.scroll.DOM.scrollable = data.next.container.querySelector("div[data-scroll]");
        webGL.scroll.setSize()

        return toIndexAni(data, webGL.imageStore);
      },

      afterEnter(data) {
        const target = data.current.url.path.split("/")[1];
        document.addEventListener("scroller", () => webGL.syncImageryToIndex(data.next.container))

        const newProjects = filterNonTargets(data.next.container.querySelectorAll('.project'), target)
        gsap.fromTo(newProjects, { scale: 0 }, { scale: 1 })

        const nextTitle = data.next.container.querySelector(`#${target}`).querySelector('h1');
        gsap.set(nextTitle, { visibility: 'visible' })
        gsap.set(data.next.container.querySelector(`#${target}`).querySelector('p'), { visibility: 'visible' })
        gsap.set(data.next.container.querySelector(`#${target}`).querySelector('a'), { visibility: 'visible' })
      },

      after(data) {
        const target = data.current.url.path.split("/")[1];
        webGL.scroll.ease = 0.062;
      },
    },
  ],
});



// landing setup
// function fadeOutIntro() {
//   gsap.fromTo(
//     document.querySelector("#welkomstDiv"),
//     { opacity: 1 },
//     { opacity: 0, duration: 3, ease: Power2.easeInOut },
//     0.3
//   );
//   document.querySelector("#welkomstDiv").style.pointerEvents = "none";
// }