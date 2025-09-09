# 🔗 API Documentation

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-api-domain.com/api`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```http
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "accessToken": "jwt_token_here"
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "accessToken": "jwt_token_here"
}
```

### Tasks

#### List Tasks
```http
GET /tasks
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)
- `completed` (boolean): Filter by completion status
- `priority` (string): Filter by priority (LOW, MEDIUM, HIGH)
- `categoryId` (string): Filter by category
- `search` (string): Search in title and description
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort direction (asc, desc)

**Response:**
```json
{
  "tasks": [
    {
      "id": "task_id",
      "title": "Complete project",
      "description": "Finish the mobile app",
      "priority": "HIGH",
      "completed": false,
      "dueDate": "2024-01-15T10:00:00Z",
      "category": {
        "id": "cat_id",
        "name": "Work",
        "color": "#4A90E2"
      },
      "tags": ["urgent", "mobile"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

#### Create Task
```http
POST /tasks
```

**Request Body:**
```json
{
  "title": "Complete project",
  "description": "Finish the mobile app",
  "priority": "HIGH",
  "dueDate": "2024-01-15T10:00:00Z",
  "categoryId": "category_id",
  "tags": ["urgent", "mobile"],
  "estimatedTime": "2 hours"
}
```

#### Update Task
```http
PUT /tasks/:id
```

**Request Body:** (partial update supported)
```json
{
  "title": "Updated task title",
  "completed": true,
  "actualTime": "1.5 hours"
}
```

#### Delete Task
```http
DELETE /tasks/:id
```

#### Get Task Statistics
```http
GET /tasks/stats
```

**Response:**
```json
{
  "stats": {
    "totalTasks": 100,
    "completedTasks": 75,
    "pendingTasks": 25,
    "overdueTasks": 5,
    "todayTasks": 8,
    "weekTasks": 15,
    "completionRate": 75.0
  }
}
```

### Categories

#### List Categories
```http
GET /categories
```

**Response:**
```json
{
  "categories": [
    {
      "id": "cat_id",
      "name": "Work",
      "color": "#4A90E2",
      "icon": "work",
      "_count": {
        "tasks": 15
      }
    }
  ]
}
```

#### Create Category
```http
POST /categories
```

**Request Body:**
```json
{
  "name": "Personal",
  "color": "#FF6B6B",
  "icon": "person"
}
```

### Reminders

#### List Reminders
```http
GET /reminders
```

**Query Parameters:**
- `upcoming` (boolean): Filter upcoming reminders
- `triggered` (boolean): Filter triggered reminders
- `type` (string): Filter by type (PUSH, EMAIL, SMS)

**Response:**
```json
{
  "reminders": [
    {
      "id": "reminder_id",
      "title": "Meeting reminder",
      "message": "Don't forget about the team meeting",
      "scheduledAt": "2024-01-15T09:30:00Z",
      "type": "PUSH",
      "recurring": false,
      "triggered": false,
      "task": {
        "id": "task_id",
        "title": "Attend team meeting"
      }
    }
  ]
}
```

#### Create Reminder
```http
POST /reminders
```

**Request Body:**
```json
{
  "title": "Meeting reminder",
  "message": "Don't forget about the team meeting",
  "scheduledAt": "2024-01-15T09:30:00Z",
  "type": "PUSH",
  "recurring": false,
  "recurringPattern": "daily",
  "taskId": "task_id"
}
```

#### Snooze Reminder
```http
POST /reminders/:id/snooze
```

**Request Body:**
```json
{
  "minutes": 15
}
```

## Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTH_REQUIRED`: Authentication token required
- `AUTH_INVALID`: Invalid authentication token
- `AUTH_EXPIRED`: Authentication token expired
- `NOT_FOUND`: Resource not found
- `DUPLICATE_ENTRY`: Resource already exists
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

## WebSocket Events

Connect to: `ws://localhost:3000` (development)

### Client Events
- `join-user-room`: Join user-specific room for updates

### Server Events
- `task_created`: New task created
- `task_updated`: Task updated
- `task_deleted`: Task deleted
- `reminder_created`: New reminder created
- `reminder_triggered`: Reminder triggered

**Example:**
```javascript
const socket = io('ws://localhost:3000');
socket.emit('join-user-room', userId);
socket.on('task_created', (task) => {
  // Handle new task
});
```