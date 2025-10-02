# ThreadFileSharing

A modern file sharing platform built with NestJS and React, designed for team collaboration with real-time features.

## 🚀 Features

### Core Features

- **User Authentication & Authorization**

  - JWT-based authentication
  - Role-based access control (Owner, Admin, Member)
  - Company-based user management

- **File Management**

  - Secure file upload and download
  - File metadata tracking
  - Storage quota management
  - File sharing within threads

- **Thread-based Communication**

  - Thread creation and management
  - Real-time messaging
  - File attachments in threads
  - Thread participant management

- **Company Management**
  - Multi-tenant architecture
  - Company settings and configuration
  - User invitation system
  - Storage quota management

### Technical Features

- **API Documentation**: Swagger/OpenAPI integration
- **Database**: PostgreSQL with TypeORM
- **Real-time**: WebSocket support (planned)
- **Testing**: Bruno API collection
- **Security**: JWT tokens, role-based guards
- **Validation**: Zod schema validation

## 🏗️ Architecture

### Backend (NestJS)

```
packages/backend/
├── src/
│   ├── auth/           # Authentication & authorization
│   ├── company/        # Company management
│   ├── user/           # User management
│   ├── thread/         # Thread management
│   ├── chatroom/       # Chat room management
│   ├── file/           # File management
│   ├── invitation/     # User invitation system
│   ├── common/         # Shared utilities
│   └── database/       # Database configuration
├── test/               # Unit & integration tests
└── migrations/         # Database migrations
```

### Frontend (React 19 + React Router 7)

```
packages/frontend/
├── app/
│   ├── pages/          # Page components
│   ├── routes/         # File-based routing
│   ├── components/     # Reusable components
│   ├── stores/         # Zustand stores
│   ├── api/            # API client
│   └── utils/          # Utility functions
└── language.csv        # Internationalization
```

## 🛠️ Tech Stack

### Backend

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Testing**: Bruno API collection

### Frontend

- **Framework**: React 19
- **Routing**: React Router 7 (file-based)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: ky

## 📦 Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm

### Backend Setup

```bash
cd packages/backend
pnpm install
cp .env.example .env
# Configure your environment variables
pnpm run migration:run
pnpm run seed:run
pnpm run start:dev
```

### Frontend Setup

```bash
cd packages/frontend
pnpm install
cp .env.example .env
# Configure your environment variables
pnpm run dev
```

## 🗄️ Database Schema

### Core Entities

- **User**: User accounts with company association
- **Company**: Multi-tenant company structure
- **Thread**: Communication threads
- **ThreadParticipant**: User participation in threads
- **ChatRoom**: Chat room management
- **File**: File metadata and storage
- **Message**: Chat messages
- **CompanyInvitation**: User invitation system

### Key Relationships

- Users belong to Companies
- Threads contain multiple ThreadParticipants
- Files are associated with Threads
- Messages belong to ChatRooms or Threads

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout

### Company Management

- `GET /api/v1/companies/me` - Get current company
- `GET /api/v1/companies/me/members` - Get company members
- `PUT /api/v1/companies/me` - Update company settings

### Thread Management

- `GET /api/v1/threads` - Get all threads
- `POST /api/v1/threads` - Create new thread
- `GET /api/v1/threads/:id` - Get thread by ID
- `PUT /api/v1/threads/:id` - Update thread
- `DELETE /api/v1/threads/:id` - Delete thread

### File Management

- `POST /api/v1/files/upload` - Upload file
- `GET /api/v1/files/:id` - Download file
- `DELETE /api/v1/files/:id` - Delete file

### Chat Room Management

- `GET /api/v1/chatrooms` - Get all chat rooms
- `POST /api/v1/chatrooms` - Create chat room
- `GET /api/v1/chatrooms/:id` - Get chat room by ID

## 🧪 Testing

### API Testing

We use Bruno for API testing. The collection is located in `tests/bruno/`.

```bash
# Install Bruno
npm install -g @usebruno/cli

# Run API tests
bruno test tests/bruno/
```

### Test Coverage

- Authentication flow
- CRUD operations for all entities
- Permission checks
- Error handling

## 🚀 Deployment

### Environment Variables

#### Backend

```env
DATABASE_URL=postgresql://username:password@localhost:5432/threadfilesharing
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=production
PORT=3001
```

#### Frontend

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

### Docker Deployment

```bash
# Build and run with Docker
docker-compose up -d
```

## 📚 Documentation

- [API Documentation](http://localhost:3001/api/docs) - Swagger UI
- [Frontend Architecture](./docs/frontend/react-router-7-structure.md)
- [Internationalization Guide](./docs/frontend/i18n-guide.md)
- [Business Requirements](./docs/business/)

## 🔐 Security

- JWT-based authentication
- Role-based access control
- Input validation with Zod
- SQL injection protection via TypeORM
- CORS configuration
- Rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Roadmap

### Completed ✅

- [x] Authentication system
- [x] User management
- [x] Company management
- [x] Thread management
- [x] File upload/download
- [x] API documentation
- [x] Database migrations
- [x] Basic frontend structure

### In Progress 🚧

- [ ] WebSocket real-time features
- [ ] File upload progress
- [ ] Advanced file management

### Planned 📋

- [ ] Mobile app
- [ ] Advanced search
- [ ] Analytics dashboard
- [ ] Third-party integrations

## 📞 Support

For support and questions, please open an issue in the repository.
