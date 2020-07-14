import {CSSParsedDeclaration} from '../css/index';
import {ElementContainer, FLAGS} from './element-container';
import {TextContainer} from './text-container';
import {ImageElementContainer} from './replaced-elements/image-element-container';
import {CanvasElementContainer} from './replaced-elements/canvas-element-container';
import {SVGElementContainer} from './replaced-elements/svg-element-container';
import {LIElementContainer} from './elements/li-element-container';
import {OLElementContainer} from './elements/ol-element-container';
import {InputElementContainer} from './replaced-elements/input-element-container';
import {SelectElementContainer} from './elements/select-element-container';
import {TextareaElementContainer} from './elements/textarea-element-container';
import {IFrameElementContainer} from './replaced-elements/iframe-element-container';
//import {Bounds, parseBounds } from '../css/layout/bounds';

const LIST_OWNERS = ['OL', 'UL', 'MENU'];

const parseNodeTree = (node: Node, parent: ElementContainer, root: ElementContainer) => {
    for (let childNode = node.firstChild, nextNode; childNode; childNode = nextNode) {
        nextNode = childNode.nextSibling;

        if (isTextNode(childNode) && childNode.data.trim().length > 0) {
            parent.textNodes.push(new TextContainer(childNode, parent.styles));
        } else if (isElementNode(childNode)) {
            const container = createContainer(childNode);
            if (container.styles.isVisible()) {
                if (createsRealStackingContext(childNode, container, root)) {
                    container.flags |= FLAGS.CREATES_REAL_STACKING_CONTEXT;
                } else if (createsStackingContext(container.styles)) {
                    container.flags |= FLAGS.CREATES_STACKING_CONTEXT;
                }

                if (LIST_OWNERS.indexOf(childNode.tagName) !== -1) {
                    container.flags |= FLAGS.IS_LIST_OWNER;
                }

                parent.elements.push(container);
                if (!isTextareaElement(childNode) && !isSVGElement(childNode) && !isSelectElement(childNode)) {
                    parseNodeTree(childNode, container, root);
                }
            }
        }
    }
};


const parseNodeTreeVideo = (node: Node,oCanvas: Node, parent: ElementContainer, root: ElementContainer) => {
    for (let childNode = node.firstChild, nextNode; childNode; childNode = nextNode) {
        nextNode = childNode.nextSibling;

        if (isTextNode(childNode) && childNode.data.trim().length > 0) {
            parent.textNodes.push(new TextContainer(childNode, parent.styles));
        } else if (isElementNode(childNode)) {


            ///const container = createContainerVideo(childNode);

            return;
            // if (container.styles.isVisible()) {
            //     if (createsRealStackingContext(childNode, container, root)) {
            //         container.flags |= FLAGS.CREATES_REAL_STACKING_CONTEXT;
            //     } else if (createsStackingContext(container.styles)) {
            //         container.flags |= FLAGS.CREATES_STACKING_CONTEXT;
            //     }

            //     if (LIST_OWNERS.indexOf(childNode.tagName) !== -1) {
            //         container.flags |= FLAGS.IS_LIST_OWNER;
            //     }

            //     parent.elements.push(container);
            //     if (!isTextareaElement(childNode) && !isSVGElement(childNode) && !isSelectElement(childNode)) {
            //         parseNodeTreeVideo(childNode,oCanvas, container, root);
            //     }
            // }
        }
    }
};

// const createContainerVideo = (element: Element) => {


//     if(isVideoElement(element)){
//         console.log(element);
//     }

// };


const createContainer = (element: Element): ElementContainer => {
    if (isImageElement(element)) {
        return new ImageElementContainer(element);
    }

    if (isCanvasElement(element)) {
        return new CanvasElementContainer(element);
    }

    if (isSVGElement(element)) {
        return new SVGElementContainer(element);
    }

    if (isLIElement(element)) {
        return new LIElementContainer(element);
    }

    if (isOLElement(element)) {
        return new OLElementContainer(element);
    }

    if (isInputElement(element)) {
        return new InputElementContainer(element);
    }

    if (isSelectElement(element)) {
        return new SelectElementContainer(element);
    }

    if (isTextareaElement(element)) {
        return new TextareaElementContainer(element);
    }

    if (isIFrameElement(element)) {
        return new IFrameElementContainer(element);
    }

    if(isVideoElement(element)){

        //$(element).remove();

        // console.log($(element).parent())

        // console.log(parseBounds(element));

        // let bounds: Bounds = parseBounds(element);

        // console.log(bounds)

        // var canvas: HTMLCanvasElement;
        // canvas = document.createElement("canvas");
        // canvas.width = bounds.width;  //获取屏幕宽度作为canvas的宽度  这个设置的越大，画面越清晰（相当于绘制的图像大，然后被css缩小）
        // canvas.height = bounds.height;
        // console.log(canvas);
        // var context = canvas.getContext("2d") as CanvasRenderingContext2D;
        // context.drawImage($("#" + $(element).attr("id")).get(0), 0, 0, canvas.width, canvas.height);//绘制视频

        // $("body").append(canvas);
        // new CanvasElementContainer(canvas);

        
    }


    return new ElementContainer(element);
};

export const parseTree = (element: HTMLElement): ElementContainer => {
    const container = createContainer(element);
    container.flags |= FLAGS.CREATES_REAL_STACKING_CONTEXT;
    parseNodeTree(element, container, container);
    return container;
};

export const parseTreeVideo = (element: HTMLElement,oCanvas: HTMLElement): ElementContainer => {
    const container = createContainer(element);
    container.flags |= FLAGS.CREATES_REAL_STACKING_CONTEXT;
    parseNodeTreeVideo(element,oCanvas, container, container);
    return container;
};

const createsRealStackingContext = (node: Element, container: ElementContainer, root: ElementContainer): boolean => {
    return (
        container.styles.isPositionedWithZIndex() ||
        container.styles.opacity < 1 ||
        container.styles.isTransformed() ||
        (isBodyElement(node) && root.styles.isTransparent())
    );
};

const createsStackingContext = (styles: CSSParsedDeclaration): boolean => styles.isPositioned() || styles.isFloating();

export const isTextNode = (node: Node): node is Text => node.nodeType === Node.TEXT_NODE;
export const isElementNode = (node: Node): node is Element => node.nodeType === Node.ELEMENT_NODE;
export const isHTMLElementNode = (node: Node): node is HTMLElement =>
    typeof (node as HTMLElement).style !== 'undefined';
export const isSVGElementNode = (element: Element): element is SVGElement =>
    typeof (element as SVGElement).className === 'object';
export const isLIElement = (node: Element): node is HTMLLIElement => node.tagName === 'LI';
export const isOLElement = (node: Element): node is HTMLOListElement => node.tagName === 'OL';
export const isInputElement = (node: Element): node is HTMLInputElement => node.tagName === 'INPUT';
export const isHTMLElement = (node: Element): node is HTMLHtmlElement => node.tagName === 'HTML';
export const isSVGElement = (node: Element): node is SVGSVGElement => node.tagName === 'svg';
export const isBodyElement = (node: Element): node is HTMLBodyElement => node.tagName === 'BODY';
export const isCanvasElement = (node: Element): node is HTMLCanvasElement => node.tagName === 'CANVAS';
export const isImageElement = (node: Element): node is HTMLImageElement => node.tagName === 'IMG';
export const isIFrameElement = (node: Element): node is HTMLIFrameElement => node.tagName === 'IFRAME';
export const isStyleElement = (node: Element): node is HTMLStyleElement => node.tagName === 'STYLE';
export const isScriptElement = (node: Element): node is HTMLScriptElement => node.tagName === 'SCRIPT';
export const isTextareaElement = (node: Element): node is HTMLTextAreaElement => node.tagName === 'TEXTAREA';
export const isSelectElement = (node: Element): node is HTMLSelectElement => node.tagName === 'SELECT';
export const isVideoElement = (node: Element): node is HTMLVideoElement => node.tagName === 'VIDEO';
