import CandidateProfile from '@/components/candidate-profile';
import RecruiterProfile from '@/components/recruiter-profile';
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const ProfilePage = async () => {
    const session = await getServerSession(authOptions);
    if (!session) {
      redirect("/login");
    }
  return (
    <>
      {session.user.type === "recruiter" ? <RecruiterProfile /> : <CandidateProfile />}
    </>
  )
}

export default ProfilePage