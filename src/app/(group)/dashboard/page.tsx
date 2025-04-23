import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import CandidateDashboard from "@/components/CandidateDashboard";
import RecruiterDashboard from "@/components/RecruiterDashboard";
import { toast } from "react-hot-toast";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const handleDashboardAction = async () => {
    try {
      toast.success("Dashboard action successful!");
    } catch (err) {
      toast.error("Dashboard action failed.");
    }
  };

  return (
    <>
      {session.user.type === "recruiter" ? <RecruiterDashboard /> : <CandidateDashboard />}
    </>
  );
}
