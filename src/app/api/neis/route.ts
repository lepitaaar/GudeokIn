import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { z } from "zod";
import { parseStringPromise } from "xml2js";
import { db } from "@/app/lib/database";
import { verify } from "@/app/lib/jwtUtil";
import moment from "moment";

const schema = z.object({
    username: z.string().min(1),
    enc_password: z.string().min(1),
});

function seperateSubjectTime(sbj: string) {
    let match = sbj.match(/^(.*)\((\d+)\)$/);
    if (match) {
        let sbjtNm = match[1].trim(); // 괄호 전의 부분 (과목명)
        let 차수 = parseInt(match[2], 10); // 괄호 안의 숫자
        return {
            과목: sbjtNm,
            차수: 차수,
        };
    } else {
        return {
            과목: sbj,
            차수: null,
        }; // 만약 괄호와 숫자가 없다면 그대로 반환
    }
}

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")!.split(" ")[1];

        const valid_tk = verify(token);
        const uuid = valid_tk.payload!.uuid;
        const exam = await db.query(
            `
            SELECT sbjtNm,
                MIN(screClaNm) AS screClaNm,
                MIN([hours]) AS hours
            FROM everytime.st_score
            WHERE screClaNm IS NOT NULL and uuid = @uuid
            GROUP BY grade, sem, sbjtNm
            ORDER BY grade, sem, sbjtNm;`,
            {
                uuid: uuid,
            }
        );
        if (exam.recordset.length <= 0) {
            return NextResponse.json(
                {
                    message: "성적이 존재하지 않습니다",
                },
                {
                    status: 500,
                }
            );
        }

        var total_환산 = 0;
        var total_단위수 = 0;

        for (var subject of exam.recordset) {
            if (subject.screClaNm === "P") continue;
            total_환산 += parseInt(subject.screClaNm) * subject.hours;
            total_단위수 += subject.hours;
        }

        return NextResponse.json(
            {
                message: "success",
                credit: Number(total_환산 / total_단위수).toFixed(2),
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        return NextResponse.json(
            {
                message: "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")!.split(" ")[1];

        const valid_tk = verify(token);

        if (!valid_tk.ok) {
            return NextResponse.json(
                {
                    message: valid_tk.message,
                },
                {
                    status: 400,
                }
            );
        }

        const param = await req.json();
        const valid = schema.safeParse({
            ...param,
        });

        if (!valid.success) {
            return NextResponse.json(
                {
                    message: "Params Validation error",
                },
                {
                    status: 500,
                }
            );
        }

        const jar = new CookieJar();

        const client: AxiosInstance = wrapper(axios.create({ jar }));
        /** 쿠키 셋업 */
        await client.get(`https://www.neisplus.kr/`);
        await client.post(
            `https://www.neisplus.kr/nts/faq/mg/nts_faq_mg00_003.do`,
            { pageIndex: "1", pageSize: "4", comCdTyp: "USR_FAQ_SVC_CD" }
        );
        await client.post(
            `https://www.neisplus.kr/nts/faq/mg/nts_ntc_mg01_001.do`,
            { trgtUserTypCd: "1", trgtUserTypCd2: "2" }
        );

        await client.get(
            "https://www.neisplus.kr/oauth/oauth_csp_login_nxt.jsp",
            {
                headers: {
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    Referer: "https://www.neisplus.kr/",
                },
            }
        );

        await client.post(
            "https://edupass.neisplus.kr/SCSP_CLOUD/login.do",
            {
                secretKey: "zCBp/JiOtLzvuIN+o46dP7+/r5ecieXF6CE3D03jKzY=",
                mhrlsNo: "",
            },
            {
                headers: {
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    UI: "nexacro",
                    Origin: "https://www.neisplus.kr",
                },
            }
        );

        /** 로그인 */
        let data = `<?xml version="1.0" encoding="UTF-8"?>\r\n<Root xmlns="http://www.nexacroplatform.com/platform/dataset">\r\n\t<Parameters>\r\n\t\t<Parameter id="jsessionidTest" />\r\n\t\t<Parameter id="WMONID"></Parameter>\r\n\t\t<Parameter id="JSESSIONID"></Parameter>\r\n\t\t<Parameter id="svcId" />\r\n\t\t<Parameter id="voId" />\r\n\t\t<Parameter id="method" />\r\n\t</Parameters>\r\n\t<Dataset id="dsSearch">\r\n\t\t<ColumnInfo>\r\n\t\t\t<Column id="userDtcNo" type="STRING" size="256" />\r\n\t\t\t<Column id="userId" type="STRING" size="256" />\r\n\t\t\t<Column id="userPswd" type="STRING" size="256" />\r\n\t\t\t<Column id="eduDgtlOpsUserScCd" type="STRING" size="256" />\r\n\t\t\t<Column id="lgnMthScCd" type="STRING" size="256" />\r\n\t\t\t<Column id="cntnDvcsClfCd" type="STRING" size="256" />\r\n\t\t\t<Column id="autoLoginYn" type="STRING" size="256" />\r\n\t\t\t<Column id="mhrlsNo" type="STRING" size="256" />\r\n\t\t</ColumnInfo>\r\n\t\t<Rows>\r\n\t\t\t<Row>\r\n\t\t\t\t<Col id="userId">${valid.data!.username}</Col>\r\n\t\t\t\t<Col id="userPswd">${valid.data!.enc_password}</Col>\r\n\t\t\t\t<Col id="eduDgtlOpsUserScCd">1</Col>\r\n\t\t\t\t<Col id="lgnMthScCd">01</Col>\r\n\t\t\t\t<Col id="cntnDvcsClfCd">10</Col>\r\n\t\t\t\t<Col id="autoLoginYn">N</Col>\r\n\t\t\t\t<Col id="mhrlsNo">null</Col>\r\n\t\t\t</Row>\r\n\t\t</Rows>\r\n\t</Dataset>\r\n</Root>`;

        const loginReq = await client.post(
            `https://edupass.neisplus.kr/edo_edo_li01_002.do`,
            data,
            {
                headers: {
                    UI: "nexacro",
                    Accept: "application/xml, text/xml, */*",
                    Referer: "https://edupass.neisplus.kr/SCSP_CLOUD/login.do",
                    "Content-Type": "text/xml",
                },
            }
        );
        const loginRes = await parseStringPromise(loginReq.data, {
            trim: true,
            explicitArray: true,
        });

        var loginYN: string | undefined;
        var errorMsg: string | undefined;
        (loginRes.Root.Dataset[0].Rows[0].Row[0].Col as any[]).forEach(
            (item) => {
                if (item.$.id == "loginYN") {
                    loginYN = item._;
                }
                if (item.$.id === "message") {
                    errorMsg = item._;
                }
            }
        );
        if (loginYN === "N") {
            return NextResponse.json(
                {
                    message: errorMsg,
                },
                {
                    status: 500,
                }
            );
        }
        /** 로그인 인증 거치는부분 */
        await client.get(
            `https://edupass.neisplus.kr/test_edo_edo_of01_002.do?siteId=SCSP_CLOUD`,
            {
                headers: {
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    Referer: "https://edupass.neisplus.kr/SCSP_CLOUD/login.do",
                },
            }
        );

        /** 성능상 쓰면안좋긴한데 짜피 사용하는사람 별로없어서 걍 지우고 추가 */
        await db.query(`delete from everytime.st_score where uuid = @uuid`, {
            uuid: valid_tk.payload!.uuid,
        });

        const grd = [1, 2, 3];
        const sem = [1, 2];

        for (const grade of grd) {
            for (const semester of sem) {
                const examResponse = await client.post(
                    `https://www.neisplus.kr/edi/sel/sl/edi_sel_sl01_000.do`,
                    {
                        grd: grade,
                        sem: semester,
                        /**
                         * 1 = 중간
                         * 2 = 기말
                         * 3 = 학기말
                         */
                        schpaSvcScreStdrValue: "3",
                        beforeSchl: false,
                    }
                );
                /**
                 * ListScreNotice = 보통교과 및 전문교과과목
                 * ListScreNotice02 = 진로 선택과목
                 * ListScreNotice03 = 체육·예술과목
                 * sccesCurrScCd = 성적 타입
                 * 1 = ListScreNotice
                 * 2 = ListScreNotice02
                 * 3 = ListScreNotice03
                 */
                const base = examResponse.data.retList.rtnMap;
                const total_arr = base.ListScreNotice.concat(
                    base.ListScreNotice02,
                    base.ListScreNotice03
                );
                for (var item of total_arr) {
                    if (!item) continue;
                    const { 과목, 차수 } = seperateSubjectTime(item.sbjtNm);
                    await db.query(
                        `
                            INSERT INTO everytime.st_score 
                            (grade, sem, uuid, sbjtNm, papFulScNm, papFulNm, sbjtPesScr, screScr, cnvlScr, orsc, scwkEvalClaNm, screClaNm, rrankTextValue, sbjtAvrgTextValue, sccesCurrScCd, achde, sbjtCd, enrlCnt, sbjtAvrg, stndDcln, hours) 
                            VALUES 
                            (@grade, @semester, @uuid, @sbjtNm, @papFulScNm, @papFulNm, @sbjtPesScr, @screScr, @cnvlScr, @orsc, @scwkEvalClaNm, @screClaNm, @rrankTextValue, @sbjtAvrgTextValue, @sccesCurrScCd, @achde, @sbjtCd, @enrlCnt, @sbjtAvrg, @stndDcln, @hours)
                        `,
                        {
                            grade: grade,
                            semester: semester,
                            uuid: valid_tk.payload!.uuid,
                            sbjtNm: 과목,
                            papFulScNm: item.papFulScNm,
                            papFulNm: item.papFulNm,
                            sbjtPesScr: item.sbjtPesScr,
                            screScr: item.screScr,
                            cnvlScr: item.cnvlScr,
                            orsc: item.orsc,
                            scwkEvalClaNm: item.scwkEvalClaNm,
                            screClaNm: item.screClaNm,
                            rrankTextValue: item.rrankTextValue,
                            sbjtAvrgTextValue: item.sbjtAvrgTextValue,
                            sccesCurrScCd: item.sccesCurrScCd,
                            achde: item.achde,
                            sbjtCd: item.sbjtCd,
                            enrlCnt: item.enrlCnt,
                            sbjtAvrg: item.sbjtAvrg,
                            stndDcln: item.stndDcln,
                            hours: 차수,
                        }
                    );
                }
            }
        }

        /** 위에 GET만들어두고 귀찮아서 복붙함 */
        const exam = await db.query(
            `
            SELECT sbjtNm,
                MIN(screClaNm) AS screClaNm,
                MIN([hours]) AS hours
            FROM everytime.st_score
            WHERE screClaNm IS NOT NULL and uuid = @uuid
            GROUP BY grade, sem, sbjtNm
            ORDER BY grade, sem, sbjtNm;`,
            {
                uuid: valid_tk.payload!.uuid,
            }
        );

        var total_환산 = 0;
        var total_단위수 = 0;

        for (var subject of exam.recordset) {
            if (subject.screClaNm === "P") continue;
            total_환산 += parseInt(subject.screClaNm) * subject.hours;
            total_단위수 += subject.hours;
        }
        const credit = Number(total_환산 / total_단위수).toFixed(2);
        await db.query(
            `UPDATE everytime.user_info SET isNeisSync = 1, neisSyncDate = @date, credit = @credit where uuid = @uuid`,
            {
                date: moment().format("YYYY-MM-DD"),
                credit: credit,
                uuid: valid_tk.payload!.uuid,
            }
        );

        return NextResponse.json(
            {
                message: "success",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error occurred:", (error as Error).message);

        return NextResponse.json(
            {
                message: "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    }
}
