# AURA — AI Trust & Investigation Agent

> **Before you trust it, let AURA investigate it.**

AURA is an AI-powered investigation system designed to analyze submitted information, identify claims, examine supporting evidence, inspect sources, and produce a structured trust assessment.

Instead of simply returning an AI-generated answer, AURA attempts to show **why** a piece of information should or should not be trusted.

---

## Overview

The modern web contains a huge amount of information, but not all information is reliable.

AURA provides an investigation workflow where a user can submit information for analysis and receive structured results including:

- Risk assessment
- Claim identification
- Evidence analysis
- Source analysis
- URL investigation
- Findings
- Trust relationships
- Evidence strength
- Investigation history
- Visual trust graph

The system combines a React frontend, Node.js backend, MongoDB, and a local AI service to create an investigation pipeline.

---

## Core Idea

AURA follows the principle:

```text
Input
  ↓
Investigation
  ↓
Claim Extraction
  ↓
Evidence Analysis
  ↓
Source / URL Analysis
  ↓
Risk Assessment
  ↓
Trust Graph
  ↓
Investigation Result
```
