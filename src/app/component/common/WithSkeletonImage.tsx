import React from "react";
import Image from "next/image";

interface IProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    fill?: boolean;
    className?: string;
}

const blurDataURL =
    "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg==";

const WithSkeletonImage = ({
    src,
    alt,
    width,
    height,
    fill,
    className,
}: IProps) => (
    <Image
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        placeholder="blur"
        blurDataURL={blurDataURL}
        fill={fill}
    />
);

export default WithSkeletonImage;
