
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, Download, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface QuizTabProps {
  videoId: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizData {
  questions: QuizQuestion[];
  language: string;
}

const QuizTab: React.FC<QuizTabProps> = ({ videoId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizCount, setQuizCount] = useState<number>(10);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have cached quiz data
    if (videoId) {
      chrome.storage.local.get([`quiz_${videoId}`], (result) => {
        if (result[`quiz_${videoId}`]) {
          setQuizData(result[`quiz_${videoId}`]);
        }
      });
    }
  }, [videoId]);

  const generateQuiz = async () => {
    if (!videoId) return;

    setLoading(true);
    setError(null);
    setQuizSubmitted(false);
    setSelectedAnswers([]);

    try {
      // In a real extension, this would call your background script
      chrome.runtime.sendMessage(
        { action: "generateQuiz", videoId, count: quizCount },
        (response) => {
          if (response.error) {
            setError(response.error);
            toast({
              variant: "destructive",
              title: "Error",
              description: response.error
            });
          } else {
            // For this demo, we'll create mock quiz data
            const mockQuizData: QuizData = {
              language: "English",
              questions: [
                {
                  question: "What is the primary purpose of the YouTube Data API?",
                  options: [
                    "To monetize videos automatically",
                    "To allow programmatic access to YouTube features",
                    "To create YouTube accounts",
                    "To download videos directly"
                  ],
                  correctAnswer: 1
                },
                {
                  question: "Which authentication method is recommended for production applications?",
                  options: [
                    "API Key only",
                    "OAuth 2.0",
                    "Basic Authentication",
                    "No authentication"
                  ],
                  correctAnswer: 1
                },
                {
                  question: "What is a YouTube API quota?",
                  options: [
                    "A limit on how many videos you can upload",
                    "A limit on how many API requests you can make daily",
                    "A payment requirement",
                    "A video view counter"
                  ],
                  correctAnswer: 1
                }
              ]
            };
            
            // Create more mock questions to meet the count
            for (let i = 3; i < quizCount; i++) {
              mockQuizData.questions.push({
                question: `Sample Question ${i+1} about YouTube API integration?`,
                options: [
                  "Option A",
                  "Option B",
                  "Option C",
                  "Option D"
                ],
                correctAnswer: Math.floor(Math.random() * 4)
              });
            }
            
            setQuizData(mockQuizData);
            setCurrentQuestion(0);
            
            // Cache the quiz data
            chrome.storage.local.set({ [`quiz_${videoId}`]: mockQuizData });
            
            toast({
              title: "Quiz Generated",
              description: `${quizCount} questions have been created based on the video content.`
            });
          }
          setLoading(false);
        }
      );
    } catch (err) {
      setError("Failed to generate quiz. Please try again.");
      setLoading(false);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate quiz. Please try again."
      });
    }
  };

  const handleNext = () => {
    if (!quizData || currentQuestion >= quizData.questions.length - 1) return;
    setCurrentQuestion(currentQuestion + 1);
  };

  const handlePrevious = () => {
    if (!quizData || currentQuestion <= 0) return;
    setCurrentQuestion(currentQuestion - 1);
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = parseInt(value);
    setSelectedAnswers(newAnswers);
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    
    if (!quizData) return;
    
    // Calculate score
    let correctCount = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizData.questions[index].correctAnswer) {
        correctCount++;
      }
    });
    
    const percentage = Math.round((correctCount / quizData.questions.length) * 100);
    
    toast({
      title: "Quiz Results",
      description: `You scored ${correctCount}/${quizData.questions.length} (${percentage}%)`
    });
  };

  if (!quizData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium mb-4">Generate Quiz Questions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create MCQ quiz questions based on the video content.
          </p>
          
          <div className="flex items-center justify-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuizCount(Math.max(5, quizCount - 5))}
              disabled={quizCount <= 5}
            >
              -
            </Button>
            <span className="mx-2 text-sm">
              {quizCount} questions
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuizCount(Math.min(20, quizCount + 5))}
              disabled={quizCount >= 20}
            >
              +
            </Button>
          </div>
          
          <Button 
            onClick={generateQuiz} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="spinner mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <RefreshCcw size={16} className="mr-2" />
                Generate Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuiz = quizData.questions[currentQuestion];

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-2">
        <h3 className="text-lg font-medium">Quiz</h3>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={generateQuiz} 
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : <RefreshCcw size={16} />}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">
              Question {currentQuestion + 1} of {quizData.questions.length}
            </span>
            {quizSubmitted && (
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                {selectedAnswers[currentQuestion] === currentQuiz.correctAnswer 
                  ? "Correct" 
                  : "Incorrect"}
              </span>
            )}
          </div>
          
          <ScrollArea className="h-[250px]">
            <div className="space-y-4">
              <p className="text-sm font-medium">{currentQuiz.question}</p>
              
              <RadioGroup 
                value={selectedAnswers[currentQuestion]?.toString()} 
                onValueChange={handleAnswerChange}
                disabled={quizSubmitted}
              >
                {currentQuiz.options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-2 p-2 rounded ${
                      quizSubmitted && index === currentQuiz.correctAnswer 
                        ? 'bg-green-950/20' 
                        : quizSubmitted && selectedAnswers[currentQuestion] === index && index !== currentQuiz.correctAnswer 
                          ? 'bg-red-950/20' 
                          : ''
                    }`}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className={`text-sm ${
                        quizSubmitted && index === currentQuiz.correctAnswer 
                          ? 'font-medium' 
                          : ''
                      }`}
                    >
                      {option}
                    </Label>
                    {quizSubmitted && index === currentQuiz.correctAnswer && (
                      <CheckCircle2 size={16} className="text-green-500 ml-auto" />
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>
          </ScrollArea>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft size={16} className="mr-1" /> Previous
            </Button>
            
            {currentQuestion < quizData.questions.length - 1 ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNext}
              >
                Next <ArrowRight size={16} className="ml-1" />
              </Button>
            ) : (
              !quizSubmitted ? (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={submitQuiz}
                  disabled={selectedAnswers.length !== quizData.questions.length}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateQuiz}
                >
                  New Quiz
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizTab;
