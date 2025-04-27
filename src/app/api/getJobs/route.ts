import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const data = await prisma.jobListing.findMany({
            where: {
                status: 'active',
                // expiryDate: {
                //     gt: new Date(),
                // },
            },
            include: {
                Recruiter: true,
            },
            orderBy: {
                postedDate: 'desc',
            },
        });
        
        return NextResponse.json({ jobs: data });
    } catch (error) {
        console.error("Failed to fetch jobs:", error);
        return NextResponse.json(
            { error: "Failed to load job listings" },
            { status: 500 }
        );
    }
}