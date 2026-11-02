# 💼 Personal Budget Tracker (Spring Boot Full-Stack)

A modern full-stack web application built with **Spring Boot 3, Spring Data JPA, H2 Database**, and a responsive frontend with currency selection (USD / INR).

---

## 🏗️ Project Architecture

```text
final_proj_k/
│
├── pom.xml                                              # Maven project dependencies & build config
├── src/
│   └── main/
│       ├── java/com/budget/tracker/
│       │   ├── BudgetTrackerApplication.java            # Main Spring Boot Application & DB Seeder
│       │   ├── model/
│       │   │   └── Transaction.java                     # JPA Entity mapping to database table
│       │   ├── repository/
│       │   │   └── TransactionRepository.java           # Spring Data JPA CRUD repository
│       │   └── controller/
│       │       └── TransactionController.java           # REST Controller (@GetMapping, @PostMapping, etc.)
│       │
│       └── resources/
│           ├── application.properties                   # H2 database, port, and JPA settings
│           └── static/                                  # Frontend served automatically by Spring Boot
│               ├── index.html                           # Modern dashboard UI
│               ├── style.css                            # Clean typography & responsive styling
│               └── app.js                               # REST API integration & currency logic
│
└── README.md
```

---

## ⚡ Prerequisites

To run Spring Boot on your computer, you need:
* **Java Development Kit (JDK 17 or 21)**
  * Download free from [Eclipse Temurin OpenJDK](https://adoptium.net/temurin/releases/) or Oracle JDK.
  * Verify by running in terminal:
    ```bash
    java -version
    ```

---

## 🚀 How to Run in VS Code

1. **Open the project folder** in VS Code.
2. If you have the **Extension Pack for Java** in VS Code:
   * Simply open `BudgetTrackerApplication.java` and click **Run**.
3. **Or run via terminal**:
   ```bash
   mvn spring-boot:run
   ```
4. **Open your browser**:
   * Dashboard: [http://localhost:8080](http://localhost:8080)
   * H2 Database Console: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
     * JDBC URL: `jdbc:h2:mem:budgetdb`
     * Username: `sa`
     * Password: *(leave blank)*

---

## 🔌 Spring Boot REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/transactions` | Fetch all transactions (newest first) |
| `POST` | `/api/transactions` | Create a new transaction |
| `DELETE` | `/api/transactions/{id}` | Delete a single transaction by ID |
| `DELETE` | `/api/transactions` | Reset / delete all transactions |
