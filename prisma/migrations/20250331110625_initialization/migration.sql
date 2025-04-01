-- CreateTable
CREATE TABLE "Candidate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "year" INTEGER,
    "collegeName" TEXT,
    "location" TEXT,
    "resume" JSONB,
    "dreamCompanies" TEXT[],
    "skills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobListingId" INTEGER,
    "shortlistedJobListingId" INTEGER,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruiter" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "website" TEXT,
    "location" TEXT,
    "industry" TEXT,
    "values" TEXT[],
    "description" TEXT,
    "companySize" TEXT,
    "linkedInUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recruiter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobListing" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "location" TEXT,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "salary" TEXT,
    "description" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "experienceLevel" TEXT,
    "jobRole" TEXT,
    "skills" TEXT[],
    "education" TEXT,
    "postedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "applicationCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodingProblem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT[],
    "companiesAskedIn" TEXT[],
    "timeComplexity" TEXT,
    "spaceComplexity" TEXT,
    "solutionApproach" TEXT,
    "solutionCode" TEXT,

    CONSTRAINT "CodingProblem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Recruiter_email_key" ON "Recruiter"("email");

-- CreateIndex
CREATE INDEX "JobListing_title_idx" ON "JobListing"("title");

-- CreateIndex
CREATE INDEX "JobListing_skills_idx" ON "JobListing"("skills");

-- CreateIndex
CREATE INDEX "JobListing_companyId_idx" ON "JobListing"("companyId");

-- CreateIndex
CREATE INDEX "CodingProblem_title_idx" ON "CodingProblem"("title");

-- CreateIndex
CREATE INDEX "CodingProblem_difficulty_idx" ON "CodingProblem"("difficulty");

-- CreateIndex
CREATE INDEX "CodingProblem_category_idx" ON "CodingProblem"("category");

-- CreateIndex
CREATE INDEX "CodingProblem_companiesAskedIn_idx" ON "CodingProblem"("companiesAskedIn");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_shortlistedJobListingId_fkey" FOREIGN KEY ("shortlistedJobListingId") REFERENCES "JobListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobListing" ADD CONSTRAINT "JobListing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Recruiter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
