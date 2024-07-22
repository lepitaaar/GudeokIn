import type { MetadataRoute } from "next";
import sitemap from "./sitemap";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api*/",
                "/account",
                "/write*/",
                "/add_diary",
                "/search",
            ],
        },
        sitemap: "https://gudeok.kr/sitemap.xml",
    };
}
