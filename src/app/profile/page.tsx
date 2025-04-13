"use client"
import CandidateProfile from '@/components/candidate-profile';
import RecruiterProfile from '@/components/recruiter-profile';
import { useSession } from 'next-auth/react';
import Loading from '@/components/ui/loading';
import { Suspense } from 'react';
const ProfileClient = () => {
  const { data: session, status } = useSession();
  return <>
  {false? <RecruiterProfile />:<CandidateProfile />}
  </>

}
const ProfilePage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileClient />
    </Suspense>
  )
}

export default ProfilePage