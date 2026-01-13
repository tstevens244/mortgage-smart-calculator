import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Calculator, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  options?: ChatOption[];
  calculatorLink?: { label: string; href: string };
};

type ChatOption = {
  label: string;
  value: string;
};

const calculatorRoutes: Record<string, { label: string; href: string; description: string }> = {
  mortgage: { label: "Mortgage Calculator", href: "/", description: "Calculate your monthly mortgage payment" },
  second_mortgage: { label: "Second Mortgage Calculator", href: "/second-mortgage", description: "Explore second mortgage options" },
  heloc: { label: "HELOC Calculator", href: "/heloc", description: "Calculate home equity line of credit" },
  refinance: { label: "Refinance Calculator", href: "/refinance", description: "See if refinancing makes sense" },
  cash_out: { label: "Cash-Out Refinance Calculator", href: "/cash-out-refinance", description: "Calculate cash-out refinancing" },
  affordability: { label: "Affordability Calculator", href: "/affordability", description: "Find out how much home you can afford" },
  qualification: { label: "Qualification Calculator", href: "/qualification", description: "Check if you qualify for a mortgage" },
  rent_or_buy: { label: "Rent or Buy Calculator", href: "/rent-or-buy", description: "Compare renting vs buying" },
  extra_payments: { label: "Extra Payments Calculator", href: "/extra-payments", description: "See how extra payments affect your loan" },
  biweekly: { label: "Bi-Weekly Payments Calculator", href: "/bi-weekly-payments", description: "Calculate bi-weekly payment savings" },
};

const initialMessage: Message = {
  id: "1",
  role: "assistant",
  content: "Hi! I'm your AI mortgage assistant. What would you like help with today?",
  options: [
    { label: "🏠 Buying a new home", value: "buying" },
    { label: "💰 Refinancing my current mortgage", value: "refinancing" },
    { label: "📊 Understanding my options", value: "options" },
    { label: "💵 Saving Money", value: "saving" },
  ],
};

const followUpQuestions: Record<string, Message> = {
  buying: {
    id: "",
    role: "assistant",
    content: "Great! Are you trying to figure out what you can afford, or do you already have a home price in mind?",
    options: [
      { label: "💵 What can I afford?", value: "afford" },
      { label: "🔢 I know the price, calculate my payment", value: "calculate_payment" },
      { label: "✅ Do I qualify for a mortgage?", value: "qualify" },
      { label: "🤔 Should I rent or buy?", value: "rent_buy" },
    ],
  },
  refinancing: {
    id: "",
    role: "assistant",
    content: "What's your main goal with refinancing?",
    options: [
      { label: "📉 Lower my monthly payment", value: "lower_payment" },
      { label: "💵 Get cash out of my home", value: "cash_out" },
      { label: "⏱️ Pay off my mortgage faster", value: "pay_faster" },
      { label: "🔄 Compare refinance options", value: "compare_refi" },
    ],
  },
  options: {
    id: "",
    role: "assistant",
    content: "I can help you explore different mortgage strategies. What interests you most?",
    options: [
      { label: "🏦 Second mortgage or HELOC", value: "second_heloc" },
      { label: "💳 Extra payments impact", value: "extra_payments" },
      { label: "📅 Bi-weekly payment savings", value: "biweekly" },
      { label: "📈 All calculators overview", value: "all_calculators" },
    ],
  },
  saving: {
    id: "",
    role: "assistant",
    content: "Great! There are several ways to save money on your mortgage. What interests you most?",
    options: [
      { label: "💳 Extra payments impact", value: "extra_payments" },
      { label: "📅 Bi-weekly payment savings", value: "biweekly" },
      { label: "📉 Refinance to lower rate", value: "lower_payment" },
      { label: "⏱️ Pay off mortgage faster", value: "pay_faster" },
    ],
  },
};

const calculatorResponses: Record<string, { content: string; calculator: string }> = {
  afford: { content: "The Affordability Calculator will help you determine how much home you can afford based on your income, debts, and down payment.", calculator: "affordability" },
  calculate_payment: { content: "The Mortgage Calculator will show you your monthly payment including principal, interest, taxes, and insurance.", calculator: "mortgage" },
  qualify: { content: "The Qualification Calculator will help you understand if you meet the requirements for a mortgage based on your financial situation.", calculator: "qualification" },
  rent_buy: { content: "The Rent or Buy Calculator compares the total costs of renting vs. buying to help you make the best decision.", calculator: "rent_or_buy" },
  lower_payment: { content: "The Refinance Calculator will show you potential savings from refinancing to a lower rate.", calculator: "refinance" },
  cash_out: { content: "The Cash-Out Refinance Calculator helps you understand how much equity you can access and the new payment.", calculator: "cash_out" },
  pay_faster: { content: "The Extra Payments Calculator shows how additional payments can shorten your loan term and save interest.", calculator: "extra_payments" },
  compare_refi: { content: "The Refinance Calculator compares your current mortgage with potential refinance options.", calculator: "refinance" },
  second_heloc: { content: "Would you like to explore a Second Mortgage or a HELOC (Home Equity Line of Credit)?", calculator: "" },
  extra_payments: { content: "The Extra Payments Calculator shows the impact of making additional principal payments on your mortgage.", calculator: "extra_payments" },
  biweekly: { content: "The Bi-Weekly Payments Calculator shows how paying every two weeks instead of monthly can save you money.", calculator: "biweekly" },
  all_calculators: { content: "Here are all our available calculators. Which one would you like to explore?", calculator: "" },
};

const secondHelocOptions: Message = {
  id: "",
  role: "assistant",
  content: "Both are ways to tap into your home equity. Which would you like to learn about?",
  options: [
    { label: "🏠 Second Mortgage (fixed amount)", value: "second_mortgage" },
    { label: "💳 HELOC (flexible credit line)", value: "heloc" },
  ],
};

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (message: Omit<Message, "id">) => {
    const newMessage = { ...message, id: Date.now().toString() };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleOptionClick = (value: string, messageId: string) => {
    // Find the option that was clicked
    const targetMessage = messages.find((m) => m.id === messageId);
    const option = targetMessage?.options?.find((o) => o.value === value);
    
    if (option) {
      // Remove options from the message that was clicked
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, options: undefined } : m
        )
      );
      
      // Add user's choice as a message
      addMessage({ role: "user", content: option.label });
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      // Check for follow-up questions
      if (followUpQuestions[value]) {
        addMessage(followUpQuestions[value]);
        return;
      }

      // Check for second/heloc special case
      if (value === "second_heloc") {
        addMessage(secondHelocOptions);
        return;
      }

      // Check for direct calculator responses
      if (calculatorResponses[value]) {
        const response = calculatorResponses[value];
        if (response.calculator) {
          const calc = calculatorRoutes[response.calculator];
          addMessage({
            role: "assistant",
            content: response.content,
            calculatorLink: { label: calc.label, href: calc.href },
          });
        } else if (value === "all_calculators") {
          addMessage({
            role: "assistant",
            content: "Here are all our mortgage calculators:",
            options: Object.entries(calculatorRoutes).map(([key, calc]) => ({
              label: calc.label,
              value: key,
            })),
          });
        }
        return;
      }

      // Direct calculator selection
      if (calculatorRoutes[value]) {
        const calc = calculatorRoutes[value];
        addMessage({
          role: "assistant",
          content: calc.description + ". Click below to get started!",
          calculatorLink: { label: calc.label, href: calc.href },
        });
        return;
      }
    }, 500);
  };

  const handleFreeformSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input.trim();
    addMessage({ role: "user", content: userInput });
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      // Simple keyword matching for calculator suggestions
      const lowerInput = userInput.toLowerCase();
      
      if (lowerInput.includes("afford") || lowerInput.includes("how much")) {
        addMessage({
          role: "assistant",
          content: "Based on your question, the Affordability Calculator would be helpful!",
          calculatorLink: calculatorRoutes.affordability,
        });
      } else if (lowerInput.includes("refinance") || lowerInput.includes("refi")) {
        addMessage({
          role: "assistant",
          content: "The Refinance Calculator can help you compare your options!",
          calculatorLink: calculatorRoutes.refinance,
        });
      } else if (lowerInput.includes("heloc") || lowerInput.includes("equity line")) {
        addMessage({
          role: "assistant",
          content: "The HELOC Calculator will help you explore home equity lines of credit!",
          calculatorLink: calculatorRoutes.heloc,
        });
      } else if (lowerInput.includes("rent") || lowerInput.includes("buy")) {
        addMessage({
          role: "assistant",
          content: "The Rent or Buy Calculator can help you decide!",
          calculatorLink: calculatorRoutes.rent_or_buy,
        });
      } else if (lowerInput.includes("payment") || lowerInput.includes("monthly")) {
        addMessage({
          role: "assistant",
          content: "The Mortgage Calculator will show you your estimated monthly payment!",
          calculatorLink: calculatorRoutes.mortgage,
        });
      } else if (lowerInput.includes("qualify") || lowerInput.includes("eligible")) {
        addMessage({
          role: "assistant",
          content: "The Qualification Calculator can help you check your eligibility!",
          calculatorLink: calculatorRoutes.qualification,
        });
      } else if (lowerInput.includes("extra") || lowerInput.includes("additional")) {
        addMessage({
          role: "assistant",
          content: "The Extra Payments Calculator shows how additional payments can save you money!",
          calculatorLink: calculatorRoutes.extra_payments,
        });
      } else if (lowerInput.includes("biweekly") || lowerInput.includes("bi-weekly") || lowerInput.includes("every two weeks")) {
        addMessage({
          role: "assistant",
          content: "The Bi-Weekly Payments Calculator can show you potential savings!",
          calculatorLink: calculatorRoutes.biweekly,
        });
      } else if (lowerInput.includes("second mortgage")) {
        addMessage({
          role: "assistant",
          content: "The Second Mortgage Calculator can help you explore your options!",
          calculatorLink: calculatorRoutes.second_mortgage,
        });
      } else if (lowerInput.includes("cash out") || lowerInput.includes("cash-out")) {
        addMessage({
          role: "assistant",
          content: "The Cash-Out Refinance Calculator will help you understand your options!",
          calculatorLink: calculatorRoutes.cash_out,
        });
      } else {
        // General response with options to restart
        addMessage({
          role: "assistant",
          content: "I'm here to help you find the right mortgage calculator! Let me know what you're trying to figure out, or choose from the options below:",
          options: [
            { label: "🏠 Buying a new home", value: "buying" },
            { label: "💰 Refinancing my current mortgage", value: "refinancing" },
            { label: "📊 Understanding my options", value: "options" },
          ],
        });
      }
    }, 600);
  };

  return (
    <Card className="calculator-card max-w-3xl mx-auto">
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] p-6" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2"
                      : "space-y-3"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <>
                      <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-foreground">{message.content}</p>
                      </div>
                      {message.options && (
                        <div className="flex flex-wrap gap-2">
                          {message.options.map((option) => (
                            <Button
                              key={option.value}
                              variant="outline"
                              size="sm"
                              className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                              onClick={() => handleOptionClick(option.value, message.id)}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      {message.calculatorLink && (
                        <Link to={message.calculatorLink.href}>
                          <Button className="mt-2 gap-2 rounded-full">
                            <Calculator className="h-4 w-4" />
                            Go to {message.calculatorLink.label}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleFreeformSubmit} className="border-t p-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your mortgage question..."
            className="flex-1 rounded-full"
          />
          <Button type="submit" size="icon" className="rounded-full" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
