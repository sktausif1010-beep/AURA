# AURA — AI Understanding, Risk & Assurance Agent

> **Before you trust it, let AURA investigate it.**

AURA (AI Understanding, Risk & Assurance Agent) is a full-stack AI-assisted investigation platform designed to help users analyze documents, URLs, claims, and supporting evidence before relying on the information they contain.

Instead of simply returning an AI-generated answer, AURA organizes an investigation around:

- Claims
- Evidence
- Sources
- Relationships
- Risk indicators
- Verification status
- Investigation history
- Trust relationships

The system combines a web-based investigation interface with a backend agent architecture, document processing, URL analysis, evidence evaluation, authentication, MongoDB persistence, and an interactive Trust Graph.

---

## 🌐 Live Demo

**Frontend**

https://aura-d14y.onrender.com

**Backend API**

https://aura-api-zn69.onrender.com

**Health Check**

https://aura-api-zn69.onrender.com/api/health

---

# 📌 Table of Contents

- [Overview](#-overview)
- [Why AURA?](#-why-aura)
- [Core Idea](#-core-idea)
- [Key Features](#-key-features)
- [How AURA Works](#-how-aura-works)
- [Investigation Workflow](#-investigation-workflow)
- [Trust Graph](#-trust-graph)
- [Risk Analysis](#-risk-analysis)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Frontend](#-frontend)
- [Backend](#-backend)
- [AI Agent Architecture](#-ai-agent-architecture)
- [Database](#-database)
- [Authentication](#-authentication)
- [API Overview](#-api-overview)
- [Environment Variables](#-environment-variables)
- [Local Installation](#-local-installation)
- [Running the Project](#-running-the-project)
- [Production Deployment](#-production-deployment)
- [Security](#-security)
- [Error Handling](#-error-handling)
- [Testing](#-testing)
- [Limitations](#-limitations)
- [Future Scope](#-future-scope)
- [Use Cases](#-use-cases)
- [Project Goals](#-project-goals)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

# 🔎 Overview

The internet contains a huge amount of information, but not all information is equally reliable.

Users regularly encounter:

- Unverified claims
- Misleading information
- Incomplete documents
- Unsupported statements
- Suspicious sources
- Conflicting evidence
- Information that is difficult to independently verify

AURA is designed as an investigation assistant that helps users examine information systematically.

The platform accepts investigation inputs and analyzes them through multiple stages.

The result is not just a simple response.

AURA produces an investigation containing:

```text
Input
   ↓
Investigation
   ↓
Claims
   ↓
Evidence
   ↓
Sources
   ↓
Relationships
   ↓
Risk Analysis
   ↓
Investigation Result
   ↓
Trust Graph
