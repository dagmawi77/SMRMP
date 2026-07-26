# SMRMP — Role-Based Product Requirements Document
## Smart Museum Resource Management Platform

```
┌─────────────────────────────────────────────────────────────────────┐
│              PRODUCT REQUIREMENTS DOCUMENT                          │
│         Smart Museum Resource Management Platform                   │
│                      Role-Based Edition                             │
├─────────────────────────────────────────────────────────────────────┤
│ Document Version:  2.0 — Role-Based PRD                            │
│ Status:            Active Development Reference                     │
│ Prepared:          July 2026                                        │
│ Backend Stack:     Node.js + Express.js                             │
│ Frontend Stack:    React.js + Tailwind CSS                          │
│ Database:          PostgreSQL                                       │
│ AI Layer:          OpenAI API + Custom Prompt Engine               │
│ Reference Site:    Adwa Victory Memorial Museum, Ethiopia           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## SECTION 1: SYSTEM ARCHITECTURE OVERVIEW

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SMRMP SYSTEM ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   VISITOR    │    │  MUSEUM STAFF│    │  MUSEUM DIRECTOR     │  │
│  │   Browser /  │    │  Browser /   │    │  Browser / Dashboard │  │
│  │   Mobile QR  │    │  Desktop     │    │                      │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────┬───────────┘  │
│         │                   │                       │              │
│         └───────────────────┼───────────────────────┘              │
│                             │                                      │
│                    ┌────────▼────────┐                             │
│                    │  React.js SPA   │                             │
│                    │  Tailwind CSS   │                             │
│                    │  Axios HTTP     │                             │
│                    └────────┬────────┘                             │
│                             │  REST API (JSON)                     │
│                    ┌────────▼────────┐                             │
│                    │  Node.js +      │                             │
│                    │  Express.js     │                             │
│                    │  API Server     │                             │
│                    └──┬──────┬───┬───┘                             │
│                       │      │   │                                 │
│          ┌────────────┘      │   └──────────────┐                  │
│          │                   │                  │                  │
│  ┌───────▼──────┐   ┌────────▼──────┐  ┌───────▼──────┐          │
│  │  PostgreSQL  │   │  OpenAI API   │  │  Telebirr /  │          │
│  │  Database    │   │  AI Engine    │  │  Chapa API   │          │
│  └──────────────┘   └───────────────┘  └──────────────┘          │
│                                                                     │
│  ┌───────────────┐   ┌───────────────┐                            │
│  │ Cloud Storage │   │  QR Generator │                            │
│  │ (S3/Cloudinary│   │  Library      │                            │
│  │  for images)  │   │               │                            │
│  └───────────────┘   └───────────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack by Role

```
┌──────────────────┬──────────────────────────────────────────────────┐
│ ROLE             │ PRIMARY TECHNOLOGIES                             │
├──────────────────┼──────────────────────────────────────────────────┤
│ Backend Dev      │ Node.js v20+, Express.js v4+, PostgreSQL v15+,  │
│                  │ Sequelize ORM, JWT, Multer, QRCode library,      │
│                  │ bcryptjs, dotenv, cors, helmet, morgan,          │
│                  │ express-validator, pg (node-postgres)            │
├──────────────────┼──────────────────────────────────────────────────┤
│ Frontend Dev     │ React.js v18+, Tailwind CSS v3+, React Router   │
│                  │ v6, Axios, React Query, Chart.js/ApexCharts,    │
│                  │ React Hook Form, Zustand (state), html5-qrcode   │
│                  │ (QR scanner), React Hot Toast (notifications)    │
├──────────────────┼──────────────────────────────────────────────────┤
│ API Integrator   │ Axios, Postman, OpenAPI/Swagger, Telebirr SDK,  │
│                  │ Chapa API, S3/Cloudinary SDK, Webhook handlers,  │
│                  │ node-fetch, express-rate-limit, API versioning   │
├──────────────────┼──────────────────────────────────────────────────┤
│ AI Engineer      │ OpenAI Node.js SDK v4+, Prompt engineering,     │
│                  │ LangChain.js (optional), streaming responses,    │
│                  │ tiktoken (token counting), context management,   │
│                  │ vector embeddings (Phase 2 — pgvector)           │
└──────────────────┴──────────────────────────────────────────────────┘
```

---

## SECTION 2: BACKEND ENGINEER PRD
### Role: Backend Developer (Node.js + Express.js)

### 2.1 Project Setup & Configuration

```
TASK ID:    BE-SETUP-001
OWNER:      Backend Developer
PRIORITY:   P0 — Must complete before any other work
ESTIMATE:   45 minutes
─────────────────────────────────────────────────────────────────────
```

**PROJECT STRUCTURE TO CREATE:**

```
smrmp-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection config
│   │   ├── cloudinary.js        # Image storage config
│   │   └── environment.js       # Environment variable validation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── artifactController.js
│   │   ├── exhibitionController.js
│   │   ├── conservationController.js
│   │   ├── dashboardController.js
│   │   ├── ticketController.js
│   │   ├── paymentController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── roleGuard.js         # RBAC enforcement
│   │   ├── uploadHandler.js     # Multer file handling
│   │   ├── validateRequest.js   # Input validation
│   │   ├── auditLogger.js       # Audit trail logger
│   │   └── errorHandler.js      # Global error handler
│   ├── models/
│   │   ├── index.js             # Sequelize init
│   │   ├── User.js
│   │   ├── Artifact.js
│   │   ├── ArtifactImage.js
│   │   ├── Exhibition.js
│   │   ├── ExhibitionArtifact.js
│   │   ├── ConservationLog.js
│   │   ├── Ticket.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   ├── authRoutes.js
│   │   ├── artifactRoutes.js
│   │   ├── exhibitionRoutes.js
│   │   ├── conservationRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── aiRoutes.js
│   ├── services/
│   │   ├── qrService.js         # QR code generation
│   │   ├── imageService.js      # Image processing
│   │   ├── reportService.js     # Report data aggregation
│   │   └── notificationService.js
│   ├── utils/
│   │   ├── apiResponse.js       # Standardized responses
│   │   ├── pagination.js        # Pagination helper
│   │   └── dateHelpers.js
│   └── app.js                   # Express app setup
├── migrations/                  # DB migration files
├── seeders/                     # Demo data seeders
├── tests/
│   ├── auth.test.js
│   ├── artifacts.test.js
│   └── ai.test.js
├── .env.example
├── .env
├── package.json
└── server.js                    # Entry point
```

**REQUIRED PACKAGES (package.json):**

```bash
npm install express pg sequelize sequelize-cli
npm install jsonwebtoken bcryptjs
npm install multer cloudinary multer-storage-cloudinary
npm install qrcode uuid
npm install express-validator
npm install cors helmet morgan dotenv
npm install express-rate-limit
npm install openai

npm install --save-dev nodemon jest supertest
```

**ENVIRONMENT VARIABLES (.env):**

```bash
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smrmp_db
DB_USER=smrmp_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_very_long_secret_key_here
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary (image storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini

# Payment (Telebirr Sandbox)
TELEBIRR_APP_ID=sandbox_app_id
TELEBIRR_APP_KEY=sandbox_key
TELEBIRR_SHORT_CODE=sandbox_code
TELEBIRR_PUBLIC_KEY=sandbox_public_key
TELEBIRR_BASE_URL=https://sandbox.telebirr.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 2.2 Database Setup & Models

```
TASK ID:    BE-DB-001
OWNER:      Backend Developer
PRIORITY:   P0
ESTIMATE:   90 minutes
DEPENDS ON: BE-SETUP-001
─────────────────────────────────────────────────────────────────────
```

**FILE: src/config/database.js**

```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development'
      ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
```

**FILE: src/models/User.js**

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 255] }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM(
      'admin', 'curator', 'conservation',
      'maintenance', 'researcher', 'visitor'
    ),
    allowNull: false,
    defaultValue: 'visitor'
  },
  museum_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
```

**FILE: src/models/Artifact.js**

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Artifact = sequelize.define('Artifact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: { notEmpty: true }
  },
  category: {
    type: DataTypes.ENUM(
      'weapon', 'textile', 'document', 'ceramic',
      'jewelry', 'ceremonial', 'photograph',
      'coin', 'other'
    ),
    allowNull: false
  },
  historical_period: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  origin: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  materials: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ai_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description_source: {
    type: DataTypes.ENUM('manual', 'ai_approved', 'ai_draft'),
    defaultValue: 'manual'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  condition_status: {
    type: DataTypes.ENUM(
      'excellent', 'good', 'fair', 'poor', 'critical'
    ),
    defaultValue: 'good'
  },
  qr_code: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  is_on_loan: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  last_edited_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'artifacts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,          // soft delete — adds deleted_at
  deletedAt: 'deleted_at'
});

module.exports = Artifact;
```

**FILE: src/models/ConservationLog.js**

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConservationLog = sequelize.define('ConservationLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  artifact_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'artifacts', key: 'id' }
  },
  inspector_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  condition_before: {
    type: DataTypes.ENUM(
      'excellent', 'good', 'fair', 'poor', 'critical'
    )
  },
  condition_after: {
    type: DataTypes.ENUM(
      'excellent', 'good', 'fair', 'poor', 'critical'
    )
  },
  observations: { type: DataTypes.TEXT },
  action_taken: { type: DataTypes.TEXT },
  next_inspection_date: { type: DataTypes.DATEONLY },
  requires_restoration: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  inspected_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'conservation_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ConservationLog;
```

### 2.3 Authentication System

```
TASK ID:    BE-AUTH-001
OWNER:      Backend Developer
PRIORITY:   P0
ESTIMATE:   2 hours
DEPENDS ON: BE-DB-001
─────────────────────────────────────────────────────────────────────
```

**FILE: src/middleware/auth.js**

```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Authentication required.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.is_active) {
      return sendError(res, 401, 'User not found or deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Session expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid authentication token.');
  }
};

module.exports = { protect };
```

**FILE: src/middleware/roleGuard.js**

```javascript
const { sendError } = require('../utils/apiResponse');

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res, 403,
        `Access denied. Required role(s): ${roles.join(', ')}`
      );
    }
    next();
  };
};

// Convenience role groups
const isAdmin        = allowRoles('admin');
const isCuratorPlus  = allowRoles('admin', 'curator');
const isStaff        = allowRoles(
  'admin', 'curator', 'conservation', 'maintenance'
);

module.exports = { allowRoles, isAdmin, isCuratorPlus, isStaff };
```

**FILE: src/controllers/authController.js**

```javascript
const jwt = require('jsonwebtoken');
const { User, AuditLog } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { body, validationResult } = require('express-validator');

// Token generator
const signToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array());
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email: email.toLowerCase(), is_active: true }
    });

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    // Update last login
    await user.update({ last_login: new Date() });

    const token = signToken(user.id, user.role);

    // Audit log
    await AuditLog.create({
      user_id: user.id,
      action: 'LOGIN',
      table_name: 'users',
      record_id: user.id,
      ip_address: req.ip
    });

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return sendError(res, 500, 'Login failed', error.message);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  await AuditLog.create({
    user_id: req.user.id,
    action: 'LOGOUT',
    table_name: 'users',
    record_id: req.user.id,
    ip_address: req.ip
  });
  return sendSuccess(res, 200, 'Logged out successfully');
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  return sendSuccess(res, 200, 'User profile retrieved', req.user);
};

exports.loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 })
];
```

**FILE: src/routes/authRoutes.js**

```javascript
const express = require('express');
const router = express.Router();
const { login, logout, getMe, loginValidation }
  = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
```

### 2.4 Artifact Controller & Routes

```
TASK ID:    BE-ART-001
OWNER:      Backend Developer
PRIORITY:   P0
ESTIMATE:   2.5 hours
DEPENDS ON: BE-AUTH-001
─────────────────────────────────────────────────────────────────────
```

**FILE: src/services/qrService.js**

```javascript
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const generateArtifactQR = async (artifactId) => {
  const qrCode = `ART-${uuidv4().split('-')[0].toUpperCase()}`;
  const publicUrl =
    `${process.env.FRONTEND_URL}/artifact/${qrCode}`;

  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2,
    color: { dark: '#1a1a1a', light: '#ffffff' }
  });

  return { qrCode, qrDataUrl, publicUrl };
};

module.exports = { generateArtifactQR };
```

**FILE: src/controllers/artifactController.js**

```javascript
const { Op } = require('sequelize');
const {
  Artifact, ArtifactImage, User, AuditLog
} = require('../models');
const { generateArtifactQR } = require('../services/qrService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { paginate } = require('../utils/pagination');
const cloudinary = require('../config/cloudinary');

// GET /api/artifacts
exports.getAllArtifacts = async (req, res) => {
  try {
    const {
      page = 1, limit = 20,
      search, category, condition_status,
      location, period
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { origin: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { historical_period: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category)         where.category = category;
    if (condition_status) where.condition_status = condition_status;
    if (location)         where.location = { [Op.iLike]: `%${location}%` };
    if (period) {
      where.historical_period = { [Op.iLike]: `%${period}%` };
    }

    const { count, rows } = await Artifact.findAndCountAll({
      where,
      include: [{
        model: ArtifactImage,
        as: 'images',
        where: { is_primary: true },
        required: false,
        attributes: ['file_path', 'file_url']
      }],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit)
    });

    return sendSuccess(res, 200, 'Artifacts retrieved', {
      artifacts: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve artifacts', error.message);
  }
};

// GET /api/artifacts/:id
exports.getArtifactById = async (req, res) => {
  try {
    const artifact = await Artifact.findByPk(req.params.id, {
      include: [
        { model: ArtifactImage, as: 'images' },
        {
          model: User, as: 'creator',
          attributes: ['id', 'name', 'role']
        }
      ]
    });

    if (!artifact) {
      return sendError(res, 404, 'Artifact not found');
    }

    return sendSuccess(res, 200, 'Artifact retrieved', artifact);
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve artifact', error.message);
  }
};

// GET /api/artifacts/qr/:code (Public — for visitor QR scan)
exports.getArtifactByQR = async (req, res) => {
  try {
    const artifact = await Artifact.findOne({
      where: { qr_code: req.params.code },
      include: [{ model: ArtifactImage, as: 'images' }],
      attributes: {
        exclude: ['created_by', 'last_edited_by',
                  'ai_description', 'deleted_at']
      }
    });

    if (!artifact) {
      return sendError(res, 404,
        'Artifact not found. This QR code may be invalid.');
    }

    return sendSuccess(res, 200, 'Artifact retrieved', artifact);
  } catch (error) {
    return sendError(res, 500, 'QR lookup failed', error.message);
  }
};

// POST /api/artifacts
exports.createArtifact = async (req, res) => {
  try {
    const {
      name, category, historical_period, origin,
      materials, description, location, condition_status,
      keywords
    } = req.body;

    const { qrCode, qrDataUrl } = await generateArtifactQR();

    const artifact = await Artifact.create({
      name, category, historical_period, origin,
      materials, description, location,
      condition_status: condition_status || 'good',
      qr_code: qrCode,
      keywords: keywords || [],
      created_by: req.user.id
    });

    // Handle image uploads if files present
    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map((file, index) => ({
        artifact_id: artifact.id,
        file_path: file.path,
        file_url: file.path,
        is_primary: index === 0
      }));
      await ArtifactImage.bulkCreate(imageRecords);
    }

    // Audit log
    await AuditLog.create({
      user_id: req.user.id,
      action: 'CREATE_ARTIFACT',
      table_name: 'artifacts',
      record_id: artifact.id,
      new_values: { name, category },
      ip_address: req.ip
    });

    const fullArtifact = await Artifact.findByPk(artifact.id, {
      include: [{ model: ArtifactImage, as: 'images' }]
    });

    return sendSuccess(res, 201, 'Artifact created successfully', {
      artifact: fullArtifact,
      qr_data_url: qrDataUrl
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to create artifact', error.message);
  }
};

// PUT /api/artifacts/:id
exports.updateArtifact = async (req, res) => {
  try {
    const artifact = await Artifact.findByPk(req.params.id);
    if (!artifact) return sendError(res, 404, 'Artifact not found');

    const oldValues = artifact.toJSON();
    await artifact.update({ ...req.body, last_edited_by: req.user.id });

    await AuditLog.create({
      user_id: req.user.id,
      action: 'UPDATE_ARTIFACT',
      table_name: 'artifacts',
      record_id: artifact.id,
      old_values: oldValues,
      new_values: req.body,
      ip_address: req.ip
    });

    return sendSuccess(res, 200, 'Artifact updated', artifact);
  } catch (error) {
    return sendError(res, 500, 'Failed to update artifact', error.message);
  }
};

// DELETE /api/artifacts/:id (soft delete via paranoid)
exports.deleteArtifact = async (req, res) => {
  try {
    const artifact = await Artifact.findByPk(req.params.id);
    if (!artifact) return sendError(res, 404, 'Artifact not found');

    await artifact.destroy(); // soft delete — sets deleted_at

    await AuditLog.create({
      user_id: req.user.id,
      action: 'DELETE_ARTIFACT',
      table_name: 'artifacts',
      record_id: artifact.id,
      old_values: { name: artifact.name },
      ip_address: req.ip
    });

    return sendSuccess(res, 200, 'Artifact removed from active catalog');
  } catch (error) {
    return sendError(res, 500, 'Failed to delete artifact', error.message);
  }
};
```

**FILE: src/routes/artifactRoutes.js**

```javascript
const express = require('express');
const router = express.Router();
const {
  getAllArtifacts, getArtifactById, getArtifactByQR,
  createArtifact, updateArtifact, deleteArtifact
} = require('../controllers/artifactController');
const { protect } = require('../middleware/auth');
const { isCuratorPlus, isAdmin } = require('../middleware/roleGuard');
const { uploadHandler } = require('../middleware/uploadHandler');

// Public routes
router.get('/qr/:code', getArtifactByQR);

// Protected routes
router.use(protect);
router.get('/', isCuratorPlus, getAllArtifacts);
router.post('/', isCuratorPlus, uploadHandler.array('images', 5),
  createArtifact);
router.get('/:id', isCuratorPlus, getArtifactById);
router.put('/:id', isCuratorPlus, updateArtifact);
router.delete('/:id', isAdmin, deleteArtifact);

module.exports = router;
```

### 2.5 Dashboard & Utility Controllers

```
TASK ID:    BE-DASH-001
OWNER:      Backend Developer
PRIORITY:   P1
ESTIMATE:   1.5 hours
─────────────────────────────────────────────────────────────────────
```

**FILE: src/controllers/dashboardController.js**

```javascript
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const {
  Artifact, Exhibition, ConservationLog,
  Ticket, User
} = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalArtifacts,
      activeExhibitions,
      conservationAlerts,
      visitorsToday,
      ticketsSoldMonth,
      recentArtifacts
    ] = await Promise.all([
      Artifact.count(),
      Exhibition.count({ where: { status: 'active' } }),
      Artifact.count({
        where: {
          condition_status: { [Op.in]: ['poor', 'critical'] }
        }
      }),
      Ticket.count({
        where: {
          created_at: { [Op.gte]: today },
          payment_status: 'completed'
        }
      }),
      Ticket.count({
        where: {
          created_at: {
            [Op.gte]: new Date(
              today.getFullYear(),
              today.getMonth(), 1
            )
          },
          payment_status: 'completed'
        }
      }),
      Artifact.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'name', 'category',
                     'condition_status', 'created_at']
      })
    ]);

    return sendSuccess(res, 200, 'Dashboard stats retrieved', {
      stats: {
        total_artifacts: totalArtifacts,
        active_exhibitions: activeExhibitions,
        conservation_alerts: conservationAlerts,
        visitors_today: visitorsToday,
        tickets_sold_this_month: ticketsSoldMonth
      },
      recent_artifacts: recentArtifacts
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to load dashboard', error.message);
  }
};

exports.getChartData = async (req, res) => {
  try {
    // Artifact categories distribution
    const categoryData = await Artifact.findAll({
      attributes: [
        'category',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    // Conservation status distribution
    const conservationData = await Artifact.findAll({
      attributes: [
        'condition_status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['condition_status'],
      raw: true
    });

    // Visitor trend (last 30 days — seeded for MVP)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const visitorTrend = await Ticket.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo },
        payment_status: 'completed'
      },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true
    });

    return sendSuccess(res, 200, 'Chart data retrieved', {
      categories: categoryData,
      conservation_status: conservationData,
      visitor_trend: visitorTrend
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to load chart data', error.message);
  }
};
```

**FILE: src/utils/apiResponse.js**

```javascript
const sendSuccess = (res, statusCode, message, data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode, message, errors = null) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
```

**FILE: src/utils/pagination.js**

```javascript
const paginate = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  return {
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };
};

module.exports = { paginate };
```

**FILE: src/middleware/errorHandler.js**

```javascript
const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method
  });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return sendError(res, 400, 'Validation error', messages);
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    return sendError(res, 409, 'A record with this value already exists');
  }

  return sendError(
    res,
    err.statusCode || 500,
    err.message || 'Internal server error'
  );
};

module.exports = errorHandler;
```

**FILE: src/app.js**

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many login attempts. Try again in 15 minutes.'
}));

app.use('/api/', rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SMRMP API',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
```

### 2.6 Backend Task Checklist

```
BACKEND DEVELOPER — COMPLETE TASK LIST
─────────────────────────────────────────────────────────────────────
PHASE 0 — SETUP (H0:00–H2:00)
  □ BE-SETUP-001  Initialize Node.js + Express project structure
  □ BE-SETUP-002  Install all required npm packages
  □ BE-SETUP-003  Configure .env with all required variables
  □ BE-SETUP-004  Set up PostgreSQL database locally + cloud
  □ BE-SETUP-005  Configure Sequelize connection + test connection
  □ BE-SETUP-006  Set up Cloudinary account + test image upload
  □ BE-SETUP-007  Create GitHub repo, push initial commit

PHASE 1 — CORE (H2:00–H8:00)
  □ BE-DB-001     Write all Sequelize models (User, Artifact,
                  ArtifactImage, Exhibition, ConservationLog,
                  Ticket, AuditLog)
  □ BE-DB-002     Write and run all database migrations
  □ BE-AUTH-001   Build auth controller (login, logout, getMe)
  □ BE-AUTH-002   Build JWT middleware (protect)
  □ BE-AUTH-003   Build role guard middleware (allowRoles)
  □ BE-AUTH-004   Build auth routes + test with Postman
  □ BE-ART-001    Build artifact controller (all 5 CRUD operations
                  + QR lookup)
  □ BE-ART-002    Build QR service (generate unique QR code)
  □ BE-ART-003    Build multer upload handler middleware
  □ BE-ART-004    Build artifact routes with role protection
  □ BE-ART-005    Test all artifact endpoints with Postman

PHASE 2 — AI + DASHBOARD (H8:00–H14:00)
  □ BE-DASH-001   Build dashboard stats endpoint
  □ BE-DASH-002   Build chart data endpoint
  □ BE-DASH-003   Build dashboard routes
  □ BE-AI-001     Build AI controller (handed to AI Engineer
                  — see AI section)
  □ BE-AI-002     Build AI routes

PHASE 3 — TICKETS + PAYMENTS (H14:00–H19:00)
  □ BE-TKT-001    Build ticket controller (purchase, verify, list)
  □ BE-TKT-002    Build ticket QR generation
  □ BE-TKT-003    Build payment simulation controller
  □ BE-TKT-004    Build ticket routes

PHASE 4 — FINISH (H19:00–H24:00)
  □ BE-SEED-001   Write seeders: 20 artifacts, 3 exhibitions,
                  3 users, 30-day ticket/visitor data
  □ BE-SEED-002   Run seeders, verify demo data looks realistic
  □ BE-DEPLOY-001 Deploy to Railway or Render
  □ BE-DEPLOY-002 Set production environment variables
  □ BE-DEPLOY-003 Run smoke tests on production URL
  □ BE-DOCS-001   Export Postman collection with all endpoints
```

---

## SECTION 3: FRONTEND ENGINEER PRD
### Role: Frontend Developer (React.js + Tailwind CSS)

### 3.1 Project Setup

```
TASK ID:    FE-SETUP-001
OWNER:      Frontend Developer
PRIORITY:   P0
ESTIMATE:   30 minutes
─────────────────────────────────────────────────────────────────────
```

**PROJECT STRUCTURE:**

```
smrmp-frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── api/
│   │   ├── axios.js           # Axios instance + interceptors
│   │   ├── authApi.js
│   │   ├── artifactApi.js
│   │   ├── dashboardApi.js
│   │   ├── ticketApi.js
│   │   └── aiApi.js
│   ├── components/
│   │   ├── ui/                # Reusable base components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── Alert.jsx
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   └── PrivateLayout.jsx
│   │   ├── artifacts/
│   │   │   ├── ArtifactCard.jsx
│   │   │   ├── ArtifactForm.jsx
│   │   │   ├── ArtifactTable.jsx
│   │   │   ├── ArtifactDetail.jsx
│   │   │   ├── QRDisplay.jsx
│   │   │   └── ImageGallery.jsx
│   │   ├── dashboard/
│   │   │   ├── StatCard.jsx
│   │   │   ├── CategoryChart.jsx
│   │   │   ├── VisitorChart.jsx
│   │   │   ├── ConservationChart.jsx
│   │   │   └── RecentArtifacts.jsx
│   │   ├── ai/
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── AIDescriptionBtn.jsx
│   │   │   └── AIReportModal.jsx
│   │   └── tickets/
│   │       ├── TicketSelector.jsx
│   │       ├── PaymentFlow.jsx
│   │       └── DigitalTicket.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── artifacts/
│   │   │   ├── ArtifactsPage.jsx
│   │   │   ├── AddArtifactPage.jsx
│   │   │   └── ArtifactDetailPage.jsx
│   │   ├── visitor/
│   │   │   └── PublicArtifactPage.jsx  # QR public page
│   │   └── tickets/
│   │       └── TicketPurchasePage.jsx
│   ├── store/
│   │   ├── authStore.js       # Zustand auth state
│   │   └── uiStore.js         # Loading, toasts, modals
│   ├── hooks/
│   │   ├── useArtifacts.js
│   │   ├── useDashboard.js
│   │   └── useAuth.js
│   ├── utils/
│   │   ├── formatters.js      # Date, currency, text formatters
│   │   └── constants.js       # App-wide constants
│   ├── App.jsx
│   └── main.jsx
├── tailwind.config.js
├── vite.config.js
└── package.json
```

**REQUIRED PACKAGES:**

```bash
npm install react-router-dom axios
npm install @tanstack/react-query
npm install zustand
npm install chart.js react-chartjs-2
npm install react-hook-form
npm install react-hot-toast
npm install @heroicons/react
npm install html5-qrcode
npm install react-dropzone
```

**TAILWIND CONFIG (tailwind.config.js):**

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        museum: {
          50:  '#f0f4e8',
          100: '#d6e4b8',
          200: '#b8cf7f',
          300: '#96b845',
          400: '#7ca018',
          500: '#5d7d0d',  // Primary green
          600: '#4a6409',
          700: '#374b07',
          800: '#243205',
          900: '#111902',
        },
        gold: {
          400: '#f5c842',
          500: '#d4a017',  // Accent gold
          600: '#b8860b',
        },
        earth: {
          100: '#f5efe6',
          200: '#e8d5b7',
          300: '#c9a96e',
          400: '#a0724a',
          500: '#7c4a2d',
        }
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
```

### 3.2 API Client & State Management

```
TASK ID:    FE-API-001
OWNER:      Frontend Developer
PRIORITY:   P0
ESTIMATE:   45 minutes
─────────────────────────────────────────────────────────────────────
```

**FILE: src/api/axios.js**

```javascript
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL
  || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor — attach token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('smrmp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message
      || 'Something went wrong';

    if (error.response?.status === 401) {
      localStorage.removeItem('smrmp_token');
      localStorage.removeItem('smrmp_user');
      window.location.href = '/login';
      toast.error('Session expired. Please log in again.');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission for this action.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

**FILE: src/api/artifactApi.js**

```javascript
import api from './axios';

export const artifactApi = {
  getAll: (params) =>
    api.get('/artifacts', { params }),

  getById: (id) =>
    api.get(`/artifacts/${id}`),

  getByQR: (code) =>
    api.get(`/artifacts/qr/${code}`),

  create: (formData) =>
    api.post('/artifacts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  update: (id, data) =>
    api.put(`/artifacts/${id}`, data),

  remove: (id) =>
    api.delete(`/artifacts/${id}`)
};
```

**FILE: src/store/authStore.js**

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({
        user, token, isAuthenticated: true
      }),

      clearAuth: () => set({
        user: null, token: null, isAuthenticated: false
      }),

      hasRole: (...roles) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      }
    }),
    {
      name: 'smrmp_auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
```

### 3.3 Core Page Components

```
TASK ID:    FE-PAGES-001
OWNER:      Frontend Developer
PRIORITY:   P0
ESTIMATE:   4 hours total for all pages
─────────────────────────────────────────────────────────────────────
```

**FILE: src/pages/auth/LoginPage.jsx**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const ROLE_REDIRECTS = {
    admin: '/dashboard',
    curator: '/artifacts',
    conservation: '/conservation',
    maintenance: '/maintenance',
    visitor: '/tickets'
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', data);
      const { token, user } = res.data.data;

      localStorage.setItem('smrmp_token', token);
      setAuth(user, token);

      toast.success(`Welcome back, ${user.name}!`);
      navigate(ROLE_REDIRECTS[user.role] || '/dashboard');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-100 flex items-center
                    justify-center px-4">
      <div className="w-full max-w-md">
        {/* Museum Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-museum-500 rounded-full
                          mx-auto mb-4 flex items-center
                          justify-center">
            <span className="text-white text-3xl">🏛️</span>
          </div>
          <h1 className="font-heading text-3xl text-museum-700
                         font-bold">
            SMRMP
          </h1>
          <p className="text-earth-400 mt-1">
            Adwa Victory Memorial Museum
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800
                         mb-6">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}
                className="space-y-4">
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@museum.et"
                className={`w-full px-4 py-3 rounded-lg border
                  ${errors.email
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300'
                  } focus:outline-none focus:ring-2
                  focus:ring-museum-400`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Invalid email format'
                  }
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-lg border
                  ${errors.password
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300'
                  } focus:outline-none focus:ring-2
                  focus:ring-museum-400`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Minimum 6 characters'
                  }
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-museum-500
                         hover:bg-museum-600 text-white font-medium
                         rounded-lg transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white
                                  border-t-transparent rounded-full
                                  animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 bg-museum-50 rounded-lg
                          text-sm text-museum-700">
            <p className="font-medium mb-2">Demo credentials:</p>
            <p>Admin: admin@adwa.museum</p>
            <p>Curator: curator@adwa.museum</p>
            <p>Password: Demo@2026!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**FILE: src/pages/visitor/PublicArtifactPage.jsx**

```jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { artifactApi } from '../../api/artifactApi';

const CONDITION_COLORS = {
  excellent: 'bg-green-100 text-green-800',
  good:      'bg-blue-100 text-blue-800',
  fair:      'bg-yellow-100 text-yellow-800',
  poor:      'bg-orange-100 text-orange-800',
  critical:  'bg-red-100 text-red-800'
};

export default function PublicArtifactPage() {
  const { code } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['artifact-qr', code],
    queryFn: () => artifactApi.getByQR(code),
    select: (res) => res.data.data.artifact
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center
                      justify-center bg-earth-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-museum-500
                          border-t-transparent rounded-full
                          animate-spin mx-auto mb-4" />
          <p className="text-museum-600">
            Loading artifact...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center
                      justify-center bg-earth-50 px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🏛️</div>
          <h1 className="text-2xl font-heading font-bold
                         text-museum-700 mb-2">
            Artifact Not Found
          </h1>
          <p className="text-gray-500">
            This QR code does not match any artifact in our
            collection. Please check the code and try again.
          </p>
        </div>
      </div>
    );
  }

  const primaryImage = data.images?.find(i => i.is_primary)
    || data.images?.[0];

  return (
    <div className="min-h-screen bg-earth-50">
      {/* Header */}
      <div className="bg-museum-700 text-white py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <p className="text-museum-200 text-sm">
              Adwa Victory Memorial Museum
            </p>
            <p className="text-xs text-museum-300">
              Digital Artifact Explorer
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Image */}
        {primaryImage ? (
          <div className="rounded-2xl overflow-hidden
                          shadow-lg bg-white">
            <img
              src={primaryImage.file_url}
              alt={data.name}
              className="w-full h-72 object-cover"
            />
          </div>
        ) : (
          <div className="rounded-2xl bg-earth-200 h-48
                          flex items-center justify-center">
            <span className="text-6xl">🏺</span>
          </div>
        )}

        {/* Artifact Title & Badges */}
        <div>
          <h1 className="font-heading text-3xl font-bold
                         text-museum-800 mb-3">
            {data.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-museum-100
                             text-museum-700 rounded-full text-sm
                             font-medium capitalize">
              {data.category}
            </span>
            {data.historical_period && (
              <span className="px-3 py-1 bg-gold-100
                               text-gold-700 rounded-full text-sm">
                📅 {data.historical_period}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm
                              font-medium capitalize
                              ${CONDITION_COLORS[data.condition_status]}`}>
              {data.condition_status}
            </span>
          </div>
        </div>

        {/* Key Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm
                        space-y-3">
          <h2 className="font-heading text-lg font-semibold
                         text-museum-700">
            Artifact Details
          </h2>
          {data.origin && (
            <div className="flex gap-3">
              <span className="text-gray-400 w-24 shrink-0
                               text-sm">Origin</span>
              <span className="text-gray-800 text-sm">
                {data.origin}
              </span>
            </div>
          )}
          {data.materials && (
            <div className="flex gap-3">
              <span className="text-gray-400 w-24 shrink-0
                               text-sm">Materials</span>
              <span className="text-gray-800 text-sm">
                {data.materials}
              </span>
            </div>
          )}
          {data.location && (
            <div className="flex gap-3">
              <span className="text-gray-400 w-24 shrink-0
                               text-sm">Location</span>
              <span className="text-gray-800 text-sm">
                {data.location}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {data.description && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-heading text-lg font-semibold
                           text-museum-700 mb-3">
              About This Artifact
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              {data.description}
            </p>
          </div>
        )}

        {/* Audio stub */}
        <button
          onClick={() => alert(
            'Audio narration coming soon — check back soon!'
          )}
          className="w-full py-3 border-2 border-dashed
                     border-museum-300 rounded-xl text-museum-600
                     hover:bg-museum-50 transition-colors text-sm
                     flex items-center justify-center gap-2"
        >
          🔊 Listen to Story (Coming Soon)
        </button>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-8">
          <p>Adwa Victory Memorial Museum</p>
          <p>SMRMP Digital Collection Platform</p>
        </div>
      </div>
    </div>
  );
}
```

### 3.4 Frontend Task Checklist

```
FRONTEND DEVELOPER — COMPLETE TASK LIST
─────────────────────────────────────────────────────────────────────
PHASE 0 — SETUP (H0:00–H2:00)
  □ FE-SETUP-001  Create Vite + React project
  □ FE-SETUP-002  Install all packages
  □ FE-SETUP-003  Configure Tailwind with museum theme
  □ FE-SETUP-004  Set up folder structure
  □ FE-SETUP-005  Configure React Router v6 routes
  □ FE-SETUP-006  Configure React Query client
  □ FE-SETUP-007  Configure Zustand auth store
  □ FE-SETUP-008  Build axios instance with interceptors
  □ FE-SETUP-009  Set up React Hot Toast notifications

PHASE 1 — AUTH + ARTIFACTS (H2:00–H8:00)
  □ FE-AUTH-001   Build LoginPage with form validation
  □ FE-AUTH-002   Build PrivateLayout (sidebar + navbar)
  □ FE-AUTH-003   Build Sidebar with role-based navigation
  □ FE-AUTH-004   Build PrivateRoute guard component
  □ FE-ART-001    Build ArtifactsPage (list + search + filter)
  □ FE-ART-002    Build ArtifactTable component with pagination
  □ FE-ART-003    Build ArtifactCard component
  □ FE-ART-004    Build AddArtifactPage with full form
  □ FE-ART-005    Build image upload dropzone (react-dropzone)
  □ FE-ART-006    Build ArtifactDetail page (full profile)
  □ FE-ART-007    Build QRDisplay component
  □ FE-ART-008    Build condition status Badge component
  □ FE-ART-009    Build ImageGallery component

PHASE 2 — AI + DASHBOARD (H8:00–H14:00)
  □ FE-AI-001     Build AIDescriptionBtn component
                  (calls AI API, shows loading + result)
  □ FE-AI-002     Build AIAssistant chat widget
  □ FE-AI-003     Build AIReportModal component
  □ FE-DASH-001   Build DashboardPage layout
  □ FE-DASH-002   Build StatCard component (6 cards)
  □ FE-DASH-003   Build CategoryChart (donut — Chart.js)
  □ FE-DASH-004   Build VisitorChart (line — Chart.js)
  □ FE-DASH-005   Build ConservationChart (bar — Chart.js)
  □ FE-DASH-006   Build RecentArtifacts list component
  □ FE-DASH-007   Wire AI Assistant widget to dashboard

PHASE 3 — VISITOR + TICKETS (H14:00–H19:00)
  □ FE-VIS-001    Build PublicArtifactPage (mobile-first)
  □ FE-VIS-002    Test QR page on mobile viewport
  □ FE-TKT-001    Build TicketPurchasePage
  □ FE-TKT-002    Build TicketSelector component
  □ FE-TKT-003    Build PaymentFlow component
                  (Telebirr sim with 3-second animation)
  □ FE-TKT-004    Build DigitalTicket QR display component

PHASE 4 — POLISH (H19:00–H24:00)
  □ FE-POLISH-001 Check all pages on mobile 375px width
  □ FE-POLISH-002 Add loading skeleton states to all lists
  □ FE-POLISH-003 Add empty state illustrations
  □ FE-POLISH-004 Add error boundary component
  □ FE-POLISH-005 Verify demo credential hints visible
  □ FE-DEPLOY-001 Deploy to Vercel
  □ FE-DEPLOY-002 Set VITE_API_URL to production backend
  □ FE-DEPLOY-003 Smoke test all pages on production URL
```

---

## SECTION 4: API INTEGRATOR PRD
### Role: API Integration Engineer

### 4.1 Complete API Endpoint Reference

```
TASK ID:    API-DOC-001
OWNER:      API Integration Engineer
PRIORITY:   P0 — Must be shared with all team members by H1:00
ESTIMATE:   30 minutes (document) | Ongoing (implement + test)
─────────────────────────────────────────────────────────────────────

BASE URL:  https://api.smrmp.adwa.museum/api
           (dev: http://localhost:5000/api)

AUTH HEADER:
  Authorization: Bearer {jwt_token}

STANDARD RESPONSE FORMAT:
  SUCCESS:
  {
    "success": true,
    "message": "Human-readable message",
    "data": { ... }
  }

  ERROR:
  {
    "success": false,
    "message": "Human-readable error",
    "errors": [ ... ]  // optional validation errors
  }
```

**AUTHENTICATION ENDPOINTS**

```
POST /auth/login
  Auth:     None
  Body:     { "email": string, "password": string }
  Success:  200 { token: string, user: { id, name, email, role } }
  Errors:   400 (validation), 401 (wrong credentials)

POST /auth/logout
  Auth:     Required
  Body:     None
  Success:  200 { message: "Logged out successfully" }

GET /auth/me
  Auth:     Required
  Success:  200 { user: { id, name, email, role, created_at } }
```

**ARTIFACT ENDPOINTS**

```
GET /artifacts
  Auth:     Curator+
  Query:    page, limit, search, category, condition_status,
            location, period
  Success:  200 {
              artifacts: [ ...array ],
              pagination: {
                total, page, limit, totalPages
              }
            }

POST /artifacts
  Auth:     Curator+
  Body:     multipart/form-data {
              name: string (required),
              category: enum (required),
              historical_period: string,
              origin: string,
              materials: string,
              description: string,
              location: string (required),
              condition_status: enum,
              keywords: JSON array string,
              images: File[] (max 5)
            }
  Success:  201 { artifact: {...}, qr_data_url: string }
  Errors:   400 (validation), 401, 403

GET /artifacts/:id
  Auth:     Curator+
  Success:  200 { artifact: { ...full object with images } }
  Errors:   404

GET /artifacts/qr/:code
  Auth:     None (Public)
  Success:  200 { artifact: { ...public fields only } }
  Errors:   404

PUT /artifacts/:id
  Auth:     Curator+
  Body:     JSON { any artifact fields to update }
  Success:  200 { artifact: { ...updated } }
  Errors:   400, 403, 404

DELETE /artifacts/:id
  Auth:     Admin only
  Success:  200 { message: "Artifact removed from active catalog" }
  Errors:   403, 404
```

**DASHBOARD ENDPOINTS**

```
GET /dashboard/stats
  Auth:     Curator+
  Success:  200 {
              stats: {
                total_artifacts: number,
                active_exhibitions: number,
                conservation_alerts: number,
                visitors_today: number,
                tickets_sold_this_month: number
              },
              recent_artifacts: [ ...5 items ]
            }

GET /dashboard/charts
  Auth:     Curator+
  Success:  200 {
              categories: [{ category, count }],
              conservation_status: [{ condition_status, count }],
              visitor_trend: [{ date, count }]
            }
```

**AI ENDPOINTS**

```
POST /ai/describe-artifact
  Auth:     Curator+
  Body:     {
              name: string,
              category: string,
              historical_period: string,
              origin: string,
              materials: string,
              staff_notes: string (optional)
            }
  Success:  200 {
              description: {
                short_description: string,
                full_description: string,
                keywords: string[],
                suggested_category: string,
                confidence_level: string,
                data_gaps: string[],
                curator_review_required: true
              },
              ai_label: "AI Draft — Pending Curator Approval",
              model_used: string,
              tokens_used: number
            }
  Errors:   400, 429 (rate limit), 503 (AI service down)

POST /ai/search
  Auth:     Curator+
  Body:     { "query": "natural language search string" }
  Success:  200 {
              filters: { category, condition_status, ... },
              interpretation: string,
              artifacts: [ ...results ]
            }

POST /ai/generate-report
  Auth:     Admin, Curator
  Body:     {
              "report_type": "daily_operations |
                              monthly_summary |
                              conservation_status |
                              visitor_analytics |
                              executive_overview"
            }
  Success:  200 {
              report: {
                title: string,
                generated_at: string,
                content: string,
                sections: { ... }
              },
              ai_label: "AI-Generated Draft | Review before
                         distribution"
            }

POST /ai/ask
  Auth:     Curator+
  Body:     { "question": string }
  Success:  200 {
              answer: string,
              data_sources: string[],
              timestamp: string
            }
```

**TICKET ENDPOINTS**

```
GET /tickets/types
  Auth:     None (Public)
  Success:  200 {
              ticket_types: [
                {
                  type: string,
                  label: string,
                  price_etb: number,
                  description: string
                }
              ]
            }

POST /tickets/purchase
  Auth:     None (Public)
  Body:     {
              ticket_type: enum,
              visitor_name: string,
              visitor_phone: string,
              quantity: number,
              payment_method: enum,
              visit_date: date
            }
  Success:  201 {
              ticket: {
                id: uuid,
                qr_ticket_code: string,
                ticket_type: string,
                quantity: number,
                total_amount: number,
                visitor_name: string,
                visit_date: date,
                status: "valid"
              },
              payment_simulation: {
                status: "completed",
                reference: string,
                sandbox_mode: true,
                sandbox_label: "DEMO — No real payment processed"
              }
            }

GET /tickets/verify/:code
  Auth:     Admin, Staff
  Success:  200 {
              valid: boolean,
              ticket: { ...details },
              message: "Valid | Already Used | Invalid"
            }
```

### 4.2 External API Integration Specs

```
TASK ID:    API-EXT-001
OWNER:      API Integration Engineer
PRIORITY:   P1
ESTIMATE:   2 hours
─────────────────────────────────────────────────────────────────────
```

**TELEBIRR SANDBOX INTEGRATION**

FILE: `src/services/telebirrService.js`

```javascript
const crypto = require('crypto');

class TelebirrService {
  constructor() {
    this.appId      = process.env.TELEBIRR_APP_ID;
    this.appKey     = process.env.TELEBIRR_APP_KEY;
    this.shortCode  = process.env.TELEBIRR_SHORT_CODE;
    this.publicKey  = process.env.TELEBIRR_PUBLIC_KEY;
    this.baseUrl    = process.env.TELEBIRR_BASE_URL;
    this.isSandbox  = process.env.NODE_ENV !== 'production';
  }

  // For MVP: simulate payment response
  // Replace with real API call in Phase 2
  async initiatePayment(payload) {
    if (this.isSandbox) {
      // Simulate 2-second processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        sandbox_mode: true,
        reference_number:
          `DEMO-${Date.now()}-${Math.random()
            .toString(36).substr(2, 6).toUpperCase()}`,
        status: 'completed',
        amount: payload.amount,
        label: 'DEMO MODE — No real payment processed',
        timestamp: new Date().toISOString()
      };
    }

    // Real Telebirr integration (Phase 2)
    // Reference: Telebirr H5 Pay API documentation
    try {
      const ussd = this._buildPayload(payload);
      const encrypted = this._encrypt(JSON.stringify(ussd));

      const response = await fetch(
        `${this.baseUrl}/payment/initiate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appid: this.appId,
            sign: this._sign(ussd),
            ussd: encrypted
          })
        }
      );

      return await response.json();
    } catch (error) {
      throw new Error(`Telebirr API error: ${error.message}`);
    }
  }

  _buildPayload(payload) {
    return {
      appid: this.appId,
      merch_code: this.shortCode,
      nonce_str: crypto.randomBytes(16).toString('hex'),
      notify_url: `${process.env.API_BASE_URL}/webhooks/telebirr`,
      out_trade_no: payload.reference,
      subject: payload.description,
      timeout_express: '120m',
      timestamp: Math.floor(Date.now() / 1000).toString(),
      total_amount: payload.amount.toString(),
      trade_type: 'Payment',
      payee_identifier: process.env.TELEBIRR_PHONE,
      payee_identifier_type: '04',
      payee_note: 'Museum Ticket'
    };
  }
}

module.exports = new TelebirrService();
```

**CLOUDINARY IMAGE UPLOAD CONFIG**

FILE: `src/config/cloudinary.js`

```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: `smrmp/artifacts/${new Date().getFullYear()}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 900, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ],
    public_id:
      `artifact_${Date.now()}_${Math.random()
        .toString(36).substr(2, 8)}`
  })
});

const uploadHandler = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png',
                     'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP images are allowed'), false);
    }
  }
});

module.exports = { cloudinary, uploadHandler };
```

### 4.3 API Integration Task Checklist

```
API INTEGRATION ENGINEER — COMPLETE TASK LIST
─────────────────────────────────────────────────────────────────────
PHASE 0 — SETUP (H0:00–H2:00)
  □ API-SETUP-001  Set up Postman workspace + collection
  □ API-SETUP-002  Document all agreed API contracts
  □ API-SETUP-003  Share contracts with FE + BE + AI devs
  □ API-SETUP-004  Set up Cloudinary account + test upload
  □ API-SETUP-005  Register Telebirr sandbox credentials

PHASE 1 — CORE INTEGRATIONS (H2:00–H8:00)
  □ API-AUTH-001   Test auth endpoints in Postman
  □ API-AUTH-002   Verify JWT token works across endpoints
  □ API-AUTH-003   Test RBAC — confirm role restrictions enforced
  □ API-ART-001    Test artifact CRUD endpoints
  □ API-ART-002    Test image upload with Cloudinary
  □ API-ART-003    Test QR code generation response
  □ API-ART-004    Test public QR lookup (no auth)

PHASE 2 — AI + DASHBOARD (H8:00–H14:00)
  □ API-AI-001     Test OpenAI API connectivity from backend
  □ API-AI-002     Test describe-artifact endpoint
  □ API-AI-003     Test smart search endpoint
  □ API-AI-004     Test report generation endpoint
  □ API-AI-005     Test Q&A endpoint
  □ API-DASH-001   Test dashboard stats endpoint
  □ API-DASH-002   Test chart data endpoint
  □ API-DASH-003   Verify data matches actual DB records

PHASE 3 — PAYMENTS + TICKETS (H14:00–H19:00)
  □ API-PAY-001    Test Telebirr sandbox payment initiation
  □ API-PAY-002    Test full ticket purchase flow end-to-end
  □ API-PAY-003    Test ticket QR verification endpoint
  □ API-PAY-004    Confirm sandbox mode label in all responses
  □ API-PAY-005    Test error cases (invalid type, missing fields)

PHASE 4 — DOCUMENTATION (H19:00–H24:00)
  □ API-DOC-001    Export final Postman collection
  □ API-DOC-002    Generate OpenAPI/Swagger spec file
  □ API-DOC-003    Write README for API deployment
  □ API-DOC-004    Document all environment variables
  □ API-ERR-001    Test all error response formats are consistent
  □ API-ERR-002    Verify rate limiting works on auth endpoints
```

---

## SECTION 5: AI ENGINEER PRD
### Role: AI Integration Engineer

### 5.1 AI System Architecture

```
TASK ID:    AI-ARCH-001
OWNER:      AI Engineer
PRIORITY:   P0
ESTIMATE:   30 minutes (design) | 3 hours (implement)
─────────────────────────────────────────────────────────────────────

AI SYSTEM DESIGN PRINCIPLES:
  1. Every AI output is DRAFT — never auto-published
  2. All outputs clearly labeled as AI-generated
  3. Graceful fallback if AI service is unavailable
  4. Token usage monitored and logged per request
  5. No personally identifiable visitor data sent to AI API
  6. Prompts are version-controlled in codebase
```

FILE: `src/services/aiService.js`

```javascript
const OpenAI = require('openai');
const { Artifact, ConservationLog, Ticket,
        Exhibition } = require('../models');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const AI_MODEL   = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const MAX_TOKENS = 1500;

// ═══════════════════════════════════════════════════════════════
// CAPABILITY 1: ARTIFACT DESCRIPTION GENERATOR
// ═══════════════════════════════════════════════════════════════
const generateArtifactDescription = async (artifactData) => {
  const {
    name, category, historical_period,
    origin, materials, staff_notes = ''
  } = artifactData;

  const systemPrompt = `You are a museum documentation assistant
for the Adwa Victory Memorial Museum in Ethiopia. Generate
accurate, culturally respectful, and professionally written
artifact descriptions.

You must:
- Write in formal museum catalog style
- Be historically accurate and culturally sensitive
- Never fabricate historical facts not in the provided data
- Use phrases like "believed to be", "circa", "attributed to"
  when uncertain
- Flag insufficient data fields explicitly

Always output valid JSON only. No explanation outside JSON.`;

  const userPrompt = `Generate a museum catalog entry for:

Artifact Name: ${name}
Category: ${category}
Historical Period: ${historical_period || 'Unknown'}
Geographic Origin: ${origin || 'Unknown'}
Materials: ${materials || 'Unknown'}
Staff Notes: ${staff_notes || 'None provided'}

Output this exact JSON structure:
{
  "short_description": "1 sentence, max 25 words",
  "full_description": "2 paragraphs, professional catalog style",
  "keywords": ["keyword1", "keyword2", "keyword3",
               "keyword4", "keyword5"],
  "suggested_category": "most appropriate category",
  "confidence_level": "high | medium | low",
  "data_gaps": ["list any fields that limited description quality"],
  "curator_review_required": true
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content);

    return {
      success: true,
      description: {
        ...parsed,
        curator_review_required: true  // Always force true
      },
      ai_label: 'AI Draft — Pending Curator Approval',
      model_used: AI_MODEL,
      tokens_used: completion.usage.total_tokens
    };
  } catch (error) {
    if (error.code === 'insufficient_quota') {
      throw new Error('AI quota exceeded. Contact administrator.');
    }
    throw new Error(`AI description failed: ${error.message}`);
  }
};

// ═══════════════════════════════════════════════════════════════
// CAPABILITY 2: SMART SEARCH INTERPRETER
// ═══════════════════════════════════════════════════════════════
const interpretSearchQuery = async (query) => {
  const systemPrompt = `You are a search query interpreter for a
museum artifact database. Convert natural language to structured
filter objects. Output valid JSON only.

Available filter fields:
- name: string (partial match)
- category: one of [weapon, textile, document, ceramic,
  jewelry, ceremonial, photograph, coin, other]
- historical_period: string
- origin: string
- condition_status: one of [excellent, good, fair, poor, critical]
- location: string
- needs_conservation: boolean (true = poor or critical)

Output format:
{
  "filters": {
    "name": null or string,
    "category": null or string,
    "historical_period": null or string,
    "origin": null or string,
    "condition_status": null or string,
    "location": null or string,
    "needs_conservation": null or boolean
  },
  "sort_by": "relevance | date_added | condition",
  "interpretation": "1 sentence explaining search intent"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: `Query: "${query}"` }
      ],
      max_tokens: 300,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    // Fallback: treat as simple keyword search
    return {
      filters: { name: query },
      sort_by: 'relevance',
      interpretation:
        `Keyword search for "${query}" (AI service unavailable)`
    };
  }
};

// ═══════════════════════════════════════════════════════════════
// CAPABILITY 3: MUSEUM Q&A ASSISTANT
// ═══════════════════════════════════════════════════════════════
const answerMuseumQuestion = async (question) => {
  // Fetch live data context from database
  const [
    totalArtifacts,
    conservationCount,
    criticalArtifacts,
    activeExhibitions,
    ticketsThisMonth
  ] = await Promise.all([
    Artifact.count(),
    Artifact.count({
      where: {
        condition_status: {
          [require('sequelize').Op.in]: ['poor', 'critical']
        }
      }
    }),
    Artifact.findAll({
      where: { condition_status: 'critical' },
      attributes: ['name'],
      limit: 5
    }),
    Exhibition.count({ where: { status: 'active' } }),
    Ticket.count({
      where: {
        payment_status: 'completed',
        created_at: {
          [require('sequelize').Op.gte]: new Date(
            new Date().getFullYear(),
            new Date().getMonth(), 1
          )
        }
      }
    })
  ]);

  const contextData = {
    total_artifacts: totalArtifacts,
    artifacts_needing_conservation: conservationCount,
    critical_artifacts: criticalArtifacts.map(a => a.name),
    active_exhibitions: activeExhibitions,
    tickets_sold_this_month: ticketsThisMonth
  };

  const systemPrompt = `You are an operational assistant for
the Adwa Victory Memorial Museum. Answer questions strictly
using the provided data context. Rules:
- Answer in 1-3 clear sentences
- Use exact numbers from context only
- If data is insufficient, say so clearly
- Never recommend specific conservation treatments
- End risk-related answers with: "Please consult the
  conservation team for action."
- Do not invent or estimate figures not in context`;

  const userPrompt = `Current museum data:
${JSON.stringify(contextData, null, 2)}

Question: ${question}`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.2
    });

    return {
      success: true,
      answer: completion.choices[0].message.content,
      data_sources: Object.keys(contextData),
      timestamp: new Date().toISOString(),
      tokens_used: completion.usage.total_tokens
    };
  } catch (error) {
    throw new Error(`Q&A assistant failed: ${error.message}`);
  }
};

// ═══════════════════════════════════════════════════════════════
// CAPABILITY 4: REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════
const generateReport = async (reportType) => {
  // Aggregate data based on report type
  const [
    artifacts, exhibitions, conservationLogs,
    tickets
  ] = await Promise.all([
    Artifact.findAll({
      attributes: ['category', 'condition_status', 'created_at']
    }),
    Exhibition.findAll({
      attributes: ['name', 'status', 'start_date', 'end_date']
    }),
    ConservationLog.findAll({
      order: [['created_at', 'DESC']],
      limit: 20
    }),
    Ticket.findAll({
      where: {
        created_at: {
          [require('sequelize').Op.gte]: new Date(
            new Date().getFullYear(),
            new Date().getMonth(), 1
          )
        }
      },
      attributes: ['ticket_type', 'total_amount',
                   'payment_status']
    })
  ]);

  const reportData = {
    report_type: reportType,
    generated_at: new Date().toISOString(),
    period: `${new Date().toLocaleString('default', {
      month: 'long', year: 'numeric'
    })}`,
    summary: {
      total_artifacts: artifacts.length,
      artifacts_by_condition: artifacts.reduce((acc, a) => {
        acc[a.condition_status] = (acc[a.condition_status] || 0) + 1;
        return acc;
      }, {}),
      active_exhibitions: exhibitions.filter(
        e => e.status === 'active'
      ).length,
      tickets_sold: tickets.filter(
        t => t.payment_status === 'completed'
      ).length,
      revenue_etb: tickets
        .filter(t => t.payment_status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.total_amount), 0)
    }
  };

  const systemPrompt = `You are a professional report writer for
a museum management system. Generate structured institutional
reports. All reports must be clearly labeled as AI drafts.
Use professional, factual language. No marketing language.
Flag uncertainties explicitly.`;

  const reportPrompts = {
    daily_operations: `Write a daily operations report.`,
    monthly_summary:  `Write a comprehensive monthly summary report.`,
    conservation_status: `Write a conservation status report
      focusing on artifact condition and risk.`,
    visitor_analytics:   `Write a visitor analytics report
      focusing on ticketing and attendance trends.`,
    executive_overview:  `Write a concise executive overview
      suitable for board or ministry review.`
  };

  const userPrompt = `${reportPrompts[reportType] || reportPrompts.monthly_summary}

Museum Data:
${JSON.stringify(reportData, null, 2)}

Structure the report with:
1. Header (Museum name, date, report type)
2. Executive Summary (3-4 sentences)
3. Key Metrics (formatted)
4. Notable Findings (data-grounded bullets)
5. Items Requiring Attention (flags only)
6. Recommended Next Steps

End with: "AI-Generated Draft | Review required before
official distribution | Generated: ${new Date().toISOString()}"`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.4
    });

    return {
      success: true,
      report: {
        title: `${reportType.replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())} — ${
          reportData.period}`,
        generated_at: reportData.generated_at,
        content: completion.choices[0].message.content,
        raw_data: reportData
      },
      ai_label: 'AI-Generated Draft | Review before distribution',
      tokens_used: completion.usage.total_tokens
    };
  } catch (error) {
    throw new Error(`Report generation failed: ${error.message}`);
  }
};

module.exports = {
  generateArtifactDescription,
  interpretSearchQuery,
  answerMuseumQuestion,
  generateReport
};
```

### 5.2 AI Controller

```
TASK ID:    AI-CTRL-001
OWNER:      AI Engineer
PRIORITY:   P0
ESTIMATE:   1 hour
─────────────────────────────────────────────────────────────────────
```

FILE: `src/controllers/aiController.js`

```javascript
const {
  generateArtifactDescription,
  interpretSearchQuery,
  answerMuseumQuestion,
  generateReport
} = require('../services/aiService');
const { Artifact, ArtifactImage } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// POST /api/ai/describe-artifact
exports.describeArtifact = async (req, res) => {
  try {
    const { name, category, historical_period,
            origin, materials, staff_notes } = req.body;

    if (!name || !category) {
      return sendError(res, 400,
        'Artifact name and category are required for AI description');
    }

    const result = await generateArtifactDescription({
      name, category, historical_period,
      origin, materials, staff_notes
    });

    return sendSuccess(
      res, 200, 'AI description generated', result
    );
  } catch (error) {
    // Graceful fallback — don't crash
    if (error.message.includes('quota')) {
      return sendError(res, 429,
        'AI quota exceeded. Please contact your administrator.');
    }
    return sendError(res, 503,
      'AI description service unavailable. ' +
      'Please write the description manually.',
      error.message
    );
  }
};

// POST /api/ai/search
exports.smartSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 2) {
      return sendError(res, 400, 'Search query too short');
    }

    const interpreted = await interpretSearchQuery(query);
    const { filters } = interpreted;

    // Build Sequelize where clause from AI filters
    const { Op } = require('sequelize');
    const where = {};

    if (filters.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters.category)         where.category = filters.category;
    if (filters.condition_status) {
      where.condition_status = filters.condition_status;
    }
    if (filters.historical_period) {
      where.historical_period = {
        [Op.iLike]: `%${filters.historical_period}%`
      };
    }
    if (filters.origin) {
      where.origin = { [Op.iLike]: `%${filters.origin}%` };
    }
    if (filters.needs_conservation === true) {
      where.condition_status = { [Op.in]: ['poor', 'critical'] };
    }

    const artifacts = await Artifact.findAll({
      where,
      include: [{
        model: ArtifactImage, as: 'images',
        where: { is_primary: true },
        required: false
      }],
      limit: 50,
      order: [['created_at', 'DESC']]
    });

    return sendSuccess(res, 200, 'Smart search complete', {
      query,
      interpretation: interpreted.interpretation,
      filters: interpreted.filters,
      count: artifacts.length,
      artifacts
    });
  } catch (error) {
    // Fallback to basic search
    return sendError(res, 500,
      'Smart search failed. Use standard search.',
      error.message
    );
  }
};

// POST /api/ai/generate-report
exports.generateReport = async (req, res) => {
  try {
    const { report_type } = req.body;

    const validTypes = [
      'daily_operations', 'monthly_summary',
      'conservation_status', 'visitor_analytics',
      'executive_overview'
    ];

    if (!validTypes.includes(report_type)) {
      return sendError(res, 400,
        `Invalid report type. Valid types: ${validTypes.join(', ')}`
      );
    }

    const result = await generateReport(report_type);
    return sendSuccess(res, 200, 'Report generated', result);
  } catch (error) {
    return sendError(res, 503,
      'Report generation failed. ' +
      'Data may be insufficient for this report type.',
      error.message
    );
  }
};

// POST /api/ai/ask
exports.askAssistant = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length < 3) {
      return sendError(res, 400,
        'Please provide a valid question');
    }

    // Basic content filter
    const blockedTopics = [
      'personal', 'confidential', 'salary', 'password'
    ];
    const lower = question.toLowerCase();
    if (blockedTopics.some(t => lower.includes(t))) {
      return sendError(res, 400,
        'That question is outside the scope of this assistant.');
    }

    const result = await answerMuseumQuestion(question);
    return sendSuccess(res, 200, 'Answer generated', result);
  } catch (error) {
    return sendError(res, 503,
      'AI assistant is temporarily unavailable.',
      error.message
    );
  }
};
```

FILE: `src/routes/aiRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const {
  describeArtifact, smartSearch,
  generateReport, askAssistant
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { isCuratorPlus, isAdmin } = require('../middleware/roleGuard');
const rateLimit = require('express-rate-limit');

// AI-specific rate limit (cost control)
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 20,               // max 20 AI calls per minute per IP
  message: {
    success: false,
    message: 'Too many AI requests. Please wait a moment.'
  }
});

router.use(protect);
router.use(aiRateLimit);

router.post('/describe-artifact', isCuratorPlus, describeArtifact);
router.post('/search',           isCuratorPlus, smartSearch);
router.post('/generate-report',  isCuratorPlus, generateReport);
router.post('/ask',              isCuratorPlus, askAssistant);

module.exports = router;
```

### 5.3 AI Engineer Task Checklist

```
AI ENGINEER — COMPLETE TASK LIST
─────────────────────────────────────────────────────────────────────
PHASE 0 — SETUP (H0:00–H2:00)
  □ AI-SETUP-001  Set up OpenAI account + generate API key
  □ AI-SETUP-002  Configure OPENAI_API_KEY in .env
  □ AI-SETUP-003  Test basic OpenAI API call (hello world)
  □ AI-SETUP-004  Confirm model availability (gpt-4o-mini)
  □ AI-SETUP-005  Set up token usage logging
  □ AI-SETUP-006  Define prompt templates document
  □ AI-SETUP-007  Agree AI feature scope with team lead

PHASE 1 — PROMPT ENGINEERING (H2:00–H8:00)
  □ AI-PROMPT-001 Write + test artifact description system prompt
  □ AI-PROMPT-002 Test with 5 different Adwa-relevant artifacts
  □ AI-PROMPT-003 Validate JSON output format is consistent
  □ AI-PROMPT-004 Write + test search interpreter prompt
  □ AI-PROMPT-005 Test 10 different natural language queries
  □ AI-PROMPT-006 Validate filter object output format
  □ AI-PROMPT-007 Write + test Q&A system prompt
  □ AI-PROMPT-008 Test Q&A with 8 realistic museum questions
  □ AI-PROMPT-009 Write + test report generator prompt
  □ AI-PROMPT-010 Test all 5 report types

PHASE 2 — INTEGRATION (H8:00–H14:00)
  □ AI-INT-001    Build aiService.js with all 4 capabilities
  □ AI-INT-002    Build aiController.js
  □ AI-INT-003    Build aiRoutes.js with rate limiting
  □ AI-INT-004    Implement graceful fallback for all endpoints
  □ AI-INT-005    Test full flow: API call → prompt → response
  □ AI-INT-006    Verify AI labels appear on all outputs
  □ AI-INT-007    Implement token logging middleware

PHASE 3 — TESTING + EDGE CASES (H14:00–H19:00)
  □ AI-TEST-001   Test with minimal artifact data
                  (only name + category filled)
  □ AI-TEST-002   Test with complete artifact data
  □ AI-TEST-003   Test fallback when API key invalid
  □ AI-TEST-004   Test fallback when API timeout occurs
  □ AI-TEST-005   Test rate limiting behavior
  □ AI-TEST-006   Verify confidence_level varies with data quality
  □ AI-TEST-007   Test Q&A with ambiguous questions
  □ AI-TEST-008   Test report with empty database (seed first)

PHASE 4 — DOCUMENTATION (H19:00–H24:00)
  □ AI-DOC-001    Document all prompts in prompts/ directory
  □ AI-DOC-002    Document average token costs per request
  □ AI-DOC-003    Write AI feature README
  □ AI-DOC-004    List known limitations and edge cases
  □ AI-DOC-005    Prepare demo script for AI features (2 min)
```

---

## SECTION 6: CROSS-TEAM COORDINATION

### 6.1 Integration Dependencies Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                  DEPENDENCY MAP                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  BE completes:           FE can start:                             │
│  ─────────────           ──────────────                             │
│  BE-AUTH-001 ──────────► FE-AUTH-001 (Login page)                 │
│  BE-ART-001  ──────────► FE-ART-001 (Artifact list)               │
│  BE-DASH-001 ──────────► FE-DASH-001 (Dashboard)                  │
│  BE-TKT-001  ──────────► FE-TKT-001 (Ticketing)                   │
│                                                                     │
│  AI completes:           FE can start:                             │
│  ─────────────           ──────────────                             │
│  AI-INT-001  ──────────► FE-AI-001 (AI Description btn)           │
│  AI-INT-003  ──────────► FE-AI-002 (AI Assistant widget)          │
│                                                                     │
│  API validates:          FE + BE can proceed:                      │
│  ──────────────          ──────────────────────                     │
│  API-AUTH-001 ─────────► FE auth flow verified                    │
│  API-ART-001  ─────────► Artifact CRUD verified                   │
│  API-AI-001   ─────────► AI endpoints verified                    │
│  API-PAY-001  ─────────► Payment flow verified                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Shared Definition of Done

```
┌─────────────────────────────────────────────────────────────────────┐
│               TEAM-WIDE DEFINITION OF DONE                         │
├──────────────────┬──────────────────────────────────────────────────┤
│ Backend          │ ✓ Endpoint returns correct HTTP status           │
│                  │ ✓ Response matches agreed API contract format    │
│                  │ ✓ Auth + RBAC enforced (tested without token)   │
│                  │ ✓ Input validation returns clear error messages  │
│                  │ ✓ Tested in Postman with realistic data         │
│                  │ ✓ Audit log entry created where required        │
├──────────────────┼──────────────────────────────────────────────────┤
│ Frontend         │ ✓ Renders without console errors                │
│                  │ ✓ Loading states visible on all async calls     │
│                  │ ✓ Error states display user-friendly message    │
│                  │ ✓ Mobile-responsive (tested at 375px width)     │
│                  │ ✓ Uses Zustand/React Query — no prop drilling   │
│                  │ ✓ Toast notifications on success + error        │
├──────────────────┼──────────────────────────────────────────────────┤
│ AI Features      │ ✓ AI output labeled "AI Draft" visibly in UI   │
│                  │ ✓ Human approval required before saving         │
│                  │ ✓ Graceful error if API unavailable             │
│                  │ ✓ Rate limiting active on all AI endpoints      │
│                  │ ✓ Token count logged per request                │
│                  │ ✓ Tested with minimal AND complete input data   │
├──────────────────┼──────────────────────────────────────────────────┤
│ API Integration  │ ✓ Endpoint documented in Postman collection     │
│                  │ ✓ Happy path + error cases both tested          │
│                  │ ✓ Payment endpoints marked SANDBOX in response  │
│                  │ ✓ CORS verified from frontend origin            │
│                  │ ✓ Rate limiting tested on auth endpoints        │
└──────────────────┴──────────────────────────────────────────────────┘
```

### 6.3 Environment Variables Master List

```bash
# ── SHARED WITH ALL TEAM MEMBERS ──────────────────────────────────
# Backend .env

NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smrmp_db
DB_USER=smrmp_user
DB_PASSWORD=StrongPassword123!

# JWT
JWT_SECRET=smrmp_super_secret_jwt_key_change_in_production_64chars
JWT_EXPIRES_IN=8h

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini

# Telebirr Sandbox
TELEBIRR_APP_ID=sandbox_id
TELEBIRR_APP_KEY=sandbox_key
TELEBIRR_SHORT_CODE=sandbox_code
TELEBIRR_BASE_URL=https://sandbox.telebirr.com
API_BASE_URL=http://localhost:5000

# ── Frontend .env ──────────────────────────────────────────────────
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SMRMP
VITE_MUSEUM_NAME=Adwa Victory Memorial Museum
```

### 6.4 Demo Script (8 Minutes)

```
┌─────────────────────────────────────────────────────────────────────┐
│                 DEMO FLOW — ALL ROLES INVOLVED                      │
├──────────────────┬──────────────────────────────────────────────────┤
│ Minute 0:00–1:00 │ TEAM LEAD SPEAKS                                │
│                  │ "Ethiopia's museums hold irreplaceable           │
│                  │  history. Today, most run on paper and           │
│                  │  spreadsheets. SMRMP changes that."              │
│                  │ Show: Problem slide + Adwa Museum context        │
├──────────────────┼──────────────────────────────────────────────────┤
│ Minute 1:00–3:00 │ FRONTEND DRIVES / BACKEND SUPPORTS              │
│                  │ Login as curator@adwa.museum                     │
│                  │ Click "Add Artifact"                             │
│                  │ Fill: Name, Category, Period, Origin, Materials  │
│                  │ Click "⚡ Generate AI Description"               │
│                  │ Watch AI draft appear with "AI Draft" label      │
│                  │ Edit one sentence → Save                         │
│                  │ Show QR code generated automatically             │
├──────────────────┼──────────────────────────────────────────────────┤
│ Minute 3:00–4:30 │ FRONTEND DRIVES / AI ENGINEER EXPLAINS          │
│                  │ Go to Dashboard                                  │
│                  │ Show 6 KPI cards + 3 charts                      │
│                  │ Click AI Assistant widget                        │
│                  │ Type: "How many artifacts need conservation?"    │
│                  │ Show accurate answer from live DB                │
│                  │ Click "Generate Report" → Monthly Summary        │
│                  │ Show AI-generated report with draft label        │
├──────────────────┼──────────────────────────────────────────────────┤
│ Minute 4:30–5:30 │ FRONTEND DRIVES / API INTEGRATOR EXPLAINS       │
│                  │ Open mobile browser (or DevTools mobile mode)    │
│                  │ Navigate to /artifact/{qr_code}                  │
│                  │ Show full artifact page — mobile optimized       │
│                  │ "Visitors scan this QR, see the full story"      │
├──────────────────┼──────────────────────────────────────────────────┤
│ Minute 5:30–6:30 │ FRONTEND DRIVES / API INTEGRATOR EXPLAINS       │
│                  │ Go to Ticket Purchase page                       │
│                  │ Select Adult × 2 (300 ETB)                       │
│                  │ Enter name + phone + Telebirr                    │
│                  │ Show "DEMO MODE" label prominently               │
│                  │ Click Confirm → 3-second processing animation    │
│                  │ Show digital QR ticket generated                 │
├──────────────────┼──────────────────────────────────────────────────┤
│ Minute 6:30–8:00 │ TEAM LEAD CLOSES                                │
│                  │ Show roadmap: MVP → Pilot → National Platform    │
│                  │ State the ask: pilot partnership with Adwa       │
│                  │ Museum + Ministry of Culture introduction        │
│                  │ "We built this in 24 hours. In 6 months,         │
│                  │  we can protect Ethiopia's heritage digitally."  │
└──────────────────┴──────────────────────────────────────────────────┘
```

---

*SMRMP Role-Based PRD v2.0 | Node.js + Express Backend Edition*
*Adwa Victory Memorial Museum, Ethiopia | July 2026*
*All estimates are planning figures subject to team composition and scope validation*
