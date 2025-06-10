'use server';

/**
 * @fileOverview A file analysis AI agent.
 *
 * - analyzeUploadedFile - A function that handles the file analysis process.
 * - AnalyzeUploadedFileInput - The input type for the analyzeUploadedFile function.
 * - AnalyzeUploadedFileOutput - The return type for the analyzeUploadedFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUploadedFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The file to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeUploadedFileInput = z.infer<typeof AnalyzeUploadedFileInputSchema>;

const AnalyzeUploadedFileOutputSchema = z.object({
  description: z.string().describe('A description of the file content.'),
  generationDetails: z
    .string()
    .describe('Details on how the file was generated or its source.'),
  extractedText: z.string().describe('Text extracted from the file, if any.'),
});
export type AnalyzeUploadedFileOutput = z.infer<typeof AnalyzeUploadedFileOutputSchema>;

export async function analyzeUploadedFile(
  input: AnalyzeUploadedFileInput
): Promise<AnalyzeUploadedFileOutput> {
  return analyzeUploadedFileFlow(input);
}

const analyzeUploadedFilePrompt = ai.definePrompt({
  name: 'analyzeUploadedFilePrompt',
  input: {schema: AnalyzeUploadedFileInputSchema},
  output: {schema: AnalyzeUploadedFileOutputSchema},
  prompt: `You are an expert file analyst. You will analyze the given file and provide a description of its content, details on how it was generated or its source, and any text extracted from the file.

File: {{media url=fileDataUri}}`,
});

const analyzeUploadedFileFlow = ai.defineFlow(
  {
    name: 'analyzeUploadedFileFlow',
    inputSchema: AnalyzeUploadedFileInputSchema,
    outputSchema: AnalyzeUploadedFileOutputSchema,
  },
  async input => {
    const {output} = await analyzeUploadedFilePrompt(input);
    return output!;
  }
);
