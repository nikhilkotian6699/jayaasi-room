# Jayaasi Rooms — Database Backup & Disaster Recovery Standard

This document details the production backup, point-in-time recovery (PITR), retention policy, and emergency runbooks for the PostgreSQL persistence layer.

---

## 1. Backup Tiers & Strategies

### Tier 1: Continuous WAL Archiving (Point-in-Time Recovery)
- **Mechanism**: PostgreSQL Write-Ahead Log (WAL) streaming to encrypted object storage (AWS S3 / Cloudflare R2).
- **RPO (Recovery Point Objective)**: <= 5 minutes of data loss.
- **RTO (Recovery Time Objective)**: <= 30 minutes to restore a functional replica.

### Tier 2: Automated Daily Full Snapshot
- **Mechanism**: `pg_dump` with custom compressed archive format (`-Fc`) scheduled nightly at 02:00 AM IST (low operational traffic window).
- **Execution Script**:
  ```bash
  pg_dump -h $PGHOST -U $PGUSER -d jayaasi_rooms -Fc -f /backups/jayaasi_rooms_$(date +%Y%m%d_%H%M%S).dump
  ```
- **Encryption**: AES-256 server-side encryption before transfer to off-site cloud storage.

---

## 2. Retention Schedule

| Backup Type | Frequency | Retention Window | Storage Target |
|---|---|---|---|
| Continuous WALs | Real-time | 7 days | Primary S3/R2 Bucket |
| Daily Snapshot | Daily (02:00 IST) | 30 days | S3 Infrequent Access |
| Weekly Snapshot | Sunday (02:00 IST) | 90 days | S3 Glacier |
| Monthly Financial Snapshot | 1st of month | 7 years (Statutory GST requirement) | S3 Deep Archive (WORM compliant) |

---

## 3. Disaster Recovery & Restoration Runbook

### Step 1: Initialize Clean Target Database
```bash
createdb -h $TARGET_HOST -U $TARGET_USER jayaasi_rooms_recovery
```

### Step 2: Restore from Dump
```bash
pg_restore -h $TARGET_HOST -U $TARGET_USER -d jayaasi_rooms_recovery --clean --if-exists -v /backups/jayaasi_rooms_latest.dump
```

### Step 3: Verify Integrity & Prisma Migration Alignment
```bash
npx prisma migrate status
npx tsx tests/database-integrity.test.ts
```

### Step 4: Promote Connection String
Switch `DATABASE_URL` in the production environment variables to point to the newly recovered instance.
