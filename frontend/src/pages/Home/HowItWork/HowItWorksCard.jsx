const HowItWorksCard = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8">
      <div className="mb-4 text-4xl text-lime-600">{icon}</div>
      <h3 className="font-bold text-lg text-gray-900 font-syne mb-2">{title}</h3>
      <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-dm-sans">
        {description}
      </p>
    </div>
  );
};

export default HowItWorksCard;