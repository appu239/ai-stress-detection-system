import { useState } from "react";
import PublicLayout from "../components/PublicLayout";

export default function FAQ() {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      question: "How does StressAI detect stress?",
      answer:
        "We use MFCC audio feature extraction combined with machine learning classification models."
    },
    {
      question: "Is student data secure?",
      answer:
        "Yes. All data is encrypted and role-based access control is implemented."
    },
    {
      question: "Can this work in multiple languages?",
      answer:
        "Yes. Our speech-to-text engine supports multilingual analysis."
    }
  ];

  return (
    <PublicLayout>

      <div className="max-w-4xl mx-auto px-8 py-20">

        <h1 className="text-4xl font-bold mb-12 text-center">
          Frequently Asked Questions
        </h1>

        <div className="space-y-6">

          {faqs.map((item, index) => (
            <div key={index} className="border rounded-xl p-6">

              <button
                onClick={() => setOpen(open === index ? null : index)}
                className="w-full text-left font-semibold text-lg"
              >
                {item.question}
              </button>

              {open === index && (
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              )}

            </div>
          ))}

        </div>

      </div>

    </PublicLayout>
  );
}