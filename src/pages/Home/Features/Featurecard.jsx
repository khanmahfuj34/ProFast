const FeatureCard = ({ illustration, title, description }) => {
  return (
    <div className="flex items-center gap-6 bg-base-100 border border-dashed border-base-300 rounded-xl px-8 py-6">
      {/* Illustration */}
      <div className="flex-shrink-0 w-32 flex items-center justify-center">
        <img
          src={illustration}
          alt={title}
          className="w-28 h-28 object-contain"
        />
      </div>

      {/* Vertical Divider */}
      <div className="w-px self-stretch bg-base-300" />

      {/* Text Content */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-base-content/60 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;