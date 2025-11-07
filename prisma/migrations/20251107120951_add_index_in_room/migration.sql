-- CreateIndex
CREATE INDEX "Room_createdBy_roomType_name_idx" ON "Room"("createdBy", "roomType", "name");
