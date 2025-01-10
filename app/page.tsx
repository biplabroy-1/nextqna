"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, Edit, Save } from "lucide-react";
import { jsPDF } from "jspdf";
import CodeResponseDisplay from "./Code";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionNo, setQuestionNo] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [topic, setTopic] = useState("Java, HTML, CSS, JavaScript");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, topic }),
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
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let cursorY = margin;

    // Reduced line spacing values
    const normalLineSpacing = 5; // Reduced from 7
    const titleLineSpacing = 7; // Reduced from 10

    // Set title font
    doc.setFontSize(14);

    // Add question number
    const questionTitle = `Question No ${questionNo}:`;
    doc.text(questionTitle, margin, cursorY);
    cursorY += titleLineSpacing;

    // Add question content
    doc.setFontSize(11);
    const questionLines = doc.splitTextToSize(question, pageWidth - 2 * margin);
    // biome-ignore lint/complexity/noForEach: <explanation>
    questionLines.forEach((line: string | string[]) => {
      if (cursorY > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += normalLineSpacing;
    });

    cursorY += titleLineSpacing;

    // Check if answer contains code sections
    if (
      answer.includes("HTML:") ||
      answer.includes("CSS:") ||
      answer.includes("JAVASCRIPT:")
    ) {
      const lines = answer.split("\n");
      let isTitle = false;

      // biome-ignore lint/complexity/noForEach: <explanation>
      lines.forEach((line) => {
        if (
          line.trim() === "HTML:" ||
          line.trim() === "CSS:" ||
          line.trim() === "JAVASCRIPT:"
        ) {
          // For section titles only
          if (cursorY > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
          }
          doc.setFontSize(16);
          const titleWidth = doc.getTextWidth(line);
          const titleX = (pageWidth - titleWidth) / 2;
          doc.text(line, titleX, cursorY);
          cursorY += titleLineSpacing;
          isTitle = true;
        } else {
          // For code content - keep original formatting
          if (cursorY > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
          }
          if (isTitle) {
            doc.setFontSize(11);
            isTitle = false;
          }
          // Only add line spacing for non-empty lines
          if (line.trim()) {
            doc.text(line, margin, cursorY);
            cursorY += normalLineSpacing;
          } else {
            // Smaller spacing for empty lines
            cursorY += normalLineSpacing / 2;
          }
        }
      });
    } else {
      // Regular text answer
      doc.setFontSize(11);
      const answerLines = doc.splitTextToSize(answer, pageWidth - 2 * margin);
      // biome-ignore lint/complexity/noForEach: <explanation>
      answerLines.forEach((line: string | string[]) => {
        if (cursorY > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += normalLineSpacing;
      });
    }

    doc.save(`Question_${questionNo}_Answer.pdf`);
  };

  // Check if the answer contains code sections
  const hasCodeSections =
    answer.includes("HTML:") ||
    answer.includes("CSS:") ||
    answer.includes("JAVASCRIPT:");

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
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topics..."
            className="min-h-[20px] w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
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
                {isEditing ? (
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  />
                ) : 
                  <CodeResponseDisplay codeResponse={answer} />
                }
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className="py-3 text-lg font-medium bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300"
                >
                  {isEditing ? (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save Answer
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-5 w-5" />
                      Edit Answer
                    </>
                  )}
                </Button>
                <Button
                  onClick={generatePDF}
                  className="py-3 text-lg font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download as PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
