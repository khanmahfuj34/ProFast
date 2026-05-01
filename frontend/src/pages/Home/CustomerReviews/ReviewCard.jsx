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
    <div className="bg-white rounded-lg p-6 sm:p-8 flex flex-col gap-4 h-full shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      {/* Quote icon */}
      <FaQuoteLeft className="text-lime-600 text-2xl opacity-70" />

      {/* Review text */}
      <p className="text-gray-600 text-sm sm:text-base leading-relaxed flex-1 font-dm-sans">
        {review}
      </p>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* User info */}
      <div className="flex items-center gap-3">
        <img
          src={user_photoURL}
          alt={userName}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-lime-600/20"
        />
        <div className="flex flex-col flex-1">
          <span className="font-semibold text-sm text-gray-900 font-syne">{userName}</span>
          <StarRating rating={ratings} />
        </div>
        <span className="text-xs text-gray-400">
          {formattedDate}
        </span>
      </div>
    </div>
  );
};

export default ReviewCard;