# 📚 Booktine - 독서 습관 관리 서비스

<img src="https://img.shields.io/badge/java-007396?style=for-the-badge&logo=OpenJDK&logoColor=white"> <img src="https://img.shields.io/badge/Spring-6DB33F?style=for-the-badge&logo=Spring&logoColor=white"> <img src="https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=SpringBoot&logoColor=white"> <img src="https://img.shields.io/badge/JUnit5-25A162?style=for-the-badge&logo=JUnit5&logoColor=white"> <img src="https://img.shields.io/badge/Hibernate-59666C?style=for-the-badge&logo=Hibernate&logoColor=white"> <img src="https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white">  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white"> <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=white"> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white"> <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=Chart.js&logoColor=white">

![Image](https://github.com/user-attachments/assets/8ed33009-4fc7-4a37-bba0-dd0d0621b8ca)
독서 기록과 목표 관리를 한 곳에서! 사용자가 독서 습관을 추적하고, 독서 노트 및 메모를 관리하며, 맞춤형 책 추천을 받을 수 있는 풀스택 웹 애플리케이션입니다.

<br>

## 목차
- [소개](#소개)
- [개발 환경](#개발-환경)
- [기능](#기능)
- [설치 및 실행](#설치-및-실행)
- [서비스 화면](#서비스-화면)
- [프로젝트 구조](#프로젝트-구조)
- [개선 목표](#개선-목표)
- [프로젝트 후기](#프로젝트-후기)

<br>

## 소개
Booktine은 독서 습관을 체계적으로 관리하고 독서 목표를 달성할 수 있도록 도와주는 웹 애플리케이션입니다.
이 프로젝트는 사용자가 자신이 읽은 책의 진행 상황을 기록하고, 독서 노트와 메모를 통해 인사이트를 정리하며, 장르별 맞춤형 책 추천을 받을 수 있도록 개발되었습니다.

<br>

## 개발 환경
| **언어 및 런타임** | Java 11+, JavaScript (ES6+), TypeScript 4.x |                                           
|-----------------|:-----------------|
| **백엔드** | Spring Boot 3.x, Spring MVC, Spring Security, Spring Data JPA (Hibernate), Maven Wrapper, 내장Tomcat, Nginx |
| **프론트엔드** | React 18.x, TypeScript, React Hooks & Context API, Axios, Chart.js, Vite (또는 Create React App) |
| **데이터베이스** | 개발: H2 (in-memory)<br>운영: MySQL 8.x |
| **디자인 & 프로토타이핑** | Figma |
| **버전 관리** | GitHub (c1oud-dev/Booktine), 브랜치 전략: main / develop / feature/* |
| **개발 도구** | IntelliJ IDEA, VS Code, Postman / Insomnia, Git Bash / Windows Terminal / iTerm2 |
| **배포 & CI/CD** | 프론트: GitHub Pages / Vercel<br>백엔드: Railway (or AWS/GCP/Azure) + Nginx<br>CI: GitHub Actions |
| **기타** | Docker (MySQL 컨테이너), 환경 변수: `.env` (frontend), `application.properties` (backend), Lint/Formatter: ESLint, Prettier, Spotless |

<br>

## 기능
- **독서 진행 상황 추적**  
  사용자가 읽은 책의 완독 여부, 읽은 날짜, 독서량(월별, 연간) 등 다양한 통계 데이터를 제공하여 독서 목표 달성 상황을 확인할 수 있습니다.

- **독서 노트 및 메모 관리**  
  사용자가 책에 대한 감상, 요약, 메모를 작성, 수정, 삭제할 수 있으며, 이를 통해 개인의 독서 기록을 체계적으로 관리할 수 있습니다.

- **책 추천 서비스**  
  Aladin API를 활용하여 사용자가 선택한 장르에 맞는 책을 랜덤으로 추천합니다.

- **회원가입 및 인증**  
  Spring Security와 BCryptPasswordEncoder를 사용하여 회원가입, 로그인, 비밀번호 재설정 등의 인증 기능을 제공합니다.

- **사용자 설정 및 프로필 관리**  
  사용자 프로필 사진 업로드, 기본 정보 수정, 게시글 수 및 완독한 책 수 등 개인별 통계 정보를 확인할 수 있습니다.

<br>

## 설치 및 실행
### 백엔드
1. **환경 준비**  
   - Java 11 이상  
   - Maven 또는 Gradle 설치  
   - MySQL (또는 H2) 데이터베이스 생성 및 접근 정보 확인  
2. **설정 파일 업데이트**  
   ```properties
   # src/main/resources/application.properties
   spring.datasource.url=jdbc:mysql://{HOST}:{PORT}/{DATABASE}?useSSL=false&serverTimezone=UTC
   spring.datasource.username={USERNAME}
   spring.datasource.password={PASSWORD}
   server.port=${PORT:8080}
3. **프로젝트 빌드 및 실행:**
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run

### 프론트엔드
1. **환경 준비**  
    - Node.js (v16 이상) & npm 설치
2. **프로젝트 실행**
  ```bash
  cd frontend
  npm install
  npm start
  ```

<br>

## 서비스 화면

### ✓ Sign Up
| 회원가입 |
| :---------------------------------------------- |
| • 상단 “Sign Up” 버튼 클릭 시 회원가입 모달이 열립니다. <br> • **입력 필드** : 이메일, 닉네임, 비밀번호 <br> • **유효성 검사** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 닉네임 : 한글 8자, 영문 14까지 입력 가능하고 공백과 특수문자는 불가능, 중복 확인 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 이메일 : 이메일 형식 유효 검사, 중복 확인 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 비밀번호 : 영문 대소문자/숫자/특수문자를 혼용하여 8~16자를 입력 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 유효성 검사를 통과하지 못할 경우 각 입력창 하단에 경고 문구가 나타납니다. <br> • **가입 처리** : 유효성 검사가 통과되면 "Sign Up" 버튼 클릭이 활성화 되고 버튼 클릭 시 백엔드로 요청 전송 → 성공 시 완료 메시지 표시 후 Log In 탭으로 이동 |
| ![Image](https://github.com/user-attachments/assets/b5477c0f-2323-4468-b6e3-7d9a2b542d57) |

### ✓ Log In
| 1️⃣ 로그인 |
| :---------------------------------------------- |
| • "Log In" 버튼을 클릭한 후 등록된 이메일과 비밀번호를 입력해 서비스에 접속합니다. <br> • 로그인 성공 시 JWT 토큰이 발급되어 이후 인증이 필요한 API 호출에 사용됩니다. |
| ![Image](https://github.com/user-attachments/assets/8b9e9c87-a827-46e9-a99e-3e3b35685a6b) |

| 2️⃣ 로그인 유지 및 비밀번호 수정 |
| :---------------------------------------------- |
| • **로그인 유지** <br> &nbsp;&nbsp;&nbsp;&nbsp; “로그인 유지” 체크박스를 활성화하면 세션 쿠키가 연장되어 브라우저 새로고침 후에도 로그인 상태가 유지됩니다.  <br> • **“비밀번호 찾기” 링크 클릭** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 로그인 모달에서 해당 링크를 누르면 ‘비밀번호 재설정’ 전용 모달이 열립니다. <br> • **새 비밀번호 설정** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 이메일이 확인되면 새 비밀번호를 입력함으로써 비밀번호를 재설정할 수 있습니다. <br> • **완료 후 리다이렉션** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 재설정 성공 시 토스트 메시지로 안내 후 자동으로 로그인 모달로 돌아갑니다. <br> <br> 이로써 사용자는 이메일 인증 → 새 비밀번호 입력 절차를 통해 안전하게 비밀번호를 변경할 수 있습니다. |
| ![Image](https://github.com/user-attachments/assets/3459f38d-559b-4467-8d7a-802ce0134b5d) |

### ✓ Home
| 1️⃣ 초기 Home 페이지 |
| :---------------------------------------------- |
| • **상단 내비게이션 바** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 왼쪽 로고 “Booktine”을 클릭 시 Main 페이지로 이동<br> &nbsp;&nbsp;&nbsp;&nbsp; - “Home”, “Book Note”, “Progress”, “Settings” 메뉴로 이동 가능 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 우측에 현재 로그인된 사용자 닉네임(예: “테스터”) 및 로그아웃 버튼. <br> • **목표 설정** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 연간 목표량과 달성량을 확인할 수 있는 Card <br> &nbsp;&nbsp;&nbsp;&nbsp; - 연간 목표: 올해 읽을 총 권수 설정 <br> • **통계 보기** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 연간/월별 독서량과 장르별 독서 비율을 확인할 수 있는 Card <br> • **독서 노트 이동** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 작성된 노트 목록을 확인할 수 있는 Card  <br> &nbsp;&nbsp;&nbsp;&nbsp; - 읽고 있는 책과 완독중인 책을 확인 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 독서 노트 버튼 클릭 시 Book Note 페이지로 이동  |
| ![Image](https://github.com/user-attachments/assets/54b64c5a-0d2e-40d9-92eb-332a8ef5b06e) |

| 2️⃣ 데이터가 반영된 Home 페이지 |
| :---------------------------------------------- |
| • 목표량과 독서 노트에 작성한 게시물의 정보가 Home 페이지에도 반영되어 있는 걸 확인할 수 있습니다. |
| ![Image](https://github.com/user-attachments/assets/380ef0d2-7bf0-4430-85f5-0153d146ae48) |

| 3️⃣ 도서 추천 |
| :---------------------------------------------- |
| • **표시 항목** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 책 제목, 저자, 짧은 소개 문구 그리고 표지 이미지 <br> • **추천받기 버튼** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 클릭 시 내부 API 호출 → 새로운 책 한 권을 랜덤 또는 알고리즘 기반으로 조회 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 조회 결과로 화면에 표시된 제목·저자·요약·표지 이미지가 즉시 갱신 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 여러 장르 선택에 따른 도서를 추천 <br> • **용도** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 사용자가 직접 추천 버튼을 눌러 매번 다른 책을 받아볼 수 있도록 함 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 메인 화면에서 간편하게 새로운 도서를 탐색하도록 지원 |
| ![Image](https://github.com/user-attachments/assets/1d01a25c-3d27-4771-afc9-669d43f6df5f) |


### ✓ Book Note
| 1️⃣ 글쓰기 |
| :---------------------------------------------- |
| • **제목 입력 및 표지 업로드** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 상단 중앙의 “제목을 입력하세요.” 영역에 글 제목을 입력 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 그 아래 “Upload Photo” 버튼으로 책 표지 혹은 배경화면 사진 선택·미리보기 <br> • **Book Information** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 책을 펴낸 날(Date Picker): 달력 아이콘을 클릭해 연·월·일 선택 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 저자 입력 필드 : 직접 타이핑<br> &nbsp;&nbsp;&nbsp;&nbsp; - 장르 선택 드롭다운: 미리 정의된 카테고리 중 하나를 선택하거나 직접 타이핑 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 출판사 입력 필드 : 자유 텍스트 <br> • **Summary 영역** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 책의 줄거리나 요약할 수 있는 텍스트 박스 <br> • **Memo 섹션** <br> &nbsp;&nbsp;&nbsp;&nbsp; - “메모 추가하기” 버튼으로 자유로운 추가 메모 항목 생성 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 메모별로 등록/수정/삭제를 할 수 있는 기능 <br> • **임시 저장 경고** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 페이지 떠나기(뒤로가기/로그아웃 등) 시 “저장하지 않은 임시 글이 있습니다. 불러오시겠습니까?” 모달 <br> &nbsp;&nbsp;&nbsp;&nbsp; - “불러오기” 클릭하면 이전 입력값 복원, “취소” 시 무시 <br> • **하단 액션 버튼** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 뒤로가기 : 목록 페이지로 복귀  <br> &nbsp;&nbsp;&nbsp;&nbsp; - 저장하기 : 입력한 정보를 서버에 저장(등록) <br> <br> 이 구조로 사용자는 제목·표지→메타정보→요약→메모를 순차적으로 작성하고, 중간에 페이지 이동 시에도 안전하게 임시 저장된 내용을 복원할 수 있습니다. |
| ![Image](https://github.com/user-attachments/assets/c075a58e-0608-46b3-8324-446531b32196) |

| 2️⃣ 필수입력 (제목, 저자, 책을 펴낸 날, 장르 입력 안 할 시) |
| :---------------------------------------------- |
|  • **대상 필드** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 제목, 책을 펴낸 날짜, 저자, 장르 선택 <br> • **동작 방식** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 사용자가 이 중 하나라도 비워두고 “저장하기" 버튼을 누르면 비어 있는 입력란 테두리에 빨간색으로 강조 표시(유효성 오류 표시) <br> &nbsp;&nbsp;&nbsp;&nbsp; - 폼 제출이 차단되고, 남은 필드를 채우기 전까지 서버 요청이 발생하지 않음 <br> • **사용자 피드백** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 누락된 항목이 바로 눈에 띄도록 에러 상태를 표시 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 모든 필드를 채워야만 저장 버튼이 정상적으로 동작하도록 보장 <br> <br> 이로써 핵심 메타데이터가 빠지지 않고 항상 입력된 상태로 글이 등록됩니다.  |
| ![Image](https://github.com/user-attachments/assets/cf9c5222-6ea6-472b-87f9-2472d61ba9b7) |

| 3️⃣ 사진 업로드 |
| :---------------------------------------------- |
|  • **“Upload Photo” 버튼 클릭** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 파일 선택 창이 뜨고, 사용자가 로컬에서 이미지 파일을 고릅니다. <br> • **선택한 이미지 즉시 미리보기** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 업로드가 완료되면 상단 헤더 영역의 배경(또는 카드 상단)으로 곧바로 반영 <br> &nbsp;&nbsp;&nbsp;&nbsp;  - 실제 저장 전에도 어떻게 보일지 확인 가능 <br> <br> 이미지 파일은 글 저장(등록/수정) 요청 시 함께 전송되어 서버에 보관되고, 다음에 해당 포스트를 불러올 때 표지로 표시됩니다. |
| ![Image](https://github.com/user-attachments/assets/ccf3609a-6da4-4270-a4ef-39fe32733260) |

| 4️⃣ 게시물 수정 1 | 4️⃣ 게시물 수정 2 |
| :--- | :--- |
| • **Book Note 목록에서 “수정하기"** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 카드 우측 상단의 **⋮** 메뉴를 클릭하면 “수정하기” 옵션이 표시됩니다. <br> &nbsp;&nbsp;&nbsp;&nbsp; - “수정하기” 선택 시 해당 포스트의 글쓰기 편집 화면으로 이동하며, 기존 입력한 데이터가 모두 그대로 로드됩니다. | • **게시글 상세 페이지에서 “수정하기"** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 상세 페이지 우측 상단의 **⋮** 메뉴에서도 동일하게 “수정하기”를 눌러 편집 모드로 진입할 수 있습니다. <br> &nbsp;&nbsp;&nbsp;&nbsp; - 상세 정보가 담긴 폼에 기존 값이 미리 채워져 바로 수정이 가능합니다. |
| ![Image](https://github.com/user-attachments/assets/3d542b06-90a4-4777-9ae2-d9b6121242e3) | ![Image](https://github.com/user-attachments/assets/d81e11e8-f2b6-4f31-9a96-ec89786b1d88) |

| 5️⃣ 게시물 삭제 | 
| :---------------------------------------------- |
| • **⋮ 메뉴 열기** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 카드 우측 상단의 점 세 개(⋮) 아이콘 클릭 <br> • **“삭제하기” 선택** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 메뉴에서 삭제하기(🗑️) 항목 클릭 <br> • **확인 모달** <br> &nbsp;&nbsp;&nbsp;&nbsp; - “정말 삭제하시겠습니까?” 확인 대화상자가 뜨며, “확인” 클릭 시 서버에 삭제 요청 전송 <br> &nbsp;&nbsp;&nbsp;&nbsp; - “취소” 클릭 시 작업 중단 <br> • **삭제 후 갱신** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 삭제 성공 시 해당 카드가 즉시 목록에서 사라지고, 전체 글 개수(“전체 글 n”)가 자동으로 업데이트됩니다. |
| ![Image](https://github.com/user-attachments/assets/57c18596-2fa2-408b-90f5-26f43e855af6)) |

| 6️⃣ 완독한 게시물 |
| :---------------------------------------------- |
| • **동작 방식** <br> &nbsp;&nbsp;&nbsp;&nbsp; 1. 입력 필드를 클릭하면 달력 위젯이 표시됩니다. <br> &nbsp;&nbsp;&nbsp;&nbsp; 2. 사용자는 읽기를 완료한 연·월·일을 선택합니다. <br> &nbsp;&nbsp;&nbsp;&nbsp; 3. 선택된 날짜는 포스트의 완독일로 저장되어, 나중에 목록이나 통계에서 ‘완독된 날짜’ 정보로 활용됩니다. |
| ![Image](https://github.com/user-attachments/assets/5cec19d8-c2be-42a3-9acb-755a2858289b) |

| 7️⃣ 검색하기 |
| :---------------------------------------------- |
| • **동작 방식** <br> &nbsp;&nbsp;&nbsp;&nbsp; 1. 검색창에 키워드(예: 책 제목 일부)를 입력 <br> &nbsp;&nbsp;&nbsp;&nbsp; 2. 실시간으로 카드 목록을 필터링  <br> • **결과 표시** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 입력한 키워드를 포함한 제목의 포스트만 보여 줌 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 기존 목록이 즉시 갱신되어, 나머지 게시물은 숨김 처리 <br> • **용도** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 원하는 노트를 빠르게 찾을 수 있도록 도와 줌 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 별도 버튼 클릭 없이 엔터 혹은 자동 반응으로 즉시 검색 결과 반영 |
| ![Image](https://github.com/user-attachments/assets/1f3206b1-7a5d-4444-94fa-20d7c289dc06) |


### ✓ Progress
| Progress |
| :---------------------------------------------- |
|  • **연간 목표 현황 (Yearly Goal Card)** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 상단 원형 게이지 : 올해 목표 대비 완독 비율(%) 표시 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 아래 텍스트 : “목표”, “달성”, “남은 책” 권수로 수치 요약 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 목표 설정 버튼 : 연간 목표 수치 변경 모달로 이동 <br> • **월별 목표 현황 (Monthly Goal Card)** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 카드 헤더에서 연도·월 선택 드롭다운 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 원형 게이지: 선택한 달의 목표 대비 달성 비율(%) <br> &nbsp;&nbsp;&nbsp;&nbsp; - 아래 “목표” 와 “달성” 권수 표시 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 목표 설정 버튼: 해당 월 목표 수치 수정 <br> • **연간 독서량 차트 (Monthly Reading Bar Chart)** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 가입한 연도부터 연간 독서량 진행 상황을 한눈에 확인 <br> • **월별 독서량 차트 (Monthly Reading Bar Chart)** <br> &nbsp;&nbsp;&nbsp;&nbsp; - X축: 1월–12월, Y축: 권수 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 연─은 “목표”, 실선─은 “달성” 바(bar)로 비교 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 선택한 연도의 월별 진행 상황 한눈에 확인 <br> • **장르별 독서 비율 (Genre Distribution Donut & Table)** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 도넛 차트: 전체 읽은 책 중 장르별 비중 시각화 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 차트 옆 표(Table): 각 장르명, Value(권), 백분율(%) 나열 <br> &nbsp;&nbsp;&nbsp;&nbsp; - “가장 많이 읽은 장르” 텍스트로 추천 장르 강조 <br> <br> 이렇게 연간·월간 목표 관리와 **세부 통계(월별 권수, 장르 분포)**를 한 화면에서 직관적으로 파악할 수 있습니다. |
| ![Image](https://github.com/user-attachments/assets/78c294bf-9e55-4e35-ad5c-fbfc03efe7fe) |


### ✓ Settings
| 1️⃣ 프로필 업로드 |
| :---------------------------------------------- |
|  • **“Upload new Profile” 버튼 클릭** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 파일 선택 창이 열려, 로컬에서 이미지를 고를 수 있습니다. <br> • **즉시 미리보기** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 선택한 사진이 사이드바의 기본 아바타 자리로 바로 반영되어 표시됩니다. <br> • **저장 동작** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 프로필 변경 후 SAVE 클릭 시 서버에 업로드되어 사용자 계정에 영구 저장 <br> • **반영 범위** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 상단 내비게이션 바의 작은 아바타 아이콘, Settings 페이지 아바타, Book Note 등의 사용자 정보 영역에서 새 사진이 보입니다. |
| ![Image](https://github.com/user-attachments/assets/2429d505-fe4b-465e-a9b9-d52f8a183345) |

| 2️⃣ 프로필 정보 수정 |
| :---------------------------------------------- |
|  • **Basic Info 편집** <br> &nbsp;&nbsp;&nbsp;&nbsp; - Nickname : 입력 필드에서 변경 가능 <br> &nbsp;&nbsp;&nbsp;&nbsp; - About Me : 자기소개 텍스트박스에 원하는 내용 작성 <br> • **보안 확인** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 변경 사항을 저장하려면 Password 필드에 현재 비밀번호 입력 필수 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 입력하지 않으면 오류 메시지 표시 <br> • **액션 버튼** <br> &nbsp;&nbsp;&nbsp;&nbsp; - SAVE : 비밀번호 확인 후 서버에 업데이트 <br> &nbsp;&nbsp;&nbsp;&nbsp; - CANCEL : 입력 전 상태로 편집 취소 <br> • **즉시 반영** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 저장 후 상단 내비게이션과 Settings 페이지, Book Note 등에서 새 닉네임·소개·아바타가 모두 업데이트됨 <br> <br> 이로써 사용자는 닉네임·소개 글을 안전하게 변경하고, 변경 전후 상태를 취소하거나 저장할 수 있습니다. |
| ![Image](https://github.com/user-attachments/assets/6ed7ae4e-b781-48b2-a82f-4e38023d4125) |

| 3️⃣ 회원탈퇴 |
| :---------------------------------------------- |
|  • **“회원 탈퇴” 링크 클릭** <br> &nbsp;&nbsp;&nbsp;&nbsp; - Settings 페이지 하단의 텍스트 링크를 누르면 탈퇴 확인 모달이 표시됩니다. <br> • **비밀번호 확인** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 모달 내 암호 입력 필드에 현재 비밀번호를 입력해야 “확인” 버튼이 활성화 <br> • **탈퇴 처리** <br> &nbsp;&nbsp;&nbsp;&nbsp; - “확인” 클릭 시 서버 요청 → 계정 및 연관 데이터(게시물, 메모 등) 전부 삭제 <br> &nbsp;&nbsp;&nbsp;&nbsp; - 성공적으로 탈퇴되면 자동으로 로그아웃되고 메인 화면으로 리다이렉트됩니다. <br> • **취소 옵션** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 모달의 “취소” 버튼으로 탈퇴 절차를 중단할 수 있습니다. |
| ![Image](https://github.com/user-attachments/assets/f16e472d-d51d-43f0-90a0-b16cda01ea24) |


### ✓ 로그아웃
| LogOut |
| :---------------------------------------------- |
|  • **“Log Out” 버튼 클릭** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 상단 내비게이션 바에 위치한 로그아웃 버튼을 누르면 <br> • **세션/쿠키 삭제** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 클라이언트의 인증 토큰(쿠키, 로컬 스토리지 등)을 제거 <br> • **서버 알림(Optional)** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 필요 시 서버에 로그아웃 요청을 보내 세션을 무효화 <br> • **리다이렉션** <br> &nbsp;&nbsp;&nbsp;&nbsp; - 로그아웃 후 로그인 화면(또는 메인 페이지)으로 자동 이동 <br> <br> 이를 통해 사용자는 안전하게 계정에서 로그아웃하고, 다른 사용자가 접근하지 못하도록 세션이 완전히 종료됩니다. |
| ![Image](https://github.com/user-attachments/assets/5a3fa785-5a95-45ed-8642-b23522db3c0e) |

<br>

## 프로젝트 구조
```
Booktine/
├── frontend/  
│   └── src/  
│       ├── components/              # 재사용 가능한 UI 컴포넌트  
│       │   ├── AuthModal.tsx  
│       │   ├── Header.tsx  
│       │   ├── Footer.tsx  
│       │   ├── MonthlyBarChart.tsx
│       │   ├── AnnualLineChart.tsx  
│       │   ├── HomeGenreDoughnutChart.tsx  
│       │   └── GenreDoughnutChart.tsx  
│       ├── pages/                   # 화면 단위 컴포넌트  
│       │   ├── HomePage.tsx  
│       │   ├── BookNote.tsx  
│       │   ├── ProgressPage.tsx  
│       │   ├── SettingsPage.tsx  
│       │   ├── CreatePostPage.tsx  
│       │   ├── MainPage.tsx  
│       │   └── PostDetailPage.tsx  
│       ├── services/                # API 호출 로직  
│       │   ├── AuthService.ts  
│       ├── App.tsx                  # 최상위 컴포넌트  
│       ├── index.tsx                # 진입점  
│       ├── index.css  
│       └── App.css  
└── src/  
    └── main/  
        ├── java/com/c1ouddev/booktine/  
        │   ├── config/              # 설정 클래스  
        │   │   └── SecurityConfig.java
        │   ├── controller/          # REST API 엔드포인트  
        │   │   ├── AuthController.java 
	│   │   ├── ProgressController.java
	│   │   ├── RecommendationController.java
        │   │   ├── PostController.java  
        │   │   ├── UploadController.java
        │   │   └── SettingsController.java
        │   ├── model/              # JPA 엔티티  
        │   │   ├── User.java  
        │   │   ├── Post.java  
        │   │   ├── Memo.java  
        │   │   └── Author.java
        │   ├── repository/          # JPA 리포지토리  
        │   │   ├── UserRepository.java  
        │   │   └── PostRepository.java  
        │   ├── service/             # 비즈니스 로직  
        │   │   ├── ProgressService.java  
        │   │   ├── PostService.java  
        │   │   ├── RecommendationService.java
        │   │   └── UserService.java  
        │   └── BooktineApplication.java  
        └── resources/  
            ├── application.properties  
```

<br>

## 개선 목표

### 1. 로그인
- **SNS, Google 등 다른 이메일 연동**
  - 소셜 로그인(네이버, 카카오, Google 등) 기능 추가
  - 해당 소셜 계정과 사용자 계정 매핑 처리
- **이메일 인증**
  - 회원가입 시 입력한 이메일로 인증 코드 발송
  - 인증 코드 입력 후 계정 활성화

---

### 2. 비밀번호 찾기
- **이메일 입력 및 인증 코드 발송**
  - 회원 등록된 이메일 주소를 입력 후 “인증코드 발송” 버튼 클릭
  - 서버에서 입력된 이메일로 6자리 인증 코드 전송
- **인증 코드 확인**
  - 받은 코드를 입력 필드에 입력하면 “코드 확인” 버튼 활성화
  - 코드 유효성 검사 후 성공 시 다음 단계로 이동
- **새 비밀번호 설정**
  - 인증 코드 확인이 완료되면 새 비밀번호 입력창과 확인용 입력창 노출
  - 두 필드에 동일한 비밀번호를 입력한 뒤 “비밀번호 재설정” 버튼 클릭

---

### 3. Book Note
- **페이지 분류/목록 기능 추가**
  - 카테고리(장르, 상태 등)별 필터링 기능 구현
  - 작성된 노트 목록을 분류별로 그룹화하여 표시
  - 페이지네이션 또는 무한 스크롤 적용으로 노트 탐색 편의성 향상


<br>

## 프로젝트 후기
