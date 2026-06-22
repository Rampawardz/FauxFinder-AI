FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /build
COPY fauxfinder-backend/pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY fauxfinder-backend/src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-jammy

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ml/requirements.txt /app/ml/requirements.txt
RUN pip3 install --no-cache-dir -r /app/ml/requirements.txt

COPY ml/predict.py ml/model.pkl ml/feature_list.json /app/ml/
COPY --from=build /build/target/FauxFinderAi-0.0.1-SNAPSHOT.jar /app/app.jar

ENV PYTHON_EXEC=python3
ENV ML_SCRIPT_PATH=/app/ml/predict.py
ENV PORT=5000

EXPOSE 5000

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
