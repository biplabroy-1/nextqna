import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CodeResponseDisplayProps {
  codeResponse: string;
}

interface CodeSection {
  type: string;
  content: string;
}

const CodeResponseDisplay: React.FC<CodeResponseDisplayProps> = ({
  codeResponse,
}) => {
  // Helper function to identify code sections
  const parseCodeSections = (text: string): CodeSection[] => {
    const sections: CodeSection[] = [];
    let currentSection = "";
    let currentType = "";

    const lines = text.split("\n");

    for (const line of lines) {
      // Check if the line ends with a colon (indicating a language section)
      if (line.trim().endsWith(":") && currentSection.trim() === "") {
        // Start a new section, setting the type to the current line
        currentType = line.trim().replace(":", "");
        currentSection = "";
      } else if (line.trim() === "" && currentType) {
        // When encountering an empty line, push the current section and start fresh
        if (currentSection.trim()) {
          sections.push({
            type: currentType,
            content: currentSection.trim(),
          });
        }
        currentType = "";
        currentSection = "";
      } else {
        // Append the line to the current section
        currentSection += `${line}\n`;
      }
    }

    // Push the last section if it exists
    if (currentSection.trim() && currentType) {
      sections.push({
        type: currentType,
        content: currentSection.trim(),
      });
    }

    return sections;
  };

  const sections = parseCodeSections(codeResponse);

  // Function to get language-specific styling (can be extended for different languages)
  const getLanguageColor = (language: string): string => {
    const colorMap: { [key: string]: string } = {
      "HTML": "text-orange-600",
      "CSS": "text-blue-600",
      "JavaScript": "text-yellow-600",
      "Java": "text-red-600",
      "Python": "text-green-600",
      "TypeScript": "text-blue-600",
      "PHP": "text-purple-600",
      "SQL": "text-cyan-600",
      "Ruby": "text-red-500",
      "C++": "text-pink-600",
      "C#": "text-violet-600",
      "Go": "text-cyan-500",
      "Rust": "text-orange-500",
      "Swift": "text-orange-600",
      "Kotlin": "text-purple-500",
    };

    // Convert to title case for matching
    const formattedLang = language
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return colorMap[formattedLang] || "text-gray-600"; // Default color if language not found
  };

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <Card key={`${section.type}-${index}`} className="shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle
              className={`text-lg font-mono ${getLanguageColor(section.type)}`}
            >
              {section.type}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <pre className="whitespace-pre-wrap font-mono text-base bg-gray-50 p-4 rounded-lg overflow-x-auto">
              <code>{section.content}</code>
            </pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CodeResponseDisplay;
