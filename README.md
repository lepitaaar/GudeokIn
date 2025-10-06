### 화면구성

| | | |
| :---: | :---: | :---: |
| <img width="300" alt="메인화면" src="https://github.com/user-attachments/assets/148076fb-8828-44f3-8817-2a0a16c5b0c8" /><br/>**메인화면** | <img width="300" alt="마이페이지" src="https://github.com/user-attachments/assets/2f43f66c-dac5-4c61-82d1-7cdeb0ef28b2" /><br/>**마이페이지** | <img width="300" alt="급식" src="https://github.com/user-attachments/assets/4b67481b-9111-4993-9970-ecca1a4a1b3d" /><br/>**급식** |
| <img width="300" alt="커뮤니티" src="https://github.com/user-attachments/assets/f4c0b14f-eaf6-4ec2-9041-6d181ddb911f" /><br/>**커뮤니티** | <img width="300" alt="시간표" src="https://github.com/user-attachments/assets/09643c05-45d4-4479-8ab2-2505f1131ee4" /><br/>**시간표** | <img width="300" alt="일정관리" src="https://github.com/user-attachments/assets/eed07e99-871e-4021-a07b-14f51711fefe" /><br/>**일정관리** |
| <img width="300" alt="일정등록" src="https://github.com/user-attachments/assets/53eb8c24-b7f8-4115-ab54-5ac36a1ef342" /><br/>**일정등록** | <img width="300" alt="대학정보" src="https://github.com/user-attachments/assets/6dfa6c3c-eca8-4e37-a3fc-43df777bcd83" /><br/>**대학정보** | |

<br/>
<br/>

# 0. Getting Started (시작하기)

```bash
$ yarn start
```

[서비스 링크](https://gudeok.kr)

<br/>
<br/>

# 1. Project Overview (프로젝트 개요)

- 프로젝트 이름: 구덕인
- 프로젝트 설명: 구덕고등학교 학생들을 위한 학생 관리 시스템 및 커뮤니티

<br/>
<br/>

# 2. Team Members (팀원 및 팀 소개)

|                                          이은호                                           |
| :---------------------------------------------------------------------------------------: |
| <img src="https://avatars.githubusercontent.com/u/66681282?v=4" alt="이은호" width="150"> |
|                                          풀스택                                           |

<br/>
<br/>

# 3. Key Features (주요 기능)

- **회원가입**:

  - 회원가입 시 DB에 유저정보가 등록됩니다.
  - 학교에서 제공하는 `year학년반@gudeok.hs.kr` 형태의 이메일 인증이필요합니다.

- **로그인**:

  - 사용자 인증 정보를 통해 로그인합니다.
  - 로그인 상태는 JWT로 관리합니다

- **급식**:

  - 금주 식단 목록을 스왑 가능한 목록으로 보여줍니다.
  - 중식/석식 버튼으로 구분해서 확인 가능합니다

- **커뮤니티**:

  - 사용중인 계정 학년 바탕으로 각 학년 게시판이 나뉩니다.
    - 자유게시판, N학년게시판, 질문게시판
  - 글쓰기, 검색, 수정, 삭제 가능합니다.
  - 작성된 글에 댓글과 좋아요, 싫어요를 할 수 있습니다.
  - 좋아요가 5개 이상시 추천글에 등록됩니다.

- **시간표**:

  - 사용중인 계정 학년과 반을 바탕으로 금주 시간표를 가져옵니다.
  - 한 시간에 여러가지 수업이 존재할 시 설정에서 선택가능한 수업을 매핑할 수 있습니다.

- **일정 관리**:

  - 우리 학교의 1년 학사일정을 바탕으로 기본 일정이 추가되어있습니다.
  - 원하는 날짜와 시간을 등록해서 자신의 일정을 관리할 수 있습니다.

- **NEIS PLUS 연동**:

  - NEIS PLUS 아이디, 비밀번호 입력 시 자신의 내신 점수를 가져와 평균 내신점수를 계산합니다.

- **마이 페이지**
  - 한달에 한번 자신의 닉네임을 변경할 수 있습니다.
  - 자신의 프로필 이미지를 변경할 수 있습니다. gif, animation webp를 지원합니다.
  - NEIS PLUS와 연동된 이력이 존재하면 자신의 평균 내신 점수를 확인할 수 있습니다.

<br/>
<br/>

# 4. Technology Stack (기술 스택)

## 4.1 Language

|            |                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| HTML5      | <img src="https://github.com/user-attachments/assets/2e122e74-a28b-4ce7-aff6-382959216d31" alt="HTML5" width="100"> |
| CSS3       | <img src="https://github.com/user-attachments/assets/c531b03d-55a3-40bf-9195-9ff8c4688f13" alt="CSS3" width="100">  |
| Typescript | <img src="https://github.com/remojansen/logo.ts/blob/master/ts.png" alt="Javascript" width="100">                   |

<br/>

## 4.2 Frotend

|             |                                                                                                                     |        |
| ----------- | ------------------------------------------------------------------------------------------------------------------- | ------ |
| React       | <img src="https://github.com/user-attachments/assets/e3b49dbb-981b-4804-acf9-012c854a2fd2" alt="React" width="100"> | 18.0.0 |
| NextJs      | <img src="https://github.com/tandpfun/skill-icons/blob/main/icons/NextJS-Dark.svg" alt="NextJs" width="100">        | 14.2.5 |
| TailwindCSS | <img src="https://github.com/tandpfun/skill-icons/blob/main/icons/TailwindCSS-Dark.svg" alt="tailwind" width="100"> | 3.4.1  |

<br/>

## 4.3 Backend

|          |                                                                                                                        |         |
| -------- | ---------------------------------------------------------------------------------------------------------------------- | ------- |
| Firebase | <img src="https://github.com/user-attachments/assets/1694e458-9bb0-4a0b-8fe6-8efc6e675fa1" alt="Firebase" width="100"> | 10.12.5 |
| NextJs   | <img src="https://github.com/tandpfun/skill-icons/blob/main/icons/NextJS-Dark.svg" alt="NextJs" width="100">           | 14.2.5  |
| Redis    | <img src="https://github.com/tandpfun/skill-icons/blob/main/icons/Redis-Dark.svg" alt="Firebase" width="100">          | 7.0     |

<br/>

## 4.4 CI/CD

|         |                                                                                                                |
| ------- | -------------------------------------------------------------------------------------------------------------- |
| Jenkins | <img src="https://github.com/tandpfun/skill-icons/blob/main/icons/Jenkins-Dark.svg" alt="jenkins" width="100"> |

<br/>

# 5. Project Structure (프로젝트 구조)

```plaintext
GudeokIn/
├── public/              # 이미지, 아이콘 등 정적 에셋
├── src/
│   ├── app/             # Next.js App Router (페이지 및 레이아웃)
│   │   ├── layout.tsx   # 공통 레이아웃
│   │   ├── page.tsx     # 메인 페이지
│   │   ├── globals.css  # 전역 스타일
│   │   ├── api/         # API 라우트 핸들러
│   │   ├── components/  # 재사용 UI 컴포넌트
│   │   ├── lib/         # 공통 모듈 (DB, 인증 등)
│   │   └── ... (각 기능별 페이지 폴더)
│   └── fonts/           # 프로젝트 사용 폰트
├── pages/
│   └── api/             # Next.js API 라우트
├── next.config.mjs      # Next.js 설정 파일
├── tailwind.config.ts   # Tailwind CSS 설정 파일
├── tsconfig.json        # TypeScript 설정 파일
└── package.json         # 프로젝트 의존성 및 스크립트
```

<br/>
