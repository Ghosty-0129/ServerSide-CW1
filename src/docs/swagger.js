const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi    = require("swagger-ui-express");

const spec = {
  openapi: "3.0.0",

  info: {
    title:   "AR Alumni Platform API",
    version: "1.0.0",
    description: `
## Phantasmagoria Ltd — University of Eastminster Alumni Platform

A RESTful API powering the AR alumni influencer platform.

### How to authenticate

**For Alumni / Admin endpoints:**
1. Register via \`POST /api/auth/register\`
2. Verify your email via \`POST /api/auth/verify-email-otp\`
3. Login via \`POST /api/auth/login\` — copy the \`token\` from the response
4. Click **Authorize** (top right) → paste the token under **bearerAuth**

**For Public Developer endpoints:**
1. An admin must generate an API key via \`POST /api/admin/api-keys\`
2. Click **Authorize** → paste the raw key under **apiKeyAuth**

### Blind Bidding Rule
The highest bid amount is **never** returned by any endpoint.
You only receive \`"winning"\` or \`"losing"\` feedback.
    `
  },

  servers: [
    { url: "http://localhost:5000", description: "Local development" }
  ],

  // SECURITY SCHEMES
  components: {
    securitySchemes: {
      bearerAuth: {
        type:         "http",
        scheme:       "bearer",
        bearerFormat: "JWT",
        description:  "JWT token from POST /api/auth/login"
      },
      apiKeyAuth: {
        type:        "http",
        scheme:      "bearer",
        description: "API key from POST /api/admin/api-keys (admin only)"
      }
    },

    // REUSABLE SCHEMAS
    schemas: {

      // Auth  
      RegisterRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string", format: "email",
            example: "jane@gmail.com",
            description: "Must match ALLOWED_EMAIL_DOMAIN in .env"
          },
          password: {
            type: "string",
            example: "Secure@Pass1!",
            description: "Min 10 chars, must include upper, lower, number, special"
          },
          role: {
            type: "string", enum: ["alumnus", "admin"],
            default: "alumnus"
          }
        }
      },

      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email:    { type: "string", format: "email", example: "jane@gmail.com" },
          password: { type: "string", example: "Secure@Pass1!" }
        }
      },

      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string", description: "JWT — use as Bearer token" },
          user: {
            type: "object",
            properties: {
              id:    { type: "integer", example: 1 },
              email: { type: "string",  example: "jane@gmail.com" },
              role:  { type: "string",  example: "alumnus" }
            }
          }
        }
      },

      OtpRequest: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: { type: "string", format: "email", example: "jane@gmail.com" },
          otp:   { type: "string", example: "482910", description: "6-digit code from email" }
        }
      },

      EmailRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "jane@gmail.com" }
        }
      },

      ResetPasswordRequest: {
        type: "object",
        required: ["email", "otp", "newPassword"],
        properties: {
          email:       { type: "string", format: "email", example: "jane@gmail.com" },
          otp:         { type: "string", example: "482910" },
          newPassword: { type: "string", example: "NewSecure@Pass2!" }
        }
      },

      // Profile  ─
      ProfileUpdateRequest: {
        type: "object",
        properties: {
          first_name:   { type: "string", example: "Jane" },
          last_name:    { type: "string", example: "Smith" },
          biography:    { type: "string", example: "Software engineer with 8 years in fintech." },
          linkedin_url: { type: "string", format: "uri", example: "https://linkedin.com/in/janesmith" }
        }
      },

      DegreeRequest: {
        type: "object",
        required: ["degree_name"],
        properties: {
          degree_name:     { type: "string", example: "BSc Computer Science" },
          institution:     { type: "string", example: "University of Eastminster" },
          degree_url:      { type: "string", format: "uri", example: "https://westminster.ac.uk/cs" },
          completion_date: { type: "string", format: "date", example: "2019-06-30" }
        }
      },

      CertificationRequest: {
        type: "object",
        required: ["certification_name"],
        properties: {
          certification_name: { type: "string", example: "AWS Solutions Architect" },
          issuing_body:       { type: "string", example: "Amazon Web Services" },
          cert_url:           { type: "string", format: "uri", example: "https://aws.amazon.com/certification/" },
          completion_date:    { type: "string", format: "date", example: "2022-03-15" }
        }
      },

      LicenceRequest: {
        type: "object",
        required: ["licence_name"],
        properties: {
          licence_name:    { type: "string", example: "Chartered Engineer (CEng)" },
          awarding_body:   { type: "string", example: "Engineering Council UK" },
          licence_url:     { type: "string", format: "uri", example: "https://engc.org.uk/ceng" },
          completion_date: { type: "string", format: "date", example: "2021-01-10" }
        }
      },

      CourseRequest: {
        type: "object",
        required: ["course_name"],
        properties: {
          course_name:     { type: "string", example: "Machine Learning Specialisation" },
          provider:        { type: "string", example: "Coursera / DeepLearning.AI" },
          course_url:      { type: "string", format: "uri", example: "https://coursera.org/ml" },
          completion_date: { type: "string", format: "date", example: "2023-08-20" }
        }
      },

      EmploymentRequest: {
        type: "object",
        required: ["job_title", "company", "start_date"],
        properties: {
          job_title:  { type: "string",  example: "Senior Software Engineer" },
          company:    { type: "string",  example: "Google DeepMind" },
          start_date: { type: "string",  format: "date", example: "2020-09-01" },
          end_date:   { type: "string",  format: "date", example: "2024-01-31",
                        nullable: true, description: "Omit or null for current role" }
        }
      },

      FullProfile: {
        type: "object",
        properties: {
          id:                 { type: "integer", example: 1 },
          user_id:            { type: "integer", example: 1 },
          email:              { type: "string",  example: "jane@gmail.com" },
          first_name:         { type: "string",  example: "Jane" },
          last_name:          { type: "string",  example: "Smith" },
          biography:          { type: "string",  example: "Software engineer..." },
          linkedin_url:       { type: "string",  example: "https://linkedin.com/in/janesmith" },
          profile_image_path: { type: "string",  example: "uploads/profiles/1_abc123.jpg" },
          is_active_today:    { type: "integer", example: 0, description: "1 = currently featured alumnus" },
          appearance_count:   { type: "integer", example: 2 },
          degrees: {
            type: "array",
            items: { $ref: "#/components/schemas/DegreeRequest" }
          },
          certifications: {
            type: "array",
            items: { $ref: "#/components/schemas/CertificationRequest" }
          },
          licences: {
            type: "array",
            items: { $ref: "#/components/schemas/LicenceRequest" }
          },
          courses: {
            type: "array",
            items: { $ref: "#/components/schemas/CourseRequest" }
          },
          employment: {
            type: "array",
            items: { $ref: "#/components/schemas/EmploymentRequest" }
          }
        }
      },

      // Bids  
      PlaceBidRequest: {
        type: "object",
        required: ["amount"],
        properties: {
          amount: {
            type: "number", format: "float",
            minimum: 0.01, example: 150.00,
            description: "Bid amount in GBP"
          }
        }
      },

      BidStatusResponse: {
        type: "object",
        properties: {
          bid_date:   { type: "string", format: "date", example: "2026-04-02" },
          your_bid:   { type: "number", example: 150.00 },
          bid_status: {
            type: "string", enum: ["winning", "losing"],
            description: "Whether you are currently winning. Highest bid is NEVER revealed."
          }
        }
      },

      MonthlyStatus: {
        type: "object",
        properties: {
          year:            { type: "integer", example: 2026 },
          month:           { type: "integer", example: 4 },
          wins_this_month: { type: "integer", example: 1 },
          monthly_limit:   { type: "integer", example: 3, description: "3 base + 1 if event bonus" },
          remaining_slots: { type: "integer", example: 2 },
          event_bonus:     { type: "boolean", example: false }
        }
      },

      BidRecord: {
        type: "object",
        properties: {
          id:         { type: "integer", example: 5 },
          user_id:    { type: "integer", example: 1 },
          bid_date:   { type: "string",  format: "date", example: "2026-04-02" },
          amount:     { type: "number",  example: 150.00 },
          status:     { type: "string",  enum: ["pending", "won", "lost"] },
          created_at: { type: "string",  format: "date-time" }
        }
      },

      // API Keys  
      GenerateKeyRequest: {
        type: "object",
        required: ["client_name"],
        properties: {
          client_name: { type: "string", example: "AR Headset Client v1" }
        }
      },

      GenerateKeyResponse: {
        type: "object",
        properties: {
          id:          { type: "integer", example: 1 },
          client_name: { type: "string",  example: "AR Headset Client v1" },
          key_prefix:  { type: "string",  example: "pk_a3f9e1b2", description: "First 10 chars for identification" },
          api_key:     { type: "string",  example: "pk_a3f9e1b2c3d4...", description: "⚠ Shown ONCE — store securely" }
        }
      },

      ApiKeyRecord: {
        type: "object",
        properties: {
          id:           { type: "integer",  example: 1 },
          client_name:  { type: "string",   example: "AR Headset Client v1" },
          key_prefix:   { type: "string",   example: "pk_a3f9e1b2" },
          is_active:    { type: "boolean",  example: true },
          created_at:   { type: "string",   format: "date-time" },
          last_used_at: { type: "string",   format: "date-time", nullable: true }
        }
      },

      ApiKeyStats: {
        type: "object",
        properties: {
          key_id:        { type: "integer", example: 1 },
          client_name:   { type: "string",  example: "AR Headset Client v1" },
          key_prefix:    { type: "string",  example: "pk_a3f9e1b2" },
          is_active:     { type: "boolean", example: true },
          last_used_at:  { type: "string",  format: "date-time", nullable: true },
          total_requests:{ type: "integer", example: 42 },
          by_endpoint: {
            type: "array",
            items: {
              type: "object",
              properties: {
                endpoint: { type: "string",  example: "/api/v1/alumni/today" },
                method:   { type: "string",  example: "GET" },
                hits:     { type: "integer", example: 38 }
              }
            }
          },
          recent_logs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                endpoint:    { type: "string", example: "/api/v1/alumni/today" },
                method:      { type: "string", example: "GET" },
                ip_address:  { type: "string", example: "192.168.1.1" },
                accessed_at: { type: "string", format: "date-time" }
              }
            }
          }
        }
      },

      // Today's Alumnus 
      TodaysAlumnusResponse: {
        type: "object",
        properties: {
          date:    { type: "string", format: "date", example: "2026-04-01" },
          alumnus: { $ref: "#/components/schemas/FullProfile" }
        }
      },

      // Common 
      MessageResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Operation successful" }
        }
      },

      IdResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Created successfully" },
          id:      { type: "integer", example: 5 }
        }
      },

      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Error description" }
        }
      }
    }
  },

  // TAGS
  tags: [
    {
      name: "Auth",
      description: "Registration, email verification, login and password reset. **No authentication required.**"
    },
    {
      name: "Profile",
      description: "Manage alumni profile — personal info, degrees, certifications, licences, courses, employment history and profile image. **Requires JWT.**"
    },
    {
      name: "Bids",
      description: "Blind bidding system for the daily featured alumni slot. **Requires JWT.** The highest bid amount is never revealed — you only receive winning/losing feedback."
    },
    {
      name: "API Keys",
      description: "Admin-only: generate, list, view usage stats and revoke client API keys. **Requires JWT with admin role.**"
    },
    {
      name: "Public API",
      description: "Developer-facing endpoint for external clients (AR headsets, mobile apps). **Requires API Key.**"
    }
  ],

  // PATHS
  paths: {

    // AUTH
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new alumni or admin account",
        description: "Email must match the configured domain (`ALLOWED_EMAIL_DOMAIN` in .env). Password must be at least 10 characters and include uppercase, lowercase, a number, and a special character. A 6-digit OTP is sent to the email after successful registration.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Registered successfully. Check email for OTP.",
            content: { "application/json": { schema: {
              type: "object",
              properties: {
                message: { type: "string", example: "Registered successfully. Please verify your email before logging in." },
                user: { type: "object", properties: {
                  id:         { type: "integer", example: 1 },
                  email:      { type: "string",  example: "jane@gmail.com" },
                  role:       { type: "string",  example: "alumnus" },
                  isVerified: { type: "boolean", example: false }
                }}
              }
            }}}
          },
          400: { description: "Validation error — weak password or bad email", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          409: { description: "Email already registered",                      content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/auth/verify-email-otp": {
      post: {
        tags: ["Auth"],
        summary: "Verify email address using OTP",
        description: "The 6-digit OTP is emailed on registration. It expires after 10 minutes and is single-use. Once verified, the account can log in.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/OtpRequest" } } }
        },
        responses: {
          200: { description: "Email verified successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          400: { description: "Invalid OTP, expired OTP, or already verified", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/auth/resend-email-otp": {
      post: {
        tags: ["Auth"],
        summary: "Resend email verification OTP",
        description: "Deletes any existing OTP for the user and generates a fresh one. Use this if the original OTP expired.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/EmailRequest" } } }
        },
        responses: {
          200: { description: "New OTP sent",          content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          400: { description: "Email already verified", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "User not found",         content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive a JWT",
        description: "Returns a signed JWT valid for 1 hour. Unverified accounts receive 403. Use the token as `Authorization: Bearer <token>` on all protected endpoints.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } }
        },
        responses: {
          200: { description: "Login successful — copy the token", content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } } },
          401: { description: "Invalid credentials",      content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Email not yet verified",   content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request a password reset OTP",
        description: "Always returns 200 regardless of whether the email exists — this prevents user enumeration attacks. If the email is registered, an OTP is sent.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/EmailRequest" } } }
        },
        responses: {
          200: { description: "OTP sent if email exists (always 200)", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } }
        }
      }
    },

    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password using OTP",
        description: "The OTP is single-use and expires after 10 minutes. The new password must meet the same strength requirements as registration.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordRequest" } } }
        },
        responses: {
          200: { description: "Password reset successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          400: { description: "Invalid OTP, expired OTP, or weak password", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // PROFILE

    "/api/profile": {
      post: {
        tags: ["Profile"],
        summary: "Create your alumni profile",
        description: "Creates an empty profile shell for the authenticated user. Must be called before adding degrees, certifications, etc. Each user can only have one profile.",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Profile created", content: { "application/json": { schema: { $ref: "#/components/schemas/IdResponse" } } } },
          409: { description: "Profile already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/profile/me": {
      get: {
        tags: ["Profile"],
        summary: "Get your full profile",
        description: "Returns the complete profile including all sub-entities: degrees, certifications, licences, courses and employment history.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Full profile", content: { "application/json": { schema: { $ref: "#/components/schemas/FullProfile" } } } },
          404: { description: "Profile not found — call POST /api/profile first", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      },
      put: {
        tags: ["Profile"],
        summary: "Update personal info",
        description: "Update name, biography and LinkedIn URL. Profile must exist first.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProfileUpdateRequest" } } }
        },
        responses: {
          200: { description: "Profile updated", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          400: { description: "Invalid LinkedIn URL", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Profile not found",    content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/profile/me/image": {
      post: {
        tags: ["Profile"],
        summary: "Upload profile image",
        description: "Upload a JPEG, PNG or WebP image. Maximum 5MB. The old image is deleted if one exists. Send as `multipart/form-data` with field name `image`.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: { type: "string", format: "binary", description: "JPEG / PNG / WebP, max 5MB" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Image uploaded",
            content: { "application/json": { schema: {
              type: "object",
              properties: {
                message:  { type: "string", example: "Profile image uploaded" },
                imageUrl: { type: "string", example: "http://localhost:5000/uploads/profiles/1_abc123.jpg" }
              }
            }}}
          },
          400: { description: "No file provided or invalid type", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // Degrees
    "/api/profile/me/degrees": {
      post: {
        tags: ["Profile"], summary: "Add a degree",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/DegreeRequest" } } } },
        responses: {
          201: { description: "Degree added", content: { "application/json": { schema: { $ref: "#/components/schemas/IdResponse" } } } },
          400: { description: "Missing required field or invalid URL", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/profile/me/degrees/{id}": {
      put: {
        tags: ["Profile"], summary: "Update a degree",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/DegreeRequest" } } } },
        responses: {
          200: { description: "Updated",   content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      },
      delete: {
        tags: ["Profile"], summary: "Delete a degree",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Deleted",   content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // Certifications
    "/api/profile/me/certifications": {
      post: {
        tags: ["Profile"], summary: "Add a certification",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CertificationRequest" } } } },
        responses: {
          201: { description: "Added",                content: { "application/json": { schema: { $ref: "#/components/schemas/IdResponse"      } } } },
          400: { description: "Validation error",     content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse"   } } } }
        }
      }
    },
    "/api/profile/me/certifications/{id}": {
      put: {
        tags: ["Profile"], summary: "Update a certification",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CertificationRequest" } } } },
        responses: { 200: { description: "Updated" }, 404: { description: "Not found" } }
      },
      delete: {
        tags: ["Profile"], summary: "Delete a certification",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Deleted" }, 404: { description: "Not found" } }
      }
    },

    // Licences
    "/api/profile/me/licences": {
      post: {
        tags: ["Profile"], summary: "Add a professional licence",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LicenceRequest" } } } },
        responses: { 201: { description: "Added" }, 400: { description: "Validation error" } }
      }
    },
    "/api/profile/me/licences/{id}": {
      put: {
        tags: ["Profile"], summary: "Update a licence",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LicenceRequest" } } } },
        responses: { 200: { description: "Updated" }, 404: { description: "Not found" } }
      },
      delete: {
        tags: ["Profile"], summary: "Delete a licence",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Deleted" }, 404: { description: "Not found" } }
      }
    },

    // Short Courses
    "/api/profile/me/courses": {
      post: {
        tags: ["Profile"], summary: "Add a short professional course",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CourseRequest" } } } },
        responses: { 201: { description: "Added" }, 400: { description: "Validation error" } }
      }
    },
    "/api/profile/me/courses/{id}": {
      put: {
        tags: ["Profile"], summary: "Update a course",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CourseRequest" } } } },
        responses: { 200: { description: "Updated" }, 404: { description: "Not found" } }
      },
      delete: {
        tags: ["Profile"], summary: "Delete a course",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Deleted" }, 404: { description: "Not found" } }
      }
    },

    // Employment  
    "/api/profile/me/employment": {
      post: {
        tags: ["Profile"], summary: "Add an employment record",
        description: "Set `end_date` to null for a current position.",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EmploymentRequest" } } } },
        responses: { 201: { description: "Added" }, 400: { description: "Missing required fields" } }
      }
    },
    "/api/profile/me/employment/{id}": {
      put: {
        tags: ["Profile"], summary: "Update an employment record",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EmploymentRequest" } } } },
        responses: { 200: { description: "Updated" }, 404: { description: "Not found" } }
      },
      delete: {
        tags: ["Profile"], summary: "Delete an employment record",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Deleted" }, 404: { description: "Not found" } }
      }
    },

    // BIDS


    "/api/bids/tomorrow": {
      get: {
        tags: ["Bids"],
        summary: "View tomorrow's slot — your bid and monthly limit",
        description: "Returns your current bid for tomorrow (if any), whether you are winning or losing, and your monthly win status. The highest bid from other users is never included.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Slot info",
            content: { "application/json": { schema: {
              type: "object",
              properties: {
                slot_date:     { type: "string", format: "date", example: "2026-04-02" },
                your_bid:      { type: "object", nullable: true,
                  properties: {
                    id:     { type: "integer", example: 5 },
                    amount: { type: "number",  example: 150.00 }
                  }
                },
                bid_status:    { type: "string", enum: ["winning", "losing"], nullable: true },
                monthly_limit: { $ref: "#/components/schemas/MonthlyStatus" }
              }
            }}}
          }
        }
      }
    },

    "/api/bids": {
      post: {
        tags: ["Bids"],
        summary: "Place a bid for tomorrow's featured slot",
        description: "One bid per user per day. Monthly win limit is checked before accepting. You will receive `bid_status: 'winning'` or `'losing'` — the highest bid from others is never revealed.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PlaceBidRequest" } } }
        },
        responses: {
          201: {
            description: "Bid placed",
            content: { "application/json": { schema: {
              type: "object",
              properties: {
                message:    { type: "string", example: "Bid placed successfully" },
                bid_id:     { type: "integer", example: 5 },
                amount:     { type: "number",  example: 150.00 },
                bid_date:   { type: "string",  format: "date", example: "2026-04-02" },
                bid_status: { type: "string",  enum: ["winning", "losing"] }
              }
            }}}
          },
          400: { description: "Invalid amount",          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Monthly limit reached",   content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          409: { description: "Bid already exists for tomorrow — use PUT to increase", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/bids/{id}": {
      put: {
        tags: ["Bids"],
        summary: "Increase your bid (decrease is NOT allowed)",
        description: "The new amount must be strictly greater than your current bid. Decreasing a bid is blocked — this is part of the blind bidding rules.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, description: "Bid ID from place bid response" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PlaceBidRequest" } } }
        },
        responses: {
          200: {
            description: "Bid updated",
            content: { "application/json": { schema: {
              type: "object",
              properties: {
                message:    { type: "string", example: "Bid updated" },
                new_amount: { type: "number", example: 250.00 },
                bid_status: { type: "string", enum: ["winning", "losing"] }
              }
            }}}
          },
          400: { description: "New amount must be greater than current bid", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Bid not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      },
      delete: {
        tags: ["Bids"],
        summary: "Cancel a pending bid",
        description: "Only bids with `status: 'pending'` can be cancelled. Won/lost bids are immutable.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Bid cancelled", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          404: { description: "Bid not found or already settled", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/bids/me/status": {
      get: {
        tags: ["Bids"],
        summary: "Check if you are winning for tomorrow",
        description: "Returns your bid amount and whether you are currently winning. **The highest bid from other users is intentionally never included** — this is the blind bidding rule.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Your bid status", content: { "application/json": { schema: { $ref: "#/components/schemas/BidStatusResponse" } } } },
          404: { description: "No bid placed for tomorrow", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/bids/me": {
      get: {
        tags: ["Bids"],
        summary: "My full bid history",
        description: "Returns all bids placed by the authenticated user, ordered by date descending. Includes final `won` / `lost` outcomes after midnight selection.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Bid history",
            content: { "application/json": { schema: {
              type: "object",
              properties: {
                bids: { type: "array", items: { $ref: "#/components/schemas/BidRecord" } }
              }
            }}}
          }
        }
      }
    },

    "/api/bids/me/monthly": {
      get: {
        tags: ["Bids"],
        summary: "View monthly win usage",
        description: "Shows how many times you have won this calendar month and how many slots remain. Base limit is 3. Attending a university alumni event grants 1 extra slot.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Monthly status", content: { "application/json": { schema: { $ref: "#/components/schemas/MonthlyStatus" } } } }
        }
      }
    },

    "/api/bids/admin/event-bonus": {
      post: {
        tags: ["Bids"],
        summary: "Grant event attendance bonus — admin only",
        description: "Grants a user an extra bid slot (raising their monthly limit from 3 to 4) for attending a university alumni event. Can only be granted once per user per month.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "year", "month"],
                properties: {
                  userId: { type: "integer", example: 1 },
                  year:   { type: "integer", example: 2026 },
                  month:  { type: "integer", example: 4, minimum: 1, maximum: 12 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Bonus granted", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          400: { description: "Missing fields", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Not admin",      content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // API KEYS

    "/api/admin/api-keys": {
      post: {
        tags: ["API Keys"],
        summary: "Generate a new client API key",
        description: "Creates a cryptographically random API key (`pk_` prefix + 64 hex characters). **Only the SHA-256 hash is stored** — the raw key is returned in this response only and cannot be recovered afterwards. Store it securely.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/GenerateKeyRequest" } } }
        },
        responses: {
          201: { description: "Key generated — store the api_key immediately", content: { "application/json": { schema: { $ref: "#/components/schemas/GenerateKeyResponse" } } } },
          400: { description: "client_name is required", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Not admin",               content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      },
      get: {
        tags: ["API Keys"],
        summary: "List all API keys",
        description: "Returns all API keys with their status. The raw key and hash are **never** returned.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of keys",
            content: { "application/json": { schema: {
              type: "object",
              properties: {
                api_keys: { type: "array", items: { $ref: "#/components/schemas/ApiKeyRecord" } }
              }
            }}}
          },
          403: { description: "Not admin", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/admin/api-keys/{id}/stats": {
      get: {
        tags: ["API Keys"],
        summary: "View usage statistics for an API key",
        description: "Returns total request count, a breakdown by endpoint and method, and the 100 most recent log entries including IP addresses and timestamps.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, description: "API Key ID" }],
        responses: {
          200: { description: "Usage statistics", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiKeyStats" } } } },
          403: { description: "Not admin",        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Key not found",    content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/admin/api-keys/{id}": {
      delete: {
        tags: ["API Keys"],
        summary: "Revoke an API key",
        description: "Sets `is_active = 0`. All subsequent requests using this key will immediately receive 401. The key record is kept in the database for audit purposes.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Key revoked",    content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          400: { description: "Already revoked", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          403: { description: "Not admin",       content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Key not found",   content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    "/api/admin/trigger-winner": {
      post: {
        tags: ["API Keys"],
        summary: "Manually trigger winner selection (testing only)",
        description: "Runs the midnight winner selection job immediately for tomorrow's bid date. Use this in development/testing to avoid waiting until midnight. Requires admin JWT.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Winner selection executed", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
          403: { description: "Not admin", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // PUBLIC API

    "/api/v1/alumni/today": {
      get: {
        tags: ["Public API"],
        summary: "Get today's featured alumnus",
        description: "Returns the full profile of the current Alumni of the Day — the winner of last night's blind bid. Includes all sub-entities: degrees, certifications, licences, courses and employment history. Returns 404 if no winner has been selected yet today.",
        security: [{ apiKeyAuth: [] }],
        responses: {
          200: { description: "Today's featured alumnus", content: { "application/json": { schema: { $ref: "#/components/schemas/TodaysAlumnusResponse" } } } },
          401: { description: "Invalid or missing API key", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "No featured alumnus today — winner not yet selected", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },

    // HEALTH

    "/health": {
      get: {
        tags: ["Auth"],
        summary: "Health check",
        description: "Returns `ok: true` if the server is running. No authentication required.",
        responses: {
          200: {
            description: "Server is running",
            content: { "application/json": { schema: {
              type: "object",
              properties: {
                ok:        { type: "boolean", example: true },
                timestamp: { type: "string",  format: "date-time" }
              }
            }}}
          }
        }
      }
    }
  }
};

function setupSwagger(app) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: "AR Alumni API Docs",
      swaggerOptions: {
        persistAuthorization: true, 
        displayRequestDuration: true, 
        filter: true,                 
        docExpansion: "list"          
      }
    })
  );

  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json(spec);
  });

  console.log("Swagger docs → http://localhost:5000/api-docs");
}

module.exports = { setupSwagger };
