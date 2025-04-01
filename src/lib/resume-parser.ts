import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"

/**
 * Extracts text from a resume file
 */
export async function extractTextFromResume(file: File): Promise<string> {
  const fileType = file.type

  // For PDF files
  if (fileType === "application/pdf") {
    return extractTextFromPDF(file)
  }

  // // For DOCX, DOC, RTF files
  // if (
  //   fileType === "application/msword" ||
  //   fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
  //   fileType === "application/rtf"
  // ) {
  //   return extractTextFromDocument(file)
  // }

  // // For plain text files
  // if (fileType === "text/plain") {
  //   return extractTextFromTXT(file)
  // }

  // throw new Error(`Unsupported file type: ${fileType}`)
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convert File to Blob for PDFLoader
    const blob = new Blob([await file.arrayBuffer()], { type: "application/pdf" })

    // Use PDFLoader to extract text
    const loader = new PDFLoader(blob)
    const docs = await loader.load()

    // Combine all pages' text
    return docs.map((doc) => doc.pageContent).join("\n\n")
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

async function extractTextFromDocument(file: File): Promise<string> {
  // In a real implementation, you would use a library like mammoth.js for DOCX
  // or another appropriate library for DOC/RTF
  // For this example, we'll use a placeholder implementation

  try {
    // This is a simplified example - in a real app, you'd use proper document parsing
    const arrayBuffer = await file.arrayBuffer()

    // Convert to text (this is a placeholder - real implementation would use proper parsing)
    // For a complete solution, you would use libraries like:
    // - mammoth.js for DOCX
    // - docx2html for DOC
    // - rtf-parser for RTF

    // Placeholder implementation - returns a message
    return "Document text extraction would be implemented here with appropriate libraries for DOCX/DOC/RTF formats."
  } catch (error) {
    console.error("Error extracting text from document:", error)
    throw new Error("Failed to extract text from document")
  }
}

/**
 * Extracts text from a plain text file
 */
async function extractTextFromTXT(file: File): Promise<string> {
  try {
    return await file.text()
  } catch (error) {
    console.error("Error extracting text from TXT:", error)
    throw new Error("Failed to extract text from text file")
  }
}

