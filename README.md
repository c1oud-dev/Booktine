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

![Image](https://github.com/user-attachments/assets/e6826308-10d7-4696-b3eb-9268be15104e)

🔗 **서비스**: https://booktine.cloud
> 서비스 운영 기간: 2026.05 ~ 2027.05

<br>

## 목차

[프로젝트 소개](#프로젝트-소개) · [개발 기간](#개발-기간) · [기술 스택](#기술-스택) · [주요 기능](#주요-기능) · [시스템 아키텍처](#시스템-아키텍처) · [ERD](#erd) · [트러블슈팅](#트러블슈팅) · [프로젝트 후기](#프로젝트-후기)

<br>

## 프로젝트 소개

독서 기록이 메모 앱, 노트, 사진 등 여러 곳에 흩어져 장기적으로 관리하기 어렵다는 문제에서 출발했습니다.
Booktine은 읽은 책의 기록과 메모, 월간·연간 독서 목표, 통계 시각화, 도서 추천, 독서 커뮤니티까지 하나의 서비스에서 제공합니다.

<br>

## 개발 기간
| 구분 | 기간 |
|------|------|
| **1차 개발** | 2025.02.28 ~ 2025.05.01 |
| **2차 개발** | 2026.04.27 ~ 2026.05.11 |
| **리팩토링** | 2026.05.11 ~ |
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

[사진](https://github.com/user-attachments/assets/d63acabd-63a0-4feb-9858-203b5e7662bc)

<br>

## 트러블슈팅

<br>

## 프로젝트 후기

### 느낀 점
1차 개발 코드를 다시 봤을 때 솔직히 당황했다.
백엔드 개발자가 되고 싶다고 하면서 정작 프론트에 집중된 코드를 짜고 있었고,
구현하면서도 수정의 반복이었다. 수정할 수 있는 수준이 아니라고 판단해서 코드를 싹 밀고 처음부터 다시 시작했다.

배포도 마찬가지였다. 무료 플랫폼을 찾아 이리저리 옮겨다니다 보니 제대로 된 배포가 안 됐고,
CORS 에러 하나 때문에 두 달을 날리기도 했다. 1차 때의 시행착오를 겪지 않기 위해 
이번에 AWS를 처음 사용해보면서 도메인도 직접 구매해보고, Docker도 써보면서 
배포가 어떤 흐름으로 돌아가는지 처음으로 제대로 이해하게 됐다.
배포가 얼마나 복잡하고 신경 써야 할 게 많은지 직접 몸으로 느꼈다.

2차 개발은 완전히 달랐다.
백엔드 설계를 먼저 세세하게 잡고, 일정이랑 기능 우선순위까지 다 정하고 들어가니까
개발하는 데 막히는 게 없었고 훨씬 깊이 있게 만들어졌다.
규모가 작은 프로젝트인데도 도메인이 생각보다 훨씬 커져서 놀라기도 했다.
그리고 백엔드가 잘 구현되니까 프론트 구현할 때 그렇게 힘을 쏟을 필요가 없다는 걸 깨달았다.

1차 개발 때랑 비교하면 나 자신이 굉장히 많이 성장했다는 걸 느낀다.
그때는 성능도, 보안도, N+1이 뭔지도 몰랐는데 이제는 그런 부분까지 직접 고민하고 적용해볼 수 있게 됐다.
이 프로젝트가 단순한 포트폴리오용 프로젝트가 아니라 나의 성장을 제대로 보여주는 프로젝트라고 생각하고,
나의 첫 프로젝트라 더 의미 있다.

### 아쉬운 점
기능적으로 특별하게 자랑할 만한 게 없는 것 같다는 생각이 든다. 
배포 전에는 충분히 완벽하게 했다고 생각했는데, 막상 실제 환경에서 뜯어보면 또 문제가 나왔다. 
완벽하다고 느끼는 순간이 없는 것 같다.

### 향후 계획
부족한 기능들은 계속 추가할 예정이고, 보안 문제나 성능 문제, 동시성 처리, 
실제 가입자 수 같은 지표 등 실제 서비스 운영 관점에서 고려해야 할 것들을 하나씩 리팩토링해나갈 계획이다.

### 마치며

앞으로도 Booktine을 계속 발전시켜서 단순한 독서 기록을 넘어 
사람들이 독서 습관을 만들고 유지하는 데 실질적으로 도움이 되는 서비스로 만들어나갈 생각입니다.
