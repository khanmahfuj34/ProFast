const HowItWorksCard = ({ icon, title, description }) => {
  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="card-body gap-3">
        <div className="text-primary">{icon}</div>
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="text-base-content/60 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default HowItWorksCard;