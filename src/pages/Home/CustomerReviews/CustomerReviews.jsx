// npm install swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import ReviewCard from "./ReviewCard";

// illustration path
import cartImg from "../../../assets/delivery-van.png";

const reviews = [
  {
    id: "5f47ac10b4f1c03e8c123456",
    user_email: "john.doe@example.com",
    userName: "John Doe",
    ratings: 4.5,
    review: "Smooth delivery and polite staff.",
    user_photoURL: "https://randomuser.me/api/portraits/men/10.jpg",
    date: "2024-05-08T14:30:00.000Z",
  },
  {
    id: "5f47ac10b4f1c03e8c234567",
    user_email: "jane.smith@example.com",
    userName: "Jane Smith",
    ratings: 3.8,
    review: "Took a bit longer than expected, but okay overall.",
    user_photoURL: "https://randomuser.me/api/portraits/women/25.jpg",
    date: "2024-06-10T10:15:00.000Z",
  },
  {
    id: "5f47ac10b4f1c03e8c345678",
    user_email: "alex.brown@example.com",
    userName: "Alex Brown",
    ratings: 5.0,
    review: "Excellent service! Fast and secure.",
    user_photoURL: "https://randomuser.me/api/portraits/men/34.jpg",
    date: "2024-07-01T08:50:00.000Z",
  },
  {
    id: "5f47ac10b4f1c03e8c456789",
    user_email: "lisa.white@example.com",
    userName: "Lisa White",
    ratings: 4.2,
    review: "Very responsive and professional.",
    user_photoURL: "https://randomuser.me/api/portraits/women/12.jpg",
    date: "2024-07-15T09:10:00.000Z",
  },
  {
    id: "5f47ac10b4f1c03e8c567890",
    user_email: "david.lee@example.com",
    userName: "David Lee",
    ratings: 2.9,
    review: "Late delivery and no updates. Disappointed.",
    user_photoURL: "https://randomuser.me/api/portraits/men/19.jpg",
    date: "2024-08-02T16:45:00.000Z",
  },
  {
    id: "5f47ac10b4f1c03e8c678901",
    user_email: "nina.khan@example.com",
    userName: "Nina Khan",
    ratings: 4.9,
    review: "Superb experience! Highly recommended.",
    user_photoURL: "https://randomuser.me/api/portraits/women/8.jpg",
    date: "2024-08-10T12:00:00.000Z",
  },
  {
    id: "5f47ac10b4f1c03e8c789012",
    user_email: "michael.jordan@example.com",
    userName: "Michael Jordan",
    ratings: 3.3,
    review: "Decent service but packaging could be better.",
    user_photoURL: "https://randomuser.me/api/portraits/men/22.jpg",
    date: "2024-08-14T18:20:00.000Z",
  },
  {
    id: "5f47ac10b4f1c03e8c890123",
    user_email: "emma.watson@example.com",
    userName: "Emma Watson",
    ratings: 4.7,
    review: "Fast, safe, and friendly delivery service.",
    user_photoURL: "https://randomuser.me/api/portraits/women/5.jpg",
    date: "2024-08-20T07:30:00.000Z",
  },
];

const CustomerReviews = () => {
  return (
    <section className="py-16 px-4 bg-base-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 gap-4">
          {/* Top illustration */}
          <img
            src={cartImg}
            alt="Delivery cart"
            className="w-24 h-24 object-contain"
          />
          <h2 className="text-3xl font-bold">What our customers are saying</h2>
          <p className="text-base-content/60 text-sm max-w-md leading-relaxed">
            Real experiences from our valued customers across Bangladesh. We
            deliver smiles, not just parcels.
          </p>
        </div>

        {/* Swiper */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={5}
            centeredSlides={true}
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={{
              nextEl: ".review-next",
              prevEl: ".review-prev",
            }}
            breakpoints={{
              320: { slidesPerView: 1 },
              480: { slidesPerView: 2 },
              640: { slidesPerView: 2.5 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
            className="pb-12"
          >
            {reviews.map((item) => (
              <SwiperSlide key={item.id} className="h-auto">
                <ReviewCard {...item} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button className="review-prev btn btn-circle btn-sm btn-outline border-base-300 hover:btn-primary">
              ←
            </button>
            <button className="review-next btn btn-circle btn-sm btn-primary">
              →
            </button>
          </div>
        </div>
      </div>

      {/* Swiper pagination dot override */}
      <style>{`
        .swiper-pagination-bullet {
          background-color: #9ca3af;
          opacity: 0.5;
          width: 8px;
          height: 8px;
        }
        .swiper-pagination-bullet-active {
          background-color: #0d4a42;
          opacity: 1;
          width: 24px;
          border-radius: 4px;
        }
        
        /* All slides default styling */
        .swiper-slide {
          opacity: 0.4;
          filter: grayscale(60%) brightness(0.8);
          transform: scale(0.75) translateY(25px);
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        /* Active (center) slide - Dramatically Elevated & Enlarged */
        .swiper-slide-active {
          opacity: 1;
          filter: grayscale(0%) brightness(1);
          transform: scale(1.56) translateY(-25px);
          z-index: 20;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.2);
        }
        
        /* Adjacent slides - Smaller and lower */
        .swiper-slide-prev,
        .swiper-slide-next {
          opacity: 0.65;
          filter: grayscale(30%) brightness(0.95);
          transform: scale(0.92) translateY(5px);
        }
      `}</style>
    </section>
  );
};

export default CustomerReviews;