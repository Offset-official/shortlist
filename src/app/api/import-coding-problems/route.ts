import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import prisma from "@/lib/prisma"; // Ensure this exports your PrismaClient instance

export async function POST() {
  try {
    // Adjust the file path as needed
    const filePath = path.join(process.cwd(), "data", "problems.json");
    const fileContent = await fs.readFile(filePath, "utf8");
    const problems = JSON.parse(fileContent);

    // Ensure your JSON file is an array of objects
    const result = await prisma.codingProblem.createMany({
      data: problems.map((problem: any) => ({
        id: problem.ques_num,
        title: problem.question,
        difficulty: "Easy", // All problems are "Easy" by default
        description: problem.description,
        category: [],
        companiesAskedIn: [],
        approaches: problem.approaches, // This is saved as JSON
      })),
    });

    return NextResponse.json({
      message: "Data imported successfully",
      count: result.count,
    });
  } catch (error) {
    console.error("Error importing data:", error);
    return NextResponse.error();
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "2", 10);
    const problems = await prisma.codingProblem.findMany({
      take: limit,
      orderBy: { id: "asc" },
    });
    return NextResponse.json({ problems });
  } catch (error) {
    console.error("Error fetching coding problems:", error);
    return NextResponse.json({ error: "Failed to fetch coding problems" }, { status: 500 });
  }
}
