"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download } from "lucide-react";
import { jsPDF } from "jspdf";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionNo, setQuestionNo] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const marginTop = 20;
    let cursorY = marginTop;
    // Add Title
    doc.setFontSize(18);
    doc.text(`Question No ${questionNo}:`, 10, cursorY);
    cursorY += 10;

    // Add Question
    doc.setFontSize(12);
    const questionLines = doc.splitTextToSize(question, 190);
    // biome-ignore lint/complexity/noForEach: <explanation>
    questionLines.forEach((line: string | string[]) => {
      if (cursorY + 10 > pageHeight - marginTop) {
        doc.addPage();
        cursorY = marginTop;
      }
      doc.text(line, 10, cursorY);
      cursorY += 8;
    });

    // Add Answer Title
    cursorY += 10;
    if (cursorY > pageHeight - marginTop) {
      doc.addPage();
      cursorY = marginTop;
    }
    doc.setFontSize(18);
    doc.text("Answer:", 10, cursorY);
    cursorY += 10;

    // Add Answer
    doc.setFontSize(12);
    const answerLines = doc.splitTextToSize(answer, 190);
    // biome-ignore lint/complexity/noForEach: <explanation>
    answerLines.forEach((line: string | string[]) => {
      if (cursorY + 10 > pageHeight - marginTop) {
        doc.addPage();
        cursorY = marginTop;
      }
      doc.text(line, 10, cursorY);
      cursorY += 8;
    });

    doc.save(`Question_${questionNo}_Answer.pdf`);
  };

  return (
    <main className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold text-center mb-6 text-indigo-600">
        Coding Q&A Assistant
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="space-y-2">
          <label className="block text-sm font-semibold">
            Question No:
            <input
              type="number"
              value={questionNo}
              onChange={(e) => setQuestionNo(Number(e.target.value))}
              className="ml-2 p-2 border border-gray-300 rounded-lg w-20"
              min="1"
            />
          </label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your coding question here..."
            className="min-h-[100px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !question}
          className="w-full py-3 text-lg font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading...
            </>
          ) : (
            "Get Answer"
          )}
        </Button>
      </form>

      {answer && (
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Question No {questionNo}:</h3>
                <p className="text-gray-700 dark:text-gray-300">{question}</p>
              </div>
              <div>
                <h3 className="font-semibold">Answer:</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {answer}
                </p>
              </div>
              <Button
                onClick={generatePDF}
                className="w-full py-3 text-lg font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300"
              >
                <Download className="mr-2 h-5 w-5" />
                Download as PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}