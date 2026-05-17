# Helfer MVP Implementation Plan - Phase 1: Cleanup and Core Setup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean the existing 'main' branch and set up the core FastAPI and Flutter structures for the Helfer MVP.

**Architecture:** Minimalist Layered Architecture. FastAPI for backend, Flutter for frontend. SQLite for minimal persistence.

**Tech Stack:** Python (FastAPI, SQLAlchemy), Dart (Flutter, Provider, flutter_map).

---

### Task 1: Project Cleanup

**Files:**
- Modify: `backend/` (delete old files)
- Modify: `Frontend/lib/` (clear boilerplate)

- [ ] **Step 1: Remove old crypto and database logic**
Run: `rm -rf backend/app/research/ backend/app/database/neo4j_db.py backend/app/database/postgres_db.py backend/app/services/GetData.py backend/app/api/api_v1/handlers/*`

- [ ] **Step 2: Clear Frontend boilerplate**
Run: `rm -rf Frontend/lib/*`

- [ ] **Step 3: Commit cleanup**
Run: `git add . && git commit -m "chore: cleanup old Wassla code for Helfer MVP"`

### Task 2: Backend Core Setup

**Files:**
- Create: `backend/app/main.py`
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/location.py`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/base.py`
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/schemas/location.py`

- [ ] **Step 1: Setup FastAPI entry point**
```python
from fastapi import FastAPI
from app.api import location

app = FastAPI(title="Helfer MVP API")

app.include_router(location.router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok"}
```

- [ ] **Step 2: Create SQLite Database Model**
```python
# backend/app/models/base.py
from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class LocationPing(Base):
    __tablename__ = "location_pings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    speed = Column(Float)
    heading = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
```

- [ ] **Step 3: Create Schemas**
```python
# backend/app/schemas/location.py
from pydantic import BaseModel
from datetime import datetime

class LocationCreate(BaseModel):
    user_id: str
    lat: float
    lng: float
    speed: float
    heading: float
    timestamp: datetime
```

- [ ] **Step 4: Run backend to verify health check**
Run: `uvicorn app.main:app --reload` (or similar depending on local setup)

- [ ] **Step 5: Commit backend core**
Run: `git add backend/app && git commit -m "feat: setup backend core for Helfer"`

### Task 3: Frontend Core Setup

**Files:**
- Create: `Frontend/lib/main.dart`
- Create: `Frontend/lib/providers/location_provider.dart`
- Create: `Frontend/lib/services/api_service.dart`

- [ ] **Step 1: Setup Flutter entry point**
```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/location_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LocationProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Helfer MVP',
      theme: ThemeData(useMaterial3: true),
      home: const Scaffold(body: Center(child: Text('Helfer MVP Initialized'))),
    );
  }
}
```

- [ ] **Step 2: Commit frontend core**
Run: `git add Frontend/lib && git commit -m "feat: setup frontend core for Helfer"`
