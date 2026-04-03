import {
  MdOutlineShoppingBag,
  MdOutlinePayments,
  MdOutlineLocalShipping,
  MdOutlineBusinessCenter,
} from "react-icons/md";
import HowItWorksCard from "./HowItWorksCard";

const steps = [
  {
    icon: <MdOutlineShoppingBag size={32} />,
    title: "Booking Pick & Drop",
    description:
      "From personal packages to business shipments — we deliver on time, every time.",
  },
  {
    icon: <MdOutlinePayments size={32} />,
    title: "Cash On Delivery",
    description:
      "From personal packages to business shipments — we deliver on time, every time.",
  },
  {
    icon: <MdOutlineLocalShipping size={32} />,
    title: "Delivery Hub",
    description:
      "From personal packages to business shipments — we deliver on time, every time.",
  },
  {
    icon: <MdOutlineBusinessCenter size={32} />,
    title: "Booking SME & Corporate",
    description:
      "From personal packages to business shipments — we deliver on time, every time.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-syne">How it Works</h2>
          <p className="text-gray-600 mt-4 text-base font-dm-sans max-w-2xl">
            Follow our simple 4-step process to get your parcels delivered efficiently.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <HowItWorksCard
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;