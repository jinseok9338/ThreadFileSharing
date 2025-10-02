# Research: Company User Chatroom Data Structure

**Feature**: 008-company-user-chatroom  
**Date**: 2024-12-19  
**Focus**: Permission system design and entity relationship modeling

## Research Areas

### 1. Hierarchical Permission Systems

**Decision**: Multi-level role-based access control (RBAC) with inheritance

**Rationale**:

- Company-level roles (Owner > Admin > Member) provide organizational control
- Thread-level roles (Owner/Member/Viewer) provide granular access control
- Clear hierarchy prevents permission conflicts and ensures data security

**Alternatives Considered**:

- Flat permission system: Rejected - insufficient for complex organizational structures
- Attribute-based access control (ABAC): Rejected - too complex for MVP phase
- Simple user/group system: Rejected - doesn't meet multi-tenant requirements

### 2. Data Storage Architecture

**Decision**: Hybrid storage with PostgreSQL + MinIO/S3

**Rationale**:

- PostgreSQL for structured data (users, chatrooms, threads, metadata)
- MinIO/S3 for file storage with proper access controls
- 50GB company storage limit enforces business model constraints
- MVP focus on MinIO for local development, S3 for production

**Alternatives Considered**:

- All-in-database: Rejected - poor performance for large files
- Pure cloud storage: Rejected - complex permission management
- Local file system: Rejected - not scalable or cloud-ready

### 3. Entity Relationship Design

**Decision**: Normalized relational model with clear foreign key relationships

**Rationale**:

- Company → User (one-to-many) with role assignment
- User → ChatRoom (many-to-many) through membership
- ChatRoom → Thread (one-to-many) with automatic creation on file upload
- Thread → ThreadParticipant (many-to-many) with role assignment
- File → Thread (many-to-one) with metadata tracking

**Key Relationships**:

```
Company (1) → (N) User [company_role]
User (N) → (N) ChatRoom [via membership]
ChatRoom (1) → (N) Thread
Thread (1) → (N) ThreadMessage
Thread (1) → (N) File
User (N) → (N) Thread [via ThreadParticipant with thread_role]
```

**Alternatives Considered**:

- Denormalized structure: Rejected - data inconsistency risks
- Graph database: Rejected - complexity outweighs benefits for this use case
- Document-based storage: Rejected - poor query performance for relational data

### 4. Permission Enforcement Strategy

**Decision**: Guard-based authorization with role hierarchy validation

**Rationale**:

- Leverage existing NestJS RoleGuard implementation
- Company role inheritance (Owner can do Admin actions, Admin can do Member actions)
- Thread-level permissions override company permissions when more restrictive
- Permission checks at service layer for business logic enforcement

**Implementation Pattern**:

```typescript
@Roles(CompanyRole.ADMIN, CompanyRole.OWNER)
@UseGuards(JwtAuthGuard, RoleGuard)
async createChatRoom(@Body() dto: CreateChatRoomDto) {
  // Service layer enforces additional thread-level permissions
}
```

**Alternatives Considered**:

- Decorator-only approach: Rejected - insufficient for complex business rules
- Middleware-based: Rejected - too coarse-grained for fine permissions
- Database-level permissions: Rejected - poor performance and complexity

### 5. File Upload and Thread Creation Flow

**Decision**: Automatic thread creation on file upload with user choice

**Rationale**:

- File upload triggers "Create Thread" vs "Share File" decision
- Thread creation includes file association and participant management
- File access controlled through thread permissions
- Maintains file-centric design principle

**Flow Design**:

1. User uploads file to chatroom
2. System presents options: "Create Thread" or "Share File"
3. If "Create Thread": New thread created with file attached, uploader becomes thread owner
4. If "Share File": File attached to existing thread or shared in chatroom
5. Thread permissions automatically set based on creator's role

**Alternatives Considered**:

- Manual thread creation only: Rejected - doesn't leverage file-centric design
- Automatic thread creation always: Rejected - too aggressive, reduces user control
- File-only sharing: Rejected - doesn't align with core value proposition

### 6. Real-time Permission Updates

**Decision**: WebSocket-based permission change notifications

**Rationale**:

- Real-time updates when user roles change
- Immediate UI updates for permission changes
- Socket.io integration for permission revocation notifications
- Graceful degradation for disconnected users

**Implementation Strategy**:

- Permission changes trigger WebSocket events
- Frontend updates UI state based on permission changes
- Re-authentication required for sensitive permission changes
- Audit trail for all permission modifications

**Alternatives Considered**:

- Polling-based updates: Rejected - poor performance and user experience
- Manual refresh only: Rejected - poor user experience
- Database triggers only: Rejected - no real-time user feedback

## Technical Decisions Summary

| Decision               | Rationale                              | Impact                               |
| ---------------------- | -------------------------------------- | ------------------------------------ |
| Multi-level RBAC       | Clear hierarchy prevents conflicts     | Medium complexity, high security     |
| PostgreSQL + MinIO     | Best of both worlds for data vs files  | Standard pattern, good performance   |
| Normalized ER model    | Data consistency and query performance | Standard relational design           |
| Guard-based auth       | Leverages existing NestJS patterns     | Low complexity, high maintainability |
| File-triggered threads | Aligns with core value proposition     | High user value, medium complexity   |
| WebSocket permissions  | Real-time user experience              | Medium complexity, high UX value     |

## Validation Criteria

- [ ] Permission hierarchy clearly defined and testable
- [ ] Entity relationships support all business requirements
- [ ] File storage strategy meets performance and security needs
- [ ] Real-time updates work reliably across all permission scenarios
- [ ] System handles edge cases (user removal, role changes, file limits)
- [ ] Documentation supports implementation team understanding


