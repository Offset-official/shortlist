// app/api/add_interview/route.ts
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
  topics: z.array(z.string().min(1)).optional(),
  scheduledDateTime: z.string().datetime(), // ISO‑8601
});

export async function POST(req: NextRequest) {
  /* 1 – Auth */
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

  /* 3 – Verify recruiter owns the job */
  const job = await prisma.jobListing.findFirst({
    where: { id: body.jobListingId, companyId: Number(session.user.id) },
    select: { id: true, title: true },
  });
  if (!job) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  /* 4 – Prevent duplicate interviews */
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

    /* 7 – Fetch candidate email/name */
    const candidate = await prisma.candidate.findUnique({
      where: { id: body.candidateId },
      select: { email: true, name: true },
    });

    /* 8 – Send Gmail email (best‑effort) */
    if (!mailTransport) {
      console.warn('📧 Gmail transport not configured (check env vars).');
    } else if (candidate?.email) {
      const html = `
        <p>Hi ${candidate.name ?? 'there'},</p>
        <p>You’ve been <strong>shortlisted</strong> for the <strong>${body.type}</strong> interview for the role “${job.title}”.</p>
        <p><strong>Schedule:</strong> ${new Date(body.scheduledDateTime).toLocaleString('en-IN')}</p>
        ${
          topics.length
            ? `<p><strong>Topics:</strong> ${topics.join(', ')}</p>`
            : ''
        }
        <p>View details and next steps at <a href="https://short-list.vercelapp.com" target="_blank">short‑list.vercelapp.com</a>.</p>
        <p>Best of luck!</p>
        <p>— The Short‑List Team</p>
      `;

      mailTransport
        .sendMail({
          from: `"Short‑List" <${GMAIL_USER}>`,
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
