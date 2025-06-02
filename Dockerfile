##### 1) 빌드 스테이지 ########################################################
FROM gradle:8.7-jdk21 AS build

# Node·npm 설치 (React 빌드용)
USER root
RUN apt-get update \
 && apt-get install -y curl gnupg \
 && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y nodejs \
 && npm -v && node -v              # 버전 확인

# 소스 복사 → Gradle 빌드
WORKDIR /workspace
COPY . .
RUN gradle bootJar --no-daemon     # ← React + Spring 한 번에 빌드

##### 2) 런타임 스테이지 ######################################################
FROM eclipse-temurin:21-jre

WORKDIR /opt/app
COPY --from=build /workspace/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
