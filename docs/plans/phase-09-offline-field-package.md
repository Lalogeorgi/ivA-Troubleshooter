# Phase 9: Offline Field Package Generator & Sync Engine

## 1. Objective
Enable true offline field service capability. Allow the FSE to export and download a scoped Field Service Package (`.iva-pkg`) before visiting a customer site, operate the complete troubleshooting workspace without internet connectivity, and synchronize service interventions back to the central hub when connectivity is restored.

## 2. Prerequisites
- Phase 1, 2, 6, 7, and 8 completed.

## 3. Files & Modules Affected
- `backend/src/offline/` (New NestJS Offline Packaging Module)
- `backend/src/offline/package-builder.service.ts`
- `backend/src/offline/sync-reconciler.service.ts`
- `frontend/public/service-worker.js` (PWA Service Worker)
- `frontend/lib/offline/` (Client offline SQLite/IndexedDB store)
- `frontend/lib/offline/sync-manager.ts`
- `frontend/components/OfflineSyncBadge.tsx`

## 4. Database Changes
- Add `SyncDeltaQueue` table:
  - `id`: UUID
  - `engineerId`: String
  - `deviceId`: String
  - `entityName`: String
  - `operation`: String (CREATE, UPDATE)
  - `payload`: Json
  - `clientTimestamp`: DateTime
  - `syncedAt`: DateTime?

## 5. API Changes
- `POST /api/v1/offline/packages/generate` — Request compilation of a target field package:
  - Parameters: `{ instrumentModelId, assetSerialNumber, includeManuals: boolean, include3D: boolean }`
  - Returns: Signed download URL for `.iva-pkg` bundle.
- `POST /api/v1/offline/sync` — Submit offline intervention delta queue for reconciliation.

## 6. UI Changes
- **Field Package Downloader**:
  - Modal allowing FSE to select upcoming site visit, view package size (e.g. 48 MB), and download for offline use.
- **Offline Mode Indicator & Sync Badge**:
  - Unobtrusive badge showing `Online`, `Offline (Running Local Package)`, or `Sync Pending (3 updates queued)`.
  - Manual "Sync Now" button when network returns.

## 7. Architecture Changes
- Client application caches core static assets via PWA Service Worker.
- Local data stored in browser IndexedDB or SQLite WASM via Origin Private File System (OPFS).
- Conflict resolution uses client-timestamped event log with Last-Write-Wins and manual conflict review for conflicting technician notes.

## 8. Dependencies
- Backend: `archiver` (ZIP/TAR bundle creation), `better-sqlite3` (generating SQLite snapshot).
- Frontend: `dexie` or `@sqlite.org/sqlite-wasm`.

## 9. Implementation Tasks
1. **Package Builder Service**:
   - Query instrument ontology, procedures, error codes, and target PDF pages for the selected asset.
   - Compile into an optimized SQLite database file (`local.db`).
   - Bundle `local.db`, target PDF files, and 3D glTF models into a compressed `.iva-pkg` archive.
2. **Client Offline Storage Layer**:
   - Initialize IndexedDB / SQLite WASM wrapper.
   - Implement local query adapter mirroring the REST API endpoints.
3. **Delta Change Logger**:
   - Intercept case updates, measurements, and part replacements, logging them to `local_changes` queue.
4. **Sync & Reconcile Service**:
   - Transmit queued changes to `/api/v1/offline/sync` upon online event.
   - Reconcile changes into the central PostgreSQL database.

## 10. Testing
- Air-gap simulation: Disconnect browser network in DevTools.
  - Verify FSE can start intervention, log measurements, follow decision tree, and complete case while offline.
- Reconnection test: Re-enable network; verify queued actions sync and case reflects accurately on central server.

## 11. Acceptance Criteria
- [ ] Field package generates in < 15 seconds.
- [ ] Complete diagnostic workflow functional with network disabled.
- [ ] Reconnection syncs all offline measurements and notes without data loss.

## 12. Risks & Rollback Considerations
- **Risk**: Browser clearing IndexedDB storage under low disk space pressure.
- **Mitigation**: Request persistent storage permission (`navigator.storage.persist()`).

## 13. Documentation Updates
- Update user guide with offline field package download and synchronization instructions.
