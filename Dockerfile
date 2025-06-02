##### 1) 빌드 스테이지 #######################################################
FROM gradle:8.7-jdk17 AS build

# Node 20 설치 (React 빌드용)
RUN apt-get update \
 && apt-get install -y curl gnupg \
 && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y nodejs

WORKDIR /workspace
COPY . .
RUN gradle bootJar --no-daemon        # React + Spring 한 번에 빌드

##### 2) 런타임 스테이지 ######################################################
FROM eclipse-temurin:17-jre

WORKDIR /opt/app
COPY --from=build /workspace/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
