// app/api/add_interview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma, { InterviewType } from '@/lib/prisma';
import { z } from 'zod';

/*───────────────
  Zod body schema
 ───────────────*/
const BodySchema = z.object({
  candidateId: z.number().int().positive(),
  jobListingId: z.number().int().positive(),
  type: z.enum([InterviewType.TECHNICAL, InterviewType.HR]),
  topics: z.array(z.string().min(1)).optional(), // only for TECHNICAL
  scheduledDateTime: z.string().datetime(),      // ISO‑8601
});

export async function POST(req: NextRequest) {
  /* 1 – Auth check */
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== 'recruiter') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  /* 2 – Validate body */
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: 'Invalid payload', detail: err }, { status: 400 });
  }

  /* 3 – Ensure recruiter owns the job */
  const job = await prisma.jobListing.findFirst({
    where: { id: body.jobListingId, companyId: Number(session.user.id) },
  });
  if (!job) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  /* 4 – Block duplicates */
  const duplicate = await prisma.interview.findFirst({
    where: {
      candidateId: body.candidateId,
      jobListingId: body.jobListingId,
      type: body.type, // same TECHNICAL/HR
    },
  });

  if (duplicate) {
    return NextResponse.json(
      { error: 'Interview already scheduled for this candidate and job.' },
      { status: 409 },
    );
  }

  /* 5 – Normalise topics */
  const topics =
    body.type === InterviewType.TECHNICAL ? body.topics ?? [] : [];

  /* 6 – Create interview */
  try {
    const interview = await prisma.interview.create({
      data: {
        candidateId: body.candidateId,
        jobListingId: body.jobListingId,
        type: body.type,
        topics,
        scheduledDateTime: new Date(body.scheduledDateTime),
      },
    });

    return NextResponse.json({ success: true, interview });
  } catch (err) {
    console.error('Failed to create interview:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
