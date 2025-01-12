/*
  Warnings:

  - You are about to drop the `recovery_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "recovery_codes" DROP CONSTRAINT "recovery_codes_userEmail_fkey";

-- DropTable
DROP TABLE "recovery_codes";
