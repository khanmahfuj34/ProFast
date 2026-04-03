const ServiceCard = ({ icon, title, description }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-6 sm:p-8 group cursor-pointer"
    >
      <div className="text-4xl text-lime-600 mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-syne mb-3">{title}</h3>
      <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-dm-sans">
        {description}
      </p>
    </div>
  );
};

export default ServiceCard;