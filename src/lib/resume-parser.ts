import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"


export async function extractTextFromResume(file: File): Promise<string> {
  const fileType = file.type

  if (fileType === "application/pdf") {
    return extractTextFromPDF(file)
  }

  throw new Error(`Unsupported file type: ${fileType}`)
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convert File to Blob for PDFLoader
    const blob = new Blob([await file.arrayBuffer()], { type: "application/pdf" })

    const loader = new PDFLoader(blob)
    const docs = await loader.load()

    // Combine all pages' text
    return docs.map((doc) => doc.pageContent).join("\n\n")
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

