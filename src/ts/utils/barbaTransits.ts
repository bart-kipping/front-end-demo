import { ITransitionData } from "@barba/core";
import gsap, { Power2 } from "gsap";
import { ImgStoreElement } from "../../../declare";
import { filterNonTargets, getMatrix } from "./calculate";

export function leaveIndexAni(data: ITransitionData) {
    // target page
    const target = data.next.url.path.split("/")[1];

    // elements to animate
    const filtered = filterNonTargets(
        data.current.container.querySelectorAll(".project"),
        target
    );
    const teaserTekst = data.current.container
        .querySelector(`#${target}`)
        .querySelector(".teaser-tekst");
    const button = data.current.container
        .querySelector(`#${target}`)
        .querySelector("a");
    const currentTitle = data.current.container
        .querySelector(`#${target}`)
        .querySelector("h1");
    const nextTitle = data.next.container
        .querySelector(`#${target}`)
        .querySelector("h1");
    const linkButton = data.next.container
        .querySelector(`#${target}`)
        .querySelector("a");
    gsap.set(nextTitle, { visibility: "hidden" });
    gsap.set(linkButton, { visibility: "hidden" });

    const currentOffset = getMatrix(
        data.current.container.querySelector(`div[data-scroll]`)
    ).y;
    const targetOffset = data.current.container
        .querySelector(`#${target}`)
        .getBoundingClientRect().top;
    const deltaOffset = currentOffset - targetOffset;

    // timeline
    const tl = gsap.timeline();

    tl.fromTo(
        data.current.container.querySelector("div[data-scroll]"),
        {
            transform: `translate3d(0px,${currentOffset}px,0px)`,
        },
        {
            transform: `translate3d(0px, ${deltaOffset}px, 0px)`,
            duration: 0.5,
        },
        0.0
    )
        .to(
            data.next.container.querySelector("div[data-scroll]"),
            {
                paddingTop: `0px`,
                duration: 0,
            },
            0.0
        )
        .to(
            teaserTekst,
            {
                opacity: 0,
            },
            0
        )
        .set(
            data.next.container.querySelector(".project-tekst"),
            {
                opacity: 0,
            },
            0
        )
        .to(
            currentTitle,
            {
                fontSize: "30rem",
                color: "black",
                duration: 0.95,
                ease: Power2.easeIn,
            },
            0
        )
        .to(
            button,
            {
                opacity: 1,
            },
            0.5
        )
        .from(
            data.next.container.querySelector("div[data-scroll]"),
            {
                translateY: targetOffset,
                duration: 0.5,
            },
            0
        )
        .to(
            filtered,
            {
                scale: 0,
                duration: 0.2,
            },
            0
        )
        .set(linkButton, {
            visibility: "visible",
        });

    return tl;
}

export function enterFromIndexAni(data: ITransitionData) {
    const projectTekst = data.next.container.querySelector(".project-tekst");
    const target = data.next.url.path.split("/")[1];

    // timeline
    const tl = gsap.timeline();
    return tl
        .fromTo(
            projectTekst,
            {
                scaleY: 0,
                x: -0,
                opacity: 0,
            },
            {
                transformOrigin: "top center",
                scaleY: 1,
                x: -0,
                opacity: 1,
                duration: 0.8,
                ease: Power2.easeInOut,
            },
            0
        )
        .to(
            data.next.container,
            {
                transform: `translate3d(-10vw, ${0}px, 0px)`,
            },
            0
        );
}

export function toIndexAni(
    data: ITransitionData,
    imageStore: ImgStoreElement[]
) {
    const target = data.current.url.path.split("/")[1];
    const filtered = filterNonTargets(
        data.next.container.querySelectorAll(".project"),
        target
    );
    const teaserTekst = data.next.container
        .querySelector(`#${target}`)
        .querySelector(".teaser-tekst");
    const button = data.next.container
        .querySelector(`#${target}`)
        .querySelector("a");
    const currentTitle = data.current.container
        .querySelector(`#${target}`)
        .querySelector("h1");
    const nextTitle = data.next.container
        .querySelector(`#${target}`)
        .querySelector("h1");
    gsap.set(nextTitle, { visibility: "hidden" });

    const currentOffset = getMatrix(
        data.current.container.querySelector(`div[data-scroll]`)
    ).y;
    const targetOffset = data.next.container
        .querySelector(`#${target}`)
        .getBoundingClientRect().top;
    window.scrollTo({ top: targetOffset - window.innerHeight * 0.2 });

    imageStore.forEach((target: ImgStoreElement) => {
        target.mesh.visible = true;
    });

    // timeline
    const tl = gsap.timeline();
    tl.fromTo(
        data.current.container.querySelector("div[data-scroll]"),
        {
            transform: `translate3d(0px,${currentOffset}px,0px)`,
        },
        {
            transform: `translate3d(0px, ${window.innerHeight * 0.2}px, 0px)`,
            duration: 0.8,
            ease: Power2.easeIn,
        },
        0
    )
        .set(
            data.next.container.querySelector("div[data-scroll]"),
            {
                transform: `translate3d(0px,${-targetOffset + window.innerHeight * 0.2}px,0px)`,
            },
            0
        )
        .to(
            currentTitle,
            {
                fontSize: "2rem",
                color: "white",
            },
            0
        )
        .set(
            filtered,
            {
                scale: 0,
            },
            0
        )
        .to(data.current.container, {
            transform: `translate3d(0vw, ${0}px, 0px)`,
        });

    return tl;
}
