# ─── ① 빌드 스테이지 ──────────────────────────────────────────────────────────
# - JDK 17 + Gradle + Node 20 이미 포함된 공식 이미지 활용
FROM gradle:8.7.0-jdk17-node AS build

# 1) 캐시 최적화 ─ package.json만 먼저 복사 → npm ci 레이어 고정
WORKDIR /workspace
COPY frontend/package*.json frontend/
RUN npm --prefix frontend ci --omit=dev

# 2) 전체 소스 복사 후 React + Spring 동시 빌드
COPY . .
RUN ./gradlew bootJar --no-daemon            # ➜ build/libs/app.jar 생성

# ─── ② 런타임 스테이지 ──────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre

WORKDIR /opt/app
COPY --from=build /workspace/build/libs/*.jar app.jar
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70"   # Render Free 메모리 512MB용
ENTRYPOINT ["java","-jar","app.jar"]
