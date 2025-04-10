/*
  Warnings:

  - You are about to drop the column `solutionApproach` on the `CodingProblem` table. All the data in the column will be lost.
  - You are about to drop the column `solutionCode` on the `CodingProblem` table. All the data in the column will be lost.
  - You are about to drop the column `spaceComplexity` on the `CodingProblem` table. All the data in the column will be lost.
  - You are about to drop the column `timeComplexity` on the `CodingProblem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CodingProblem" DROP COLUMN "solutionApproach",
DROP COLUMN "solutionCode",
DROP COLUMN "spaceComplexity",
DROP COLUMN "timeComplexity",
ADD COLUMN     "approaches" JSONB;
