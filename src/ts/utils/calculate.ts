interface FovProps {
    height: number,
    camDistance: number
}

export function FovfromHeight(par: FovProps) {
    const fov = 2 * Math.atan(par.height / 2 / par.camDistance) * (180 / Math.PI);
    return fov;
}

export function getMatrix(element: any) {
    const values = element.style.transform.split(/\w+\(|\);?/);
    const transform = values[1].split(/,\s?/g).map(parseFloat);

    return {
        x: transform[0],
        y: transform[1],
        z: transform[2]
    };
}

export function filterNonTargets(all: NodeListOf<HTMLElement>, target: String) {
    let filtered: HTMLElement[] = []
    all.forEach(element => {
        if (element.id !== target) {
            filtered = [...filtered, element]
        }
    });
    return filtered
}

