# ivA-Troubleshooter — Backend Service Intelligence Core

This directory contains the server-side architecture and diagnostic engine for **ivA-Troubleshooter**, an open-source, AI-native medical device service intelligence and diagnostic troubleshooting platform.

For full project overview, stakeholder value guides, and knowledge vault documentation, see the [Root README](../README.md).

---

## 🛠️ Technology Stack
* **Framework**: [NestJS](https://nestjs.com/) (Node.js & TypeScript)
* **ORM & Database**: [Prisma](https://www.prisma.io/) with [PostgreSQL 16](https://www.postgresql.org/)
* **Vector Extensions**: [pgvector](https://github.com/pgvector/pgvector) for semantic embeddings
* **Knowledge Vault**: Obsidian-compatible Markdown AST parsing & relational graph indexing
* **Search Architecture**: Reciprocal Rank Fusion (BM25 Lexical + Dense Vector + Graph Traversal)
* **Agentic Tools**: Model-agnostic LLM provider abstraction (Local Ollama, vLLM, Cloud) with MCP-compatible tool protocols

---

## 📁 Directory Structure
```
backend/
├── src/
│   ├── cases/                     # FSE Case Operations & Intervention lifecycles
│   ├── troubleshooting/          # Stateful diagnostic tree engine & physical tolerance checks
│   ├── vault/                     # Knowledge Vault parser, wikilink extractor & graph sync
│   ├── knowledge-search/          # Hybrid search engine (RRF fusion + pgvector + graph)
│   ├── knowledge-ingestion/       # Layout-aware PDF manual parser & provenance indexer
│   ├── ontology/                  # Medical device domain ontology & equipment hierarchy
│   ├── offline/                   # Encrypted offline field package (.iva-pkg) generator
│   ├── audit/                     # FDA 21 CFR Part 820 / ISO 13485 compliance audit logging
│   └── agent/                     # Multi-step evidence reasoning agent & LLM providers
├── prisma/
│   ├── schema.prisma              # Database schema (PostgreSQL + pgvector)
│   └── seed.ts                    # Synthetic medical device fixtures & baseline diagnostic trees
```

---

## 🚀 Getting Started

### 1. Database Setup
Ensure PostgreSQL 16 with pgvector is running via Docker Compose:
```bash
docker compose -f ../docker/docker-compose.yml up -d
```

### 2. Install Dependencies & Migrate
```bash
npm install
npx prisma migrate dev --name init_postgres_baseline
npm run seed
```

### 3. Run Development Server
```bash
npm run start:dev
```
The NestJS API will be available at [http://localhost:3001](http://localhost:3001).

### 4. Knowledge Vault Synchronization
Trigger a full scan and relational graph synchronization of the `knowledge/` directory:
```bash
curl -X POST http://localhost:3001/vault/sync
```
