# Webhook Relay Service

## 📌 Overview

The **Webhook Relay Service** is a **NestJS-based** system that acts as a **proxy** for handling incoming webhooks reliably. It is designed to handle **network failures, rate limiting, and unstable internal services** by **queueing incoming requests** and retrying failed ones.

### **🔹 Key Features**
- **Receives webhooks** via a REST API (`POST /webhook`)
- **Queues webhooks** using **Bull (Redis)**
- **Processes jobs asynchronously** and forwards webhooks to internal services
- **Implements retry logic** for failed requests
- **Mock internal service** with random failures and delays
- **Load testing with Vegeta**

## ⚙️ **Tech Stack**

- **Backend:** NestJS (Node.js + TypeScript)
- **Queue Management:** Bull (Redis)
- **Database:** Redis
- **Load Testing:** Vegeta
- **Containerization:** Docker & Docker Compose

---

## 🚀 **Setup & Installation**

### **1️⃣ Clone the Repository**

```sh
git clone
cd webhook-relay
```

```sh
npm install
```

### **3️⃣ Configure Environment Variables**

Create a `.env` file in the root folder and define:

```env
PORT=3000
INTERNAL_SERVICE_URL=http://localhost:3000/internal-service
REDIS_HOST=redis
REDIS_PORT=6379
RETRY_DELAY=5000
MAX_RETRIES=3
```

### **4️⃣ Run the Services with Docker Compose**

```sh
docker-compose up --build
```

### **5️⃣ Verify Running Services**

Check running containers:

```sh
docker ps
```

Expected output:

```
CONTAINER ID   IMAGE                     PORTS                    NAMES
c7ae1b1dc107   webhook-relay-api         0.0.0.0:3000->3000/tcp    webhook-relay-api-1
087163cb8082   redis:alpine              0.0.0.0:6379->6379/tcp    webhook-relay-redis-1
```

---


## 📐 Architecture

```text
                 ┌──────────────────────────┐
                 │   External Webhook Source │
                 └──────────▲───────────────┘
                            │
                            ▼
                 ┌──────────────────────────┐
                 │  Webhook Relay API (NestJS) │
                 ├──────────────────────────┤
                 │ - Receives webhooks      │
                 │ - Queues jobs (Bull)     │
                 │ - Processes jobs        │
                 │ - Retries on failure    │
                 └──────────┬───────────────┘
                            │
                            ▼
                 ┌──────────────────────────┐
                 │   Redis Queue (Bull)      │
                 └──────────┬───────────────┘
                            │
                            ▼
                 ┌──────────────────────────┐
                 │   Internal Service (NestJS) │
                 │ - Simulates failures     │
                 │ - Random delays (0-30s)  │
                 └──────────────────────────┘
```

---

##  **API Documentation**

### **1️⃣ Webhook Endpoint**
#### **POST `/webhook`**
Receives a webhook and enqueues it for processing.

**Request Body Example:**
```json
{
  "event": "user_signup",
  "user": {
    "id": "12345",
    "email": "user@example.com"
  }
}
```

**Response:**
```json
{
  "status": "Webhook received"
}
```

---

### **2️⃣ Internal Service Endpoint**
#### **POST `/internal-service`**
Mocks an internal service with **30% failure rate** (400, 500, 502, 503) and **random delays (0-30s)**.

**Request Example:**
```json
{
  "event": "user_signup",
  "user": {
    "id": "12345",
    "email": "user@example.com"
  }
}
```

**Response Example:**
```json
{
  "success": true
}
```
or
```json
{
  "error": "HTTP 500"
}
```

---

## 📊 **Monitoring the Queue**

### **Check Job Status in Redis**

```sh
docker exec -it webhook-relay-redis-1 redis-cli
```

Then run:

```redis
ZRANGE bull:webhook-queue:completed 0 -1 WITHSCORES
ZRANGE bull:webhook-queue:failed 0 -1 WITHSCORES
```

✅ If completed jobs are increasing, everything works fine!  
❌ If failed jobs increase too much, check logs:

```sh
docker logs webhook-relay-api-1
```

---

## 🔥 **Load Testing with Vegeta**

### **1️⃣ Install Vegeta (if not installed)**

#### **MacOS**
```sh
brew install vegeta
```

#### **Linux**
```sh
wget -qO- https://github.com/tsenart/vegeta/releases/download/v12.12.0/vegeta-linux-amd64.tar.gz | tar xvz
chmod +x vegeta
sudo mv vegeta /usr/local/bin/
```

Verify installation:

```sh
vegeta -version
```

---

### **2️⃣ Run Load Test (1000 req/sec for 30s)**

```sh
echo "POST http://localhost:3000/webhook" | vegeta attack -duration=30s -rate=1000 | vegeta report
```

Example output:

```
Requests      [total, rate, throughput]         30000, 1000.04, 1000.01
Duration      [total, attack, wait]             30s, 29.999s, 780.789µs
Latencies     [min, mean, 50, 90, 95, 99, max]  607.779µs, 950.605µs, 876.874µs, 1.108ms, 1.324ms, 2.524ms, 15.56ms
Bytes In      [total, mean]                     870000, 29.00
Bytes Out     [total, mean]                     0, 0.00
Success       [ratio]                           100.00%
Status Codes  [code:count]                      201:30000  
```

---

### **3️⃣ Generate a JSON Report**

```sh
echo "POST http://localhost:3000/webhook" | vegeta attack -duration=30s -rate=1000 | vegeta report -type=json
```

---

## 🛠 **Troubleshooting**

### **1️⃣ Webhook Service Not Responding**
```sh
curl -X POST http://localhost:3000/webhook -H "Content-Type: application/json" -d '{"test": "ok"}'
```
If no response, check logs:

```sh
docker logs webhook-relay-api-1
```

### **2️⃣ Internal Service Not Reachable**
Try:

```sh
docker exec -it webhook-relay-api-1 curl -X POST http://localhost:3000/internal-service -H "Content-Type: application/json" -d '{"test": "ok"}'
```

If it fails, restart:

```sh
docker-compose down
docker-compose up --build
```

---

## 📝 **Conclusion**

This Webhook Relay Service efficiently queues incoming webhooks, handles failures with retry logic, and provides real-time monitoring with Redis. The **Vegeta load test** ensures that the system can handle **high traffic loads** efficiently.

