import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma"; // Your Prisma client instance
import { authOptions } from "@/lib/authOptions";
import { CodingProblem } from "@/interfaces/model_interfaces"; // Your CodingProblem interface
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";

export default async function DsaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParam = await searchParams;
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Error retrieving session:", error);
    redirect("/login");
  }

  if (!session) {
    redirect("/login");
  }

  // Determine the current page using query params (default is page 1)
  const page = searchParam.page ? Number(searchParam.page) || 1 : 1;
  const pageSize = 9;
  const skip = (page - 1) * pageSize;

  // Fetch only the 9 coding problems corresponding to the current page.
  const questions = await prisma.codingProblem.findMany({
    skip,
    take: pageSize,
    orderBy: { id: "asc" },
  });

  const handleDSAAction = async () => {
    try {
      // Example: Add toast to DSA action
      toast.success("DSA action successful!");
    } catch (err) {
      toast.error("DSA action failed.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">DSA Problems</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {questions.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}
      </div>
      <div className="flex justify-between mt-8">
        {page > 1 && (
          <Link
            href={`/dsa?page=${page - 1}`}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Previous
          </Link>
        )}
        {questions.length === pageSize && (
          <Link
            href={`/dsa?page=${page + 1}`}
            className="ml-auto px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}


interface ProblemCardProps {
  problem: CodingProblem;
}

function ProblemCard({ problem }: ProblemCardProps) {
  // Choose color styling based on the problem's difficulty.
  let difficultyColor = "";
  if (problem.difficulty === "Easy") {
    difficultyColor = "bg-green-100 text-green-800";
  } else if (problem.difficulty === "Medium") {
    difficultyColor = "bg-yellow-100 text-yellow-800";
  } else if (problem.difficulty === "Hard") {
    difficultyColor = "bg-red-100 text-red-800";
  }

  return (
    <Link href={`/dsa/${problem.id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition">
        <CardHeader className="flex justify-between items-center p-4">
          {/* Display the problem number */}
          <span className="font-bold">#{problem.id}</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${difficultyColor}`}>
            {problem.difficulty}
          </span>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm mb-2 line-clamp-3">{problem.description}</p>
          {problem.category && problem.category.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {problem.category.map((cat, index) => (
                <span key={index} className="text-xs bg-gray-200 rounded px-2 py-1">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
