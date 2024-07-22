import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
    ListObjectsV2CommandOutput,
    GetObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import crypto from "crypto";

const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNTID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_ACCESS_SEC_KEY!,
    },
});

const bucketName = "gudeok";

const getHash = (data: Buffer): string => {
    return crypto.createHash("md5").update(data).digest("hex");
};

const getObjectData = async (bucket: string, key: string): Promise<Buffer> => {
    const command: GetObjectCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    const response: GetObjectCommandOutput = await S3.send(command);
    const chunks: Buffer[] = [];
    for await (const chunk of response.Body as any) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};

const listObjects = async (bucket: string): Promise<string[]> => {
    const keys: string[] = [];
    let isTruncated = true;
    let continuationToken: string | undefined = undefined;

    while (isTruncated) {
        const command: ListObjectsV2Command = new ListObjectsV2Command({
            Bucket: bucket,
            ContinuationToken: continuationToken,
        });
        const response: ListObjectsV2CommandOutput = await S3.send(command);
        if (response.Contents) {
            keys.push(...response.Contents.map((item) => item.Key!));
        }
        isTruncated = response.IsTruncated ?? false;
        continuationToken = response.NextContinuationToken;
    }
    return keys;
};

const buildHashMap = async (bucket: string): Promise<Map<string, string>> => {
    const hashMap = new Map<string, string>();
    const keys = await listObjects(bucket);

    for (const key of keys) {
        const data = await getObjectData(bucket, key);
        const hash = getHash(data);
        hashMap.set(hash, key);
    }

    return hashMap;
};

const uploadFile = async (
    key: string,
    body: Buffer
): Promise<{ key: string; loc: string }> => {
    try {
        // const hash = getHash(body);
        // const hashMap = await buildHashMap(bucketName);

        // if (hashMap.has(hash)) {
        //     const existingKey = hashMap.get(hash);
        //     const duplicateUrl = `https://cdn.gudeok.kr/${existingKey}`;
        //     console.log(`Duplicate file found. URL: ${duplicateUrl}`);
        //     return {
        //         key: existingKey!,
        //         loc: duplicateUrl,
        //     };
        // }

        const upload = new Upload({
            client: S3,
            params: {
                Bucket: bucketName,
                Key: key,
                Body: body,
            },
        });

        const data = await upload.done();
        console.log(`File uploaded successfully. ${data.Location}`);
        return {
            key: key,
            loc: `https://cdn.gudeok.kr/${key}`,
        };
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

export { uploadFile };
