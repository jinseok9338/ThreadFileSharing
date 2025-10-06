const { v4: uuidv4 } = require("uuid");

/**
 * TestUser Entity Model
 *
 * Represents authenticated users with different roles for comprehensive permission testing
 */
class TestUser {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.email = data.email || `test-${Date.now()}@example.com`;
    this.password = data.password || "testpassword123";
    this.fullName = data.fullName || `Test User ${Date.now()}`;
    this.companyId = data.companyId || uuidv4();
    this.role = data.role || "MEMBER";
    this.accessToken = data.accessToken || null;
    this.refreshToken = data.refreshToken || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.lastLoginAt = data.lastLoginAt || null;
  }

  /**
   * Validate user data
   */
  validate() {
    const errors = [];

    // Email validation
    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push("Invalid email format");
    }

    // Password validation
    if (!this.password || this.password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    // Role validation
    const validRoles = ["OWNER", "ADMIN", "MEMBER", "GUEST"];
    if (!validRoles.includes(this.role)) {
      errors.push(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    // UUID validation
    if (!this.isValidUUID(this.id)) {
      errors.push("Invalid user ID format");
    }

    if (!this.isValidUUID(this.companyId)) {
      errors.push("Invalid company ID format");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if string is valid UUID
   */
  isValidUUID(uuid) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Update user data
   */
  update(data) {
    const allowedFields = [
      "email",
      "password",
      "fullName",
      "role",
      "accessToken",
      "refreshToken",
      "isActive",
      "lastLoginAt",
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        this[field] = data[field];
      }
    });

    return this.validate();
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      companyId: this.companyId,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt,
      // Exclude sensitive data
      // password, accessToken, refreshToken
    };
  }

  /**
   * Convert to safe JSON (includes tokens for testing)
   */
  toSafeJSON() {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      fullName: this.fullName,
      companyId: this.companyId,
      role: this.role,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      isActive: this.isActive,
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt,
    };
  }

  /**
   * Create user from registration data
   */
  static fromRegistrationData(data) {
    return new TestUser({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      companyName: data.companyName,
      role: data.role || "MEMBER",
    });
  }

  /**
   * Create user from login data
   */
  static fromLoginData(data) {
    return new TestUser({
      email: data.email,
      password: data.password,
    });
  }

  /**
   * Generate test users
   */
  static generateTestUsers(count = 5) {
    const users = [];
    const roles = ["OWNER", "ADMIN", "MEMBER", "GUEST"];

    for (let i = 0; i < count; i++) {
      users.push(
        new TestUser({
          email: `test-user-${i + 1}@example.com`,
          password: "testpassword123",
          fullName: `Test User ${i + 1}`,
          role: roles[i % roles.length],
        })
      );
    }

    return users;
  }

  /**
   * Compare users
   */
  equals(other) {
    return this.id === other.id && this.email === other.email;
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission) {
    const rolePermissions = {
      OWNER: [
        "READ",
        "WRITE",
        "DELETE",
        "ADMIN",
        "MANAGE_USERS",
        "MANAGE_COMPANY",
      ],
      ADMIN: ["READ", "WRITE", "DELETE", "MANAGE_USERS"],
      MEMBER: ["READ", "WRITE"],
      GUEST: ["READ"],
    };

    return rolePermissions[this.role]?.includes(permission) || false;
  }

  /**
   * Check if user can access resource
   */
  canAccessResource(resourceType, resourceId, action = "READ") {
    // Owner can access everything
    if (this.role === "OWNER") {
      return true;
    }

    // Admin can access most resources
    if (this.role === "ADMIN" && action !== "DELETE") {
      return true;
    }

    // Member can read and write
    if (this.role === "MEMBER" && ["READ", "WRITE"].includes(action)) {
      return true;
    }

    // Guest can only read
    if (this.role === "GUEST" && action === "READ") {
      return true;
    }

    return false;
  }

  /**
   * Get user permissions
   */
  getPermissions() {
    const rolePermissions = {
      OWNER: [
        "READ",
        "WRITE",
        "DELETE",
        "ADMIN",
        "MANAGE_USERS",
        "MANAGE_COMPANY",
      ],
      ADMIN: ["READ", "WRITE", "DELETE", "MANAGE_USERS"],
      MEMBER: ["READ", "WRITE"],
      GUEST: ["READ"],
    };

    return rolePermissions[this.role] || [];
  }

  /**
   * Check if user is active
   */
  isActive() {
    return this.isActive === true;
  }

  /**
   * Activate user
   */
  activate() {
    this.isActive = true;
    return this;
  }

  /**
   * Deactivate user
   */
  deactivate() {
    this.isActive = false;
    return this;
  }

  /**
   * Update last login
   */
  updateLastLogin() {
    this.lastLoginAt = new Date();
    return this;
  }

  /**
   * Set tokens
   */
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    return this;
  }

  /**
   * Clear tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    return this;
  }

  /**
   * Check if tokens are valid
   */
  hasValidTokens() {
    return this.accessToken && this.refreshToken;
  }

  /**
   * Get user summary
   */
  getSummary() {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
      isActive: this.isActive,
      hasTokens: this.hasValidTokens(),
      permissions: this.getPermissions(),
    };
  }
}

module.exports = TestUser;
