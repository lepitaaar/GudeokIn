import React from "react";
import SearchComponent from "./SearchComponent";

export default async function SearchPost({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/post?keyword=${searchParams?.keyword}`
    ).then((res) => res.json());

    return (
        <SearchComponent
            list={res}
            keyword={searchParams?.keyword?.toString() ?? ""}
        />
    );
}
