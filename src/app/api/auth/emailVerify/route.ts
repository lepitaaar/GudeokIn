import { NextRequest, NextResponse } from "next/server";
import { string, z } from "zod";
import { redis } from "@/app/lib/redis";
import nodemailer from "nodemailer";
import { db } from "@/app/lib/database";
/**
 * 

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "gudeok.in@gmail.com", // Gmail 주소
            pass: "conweak12", // Gmail 비밀번호 or 앱 비밀번호
        },
    });

    let mailOptions = {
        // from: "testmail@gmail.com",
        to: "leekus1006@gmail.com",
        subject: "이메일 제목",
        text: "Node.js의 Nodemailer + Google SMTP를 사용해서 보낸 메일입니다!",
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
 */
//yqvm qdal qosd pcvo
export async function GET(req: NextRequest) {
    const schema = z.object({
        email: z
            .string()
            .regex(
                /^[0-9]{4}[1-3][0-9]{1}[0-9]{1}[0-9]{1,2}@gudeok\.hs\.kr$/,
                "Invalid Email"
            ),
    });

    const valid = schema.safeParse({
        email: req.nextUrl.searchParams.get("email"),
    });

    if (valid.error) {
        return NextResponse.json(
            {
                message: "Params Validation Error",
            },
            {
                status: 500,
            }
        );
    }

    const data = valid.data;
    const code = Math.floor(100000 + Math.random() * 900000);

    const duplicate = (
        await db.query(
            `SELECT uuid from everytime.user_info where email = @email`,
            {
                email: data.email,
            }
        )
    ).recordset;

    if (duplicate.length > 0) {
        return NextResponse.json(
            {
                message: "이미 회원가입 되어있습니다.",
            },
            {
                status: 409,
            }
        );
    }

    await redis.setEx(`code:${data.email}`, 300, code.toString());

    // Here, you would send the code via email using your email service
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: "gudeok.in@gmail.com", // Gmail 주소
            pass: "ljeu golk hswy vqrw", // Gmail 비밀번호 or 앱 비밀번호
        },
        secure: true,
    });

    let mailOptions = {
        to: data.email,
        subject: "구덕인 인증코드",
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Verify your email address</title>
  <style type="text/css" rel="stylesheet" media="all">
    /* Base ------------------------------ */
    *:not(br):not(tr):not(html) {
      font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
    }
    body {
      width: 100% !important;
      height: 100%;
      margin: 0;
      line-height: 1.4;
      background-color: #F5F7F9;
      color: #839197;
      -webkit-text-size-adjust: none;
    }
    a {
      color: #414EF9;
    }

    /* Layout ------------------------------ */
    .email-wrapper {
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #F5F7F9;
    }
    .email-content {
      width: 100%;
      margin: 0;
      padding: 0;
    }

    /* Masthead ----------------------- */
    .email-masthead {
      padding: 25px 0;
      text-align: center;
    }
    .email-masthead_logo {
      max-width: 400px;
      border: 0;
    }
    .email-masthead_name {
      font-size: 16px;
      font-weight: bold;
      color: #839197;
      text-decoration: none;
      text-shadow: 0 1px 0 white;
    }

    /* Body ------------------------------ */
    .email-body {
      width: 100%;
      margin: 0;
      padding: 0;
      border-top: 1px solid #E7EAEC;
      border-bottom: 1px solid #E7EAEC;
      background-color: #FFFFFF;
    }
    .email-body_inner {
      width: 570px;
      margin: 0 auto;
      padding: 0;
    }
    .email-footer {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      text-align: center;
    }
    .email-footer p {
      color: #839197;
    }
    .body-action {
      width: 100%;
      margin: 30px auto;
      padding: 0;
      text-align: center;
    }
    .body-sub {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid #E7EAEC;
    }
    .content-cell {
      padding: 35px;
    }
    .align-right {
      text-align: right;
    }

    /* Type ------------------------------ */
    h1 {
      margin-top: 0;
      color: #292E31;
      font-size: 19px;
      font-weight: bold;
      text-align: left;
    }
    h2 {
      margin-top: 0;
      color: #292E31;
      font-size: 16px;
      font-weight: bold;
      text-align: left;
    }
    h3 {
      margin-top: 0;
      color: #292E31;
      font-size: 14px;
      font-weight: bold;
      text-align: left;
    }
    p {
      margin-top: 0;
      color: #839197;
      font-size: 16px;
      line-height: 1.5em;
      text-align: left;
    }
    p.sub {
      font-size: 12px;
    }
    p.center {
      text-align: center;
    }

    /* Buttons ------------------------------ */
    .button {
      display: inline-block;
      width: 200px;
      background-color: #414EF9;
      border-radius: 3px;
      color: #ffffff;
      font-size: 15px;
      line-height: 45px;
      text-align: center;
      text-decoration: none;
      -webkit-text-size-adjust: none;
      mso-hide: all;
    }
    .button--green {
      background-color: #28DB67;
    }
    .button--red {
      background-color: #FF3665;
    }
    .button--blue {
      background-color: #414EF9;
    }

    /*Media Queries ------------------------------ */
    @media only screen and (max-width: 600px) {
      .email-body_inner,
      .email-footer {
        width: 100% !important;
      }
    }
    @media only screen and (max-width: 500px) {
      .button {
        width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table class="email-content" width="100%" cellpadding="0" cellspacing="0">
          <!-- Logo -->
          <tr>
            <td class="email-masthead">
              <a class="email-masthead_name" style="color: #000000;">구덕고등학교</a>
            </td>
          </tr>
          <!-- Email Body -->
          <tr>
            <td class="email-body" width="100%">
              <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0">
                <!-- Body content -->
                <tr>
                  <td class="content-cell">
                    <h1>이메일 주소를 인증해주세요</h1>
                    <p>구덕인에 가입하기 위한 인증 코드입니다. 아래에 코드를 5분 이내에 입력해주세요.</p>
                    <!-- Action -->
                    <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <div>
                            <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{action_url}}" style="height:45px;v-text-anchor:middle;width:200px;" arcsize="7%" stroke="f" fill="t">
                            <v:fill type="tile" color="#414EF9" />
                            <w:anchorlock/>
                            <center style="color:#ffffff;font-family:sans-serif;font-size:15px;">${code}</center>
                          </v:roundrect><![endif]-->
                            <p style="font-size: 2rem;font-weight: 700;text-align: center; color: #000000;">${code}</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });

    return NextResponse.json(
        {
            message: "success",
        },
        {
            status: 200,
        }
    );
}

export async function POST(req: NextRequest) {
    const schema = z.object({
        email: z.string().min(1),
        code: z.string().transform((v: any) => parseInt(v)),
    });

    const valid = schema.safeParse({
        ...(await req.json()),
    });

    if (valid.error) {
        return NextResponse.json(
            {
                message: "Params Validation Error",
            },
            {
                status: 500,
            }
        );
    }

    const { email, code } = valid.data;

    // Retrieve the code from Redis
    const storedCode = await redis.get(`code:${email}`);

    if (!storedCode || storedCode !== code.toString()) {
        return NextResponse.json(
            {
                message: "인증 코드가 틀렸습니다",
            },
            {
                status: 400,
            }
        );
    }

    // Mark email as verified by setting a key in Redis with expiration time of 1 hour
    await redis.setEx(`verified:${email}`, 3600, "true");

    // Remove the code from Redis
    await redis.del(`code:${email}`);

    return NextResponse.json(
        {
            message: "success",
        },
        {
            status: 200,
        }
    );
}
