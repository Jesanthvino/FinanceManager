# Personal Finance Manager

A full-stack web application to track personal expenses, categorize spending, and manage financial data efficiently.

## 🚀 Features

- User registration & authentication (JWT-based)
- Add, update, delete, and view expenses
- Categorize expenses
- Responsive and user-friendly UI
- Secure API endpoints with role-based access

## 🛠️ Technology Stack

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.5.3  
- **Language**: Java 21  
- **Database**: MySQL  
- **Security**: Spring Security + JWT  
- **ORM**: Spring Data JPA  
- **Build Tool**: Maven  

### Frontend (React)
- **Framework**: React 19  
- **Routing**: React Router 7  
- **HTTP Client**: Axios  
- **Build Tool**: npm (React Scripts)  

## 📁 Project Structure

### Backend
- `model/` – Entity classes (User, Expense)  
- `repository/` – JPA Repositories  
- `service/` – Business logic  
- `controller/` – REST endpoints  
- `config/` – Security & CORS configuration  

### Frontend
- `components/` – UI components  
- `context/` – Global state (e.g., auth)  
- `api/` – Backend service functions  
- `routes/` – Page routing  

## ⚙️ Setup Instructions

### Backend

```bash
# 1. Clone repo & navigate to backend folder
cd personal-finance-manager

# 2. Set environment variables (.env or application.properties)
DB_URL=jdbc:mysql://localhost:3306/your_db
DB_USERNAME=your_user
DB_PASSWORD=your_pass
FRONTEND_URL=http://localhost:3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PORT=8080

# 3. Start the backend server
./mvnw spring-boot:run
```

### Frontend

```bash
# 1. Navigate to frontend folder
cd finance-frontend

# 2. Install dependencies
npm install

# 3. Start frontend
npm start
```

App will be available at: [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` – Login  
- `POST /api/auth/register` – Register  

### Users
- `GET /api/users` – Get current user  
- `PUT /api/users` – Update user  

### Expenses
- `GET /api/expenses` – Get all expenses  
- `POST /api/expenses` – Add expense  
- `PUT /api/expenses/{id}` – Update expense  
- `DELETE /api/expenses/{id}` – Delete expense  

## 🔐 Security

- Passwords encrypted using BCrypt
- JWT for stateless authentication
- Role-based access control
- CORS configured for frontend-backend communication

## 🧪 Development Notes

- Backend auto-reloads with Spring DevTools
- Hibernate auto schema update (`ddl-auto=update`)
- Frontend supports hot reload (`npm start`)

## 📦 Production Build

### Backend
```bash
./mvnw clean package
# Output: target/*.jar
```

### Frontend
```bash
npm run build
# Output: build/ directory with static assets
```