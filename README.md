# FauxFinder AI

FauxFinder AI is a full-stack fake Instagram profile detection project. It uses a Spring Boot backend, a Python ML model, MySQL, and a React frontend.

## Current Features

| Feature | Description |
|---|---|
| Login and Registration | Users can create an account and log in before using the app |
| ML Detection | Ensemble model using Random Forest + Gradient Boosting trained on 621 Instagram profiles |
| Risk Score | Probability-based score from 0 to 100 percent showing how likely a profile is fake |
| Report System | Users can report fake profiles and report data is saved in the database `reports` table |

## Project Structure

```text
FauxFinder AI/
|-- fauxfinder-backend/
|   |-- pom.xml
|   |-- system.properties
|   `-- src/main/
|       |-- java/com/example/FauxFinderAi/
|       |   |-- FauxFinderAiApplication.java
|       |   |-- Controller/
|       |   |   |-- AuthController.java
|       |   |   |-- ProfileController.java
|       |   |   `-- ReportController.java
|       |   |-- Service/
|       |   |   |-- AuthService.java
|       |   |   |-- ProfileService.java
|       |   |   `-- ReportService.java
|       |   |-- Repository/
|       |   |   |-- UserRepository.java
|       |   |   |-- ProfileRepository.java
|       |   |   `-- ReportRepository.java
|       |   `-- Entity/
|       |       |-- User.java
|       |       |-- RegisterRequest.java
|       |       |-- LoginRequest.java
|       |       |-- AuthResponse.java
|       |       |-- Profile.java
|       |       |-- PredictionResponse.java
|       |       |-- Report.java
|       |       `-- ReportRequest.java
|       `-- resources/
|           `-- application.properties
|-- ml/
|   |-- data/instagram_fake.csv
|   |-- feature_list.json
|   |-- model.pkl
|   |-- predict.py
|   |-- requirements.txt
|   `-- train_model.py
|-- FauxFinder AI/
|   |-- package.json
|   |-- vite.config.js
|   `-- src/
|-- Dockerfile
|-- render.yaml
`-- README.md
```

## Backend Architecture

The backend follows a simple beginner-friendly MVC style.

| Layer | Folder | Responsibility |
|---|---|---|
| Controller | `Controller` | Receives HTTP requests and returns API responses |
| Service | `Service` | Contains business logic |
| Repository | `Repository` | Uses Spring Data JPA to access database records |
| Entity | `Entity` | Defines tables and request/response objects |

The `Repository` layer works as the DAO/data-access layer in this Spring Boot project.

## Tech Stack

| Part | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.5.15, Spring Web, Spring Data JPA, Spring Security |
| Security | BCrypt password hashing |
| Database | MySQL |
| Machine Learning | Python, scikit-learn, pandas, numpy |
| Frontend | React 19, Vite, Axios |
| Deployment | Docker, Render configuration |

The login module is intentionally simple for a beginner project. It stores users in MySQL and hashes passwords with BCrypt. It does not use JWT.

## Requirements

Install these tools before running or deploying:

| Tool | Version |
|---|---|
| Java JDK | 17 or newer |
| Maven | 3.8 or newer |
| MySQL | 8 or newer |
| Python | 3.10 recommended |
| Node.js | 18 or newer |
| Docker | Required for Docker/Render deployment |

## Environment Variables

Backend configuration is in:

```text
fauxfinder-backend/src/main/resources/application.properties
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Backend HTTP port |
| `SPRING_DATASOURCE_URL` | Local MySQL `fauxfinder` URL | JDBC database URL |
| `SPRING_DATASOURCE_USERNAME` | `root` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | `admin` | Database password |
| `HIBERNATE_DDL_AUTO` | `update` | Hibernate schema mode |
| `SHOW_SQL` | `false` | Show SQL in logs |
| `PYTHON_EXEC` | Local Python path | Python executable used by Java |
| `ML_SCRIPT_PATH` | Local `ml/predict.py` path | Prediction script path |

Frontend configuration:

| Variable | Example | Description |
|---|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` | Backend API base URL for deployed frontend |

If `VITE_API_URL` is not set, the frontend uses `/api`, which works locally through the Vite proxy.

## Local Setup

### 1. Create MySQL Database

```sql
CREATE DATABASE IF NOT EXISTS fauxfinder
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

The backend uses Hibernate with `ddl-auto=update`, so these tables are created or updated automatically:

```text
users
profiles
reports
```

### 2. Install Python ML Dependencies

From the project root:

```powershell
pip install -r ml\requirements.txt
```

### 3. Set Local Backend Variables

PowerShell example:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/fauxfinder?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="your_mysql_password"
$env:PYTHON_EXEC="python"
$env:ML_SCRIPT_PATH="C:\Users\rampa\OneDrive\Desktop\FauxFinder AI\ml\predict.py"
```

### 4. Build and Run Backend

```powershell
cd "C:\Users\rampa\OneDrive\Desktop\FauxFinder AI\fauxfinder-backend"
mvn.cmd clean package -DskipTests
java -jar target\FauxFinderAi-0.0.1-SNAPSHOT.jar
```

Backend URL:

```text
http://localhost:5000
```

### 5. Run Frontend

Open a second terminal:

```powershell
cd "C:\Users\rampa\OneDrive\Desktop\FauxFinder AI\FauxFinder AI"
npm install
npm.cmd run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Deployment Steps

### Option A: Deploy Backend with Docker

The root `Dockerfile` builds the Spring Boot backend and bundles the Python ML runtime.

From the project root:

```powershell
docker build -t fauxfinder-backend .
```

Run the container against local MySQL on Windows:

```powershell
docker run -p 5000:5000 `
  -e SPRING_DATASOURCE_URL="jdbc:mysql://host.docker.internal:3306/fauxfinder?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" `
  -e SPRING_DATASOURCE_USERNAME="root" `
  -e SPRING_DATASOURCE_PASSWORD="your_mysql_password" `
  -e HIBERNATE_DDL_AUTO="update" `
  fauxfinder-backend
```

Docker image includes:

```text
Java 17 runtime
Python 3
Python ML dependencies
Spring Boot backend JAR
ml/predict.py
ml/model.pkl
ml/feature_list.json
```

### Option B: Deploy Backend on Render

This project includes:

```text
render.yaml
Dockerfile
```

1. Push the full project to GitHub.
2. Create a MySQL database using any managed MySQL provider.
3. Copy the production JDBC URL, username, and password.
4. In Render, create a new Blueprint or Web Service from the GitHub repo.
5. Render will use the root `Dockerfile`.
6. Set these environment variables in Render:

| Variable | Value |
|---|---|
| `PORT` | `5000` |
| `SPRING_DATASOURCE_URL` | Production MySQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Production MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | Production MySQL password |
| `HIBERNATE_DDL_AUTO` | `update` |
| `PYTHON_EXEC` | `python3` |
| `ML_SCRIPT_PATH` | `/app/ml/predict.py` |

Render health check:

```text
/api/profiles
```

Production JDBC URL example:

```text
jdbc:mysql://your-host:3306/fauxfinder?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

### Option C: Deploy Frontend on Vercel or Netlify

Frontend folder:

```text
FauxFinder AI/
```

Build settings:

| Setting | Value |
|---|---|
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | `FauxFinder AI` |

Set this frontend environment variable:

```text
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

After setting environment variables, redeploy the frontend.

## API Reference

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

Request:

```json
{
  "username": "rampa",
  "email": "rampa@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "userId": 1,
  "username": "rampa",
  "email": "rampa@example.com",
  "role": "USER",
  "message": "Registration successful"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

Request:

```json
{
  "email": "rampa@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "userId": 1,
  "username": "rampa",
  "email": "rampa@example.com",
  "role": "USER",
  "message": "Login successful"
}
```

### Analyze Profile

```http
POST /api/profiles/analyze
Content-Type: application/json
```

Request:

```json
{
  "profile pic": 0,
  "nums/length username": 0.8,
  "fullname words": 1,
  "nums/length fullname": 0.5,
  "name==username": 1,
  "description length": 0,
  "external URL": 0,
  "private": 0,
  "#posts": 1,
  "#followers": 5,
  "#follows": 900
}
```

Response:

```json
{
  "riskScore": 0.896476,
  "isFake": true,
  "savedProfileId": 8,
  "features": {
    "profile pic": 0,
    "#followers": 5
  }
}
```

### Create Report

Reports can be created only for profiles detected as fake.

```http
POST /api/reports
Content-Type: application/json
```

Request:

```json
{
  "profileId": 8,
  "reporterId": 1,
  "reason": "This profile looks fake and is impersonating another user.",
  "severity": "HIGH"
}
```

Response:

```json
{
  "reportId": 2,
  "reason": "This profile looks fake and is impersonating another user.",
  "severity": "HIGH",
  "status": "OPEN"
}
```

Valid severity values:

```text
LOW
MEDIUM
HIGH
```

### Other Endpoints

```http
GET /api/profiles
GET /api/reports
```

## Database Tables

### users

Stores registered users.

Important fields:

```text
id
username
email
password
role
created_at
updated_at
```

The `password` field stores a BCrypt hash.

### profiles

Stores analyzed profile data, model risk score, and fake/not-fake result.

Important fields:

```text
id
risk_score
is_fake
created_at
updated_at
```

### reports

Stores reports filed against fake profiles.

Important fields:

```text
id
profile_id
reporter_id
reason
severity
status
created_at
updated_at
```

## Quick Production Test

Replace the base URL with your deployed backend URL.

### 1. Register User

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "https://your-backend.onrender.com/api/auth/register" `
  -ContentType "application/json" `
  -Body '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

### 2. Analyze Profile

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "https://your-backend.onrender.com/api/profiles/analyze" `
  -ContentType "application/json" `
  -Body '{
    "profile pic": 0,
    "nums/length username": 0.8,
    "fullname words": 1,
    "nums/length fullname": 0.5,
    "name==username": 1,
    "description length": 0,
    "external URL": 0,
    "private": 0,
    "#posts": 1,
    "#followers": 5,
    "#follows": 900
  }'
```

### 3. Submit Report

Use the `savedProfileId` returned from the analyze response.

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "https://your-backend.onrender.com/api/reports" `
  -ContentType "application/json" `
  -Body '{
    "profileId": 8,
    "reporterId": 1,
    "reason": "Fake profile report",
    "severity": "HIGH"
  }'
```

## Troubleshooting

| Problem | Fix |
|---|---|
| Frontend shows network error | Set `VITE_API_URL` to the deployed backend URL ending with `/api` |
| Backend cannot connect to MySQL | Check `SPRING_DATASOURCE_URL`, username, password, and database firewall settings |
| Tables are missing | Keep `HIBERNATE_DDL_AUTO=update` for first deployment |
| `predict.py` not found | Set `ML_SCRIPT_PATH=/app/ml/predict.py` in Docker/Render |
| Python package missing | Docker installs `ml/requirements.txt`; locally run `pip install -r ml\requirements.txt` |
| Port 5000 already in use | Stop the existing process or set `$env:PORT="5001"` locally |
| Report API returns `Only fake profiles can be reported` | Analyze the profile first and report only when `isFake` is `true` |
| Docker cannot reach local MySQL | Use `host.docker.internal` in the JDBC URL on Windows |

## Build Verification

Run these before deployment:

```powershell
cd "C:\Users\rampa\OneDrive\Desktop\FauxFinder AI\fauxfinder-backend"
mvn.cmd clean package -DskipTests
```

```powershell
cd "C:\Users\rampa\OneDrive\Desktop\FauxFinder AI\FauxFinder AI"
npm.cmd run build
```

Expected backend artifact:

```text
fauxfinder-backend/target/FauxFinderAi-0.0.1-SNAPSHOT.jar
```
