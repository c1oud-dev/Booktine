# 📚 Booktine
> 독서 기록, 목표, 통계, 추천, 커뮤니티를 한 곳에서 관리하는 독서 습관 관리 서비스

![Java](https://img.shields.io/badge/Java_21-007396?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazonaws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

![Image]("https://github.com/user-attachments/assets/e6826308-10d7-4696-b3eb-9268be15104e")

🔗 **서비스**: https://booktine.cloud
> 서비스 운영 기간: 2025.05 ~ 2026.05

<br>

## 목차

[프로젝트 소개](#프로젝트-소개) · [개발 기간](#개발-기간) · [기술 스택](#기술-스택) · [주요 기능](#주요-기능) · [시스템 아키텍처](#시스템-아키텍처) · [ERD](#erd) · [트러블슈팅](#트러블슈팅) · [프로젝트 후기](#프로젝트-후기)

<br>

## 프로젝트 소개

독서 기록이 메모 앱, 노트, 사진 등 여러 곳에 흩어져 장기적으로 관리하기 어렵다는 문제에서 출발했습니다.
Booktine은 읽은 책의 기록과 메모, 월간·연간 독서 목표, 통계 시각화, 도서 추천, 독서 커뮤니티까지 하나의 서비스에서 제공합니다.

<br>

## 개발 기간
- **전체 개발 기간** : 2025.02.28 ~ 2025.05.01
- **프로젝트 계획 및 UI 설계** : 2025.02.28 ~ 2025.03.09
- **프론트 & 백엔드 작업** : 2025.03.10 ~ 2025.04.14
- **리팩토링** : 2025.04.15 ~ 2025.05.01
- **전면 수정** : 2026.04.27 ~ 2026.05.11(약 2주)

<br>

## 기술 스택

### Backend
| 구분 | 기술 |
|------|------|
| Language | Java 21 (GraalVM) |
| Framework | Spring Boot 3.3, Spring Security 6 |
| Persistence | Spring Data JPA, MySQL 8, H2 (dev) |
| Auth | JWT, Redis, OAuth2 (Google), BCrypt |
| Storage / External | AWS S3, Aladin API, SMTP |
| API Docs | springdoc-openapi / Swagger UI (dev only) |
| Build | Gradle |

### Frontend
| 구분 | 기술 |
|------|------|
| Language | TypeScript |
| Framework | React 18, Vite |
| Styling | Tailwind CSS v3, shadcn/ui, CSS Variables |
| HTTP | Axios (Bearer Token Interceptor) |
| UI | lucide-react, framer-motion |

### Infra
| 구분 | 기술 |
|------|------|
| Compute | AWS EC2, Docker, Docker Hub |
| Database | AWS RDS (MySQL 8) |
| Cache | AWS ElastiCache (Redis) |
| Storage / CDN | AWS S3, CloudFront |
| Network | ALB, HTTPS (booktine.cloud / api.booktine.cloud) |

<br>

## 주요 기능

### 인증 / 회원 관리
[사진]

이메일 회원가입 및 이메일 인증, Google OAuth2 소셜 로그인을 지원합니다. JWT Access Token + Refresh Token 기반 인증과 Redis를 활용한 토큰 재발급 및 무효화, 비밀번호 재설정 기능을 제공합니다.

### 독서 기록 (Book Note)
[사진]

도서 기록 CRUD와 독서 상태(읽는 중 / 완독 / 일시정지 / 읽고 싶음) 관리, 별점·한줄평·장르 기반 독서 노트를 작성할 수 있습니다.

### 메모 관리
[사진]

도서 기록별로 메모를 작성·수정·삭제할 수 있습니다. 책을 읽으며 남긴 문장, 감상, 요약을 도서 단위로 정리합니다.

### 목표 및 통계 (Progress)
[사진]

월간·연간 독서 목표를 설정하고, 기본 통계, 장르별 분포, 연간 월별 완독 권수, 연간 완독 요약을 시각화하여 제공합니다.

### 도서 추천 (Recommendation)
[사진]

Aladin API를 연동해 도서 검색, 베스트셀러 조회, 장르 기반 추천을 제공합니다. 추천받은 도서를 저장하고 목록으로 관리할 수 있습니다.

### 독서 커뮤니티
[사진]

커뮤니티 게시글 작성·수정·삭제와 댓글, 대댓글, 좋아요 기능을 지원합니다.

### 리마인더
[사진]

독서 리마인더를 등록하고 SSE 연결을 통해 실시간 알림을 수신할 수 있습니다.

### 관리자
[사진]

관리자 권한으로 사용자, 게시글, 장르, 문의 목록을 조회하고 장르를 추가·삭제할 수 있습니다.

<br>

## ERD

[사진]

<br>

## 트러블슈팅


## 프로젝트 후기

### 🎯 프로젝트를 마치며
2개월간의 Booktine 개발을 마무리하며, 독서 습관 관리라는 실용적인 서비스를 완성했다는 점에서 큰 보람을 느꼈습니다.

### 💡 가장 보람있었던 점
- **풀스택 개발 경험**: Spring Boot + React를 활용한 완전한 웹 애플리케이션 구축
- **사용자 중심 기능**: 임시저장, 독서 통계 시각화, 목표 관리 등 세심한 UX 구현
- **실무 경험**: Docker 컨테이너화, Render 배포, Git 버전 관리 등 DevOps 기초 습득

### 🚧 어려웠던 점
- **상태 관리**: React 컴포넌트 간 복잡한 상태 공유 → 향후 Redux 도입 예정
- **파일 업로드**: 이미지 처리 및 경로 매핑 → 클라우드 스토리지 필요성 체감
- **반응형 디자인**: 모바일 대응 미흡 → 추후 개선 필요

### 📚 주요 성과
- JPA를 활용한 효율적인 데이터베이스 설계
- TypeScript 도입으로 타입 안정성 확보
- Spring Security 기반 인증/인가 시스템 구현
- Chart.js를 활용한 독서 통계 시각화

### 🔮 향후 계획
- 소셜 로그인, 이메일 인증 기능 추가
- 독서 커뮤니티 기능 확장
- 성능 최적화 (페이지네이션, lazy loading)
- 테스트 코드 보강

### 마치며
첫 풀스택 프로젝트를 통해 기술적 성장뿐만 아니라 사용자 관점에서 서비스를 바라보는 시각을 기를 수 있었습니다. 완벽하지 않지만 스스로 기획부터 배포까지 완성했다는 점에서 의미 있는 경험이었습니다.

앞으로도 Booktine을 지속적으로 개선하여 많은 사람들의 독서 습관 형성에 도움이 되는 서비스로 발전시키겠습니다.
