import { images } from "@repo/shared/schemas";
import type { AnyColumn, SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";

export function primaryImageUrlSql(entityType: string, entityId: AnyColumn): SQL<string | null> {
  return sql<string | null>`(
    SELECT i.url FROM ${images} i
    WHERE i.entity_type = ${entityType}
      AND i.entity_id = ${entityId}
      AND i.deleted_at IS NULL
    ORDER BY i.created_at ASC, i.id ASC
    LIMIT 1
  )`;
}
