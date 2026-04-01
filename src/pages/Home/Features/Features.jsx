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
    <section className="py-16 px-4 bg-base-200">
      <div className="max-w-4xl mx-auto flex flex-col gap-5">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            illustration={feature.illustration}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
};

export default Features;