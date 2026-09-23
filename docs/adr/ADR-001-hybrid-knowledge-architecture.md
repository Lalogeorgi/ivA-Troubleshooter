# ADR-001: Hybrid Knowledge Architecture (Postgres + pgvector + Markdown Knowledge Vault)

## Status
Accepted

## Context
Medical device service engineering requires managing three distinct classes of technical knowledge:
1. **Human/AI Collaborative Engineering Knowledge**: Diagnostic guides, failure mode descriptions, procedural steps, and service bulletins. These are authored by senior FSEs, technical writers, and systems engineers. They must be easily readable, version-controlled via Git, diffable, and interconnected.
2. **Authoritative Original Documents**: OEM PDF service manuals, schematics, hydraulic diagrams, and regulatory notices. These documents are legally authoritative; an AI cannot simply rewrite them without losing compliance.
3. **Operational & Case Data**: Customer hospital sites, serial numbers, installed firmware versions, diagnostic measurement logs, part consumption, and technician audit trails. These require ACID transactional integrity, relational foreign keys, and structured queries.

In the original prototype, data was scattered between incomplete SQL tables, raw unchunked text files, and an unindexed pgvector column.

## Decision
We adopt a **Hybrid Knowledge Architecture**:
1. **Markdown Enterprise Knowledge Vault**:
   - Technical concepts (Instruments, Subsystems, Components, ErrorCodes, Procedures, FailureModes, ServiceBulletins) are stored as human-readable Markdown files with YAML frontmatter and `[[wikilinks]]`.
   - The vault is managed under version control and can be edited in tools like Obsidian or any text editor.
2. **PostgreSQL 16 + pgvector as Operational & Retrieval Core**:
   - PostgreSQL stores operational data (Cases, Assets, Sites, Work Orders) and indexes the parsed knowledge vault.
   - Vector embeddings of document chunks and procedure sections are stored in `pgvector`.
   - Knowledge relationships (wikilinks and parent-child physical hierarchies) are synchronized into PostgreSQL relational adjacency tables, enabling recursive CTE graph traversals.
3. **Authoritative PDF Document Repository**:
   - Original PDFs remain untouched on disk/object storage.
   - Ingestion preserves exact page numbers and bounding box coordinates `[x0, y0, x1, y1]`, enabling exact side-by-side provenance rendering in the client.

## Consequences
### Positive
- Senior engineers and technical writers can inspect and update procedures without touching SQL databases.
- The platform avoids lock-in to specialized graph databases (e.g. Neo4j) or dedicated vector databases (e.g. Pinecone), running on a single robust PostgreSQL instance.
- Exact clinical auditability and regulatory compliance are maintained back to original PDF pages.

### Negative
- Requires a synchronization worker to monitor file modifications in the Markdown vault and update the PostgreSQL relational and vector indexes.
