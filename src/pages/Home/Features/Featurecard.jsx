const FeatureCard = ({ illustration, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8">
      {/* Illustration */}
      <div className="mb-4 flex items-center justify-center">
        <img
          src={illustration}
          alt={title}
          className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
        />
      </div>

      {/* Text Content */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-syne">{title}</h3>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-dm-sans">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;