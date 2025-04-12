"use client"
import CandidateProfile from '@/components/candidate-profile';
import RecruiterProfile from '@/components/recruiter-profile';
import { useSession } from 'next-auth/react';
const ProfilePage = () => {
  const { data: session, status } = useSession();
  return <>
  {false? <RecruiterProfile />:<CandidateProfile />}
  </>

}

export default ProfilePage