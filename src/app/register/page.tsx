"use client";

import { isAxiosError } from "axios";
import NavBarLayout from "../component/mobile/Header/NavBarLayout";
import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { z } from "zod";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Autocomplete from "@mui/material/Autocomplete";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { extractEmailDetails } from "@/app/lib/util";

const emailSchema = z
    .string()
    .regex(
        /^[0-9]{4}[1-3][0-9]{1}[0-9]{1}[0-9]{1,2}@gudeok\.hs\.kr$/,
        "유효하지 않은 이메일입니다."
    );
const idSchema = z
    .string()
    .min(5)
    .max(20)
    .regex(/^[a-z0-9]+$/);
const passwordSchema = z
    .string()
    .min(8)
    .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()._-]+$/);
const nicknameSchema = z
    .string()
    .min(2)
    .max(20)
    .regex(/^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]+$/);

export default function AccountSetup() {
    const [id, setId] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [nickname, setNickname] = useState<string>("");
    const [emailVerified, setEmailVerified] = useState<boolean>(false);
    const [inputVerificationCode, setInputVerificationCode] =
        useState<string>("");
    const [countdown, setCountdown] = useState<number>(0);
    const [showVerificationField, setShowVerificationField] =
        useState<boolean>(false);
    const [grade, setGrade] = useState<number>(0);
    const [classNM, setClassNM] = useState<number>(0);
    const [number, setNumber] = useState<number>(0);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<any>({});
    const [options, setOptions] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        const localPart = email?.split("@")?.[0];
        if (localPart) {
            setOptions([`${localPart}@gudeok.hs.kr`]);
        } else {
            setOptions([]);
        }
    }, [email]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0 && !emailVerified) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const isValidEmail = (email: string) => {
        try {
            emailSchema.parse(email);
            return true;
        } catch {
            return false;
        }
    };

    const handleEmailVerification = async () => {
        if (email) {
            try {
                if (!isValidEmail(email)) throw Error();

                const res = await axios.get(
                    `/api/auth/emailVerify?email=${email}`
                );
                if (res.status === 200) {
                    const detail = extractEmailDetails(email);
                    setGrade(detail!.grade);
                    setClassNM(detail!.class);
                    setNumber(detail!.number);
                    setCountdown(300);
                    setShowVerificationField(true);
                }
            } catch (error: any) {
                if (isAxiosError(error)) {
                    setErrors({
                        ...errors,
                        email:
                            error.response?.data?.message ||
                            "유효하지 않은 이메일입니다.",
                    });
                }
                console.log(error);
            }
        }
    };

    const handleVerificationCodeCheck = async () => {
        try {
            const res = await axios.post(`/api/auth/emailVerify`, {
                email: email,
                code: inputVerificationCode,
            });
            if (res.status === 200) {
                setEmailVerified(true);
            }
        } catch (error: any) {
            if (isAxiosError(error)) {
                setErrors({
                    ...errors,
                    code:
                        error.response?.data?.message ||
                        "인증코드가 잘못되었습니다.",
                });
            }
            console.log(error);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validId = idSchema.safeParse(id);
        const validPassword = passwordSchema.safeParse(password);
        const validNickname = nicknameSchema.safeParse(nickname);
        if (
            !validId.success ||
            !validPassword.success ||
            !validNickname.success
        ) {
            setErrors({
                id: !validId.success ? "아이디를 확인해주세요." : "",
                password: !validPassword.success
                    ? "비밀번호를 확인해주세요."
                    : "",
                nickname: !validNickname.success
                    ? "닉네임을 확인해주세요."
                    : "",
            });
            return;
        }

        if (emailVerified && id && password && nickname) {
            try {
                const res = await axios.post(`/api/auth/register`, {
                    id: id,
                    pw: password,
                    email: email,
                    grade: grade,
                    class: classNM,
                    number: number,
                    nickname: nickname,
                });
                if (res.status === 200) {
                    alert("회원가입 되었습니다.");
                    router.push("/");
                }
            } catch (error: any) {
                alert(error.response?.data.message || "오류가 발생했습니다");
                console.log(error);
            }
        }
    };

    const isFormValid = (): boolean => {
        return emailVerified && id !== "" && password !== "" && nickname !== "";
    };

    return (
        <NavBarLayout account={false} menu={false}>
            <div className="flex items-center justify-center">
                <div className="w-full max-w-md p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-center">회원가입</h2>
                    <form onSubmit={handleSubmit} method="post">
                        <div className="space-y-4">
                            <Autocomplete
                                disableClearable={true}
                                freeSolo
                                options={options}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="이메일"
                                        variant="outlined"
                                        fullWidth
                                        error={Boolean(errors.email)}
                                        helperText={errors.email}
                                        placeholder="20241211@gudeok.hs.kr"
                                        className={`${
                                            errors.email
                                                ? "border-red-500"
                                                : "border-green-500"
                                        }`}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {
                                                        params.InputProps
                                                            .endAdornment
                                                    }
                                                    <InputAdornment position="end">
                                                        {countdown > 0 ? (
                                                            <span className="text-red-500">
                                                                {Math.floor(
                                                                    countdown /
                                                                        60
                                                                )}
                                                                :
                                                                {countdown %
                                                                    60 <
                                                                10
                                                                    ? `0${
                                                                          countdown %
                                                                          60
                                                                      }`
                                                                    : countdown %
                                                                      60}
                                                            </span>
                                                        ) : (
                                                            <Button
                                                                onClick={
                                                                    handleEmailVerification
                                                                }
                                                                disabled={
                                                                    emailVerified
                                                                }
                                                                className="bg-gray-300"
                                                            >
                                                                발송
                                                            </Button>
                                                        )}
                                                    </InputAdornment>
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                value={email}
                                onChange={(event, newValue) => {
                                    setEmail(newValue);
                                }}
                                onInputChange={(event, newInputValue) => {
                                    setEmail(newInputValue);
                                    const localPart =
                                        newInputValue.split("@")[0];
                                    if (localPart) {
                                        setOptions([
                                            `${localPart}@gudeok.hs.kr`,
                                        ]);
                                    } else {
                                        setOptions([]);
                                    }
                                }}
                                disabled={emailVerified}
                            />
                            {showVerificationField && (
                                <TextField
                                    label="인증번호"
                                    variant="outlined"
                                    fullWidth
                                    onChange={(e) =>
                                        setInputVerificationCode(e.target.value)
                                    }
                                    placeholder="인증 번호"
                                    disabled={emailVerified}
                                    error={Boolean(errors.code)}
                                    helperText={errors.code}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Button
                                                    onClick={
                                                        handleVerificationCodeCheck
                                                    }
                                                    disabled={
                                                        emailVerified ||
                                                        countdown === 0
                                                    }
                                                    className="bg-gray-300"
                                                >
                                                    확인
                                                </Button>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                            {emailVerified && (
                                <>
                                    <TextField
                                        label="아이디 (5~20자 이내, 영문, 숫자 사용가능)"
                                        variant="outlined"
                                        fullWidth
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        placeholder="gudeok"
                                        error={Boolean(errors.id)}
                                        helperText={errors.id}
                                        className={`${
                                            errors.id
                                                ? "border-red-500"
                                                : "border-green-500"
                                        }`}
                                        /**
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {id && ( // Only show the button if id is not empty
                                                        <Button
                                                            onClick={
                                                                handleVerificationCodeCheck
                                                            }
                                                            disabled={
                                                                emailVerified ||
                                                                countdown === 0
                                                            }
                                                            className="bg-gray-300"
                                                        >
                                                            중복확인
                                                        </Button>
                                                    )}
                                                </InputAdornment>
                                            ),
                                        }} */
                                    />
                                    <TextField
                                        label="비밀번호 (8자이상, 문자,숫자 사용가능)"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        variant="outlined"
                                        fullWidth
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="******"
                                        error={Boolean(errors.password)}
                                        helperText={errors.password}
                                        className={`${
                                            errors.password
                                                ? "border-red-500"
                                                : "border-green-500"
                                        }`}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() =>
                                                            setShowPassword(
                                                                !showPassword
                                                            )
                                                        }
                                                        edge="end"
                                                    >
                                                        {showPassword ? (
                                                            <VisibilityOff />
                                                        ) : (
                                                            <Visibility />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        label="닉네임"
                                        variant="outlined"
                                        fullWidth
                                        onChange={(e) =>
                                            setNickname(e.target.value)
                                        }
                                        placeholder="멋쟁이구덕이"
                                        error={Boolean(errors.nickname)}
                                        helperText={errors.nickname}
                                        className={`${
                                            errors.nickname
                                                ? "border-red-500"
                                                : "border-green-500"
                                        }`}
                                    />
                                    <div className="flex space-x-4">
                                        <TextField
                                            label="학년"
                                            variant="outlined"
                                            fullWidth
                                            value={grade}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                        <TextField
                                            label="반"
                                            variant="outlined"
                                            fullWidth
                                            value={classNM}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                        <TextField
                                            label="번호"
                                            variant="outlined"
                                            fullWidth
                                            value={number}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        disabled={!isFormValid()}
                                        className="bg-blue-600 text-white"
                                    >
                                        회원가입
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </NavBarLayout>
    );
}
