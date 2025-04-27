import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fetch from 'node-fetch';

// Forbidden websites (from /interview page)
const forbiddenWebsites = [
  { name: 'google', pattern: 'google' },
  { name: 'chatgpt', pattern: 'chatgpt' },
  { name: 'gemini', pattern: 'gemini' },
  { name: 'stackoverflow', pattern: 'stackoverflow' },
  { name: 'github', pattern: 'github' },
  { name: 'wikipedia', pattern: 'wikipedia' },
];

// Define consistent structure for interviewAnalysis
interface InterviewAnalysis {
  poseStability: number;
  faceVisibility: number;
  faceDirectionDistribution: {
    Forward: number;
    Left: number;
    Right: number;
    'No Face Detected': number;
  };
  violationCount: number;
  violationSummary: string;
  faceSummary: string;
  poseSummary: string;
  suspicionSummary: string;
  completedQuestions: number; // Number of correctly answered questions
  questionSummary: string; // Summary of question performance
}

export async function POST(req: NextRequest) {
  try {
    const { interviewId } = await req.json();
    if (!interviewId) {
      return NextResponse.json({ error: 'Missing interviewId' }, { status: 400 });
    }

    // Fetch interview with chatHistory
    const interview = await prisma.interview.findUnique({
      where: { id: Number(interviewId) },
      select: {
        id: true,
        numQuestions: true,
        chatHistory: true,
      },
    });
    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    // Fetch all diagnostics for this interview
    const diagnostics = await prisma.diagnostics.findMany({
      where: { interviewId: Number(interviewId) },
      orderBy: { createdAt: 'asc' },
    });

    // Analyze MediaPipe and Screenpipe data, update diagnostics with violations
    const analysis = await analyzeDiagnostics(diagnostics, interviewId);

    // Analyze chat history for completed questions
    const chatAnalysis = await analyzeChatHistory(interview.chatHistory, interview.numQuestions ?? 0);

    // Call Gemini API for structured JSON summaries
    const { faceSummary, poseSummary, suspicionSummary } = await getGeminiAnalysis(analysis);

    // Build consistent interviewAnalysis object
    const interviewAnalysis: InterviewAnalysis = {
      poseStability: analysis.poseStability,
      faceVisibility: analysis.faceVisibility,
      faceDirectionDistribution: analysis.faceDirectionDistribution,
      violationCount: analysis.violationCount,
      violationSummary: analysis.violationSummary,
      faceSummary,
      poseSummary,
      suspicionSummary,
      completedQuestions: chatAnalysis.completedQuestions,
      questionSummary: chatAnalysis.questionSummary,
    };

    // Update interview with interviewEndedAt and interviewAnalysis
    const updatedInterview = await prisma.interview.update({
      where: { id: Number(interviewId) },
      data: {
        interviewEndedAt: new Date(),
        interviewAnalysis: interviewAnalysis as any, // Prisma JSON field
      },
    });

    return NextResponse.json({ interview: updatedInterview, diagnostics });
  } catch (err) {
    console.error('/api/interviewOver error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Analyze diagnostics to generate analysis metrics
async function analyzeDiagnostics(diagnostics: any[], interviewId: number) {
  let poseStabilityScore = 0;
  let faceVisibilityCount = 0;
  const faceDirectionCounts = {
    Forward: 0,
    Left: 0,
    Right: 0,
    'No Face Detected': 0,
  };
  const totalSamples = diagnostics.length;
  const violations: { timestamp: string; website: string }[] = [];
  const diagnosticUpdates: { id: number; screenpipeData: any }[] = [];

  // Process diagnostics and collect violations
  for (const diag of diagnostics) {
    // Parse poseData and faceData (handle JSON or string)
    const poseData = typeof diag.poseData === 'string' ? diag.poseData : diag.poseData?.value || 'No Pose Detected';
    const faceData = typeof diag.faceData === 'string' ? diag.faceData : diag.faceData?.value || 'No Face Detected';

    // Pose stability: Count "Good Pose" as stable
    if (poseData === 'Good Pose') {
      poseStabilityScore += 1;
    }

    // Face visibility: Count "Forward" as visible
    if (faceData === 'Forward') {
      faceVisibilityCount += 1;
    }

    // Track face direction distribution
    if (faceData in faceDirectionCounts) {
      faceDirectionCounts[faceData as keyof typeof faceDirectionCounts] += 1;
    }

    // Analyze Screenpipe OCR data for violations
    if (diag.screenpipeData?.data) {
      const newViolations: { timestamp: string; website: string }[] = [];
      diag.screenpipeData.data.forEach((it: any) => {
        if (it.type !== 'OCR') return;
        const w = it.content?.windowName?.toLowerCase() || '';
        const timestamp = new Date().toISOString();

        if (!w.includes('connecting talent with opportunities')) {
          newViolations.push({
            timestamp,
            website: 'Interview tab not active',
          });
        }

        forbiddenWebsites.forEach((website) => {
          if (w.includes(website.pattern)) {
            newViolations.push({
              timestamp,
              website: website.name,
            });
          }
        });
      });

      // Append new violations to screenpipeData.violations
      if (newViolations.length > 0) {
        const existingViolations = diag.screenpipeData.violations || [];
        const updatedScreenpipeData = {
          ...diag.screenpipeData,
          violations: [...existingViolations, ...newViolations],
        };
        diagnosticUpdates.push({
          id: diag.id,
          screenpipeData: updatedScreenpipeData,
        });
        violations.push(...newViolations);
      }
    }
  }

  // Batch update diagnostics with new violations
  if (diagnosticUpdates.length > 0) {
    await Promise.all(
      diagnosticUpdates.map((update) =>
        prisma.diagnostics.update({
          where: { id: update.id },
          data: { screenpipeData: update.screenpipeData },
        })
      )
    );
  }

  // Calculate percentages
  const poseStability = totalSamples > 0 ? Number((poseStabilityScore / totalSamples * 100).toFixed(2)) : 0;
  const faceVisibility = totalSamples > 0 ? Number((faceVisibilityCount / totalSamples * 100).toFixed(2)) : 0;
  const violationCount = violations.length;

  // Calculate face direction distribution
  const faceDirectionDistribution = {
    Forward: totalSamples > 0 ? Number((faceDirectionCounts.Forward / totalSamples * 100).toFixed(2)) : 0,
    Left: totalSamples > 0 ? Number((faceDirectionCounts.Left / totalSamples * 100).toFixed(2)) : 0,
    Right: totalSamples > 0 ? Number((faceDirectionCounts.Right / totalSamples * 100).toFixed(2)) : 0,
    'No Face Detected': totalSamples > 0 ? Number((faceDirectionCounts['No Face Detected'] / totalSamples * 100).toFixed(2)) : 0,
  };

  // Summarize violations
  const violationTypes = [...new Set(violations.map((v) => v.website))];
  const violationSummary = violationCount > 0
    ? `${violationCount} violation${violationCount === 1 ? '' : 's'}: ${violationTypes.join(', ')}`
    : 'No violations detected';

  return {
    poseStability,
    faceVisibility,
    faceDirectionDistribution,
    violationCount,
    violationSummary,
  };
}

// Analyze chat history to count correctly answered questions and summarize
async function analyzeChatHistory(chatHistory: any, numQuestions: number) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
    return {
      completedQuestions: 0,
      questionSummary: 'No chat history available to analyze question performance.',
    };
  }

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return {
      completedQuestions: 0,
      questionSummary: 'Question analysis unavailable: API key missing.',
    };
  }

  const systemPrompt = `
    You are an expert interview evaluator. Analyze the chat history to determine how many questions the candidate answered correctly out of ${numQuestions}. A question is typically posed by the assistant, followed by the user's response. A correct answer demonstrates a clear understanding of the problem and provides a valid solution or response. Provide a concise summary (~40 words, ~60-80 tokens) of the candidate's question performance in professional language for recruiters. Return a JSON object with fields: completedQuestions (number), questionSummary (string).
  `;

  const chatText = chatHistory
    .map((entry) => `${entry.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${entry.content}`)
    .join('\n');

  const userPrompt = `
    Chat History:
    ${chatText}

    Analyze the chat history to count correctly answered questions out of ${numQuestions}. Return:
    {
      "completedQuestions": <number>,
      "questionSummary": "Summary text..."
    }
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: userPrompt,
                },
              ],
            },
          ],
          systemInstruction: {
            role: 'system',
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
          generationConfig: {
            maxOutputTokens: 100,
            response_mime_type: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error for chat analysis:', errorData);
      return {
        completedQuestions: 0,
        questionSummary: 'Question analysis unavailable: API request failed.',
      };
    }

    const data = await response.json();
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid response format');
    }
    const candidates = (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] }).candidates;
    const result = JSON.parse(candidates?.[0]?.content?.parts?.[0]?.text || '{}');

    return {
      completedQuestions: result.completedQuestions || 0,
      questionSummary: result.questionSummary || 'Question analysis unavailable: No response.',
    };
  } catch (err) {
    console.error('Gemini API fetch error for chat analysis:', err);
    return {
      completedQuestions: 0,
      questionSummary: 'Question analysis unavailable: Network error.',
    };
  }
}

// Call Gemini API for structured JSON summaries (face, pose, suspicion)
async function getGeminiAnalysis(analysis: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return {
      faceSummary: 'Face analysis unavailable: API key missing',
      poseSummary: 'Pose analysis unavailable: API key missing',
      suspicionSummary: 'Suspicion analysis unavailable: API key missing',
    };
  }

  const systemPrompt = `
    You are an expert interview analyst for recruiters. Provide concise summaries (~40 words each, ~60-80 tokens) for face engagement, pose consistency, and professionalism (suspicion). Use professional language, focusing on hiring insights. Ensure lines are up to 80 characters. Return a JSON object with fields: faceSummary, poseSummary, suspicionSummary.
  `;

  const userPrompt = `
    Analyze the candidate's interview performance for a recruiter based on:
    - Face Visibility: ${analysis.faceVisibility}% (time facing camera directly)
    - Face Direction: ${JSON.stringify(analysis.faceDirectionDistribution)}%
    - Pose Stability: ${analysis.poseStability}% (time in "Good Pose")
    - Violation Count: ${analysis.violationCount}
    - Violation Summary: ${analysis.violationSummary}

    Return:
    {
      "faceSummary": "Summary text...",
      "poseSummary": "Summary text...",
      "suspicionSummary": "Summary text..."
    }
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: userPrompt,
                },
              ],
            },
          ],
          systemInstruction: {
            role: 'system',
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
          generationConfig: {
            maxOutputTokens: 240,
            response_mime_type: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return {
        faceSummary: 'Face analysis unavailable: API request failed',
        poseSummary: 'Pose analysis unavailable: API request failed',
        suspicionSummary: 'Suspicion analysis unavailable: API request failed',
      };
    }

    const data = await response.json();
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid response format');
    }
    const candidates = (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] }).candidates;
    const result = JSON.parse(candidates?.[0]?.content?.parts?.[0]?.text || '{}');

    return {
      faceSummary: result.faceSummary || 'Face analysis unavailable: No response',
      poseSummary: result.poseSummary || 'Pose analysis unavailable: No response',
      suspicionSummary: result.suspicionSummary || 'Suspicion analysis unavailable: No response',
    };
  } catch (err) {
    console.error('Gemini API fetch error:', err);
    return {
      faceSummary: 'Face analysis unavailable: Network error',
      poseSummary: 'Pose analysis unavailable: Network error',
      suspicionSummary: 'Suspicion analysis unavailable: Network error',
    };
  }
}