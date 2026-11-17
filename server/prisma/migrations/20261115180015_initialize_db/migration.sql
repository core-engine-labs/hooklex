-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "token" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT,
    "headers" JSONB NOT NULL,
    "ip" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "query" JSONB,
    "body" TEXT,
    "bodySize" INTEGER NOT NULL DEFAULT 0,
    "isReplay" BOOLEAN NOT NULL DEFAULT false,
    "replayedFrom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_after" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collection_token_key" ON "Collection"("token");

-- CreateIndex
CREATE INDEX "Collection_id_idx" ON "Collection"("id");

-- CreateIndex
CREATE INDEX "Collection_isDeleted_id_idx" ON "Collection"("isDeleted", "id");

-- CreateIndex
CREATE INDEX "Collection_id_isDeleted_idx" ON "Collection"("id", "isDeleted");

-- CreateIndex
CREATE INDEX "Request_collectionId_createdAt_idx" ON "Request"("collectionId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Request_collectionId_method_createdAt_idx" ON "Request"("collectionId", "method", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Request_collectionId_isReplay_createdAt_idx" ON "Request"("collectionId", "isReplay", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Request_collectionId_ip_createdAt_idx" ON "Request"("collectionId", "ip", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Request_expire_after_createdAt_idx" ON "Request"("expire_after", "createdAt");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
