import { FaQuoteLeft } from "react-icons/fa";

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <span
            key={star}
            className={`text-sm ${filled || half ? "text-yellow-400" : "text-base-300"}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

const ReviewCard = ({ review, userName, user_photoURL, ratings, date }) => {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-base-100 rounded-2xl p-6 flex flex-col gap-4 h-full shadow-sm border border-base-200">
      {/* Quote icon */}
      <FaQuoteLeft className="text-primary text-2xl opacity-60" />

      {/* Review text */}
      <p className="text-base-content/70 text-sm leading-relaxed flex-1">
        {review}
      </p>

      {/* Divider */}
      <div className="border-t border-dashed border-base-300" />

      {/* User info */}
      <div className="flex items-center gap-3">
        <img
          src={user_photoURL}
          alt={userName}
          className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{userName}</span>
          <StarRating rating={ratings} />
        </div>
        <span className="ml-auto text-xs text-base-content/40">
          {formattedDate}
        </span>
      </div>
    </div>
  );
};

export default ReviewCard;