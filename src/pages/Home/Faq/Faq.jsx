import { useState } from "react";
import { MdArrowOutward } from "react-icons/md";

const faqs = [
  {
    id: 1,
    question: "How does ZapShift parcel delivery work?",
    answer:
      "Simply book a pickup through our app or website, and our rider will collect your parcel from your location. We then process it through our delivery hub and ensure it reaches the destination within the promised timeframe.",
  },
  {
    id: 2,
    question: "What areas do you currently deliver to?",
    answer:
      "We deliver across all 64 districts of Bangladesh. Express delivery is available within Dhaka, Chittagong, Sylhet, Khulna, and Rajshahi within 4–6 hours.",
  },
  {
    id: 3,
    question: "Is cash on delivery (COD) available?",
    answer:
      "Yes! We offer 100% cash on delivery anywhere in Bangladesh. The collected amount is transferred to your account within the agreed settlement period.",
  },
  {
    id: 4,
    question: "How can I track my parcel in real-time?",
    answer:
      "Once your parcel is picked up, you'll receive a tracking ID. Use it on our website or app to monitor every step of the delivery journey — from pickup to final delivery.",
  },
  {
    id: 5,
    question: "What happens if my parcel is lost or damaged?",
    answer:
      "We take full responsibility for parcels under our care. In the rare event of loss or damage, our support team will initiate a claim process and ensure you are compensated as per our policy.",
  },
  {
    id: 6,
    question: "How do I become a merchant with ZapShift?",
    answer:
      "Click 'Become a Merchant' on our homepage, fill in your business details, and our team will get in touch within 24 hours to set up your account and walk you through the onboarding process.",
  },
];

const INITIAL_SHOW = 4;

const FAQ = () => {
  const [showAll, setShowAll] = useState(false);

  const visibleFaqs = showAll ? faqs : faqs.slice(0, INITIAL_SHOW);

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-syne mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-base leading-relaxed max-w-xl mx-auto font-dm-sans">
            Have questions about our services? We've got answers. Browse through
            our most common queries below.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="flex flex-col gap-3">
          {visibleFaqs.map((faq) => (
            <div
              key={faq.id}
              tabIndex={0}
              className="collapse collapse-arrow bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="collapse-title font-semibold text-base text-gray-900 font-syne pe-4 ps-5 py-4">
                {faq.question}
              </div>
              <div className="collapse-content text-base text-gray-600 leading-relaxed ps-5 pb-4 font-dm-sans">
                {faq.answer}
              </div>
            </div>
          ))}
        </div>

        {/* See More Button */}
        {!showAll && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center gap-2 px-6 py-3 font-semibold text-sm rounded-full border-2 border-lime-600 hover:bg-lime-50 transition-all duration-300 text-lime-600 bg-white"
            >
              See More FAQ's
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-lime-600">
                <MdArrowOutward size={16} color="#ffffff" />
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQ;