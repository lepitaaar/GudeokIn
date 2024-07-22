import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { randomInt } from "crypto";
import { uploadFile } from "@/app/lib/r2";

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
]);

async function processImage(file: Blob): Promise<Buffer> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;

    if (mimeType === "image/gif") {
        return sharp(buffer, { animated: true }).webp().toBuffer();
    }
    return sharp(buffer).webp().toBuffer();
}

async function handleFileUpload(
    file: Blob,
    onProgress?: (progress: number) => void
): Promise<{ name: string; url: string }> {
    if (!allowedMimeTypes.has(file.type)) {
        throw new Error("허용되지 않은 이미지 형식입니다");
    }

    const uniqueFilename = `${Date.now()}${randomInt(300)}.webp`;
    const processedBuffer = await processImage(file);

    const { key, loc } = await uploadFile(
        uniqueFilename,
        processedBuffer,
        onProgress
    );

    return { name: key, url: loc };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const formData = await req.formData();
        const files = Array.from(formData.values()).filter(
            (value) => value instanceof Blob
        ) as Blob[];

        if (files.length === 0) {
            return NextResponse.json(
                { message: "No file uploaded" },
                { status: 400 }
            );
        }

        const uploadPromises = files.map((file) => {
            return new Promise<{ name: string; url: string }>(
                (resolve, reject) => {
                    handleFileUpload(file, (progress) => {
                        // Here you would normally send the progress update to the client
                        console.log(`Progress: ${progress}%`);
                    })
                        .then(resolve)
                        .catch(reject);
                }
            );
        });

        const completeFiles = await Promise.all(uploadPromises);

        return NextResponse.json({
            message: "success",
            files: completeFiles,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
