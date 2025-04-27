import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma, { InterviewType } from '@/lib/prisma';
import { z } from 'zod';
import nodemailer from 'nodemailer';

/*────────────────────
  Gmail SMTP transport
  ────────────────────*/
const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

const mailTransport =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD, // Gmail App Password
        },
      })
    : null;

/*───────────────
  Zod body schema
 ───────────────*/
const BodySchema = z.object({
  candidateId: z.number().int().positive(),
  jobListingId: z.number().int().positive(),
  type: z.enum([InterviewType.TECHNICAL, InterviewType.HR]),
  expiryDateTime: z.string().datetime(),
  numQuestions: z.number().int().min(1).default(2),
  screenpipeRequired: z.boolean().default(true), // Align with dialog default
  terminatorRequired: z.boolean().default(false), // Align with dialog default
  programmingLanguage: z.string().min(1).optional(),
  dsaTopics: z
    .array(z.object({ topic: z.string().min(1), difficulty: z.string().min(1) }))
    .optional(),
  topics: z.array(z.string().min(1)).optional(), // Non-DSA technical topics
  hrTopics: z.array(z.string().min(1)).optional(),
}).refine(
  (data) => {
    if (data.type === InterviewType.TECHNICAL) {
      return (data.dsaTopics?.length ?? 0) >= 1; // At least 1 DSA topic
    }
    return true;
  },
  {
    message: 'At least 1 DSA topic is required for technical interviews.',
    path: ['dsaTopics'],
  }
).refine(
  (data) => {
    if (data.type === InterviewType.HR) {
      return (data.hrTopics?.length ?? 0) >= 2; // At least 2 HR topics
    }
    return true;
  },
  {
    message: 'At least 2 HR topics are required for HR interviews.',
    path: ['hrTopics'],
  }
).refine(
  (data) => {
    if (data.type === InterviewType.TECHNICAL) {
      return !!data.programmingLanguage; // Programming language required for technical
    }
    return true;
  },
  {
    message: 'Programming language is required for technical interviews.',
    path: ['programmingLanguage'],
  }
);

export async function POST(req: NextRequest) {
  /* 1 – Auth */
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== 'recruiter') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  /* 2 – Validate body */
  let body: z.infer<typeof BodySchema>;
  try {
    body = await BodySchema.parseAsync(await req.json());
  } catch (err) {
    return NextResponse.json({ error: 'Invalid payload', detail: err }, { status: 400 });
  }

  /* 3 – Validate expiry date */
  const expiryDate = new Date(body.expiryDateTime);
  const now = new Date();
  if (expiryDate <= now) {
    return NextResponse.json(
      {
        error: `Expiry date must be in the future. Current time: ${now.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
        })}`,
      },
      { status: 400 }
    );
  }

  /* 4 – Verify recruiter owns the job */
  const job = await prisma.jobListing.findFirst({
    where: { id: body.jobListingId, companyId: Number(session.user.id) },
    select: { id: true, title: true, Recruiter: { select: { companyName: true } } },
  });
  if (!job) {
    return NextResponse.json(
      { error: 'Forbidden: Job listing not found or not owned by recruiter' },
      { status: 403 }
    );
  }

  /* 5 – Prevent duplicate interviews */
  const duplicate = await prisma.interview.findFirst({
    where: {
      candidateId: body.candidateId,
      jobListingId: body.jobListingId,
      type: body.type,
    },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: 'Interview already scheduled for this candidate and job.' },
      { status: 409 }
    );
  }

  /* 6 – Normalise topics */
  const topics = body.type === InterviewType.TECHNICAL ? body.topics ?? [] : [];
  const dsaTopics = body.type === InterviewType.TECHNICAL ? body.dsaTopics ?? [] : [];
  const programmingLanguage = body.type === InterviewType.TECHNICAL ? body.programmingLanguage ?? null : null;
  const hrTopics = body.type === InterviewType.HR ? body.hrTopics ?? [] : [];
  const numQuestions = body.numQuestions;
  const screenpipeRequired = body.screenpipeRequired;
  const terminatorRequired = body.terminatorRequired;

  /* 7 – Create interview */
  try {
    const interview = await prisma.interview.create({
      data: {
        candidateId: body.candidateId,
        jobListingId: body.jobListingId,
        type: body.type,
        expiryDateTime: expiryDate,
        numQuestions,
        screenpipeRequired,
        terminatorRequired,
        programmingLanguage,
        dsaTopics,
        topics,
        hrTopics,
      },
    });

    /* 8 – Fetch candidate email/name */
    const candidate = await prisma.candidate.findUnique({
      where: { id: body.candidateId },
      select: { email: true, name: true },
    });

    /* 9 – Send Gmail email (best-effort) */
    if (!mailTransport) {
      console.warn('📧 Gmail transport not configured (check env vars).');
    } else if (candidate?.email) {
      const companyName = job.Recruiter?.companyName || 'the company';
      const expiryStr = expiryDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const html = `
        <p>Hi ${candidate.name ?? 'there'},</p>
        <p>You’ve been <strong>shortlisted</strong> for the <strong>${body.type}</strong> interview for the role “${job.title}” at <strong>${companyName}</strong>.</p>
        <p><strong>Note:</strong> This interview link will expire on <strong>${expiryStr}</strong>. Please complete your interview before this time.</p>
        <p>View details and next steps at <a href="https://short-list.vercelapp.com" target="_blank">short-list.vercelapp.com</a>.</p>
        <p>Best of luck!</p>
        <p>— The Short-List Team</p>
      `;

      mailTransport
        .sendMail({
          from: `"Short-List" <${GMAIL_USER}>`,
          to: candidate.email,
          subject: 'You’ve been shortlisted for an interview! 🎉',
          html,
        })
        .catch((err: any) => console.error('📧 Gmail send failed:', err));
    } else {
      console.warn('Candidate has no email; notification not sent.');
    }

    return NextResponse.json({ success: true, interview });
  } catch (err) {
    console.error('Failed to create interview:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}