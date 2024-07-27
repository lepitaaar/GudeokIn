import Image from "next/image";
import NavBarLayout from "../component/mobile/Header/NavBarLayout";
import { db } from "../lib/database";
import { getUserByUUID } from "../lib/user";

export default async function GiftPage() {
    const gift = (await db.query(`select * from everytime.gift`)).recordset;
    return (
        <NavBarLayout>
            <div className="mx-2 mt-2">
                {gift.length > 0 ? (
                    (gift as any[]).map(async (uuid: any) => {
                        const user = await getUserByUUID(uuid.uuid);
                        return (
                            <div className="border border-solid border-1 p-3 shadow-sm rounded-lg flex flex-row items-center space-x-2">
                                <div className="profile flex flex-row items-center justify-start">
                                    <div className="relative w-[45px] h-[45px]">
                                        <Image
                                            src={user!.profileImage}
                                            className="rounded-lg object-cover"
                                            alt="프로필 이미지"
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                </div>
                                <p className="text-xl">{user?.nickname}</p>
                            </div>
                        );
                    })
                ) : (
                    <h1>경품 당첨자가 없습니다.</h1>
                )}
            </div>
        </NavBarLayout>
    );
}
