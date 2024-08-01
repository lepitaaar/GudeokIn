import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { randomInt } from "crypto";
import { uploadFile } from "@/app/lib/r2";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const formData = await req.formData();
        var files: Blob[] = [];

        for (var i of formData) {
            files.push(i[1] as Blob);
        }

        if (files.length == 0) {
            return NextResponse.json({
                message: "No file uploaded",
            });
        }

        var complete_files = [];

        for (var file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const mimeType = file.type;

            // Check if the file is an images
            if (!/^image\/(jpeg|png|gif|webp)$/.test(mimeType)) {
                return NextResponse.json(
                    {
                        message: "지원하지 않은 형식입니다",
                    },
                    {
                        status: 500,
                    }
                );
            }

            // Generate a random filename to avoid original filename issues
            const uniqueFilename = `${new Date().getTime()}${randomInt(
                300
            )}.webp`; //${mimeType.split("/")[1]}

            const metadata = await sharp(buffer).metadata();
            const { width } = metadata;

            var processedBuffer: Buffer | null = null;
            const resizeOption =
                width! >= 700 ? { width: 700 } : { width: width };

            processedBuffer = await sharp(buffer, { animated: true })
                .resize(resizeOption)
                .toFormat("webp")
                .toBuffer();

            const processed = await sharp(processedBuffer).metadata();

            const { key, loc } = await uploadFile(
                uniqueFilename,
                processedBuffer
            );
            complete_files.push({
                name: key,
                url: loc,
                width: processed.width,
                height: processed.height,
            });
        }

        return NextResponse.json({
            message: "success",
            files: complete_files,
        });
    } catch (error) {
        return NextResponse.json({
            message: (error as Error).message,
        });
    }
}
