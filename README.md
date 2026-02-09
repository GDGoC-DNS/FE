# GDG Subdomain Registration Center (FE)

GDG(Google Developer Groups) 커뮤니티를 위한 서브도메인(`*.gdgoc.com`) 등록 및 관리 서비스의 프론트엔드 프로젝트입니다.
React와 Vite를 기반으로 구축되었으며, 사용자는 대시보드를 통해 도메인을 검색하고, 등록된 도메인의 DNS 레코드를 손쉽게 관리할 수 있습니다.

## 🛠 Tech Stack

- **Core**: React, Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS

## 📂 Project Structure

주요 파일 및 폴더 구조는 다음과 같습니다.

```
src/
├── pages/
│   ├── DashboardPage.jsx  # 메인 대시보드 (도메인 리스트, 사용자 정보, Mock Data 포함)
│   ├── LoginPage.jsx      # 로그인 페이지
│   └── SignupPage.jsx     # 회원가입 페이지
├── image/                 # 로고 및 이미지 자산
├── App.jsx                # 라우팅 설정 (/login, /signup, /dashboard)
└── main.jsx               # 앱 진입점
```

## 🚀 Features

- **대시보드**: 사용자 프로필 표시 및 등록된 도메인 목록 조회
- **도메인 관리**: 도메인 상태 확인 및 관리 UI 구성
- **인증**: 로그인 및 회원가입 페이지 라우팅 구성

## 💻 Getting Started

1. **의존성 설치**
   ```bash
   npm install
   ```
2. **개발 서버 실행**
   ```bash
   npm run dev
   ```
