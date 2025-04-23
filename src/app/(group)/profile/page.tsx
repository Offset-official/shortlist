import CandidateProfile from '@/components/candidate-profile';
import RecruiterProfile from '@/components/recruiter-profile';
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { toast } from "react-hot-toast";

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

const handleProfileAction = async () => {
  try {
    // ...existing code...
    toast.success("Profile action successful!");
    // ...existing code...
  } catch (err) {
    toast.error("Profile action failed.");
  }
};

export default ProfilePage