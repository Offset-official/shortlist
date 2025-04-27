import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { CodingProblem } from "@/interfaces/model_interfaces";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";

// Enable debug logging only when needed (set to false in production)
const DEBUG = false;

export default async function DsaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParam = await searchParams;
  let session;
  try {
    session = await getServerSession(authOptions);
    DEBUG && console.log("Session retrieved:", !!session);
  } catch (error) {
    // Log only in debug mode
    DEBUG && console.error("Error retrieving session:", error);
    redirect("/login");
  }

  if (!session) {
    redirect("/login");
  }

  const page = searchParam.page ? Number(searchParam.page) || 1 : 1;
  const pageSize = 9;
  const skip = (page - 1) * pageSize;

  let questions: any[] = [];
  try {
    questions = await prisma.codingProblem.findMany({
      skip,
      take: pageSize,
      orderBy: { id: "asc" },
    });
    DEBUG && console.log(`Fetched ${questions.length} problems for page ${page}`);
  } catch (error) {
    DEBUG && console.error("Error fetching coding problems:", error);
    // Optionally render an error state instead of redirecting
    questions = [];
  }

  const handleDSAAction = async () => {
    try {
      toast.success("DSA action successful!");
    } catch (err) {
      toast.error("DSA action failed.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: "var(--foreground)" }}
      >
        DSA Problems
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.length > 0 ? (
          questions.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))
        ) : (
          <p
            className="col-span-full text-center text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            No problems found. Try refreshing or checking your database.
          </p>
        )}
      </div>
      <div className="flex justify-center items-center gap-4 mt-10">
        {page > 1 ? (
          <Link
            href={`/dsa?page=${page - 1}`}
            className="px-4 py-2 rounded-[var(--radius-md)] transition-colors hover:bg-[color:calc(var(--primary)_90%_var(--foreground))]"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            Previous
          </Link>
        ) : (
          <span
            className="px-4 py-2 rounded-[var(--radius-md)] cursor-not-allowed"
            style={{
              backgroundColor: "var(--muted)",
              color: "var(--muted-foreground)",
            }}
          >
            Previous
          </span>
        )}
        {questions.length === pageSize ? (
          <Link
            href={`/dsa?page=${page + 1}`}
            className="px-4 py-2 rounded-[var(--radius-md)] transition-colors hover:bg-[color:calc(var(--primary)_90%_var(--foreground))]"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            Next
          </Link>
        ) : (
          <span
            className="px-4 py-2 rounded-[var(--radius-md)] cursor-not-allowed"
            style={{
              backgroundColor: "var(--muted)",
              color: "var(--muted-foreground)",
            }}
          >
            Next
          </span>
        )}
      </div>
    </div>
  );
}

interface ProblemCardProps {
  problem: CodingProblem;
}

function ProblemCard({ problem }: ProblemCardProps) {
  let difficultyStyles = {
    backgroundColor: "",
    color: "",
    borderColor: "",
  };

  if (problem.difficulty === "Easy") {
    difficultyStyles = {
      backgroundColor: "var(--tertiary)",
      color: "var(--secondary-foreground)",
      borderColor: "color-mix(in srgb, var(--tertiary) 80%, var(--foreground))",
    };
  } else if (problem.difficulty === "Medium") {
    difficultyStyles = {
      backgroundColor: "var(--yellow)",
      color: "var(--card-foreground)",
      borderColor: "color-mix(in srgb, var(--yellow) 80%, var(--foreground))",
    };
  } else if (problem.difficulty === "Hard") {
    difficultyStyles = {
      backgroundColor: "var(--destructive)",
      color: "var(--secondary-foreground)",
      borderColor: "color-mix(in srgb, var(--destructive) 80%, var(--foreground))",
    };
  }

  const mockInterviewHref = `/mock-interview?dsaId=${problem.id}&title=${encodeURIComponent(
    problem.title
  )}&difficulty=${encodeURIComponent(problem.difficulty)}`;

  return (
    <Link href={mockInterviewHref}>
      <Card
        className="group flex flex-col h-full transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardHeader
          className="flex justify-between items-center p-4"
          style={{ borderBottomColor: "var(--border)" }}
        >
          <span
            className="font-semibold text-lg"
            style={{ color: "var(--card-foreground)" }}
          >
            #{problem.id}
          </span>
          <span
            className="text-sm font-medium px-3 py-1 rounded-full border"
            style={{
              backgroundColor: difficultyStyles.backgroundColor,
              color: difficultyStyles.color,
              borderColor: difficultyStyles.borderColor,
            }}
          >
            {problem.difficulty}
          </span>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <h3
            className="text-lg font-medium mb-2 group-hover:text-[var(--primary)] transition-colors"
            style={{ color: "var(--card-foreground)" }}
          >
            {problem.title}
          </h3>
          <p
            className="text-sm line-clamp-3"
            style={{ color: "var(--muted-foreground)" }}
          >
            {problem.description}
          </p>
          {problem.category && problem.category.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {problem.category.map((cat, index) => (
                <span
                  key={index}
                  className="text-xs rounded-full px-3 py-1 border"
                  style={{
                    backgroundColor: "var(--muted)",
                    color: "var(--muted-foreground)",
                    borderColor: "var(--border)",
                  }}
                >
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