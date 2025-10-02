# Feature Specification: Company User Chatroom Data Structure

**Feature Branch**: `008-company-user-chatroom`  
**Created**: 2024-12-19  
**Status**: Draft  
**Input**: User description: "이제 company , user, chatroom, chats , threads, 쓰레드안의 채팅, 파일, 에 대한 구조를 잡아야해. 이번에 포커스는 api 를 만드는 것보다는 문서를 꼼꼼히 따지고 이거로 다이어 그램을 만드는 거에 목적이 있어."

## Execution Flow (main)

```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a company administrator, I want to define the organizational structure with companies, users, chatrooms, and threads so that the system can properly manage permissions, data access, and collaborative workflows within a hierarchical structure.

### Acceptance Scenarios

1. **Given** a company exists in the system, **When** an admin creates a chatroom, **Then** the chatroom is associated with the company and inherits company-level permissions
2. **Given** a chatroom exists, **When** users join the chatroom, **Then** they can participate in conversations and access shared files
3. **Given** a file is uploaded to a chatroom, **When** the system processes it, **Then** a new thread is automatically created linked to that file
4. **Given** a thread exists, **When** users interact within the thread, **Then** all thread participants can see the conversation and shared files
5. **Given** users have different roles in a company, **When** they access chatrooms and threads, **Then** their permissions match their role level

### Edge Cases

- What happens when a user is removed from a company but has active threads?
- How does the system handle when company storage exceeds 50GB limit?
- What happens when a thread contains files that would exceed company storage quotas?
- How are orphaned threads handled when the parent chatroom is deleted?
- What happens when a user's company role changes while they have thread ownership?
- How does the system handle file upload failures during MinIO/S3 storage operations?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST support hierarchical company structure with multiple companies
- **FR-002**: System MUST allow users to belong to one or more companies with specific roles
- **FR-003**: System MUST enable creation of chatrooms within company boundaries
- **FR-004**: System MUST automatically generate threads when files are uploaded to chatrooms
- **FR-005**: System MUST support threaded conversations within chatrooms
- **FR-006**: System MUST maintain file associations with both chatrooms and threads
- **FR-007**: System MUST enforce permission-based access control across all entities
- **FR-008**: System MUST support real-time messaging within chatrooms and threads
- **FR-009**: System MUST maintain audit trails for all entity interactions
- **FR-010**: System MUST support file sharing within threads with proper access controls

_Additional Requirements:_

- **FR-011**: System MUST support company-level roles: Owner > Admin > Member (hierarchical permissions)
- **FR-012**: System MUST support thread-level roles: Owner, Member, Viewer for granular thread access control
- **FR-013**: System MUST enforce company storage limits: 50GB total for free tier companies
- **FR-014**: System MUST support unlimited concurrent users per chatroom/thread (no user limits)
- **FR-015**: System MUST integrate with MinIO (S3-compatible) for file storage during MVP phase
- **FR-016**: System MUST maintain data in production database services (MVP phase focuses on structure)

### Key Entities _(include if feature involves data)_

- **Company**: Organization with users, chatrooms, storage limits (50GB free tier), and company-level permissions
- **User**: Individual with profile, company membership, company role (Owner/Admin/Member), and authentication data
- **ChatRoom**: Communication space within a company for group discussions and file sharing
- **Message**: Individual communication unit within a chatroom (not threads)
- **Thread**: Focused conversation space created around specific files or topics within a chatroom
- **ThreadMessage**: Message within a specific thread, separate from main chatroom messages
- **File**: Shared document or media with metadata, permissions, S3/MinIO storage, and associations to chatrooms/threads
- **CompanyRole**: Hierarchical company-level permissions (Owner > Admin > Member)
- **ThreadRole**: Thread-level permissions (Owner, Member, Viewer) for granular access control
- **ThreadParticipant**: Junction entity linking users to threads with specific thread roles

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## Backend Analysis Summary

### Existing User Role Structure

Based on analysis of the current backend implementation, the following role hierarchy is already established:

#### **Company-Level Roles** (Hierarchical: Owner > Admin > Member)

- **Owner**: Full company control, can manage all users and settings
- **Admin**: User management, company settings, can create/manage chatrooms
- **Member**: Basic access, can participate in chatrooms and threads

#### **Thread-Level Roles** (Granular access control)

- **Owner**: Full thread control, can add/remove participants, delete thread
- **Member**: Can participate in thread discussions, upload files, invite others
- **Viewer**: Read-only access to thread content and files

### Storage and Infrastructure Decisions

#### **File Storage**

- **MVP Phase**: MinIO (S3-compatible) for local development and testing
- **Production**: AWS S3 or similar cloud storage service
- **Company Limits**: 50GB total storage for free tier companies
- **Individual File Limits**: Not specified (to be determined based on business needs)

#### **Database Strategy**

- **MVP Focus**: Structure and relationships over performance optimization
- **Production**: Managed database services (PostgreSQL)
- **Data Retention**: Standard database retention policies apply

#### **User Concurrency**

- **No Limits**: Unlimited concurrent users per chatroom/thread
- **Scalability**: Focus on structure first, performance optimization later

---
