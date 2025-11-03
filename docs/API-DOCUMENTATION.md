# 📖 API Documentation - Hospital Management System

## 📋 Table of Contents
- [Overview](#overview)
- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)

---

## 🌐 Overview

The HMS API is a RESTful API that provides access to all hospital management functionalities. All requests and responses are in JSON format.

### **API Version**: v1
### **Content Type**: `application/json`
### **Authentication**: JWT Bearer Token

---

## 🔗 Base URLs

| Environment | Base URL |
|------------|----------|
| **Development** | `http://localhost:3001/api` |
| **Production** | `https://your-domain.com/api` |

---

## 🔐 Authentication

### **Token-Based Authentication**

All protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### **Obtaining a Token**

Make a POST request to `/auth/login` with valid credentials:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@hospital.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clp123abc",
      "email": "user@hospital.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN"
    }
  }
}
```

### **Token Expiration**

- **Default**: 24 hours
- **Renewal**: Login again to get a new token
- **Storage**: Store securely (localStorage or httpOnly cookie)

---

## ⚠️ Error Handling

### **Error Response Format**

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### **HTTP Status Codes**

| Code | Meaning | Description |
|------|---------|-------------|
| **200** | OK | Request successful |
| **201** | Created | Resource created successfully |
| **400** | Bad Request | Invalid request parameters |
| **401** | Unauthorized | Missing or invalid authentication |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Resource already exists |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server error occurred |

---

## 🚦 Rate Limiting

### **Limits**

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| **Authentication** | 5 requests | 15 minutes |
| **General API** | 100 requests | 15 minutes |

### **Rate Limit Headers**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 900
```

---

## 📡 API Endpoints

## 🔐 Authentication Endpoints

### **Register New User**

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@hospital.com",
  "password": "SecurePass123",
  "dateOfBirth": "1990-01-15",
  "gender": "MALE",
  "phone": "+1234567890",
  "address": "123 Main St, City, State 12345"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "clp123abc",
      "email": "john.doe@hospital.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PATIENT"
    }
  }
}
```

**Notes:**
- Role is automatically set to PATIENT
- Password must be at least 8 characters
- Email must be unique

---

### **Login**

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clp123abc",
      "email": "admin@hospital.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    }
  }
}
```

---

### **Get Current User Profile**

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clp123abc",
    "email": "admin@hospital.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 👥 Patient Endpoints

### **Get All Patients**

```http
GET /api/patients
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name or email

**Response (200):**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "clp456def",
        "userId": "clu789ghi",
        "dateOfBirth": "1990-05-15",
        "gender": "MALE",
        "phone": "+1234567890",
        "address": "123 Main St",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@hospital.com"
        }
      }
    ],
    "pagination": {
      "current": 1,
      "total": 5,
      "count": 42
    }
  }
}
```

---

### **Get Patient by ID**

```http
GET /api/patients/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clp456def",
    "userId": "clu789ghi",
    "dateOfBirth": "1990-05-15",
    "gender": "MALE",
    "phone": "+1234567890",
    "address": "123 Main St",
    "emergencyContact": "+9876543210",
    "medicalHistory": "No known allergies",
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@hospital.com"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### **Create Patient**

```http
POST /api/patients
Authorization: Bearer <token>
```

**Required Role:** ADMIN, RECEPTIONIST

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@hospital.com",
  "dateOfBirth": "1985-03-20",
  "gender": "FEMALE",
  "phone": "+1987654321",
  "address": "456 Oak Ave, City",
  "emergencyContact": "+1234567890",
  "medicalHistory": "Diabetes Type 2"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clp789ghi",
    "userId": "clu012jkl",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@hospital.com"
  }
}
```

---

### **Update Patient**

```http
PUT /api/patients/:id
Authorization: Bearer <token>
```

**Request Body:** (partial update supported)
```json
{
  "phone": "+1111111111",
  "address": "New Address 789",
  "medicalHistory": "Updated medical history"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Patient updated successfully",
  "data": {
    "id": "clp456def",
    "phone": "+1111111111",
    "address": "New Address 789"
  }
}
```

---

### **Delete Patient**

```http
DELETE /api/patients/:id
Authorization: Bearer <token>
```

**Required Role:** ADMIN

**Response (200):**
```json
{
  "success": true,
  "message": "Patient deleted successfully"
}
```

---

## 👨‍⚕️ Doctor Endpoints

### **Get All Doctors**

```http
GET /api/doctors
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search by name
- `specialization` (string): Filter by specialization

**Response (200):**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "cld123abc",
        "specialization": "Cardiology",
        "licenseNumber": "MD12345",
        "yearsOfExperience": 10,
        "consultationFee": 150.00,
        "user": {
          "firstName": "Dr. James",
          "lastName": "Wilson",
          "email": "james.wilson@hospital.com"
        }
      }
    ],
    "pagination": {
      "current": 1,
      "total": 3,
      "count": 25
    }
  }
}
```

---

### **Get Doctor by ID**

```http
GET /api/doctors/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cld123abc",
    "userId": "clu456def",
    "specialization": "Cardiology",
    "licenseNumber": "MD12345",
    "yearsOfExperience": 10,
    "consultationFee": 150.00,
    "availability": {
      "monday": ["09:00-17:00"],
      "tuesday": ["09:00-17:00"],
      "friday": ["09:00-13:00"]
    },
    "user": {
      "firstName": "Dr. James",
      "lastName": "Wilson",
      "email": "james.wilson@hospital.com"
    }
  }
}
```

---

### **Create Doctor**

```http
POST /api/doctors
Authorization: Bearer <token>
```

**Required Role:** ADMIN

**Request Body:**
```json
{
  "userId": "clu789ghi",
  "specialization": "Neurology",
  "licenseNumber": "MD67890",
  "yearsOfExperience": 15,
  "consultationFee": 200.00,
  "availability": {
    "monday": ["10:00-18:00"],
    "wednesday": ["10:00-18:00"],
    "friday": ["10:00-14:00"]
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cld456def",
    "specialization": "Neurology",
    "licenseNumber": "MD67890"
  }
}
```

---

## 📅 Appointment Endpoints

### **Get Appointments**

```http
GET /api/appointments
Authorization: Bearer <token>
```

**Query Parameters:**
- `patientId` (string): Filter by patient
- `doctorId` (string): Filter by doctor
- `status` (string): Filter by status
- `date` (string): Filter by date (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "cla123abc",
        "patientId": "clp456def",
        "doctorId": "cld789ghi",
        "appointmentDateTime": "2024-02-15T14:30:00Z",
        "serviceType": "Consultation",
        "status": "SCHEDULED",
        "symptoms": "Headache, fever",
        "notes": "Follow-up visit"
      }
    ]
  }
}
```

---

### **Create Appointment**

```http
POST /api/appointments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "doctorId": "cld789ghi",
  "appointmentDateTime": "2024-02-20T10:00:00Z",
  "serviceType": "Consultation",
  "symptoms": "Chest pain",
  "notes": "Urgent consultation needed"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "cla456def",
      "patientId": "clp123abc",
      "doctorId": "cld789ghi",
      "appointmentDateTime": "2024-02-20T10:00:00Z",
      "status": "SCHEDULED"
    }
  }
}
```

---

## 💰 Billing Endpoints

### **Get All Billing Records**

```http
GET /api/billing
Authorization: Bearer <token>
```

**Query Parameters:**
- `patientId` (string): Filter by patient
- `status` (string): PENDING, PAID, OVERDUE, CANCELLED

**Response (200):**
```json
{
  "success": true,
  "data": {
    "billings": [
      {
        "id": "clb123abc",
        "patientId": "clp456def",
        "amount": 250.00,
        "description": "Consultation and medication",
        "status": "PAID",
        "issueDate": "2024-01-15",
        "dueDate": "2024-01-30",
        "patient": {
          "user": {
            "firstName": "John",
            "lastName": "Doe"
          }
        }
      }
    ]
  }
}
```

---

### **Create Billing Record**

```http
POST /api/billing
Authorization: Bearer <token>
```

**Required Role:** ADMIN, RECEPTIONIST

**Request Body:**
```json
{
  "patientId": "clp456def",
  "amount": 350.00,
  "description": "Lab tests and X-ray",
  "issueDate": "2024-02-01",
  "dueDate": "2024-02-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clb789ghi",
    "amount": 350.00,
    "status": "PENDING"
  }
}
```

---

## 📊 Dashboard Endpoints

### **Get Dashboard Statistics**

```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalPatients": 250,
      "totalDoctors": 15,
      "todaysAppointments": 42,
      "pendingBills": 35,
      "monthlyRevenue": 125000.00,
      "overdueBills": 8
    },
    "recentAppointments": [],
    "alerts": [
      {
        "id": "1",
        "type": "warning",
        "message": "8 patients have overdue bills"
      }
    ]
  }
}
```

---

## 👤 User Management Endpoints

### **Get All Users** (Admin Only)

```http
GET /api/users
Authorization: Bearer <token>
```

**Required Role:** ADMIN

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "clu123abc",
        "email": "user@hospital.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "PATIENT",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 📝 Request Examples

### **Using cURL**

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'

# Get patients (with token)
curl -X GET http://localhost:3001/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **Using JavaScript (Fetch)**

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@hospital.com',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  return data.data.token;
};

// Get patients
const getPatients = async (token) => {
  const response = await fetch('http://localhost:3001/api/patients', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

---

## 🔒 Security Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (httpOnly cookies recommended)
3. **Implement token refresh** for long sessions
4. **Validate all inputs** on both client and server
5. **Never expose sensitive data** in error messages
6. **Log all sensitive operations** for audit trails
7. **Implement request signing** for critical operations

---

## 📞 Support

For API-related questions or issues:

- **GitHub Issues**: [Report Issue](https://github.com/vivek12coder/hms/issues)
- **Email**: vivek12coder@gmail.com
- **Documentation**: [View Full Docs](../docs/)

---

*Last Updated: November 2025*
