import { MetadataRoute } from "next";
/** content layer 도입? */
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://gudeok.kr/univ",
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: "https://gudeok.kr/community",
            lastModified: new Date(),
            changeFrequency: "always",
            priority: 1.0,
        },
        {
            url: "https://gudeok.kr/",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.7,
        },
        {
            url: "https://gudeok.kr/schedule",
            lastModified: new Date(),
            changeFrequency: "daily",
        },
        {
            url: "https://gudeok.kr/meal",
            lastModified: new Date(),
            changeFrequency: "weekly",
        },
        {
            url: "https://gudeok.kr/diary",
            lastModified: new Date(),
            changeFrequency: "monthly",
        },
    ];
}
