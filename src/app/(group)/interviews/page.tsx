import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import CandidateInterviews from "@/components/CandidateInterviews";
// import RecruiterDashboard from "@/components/RecruiterDashboard";
import  NotFound from "@/app/not-found";

export default async function Interviews() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return (
    <>
      {session.user.type === "recruiter" ? < NotFound/> : <CandidateInterviews />}
    </>
  );
}
