'use client'

import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from '@/components/ui/loading';
import { ResumeUploader } from '@/components/resume-uploader';
import { FileText, User, BookOpen, Briefcase, Award, Star, Layers, Medal, Code } from 'lucide-react';
import { Candidate } from '@/interfaces/model_interfaces';

const sectionIcons: Record<string, React.ReactNode> = {
    summary: <User className="h-20 w-20 text-tertiary" />,
    education: <BookOpen className="h-20 w-20 text-tertiary" />,
    experience: <Briefcase className="h-20 w-20 text-tertiary" />,
    skills: <Code className="h-20 w-20 text-tertiary" />,
    achievements: <Award className="h-20 w-20 text-tertiary" />,
    projects: <Layers className="h-20 w-20 text-tertiary" />,
};

const Page = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(true);

    // Make fetchCandidate accessible
    const fetchCandidate = async () => {
        if (!session?.user?.id) return;
        setLoading(true);
        try {
            const response = await axios.get('/api/getCandidate', {
                params: {
                    user_id: session.user.id
                }
            });
            setCandidate(response.data);
        } catch (error) {
            console.error('Failed to fetch candidate', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status !== 'loading' && !session) {
            router.push('/login');
        }
        if (session?.user?.id) {
            fetchCandidate();
        }
    }, [status]);

    if (status === 'loading' || loading || !session) {
        return <Loading />;
    }

    if (!candidate) {
        return <p>Candidate data not found.</p>;
    }
    return (
        <div className="flex flex-col items-center min-h-screen   py-10">
            <div className="w-full max-w-7xl bg-card shadow-xl rounded-2xl p-8 border border-muted">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-3">
                        Resume Analysis
                    </h1>
                    <p className="mt-2 text-gray max-w-2xl mx-auto">
                        Get personalized insights and actionable recommendations to make your resume stand out. Upload your latest resume and track your progress!
                    </p>
                </header>
                <hr className="my-6 border-muted/30" />
                {candidate?.resumeAnalysis ? (
                    <>
                        {/* Resume Analysis Stats (Key Metrics) */}
                        <section>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                {/* Overall Score */}
                                <div className="relative flex flex-col items-center gap-1 bg-primary/5 rounded-lg p-8 shadow-sm overflow-hidden ">
                                    {/* Background Icon */}
                                    <span className="opacity-10 absolute -bottom-5 -right-5 pointer-events-none">
                                        <Medal className="h-20 w-20 text-primary" />
                                    </span>
                                    <span className="relative z-10 text-5xl font-extrabold text-primary">{candidate.resumeAnalysis.overallScore}</span>
                                    <span className="relative z-10 text-xs text-muted-foreground">Overall Score</span>
                                </div>
                                {/* Section Scores */}
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {Object.entries(candidate.resumeAnalysis.sections).map(([section, value]) => {
                                            const data = value as { score: number };
                                            const key = section.toLowerCase();
                                            return (
                                                <div key={section} className="relative flex flex-col items-center bg-muted/50 rounded-lg p-4 shadow overflow-hidden ">
                                                    <span className="opacity-10 absolute -bottom-5 -right-5 pointer-events-none">
                                                        {(sectionIcons[key] || <Star className="h-20 w-20 text-tertiary" />)}
                                                    </span>
                                                    <span className="relative z-10 font-bold text-xl text-tertiary">{data.score}</span>
                                                    <span className="relative z-10 text-xs text-muted-foreground capitalize text-center">{section.replace(/([A-Z])/g, ' $1')}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                {/* Recommendations */}
                                <div className="flex max-w-1/2 flex-col gap-2 bg-secondary/10 rounded-lg p-6 shadow-sm">
                                    <span className="font-semibold mb-1 text-primary-foreground">Top Recommendations</span>
                                    <ul className="list-disc pl-5 text-sm text-primary-foreground space-y-1">
                                        {candidate.resumeAnalysis.overallRecommendations.map((rec: string, i: number) => (
                                            <li key={i}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <span className="text-sm text-foreground ">{candidate.resumeAnalysis.overallRationale}</span>
                            </div>
                        </section>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-10">
                        <span className="text-lg text-muted-foreground">No resume analysis found. Upload your resume to get started!</span>
                    </div>
                )}
                <hr className="my-8 border-muted/30" />
                <section>
                    <ResumeUploader userId={candidate?.id.toString()} onResumeAnalysed={fetchCandidate} />
                </section>
            </div>
        </div>
    );
}

export default Page;