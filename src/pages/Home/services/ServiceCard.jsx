const ServiceCard = ({ icon, title, description }) => {
  return (
    <div 
      className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
      style={{ "--hover-color": "#3B82F6" }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3B82F6"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
    >
      <div className="card-body gap-4">
        <div className="text-primary">{icon}</div>
        <h3 className="card-title text-base">{title}</h3>
        <p className="text-base-content/60 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ServiceCard;