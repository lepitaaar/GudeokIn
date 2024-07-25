import { Quill } from "react-quill-new";

const ImageBlot: any = Quill.import("formats/image");

class CustomImageBlot extends ImageBlot {
    static create(value: {
        url: string;
        width?: string;
        height?: string;
        alt?: string;
        loading?: "lazy" | "eager";
        decoding?: "async" | "sync" | "auto";
    }) {
        const node = super.create(value.url) as HTMLElement;
        node.setAttribute("src", value.url);
        if (value.width) {
            node.setAttribute("width", value.width);
        }
        if (value.height) {
            node.setAttribute("height", value.height);
        }
        if (value.alt) {
            node.setAttribute("alt", value.alt);
        }
        if (value.loading) {
            node.setAttribute("loading", value.loading);
        }
        if (value.decoding) {
            node.setAttribute("decoding", value.decoding);
        }
        return node;
    }

    static value(node: HTMLElement) {
        return {
            url: node.getAttribute("src"),
            width: node.getAttribute("width"),
            height: node.getAttribute("height"),
            alt: node.getAttribute("alt"),
            loading: node.getAttribute("loading"),
            decoding: node.getAttribute("decoding"),
        };
    }
}

CustomImageBlot.blotName = "customImage";
CustomImageBlot.tagName = "img";
Quill.register(CustomImageBlot);

export default CustomImageBlot;
