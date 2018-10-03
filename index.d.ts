// Type definitions for ufo.js 0.0.2
// Project: https://github.com/simoncozens/glyphs.js
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.1
export as namespace glyphs;

/******************************************
 * FONT
 ******************************************/

export class Font {
    unitsPerEm: number;
    masters: { [key:string]:Master }
    fontVersion: string;
    userData: any;
}

export class Master {
    readonly defaultRenderOptions: RenderOptions;
    font: Font;
    glyphs: { [key:string]:Glyph }

    constructor(options: FontConstructorOptions);

    stringToGlyphs(s: string): Glyph[];
    getKerningValue(
        leftGlyph: Glyph | string,
        rightGlyph: Glyph | string
    ): number | null;

    draw(
        ctx: CanvasRenderingContext2D,
        text: string,
        x?: number,
        y?: number,
        fontSize?: number,
        options?: RenderOptions
    ): void;

    forEachGlyph(
        text: string,
        x: number | undefined,
        y: number | undefined,
        fontSize: number | undefined,
        options: RenderOptions | undefined,
        callback: (
            glyph: Glyph,
            x: number,
            y: number,
            fontSize: number,
            options?: RenderOptions
        ) => void
    ): number;

    getAdvanceWidth(
        text: string,
        fontSize?: number,
        options?: RenderOptions
    ): number;
}

export type FontConstructorOptions = {
    empty?: boolean;
}

/******************************************
 * GLYPH
 ******************************************/

export class Glyph {
    name: string;
    master: Master;
    advanceWidth: number;

    constructor(options: any, master: Master, name: string);

    load(): Promise<Glyph>;
    draw(
        ctx: CanvasRenderingContext2D,
        x?: number,
        y?: number,
        fontSize?: number,
        options?: RenderOptions
    ): void;
    getPath(
        x?: number,
        y?: number,
        fontSize?: number,
        options?: RenderOptions
    ): Path;
}

export interface RenderOptions {
    script?: string;
    language?: string;
    kerning?: boolean;
    xScale?: number;
    yScale?: number;
    features?: {
        [key: string]: boolean;
    };
}

/******************************************
 * PATH
 ******************************************/

export class Path {
    private fill;
    private stroke;
    private strokeWidth;
    constructor();
    bezierCurveTo(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x: number,
        y: number
    ): void;
    close: () => void;
    closePath(): void;
    commands: PathCommand[];
    curveTo: (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x: number,
        y: number
    ) => void;
    draw(ctx: CanvasRenderingContext2D): void;
    extend(pathOrCommands: Path | PathCommand[] | BoundingBox): void;
    getBoundingBox(): BoundingBox;
    lineTo(x: number, y: number): void;
    moveTo(x: number, y: number): void;
    quadraticCurveTo(x1: number, y1: number, x: number, y: number): void;
    quadTo: (x1: number, y1: number, x: number, y: number) => void;
    toDOMElement(decimalPlaces: number): SVGPathElement;
    toPathData(decimalPlaces: number): string;
    toSVG(decimalPlaces: number): string;
    unitsPerEm: number;
}

export interface PathCommand {
    type: string;
    x?: number;
    y?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
}

/******************************************
 * UTIL CLASSES
 ******************************************/

export type BoundingBox = () => any;
// TODO add methods
export interface Encoding {
    charset: string;
    charToGlyphIndex(c: string): number;
    font: Font;
}

export type Substitution = (font: Font) => any;
// TODO add methods
/******************************************
 * STATIC
 ******************************************/
export interface FontLoadingOptions {
    loadFn: (url: string) => Promise<string>
}

export function load(
    url: string,
    callback: (error: any, font?: Font) => void,
    options?: FontLoadingOptions
): void;

export function loadSync(
    url: string
): Font;
