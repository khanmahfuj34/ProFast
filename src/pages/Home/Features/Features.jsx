import FeatureCard from "./Featurecard";

// Replace these with your actual illustration imports
// e.g. import trackingImg from "../../../assets/illustrations/tracking.png";
import trackingImg from '../../../assets/live-tracking.png'
import deliveryImg from '../../../assets/safe-delivery.png'
import supportImg from '../../../assets/safe-delivery.png'

const features = [
  {
    illustration: trackingImg,
    title: "Live Parcel Tracking",
    description:
      "Stay updated in real-time with our live parcel tracking feature. From pick-up to delivery, monitor your shipment's journey and get instant status updates for complete peace of mind.",
  },
  {
    illustration: deliveryImg,
    title: "100% Safe Delivery",
    description:
      "We ensure your parcels are handled with the utmost care and delivered securely to their destination. Our reliable process guarantees safe and damage-free delivery every time.",
  },
  {
    illustration: supportImg,
    title: "24/7 Call Center Support",
    description:
      "Our dedicated support team is available around the clock to assist you with any questions, updates, or delivery concerns — anytime you need us.",
  },
];

const Features = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-12 sm:mb-16 lg:mb-20 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-syne mb-4">
            Why Choose ProFast?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base leading-relaxed font-dm-sans">
            Experience premium delivery services with cutting-edge features and unmatched reliability.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            illustration={feature.illustration}
            title={feature.title}
            description={feature.description}
          />
        ))}
        </div>
      </div>
    </section>
  );
};

export default Features;