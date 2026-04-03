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
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16 lg:mb-20 gap-4">
          {/* Top illustration */}
          <img
            src={cartImg}
            alt="Delivery cart"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          />
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-syne">What our customers are saying</h2>
          <p className="text-gray-600 text-base max-w-2xl leading-relaxed font-dm-sans">
            Real experiences from our valued customers across Bangladesh. We
            deliver smiles, not just parcels.
          </p>
        </div>

        {/* Swiper */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={3}
            centeredSlides={true}
            loop={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={{
              nextEl: ".review-next",
              prevEl: ".review-prev",
            }}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 20 },
              640: { slidesPerView: 1.5, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 25 },
              1024: { slidesPerView: 3, spaceBetween: 30 },
              1280: { slidesPerView: 3, spaceBetween: 30 },
            }}
            className="pb-16 px-4"
          >
            {reviews.map((item) => (
              <SwiperSlide key={item.id} className="h-auto flex items-center justify-center">
                <div className="swiper-slide-wrapper">
                  <ReviewCard {...item} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button className="review-prev btn btn-circle btn-sm btn-outline border-base-300 hover:btn-primary">
              ←
            </button>
            <button className="review-next btn btn-circle btn-sm btn-primary">
              →
            </button>
          </div>
        </div>
      </div>

      {/* Professional Testimonial Slider Styling */}
      <style>{`
        /* Pagination Dots */
        .swiper-pagination-bullet {
          background-color: #cbd5e1;
          opacity: 0.6;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .swiper-pagination-bullet-active {
          background-color: #0d4a42;
          opacity: 1;
          width: 28px;
          border-radius: 5px;
          transform: scaleX(1.2);
        }
        
        /* Swiper slide wrapper for better stacking */
        .swiper-slide-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        
        /* DEFAULT: Side slides - Smaller, Faded, Below */
        .swiper-slide {
          opacity: 0.5;
          filter: grayscale(30%) brightness(0.9);
          transform: scale(0.85);
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform-origin: center;
        }
        
        /* ACTIVE: Center slide - Full Size, Full Brightness, Elevated */
        .swiper-slide-active {
          opacity: 1;
          filter: grayscale(0%) brightness(1);
          transform: scale(1) translateY(0px);
          z-index: 10;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }
        
        /* ADJACENT: Near-center slides - Slightly larger than far sides */
        .swiper-slide-prev,
        .swiper-slide-next {
          opacity: 0.7;
          filter: grayscale(15%) brightness(0.95);
          transform: scale(0.92);
        }
        
        /* Smooth animation for all transitions */
        .swiper-slide {
          will-change: transform, opacity;
        }
        
        /* Remove any 3D perspective effects */
        .swiper {
          perspective: none;
        }
        
        .swiper-wrapper {
          align-items: center;
        }
      `}</style>
    </section>
  );
};

export default CustomerReviews;