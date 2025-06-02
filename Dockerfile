##### 1) 빌드 스테이지 #######################################################
FROM gradle:8.7-jdk17 AS build

# 1️⃣ Node 20을 먼저 설치 (npm 포함)
RUN apt-get update \
 && apt-get install -y curl gnupg \
 && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y nodejs

# 2️⃣ 소스 작업 디렉터리 지정
WORKDIR /workspace

# 3️⃣ package*.json 먼저 복사 → 의존성 레이어 캐시
COPY frontend/package*.json frontend/

# 4️⃣ 의존성 설치 (npm ci)
RUN npm --prefix frontend ci --omit=dev

# 5️⃣ 전체 소스 복사 후 React + Spring 한 번에 빌드
COPY . .
RUN chmod +x gradlew
RUN ./gradlew bootJar --no-daemon

##### 2) 런타임 스테이지 ######################################################
FROM eclipse-temurin:17-jre

WORKDIR /opt/app
COPY --from=build /workspace/build/libs/*.jar app.jar
EXPOSE 8080

# Render Free (512 MB) 에 맞춰 JVM 메모리 제한
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70"

ENTRYPOINT ["java","-jar","app.jar"]
