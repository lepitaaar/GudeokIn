"use client";

import { useEffect, useState } from "react";
import axios from "@/app/lib/axios";
import { useRouter } from "next/navigation";

export default function SetSubectMappingView({
    setSubject,
    existMap,
}: {
    setSubject: Map<string, Set<string>>;
    existMap: any;
}) {
    const router = useRouter();
    const [MappingTable, setMappingTable] = useState<Map<string, string>>();

    const SaveMapping = async () => {
        try {
            const res = await axios.post(`/api/schedule`, {
                mapping: JSON.stringify(Object.fromEntries(MappingTable!)),
            });
            if (res.status === 200) {
                alert("저장되었습니다!");
                router.refresh();
            }
        } catch (error) {
            console.log(error);
            alert("예상치 못한 오류가 발생했습니다");
        }
    };

    useEffect(() => {
        setSubject.forEach((value, key) => {
            setMappingTable((prev) => new Map(prev).set(key, existMap[key] ?? key));
        });
    }, []);

    const ChangeMapping = (
        e: React.ChangeEvent<HTMLSelectElement>,
        key: string
    ) => {
        setMappingTable(
            (prev) => new Map([...(prev ?? []), [key, e.target.value]])
        );
    };

    return (
        <div>
            {setSubject.size <= 0 ? (
                <>
                    <p>지정할 세트 수업이 존재하지않습니다.</p>
                </>
            ) : (
                <div className="mb-40 space-y-1">
                    {Array.from(setSubject).map(([key, value]) => (
                        <div className="mx-20" key={key}>
                            <label
                                htmlFor={key}
                                className="block mb-2 text-lg font-medium text-gray-900"
                            >
                                {key}
                            </label>
                            <select
                                id={key}
                                defaultValue={existMap[key]}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                onChange={(e) => ChangeMapping(e, key)}
                            >
                                <option>{key}</option>
                                {Array.from(value).map((val) => {
                                    if (val) {
                                        return (
                                            <option value={val} key={val}>
                                                {val}
                                            </option>
                                        );
                                    }
                                })}
                            </select>
                        </div>
                    ))}
                    <div className="pt-4">
                        <button
                            onClick={SaveMapping}
                            className="w-[55px] h-[37px] bg-blue-500 text-white font-semibold"
                        >
                            저장
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
