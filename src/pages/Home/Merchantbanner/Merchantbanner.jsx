// import bgImage from "../../assets/be-a-merchant-bg.png";
// import locationImg from "../../assets/location-merchant.png";
import bgImage from "../../../assets/be-a-merchant-bg.png";
import locationImg from "../../../assets/location-merchant.png";

const MerchantBanner = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, #0f3d38 0%, #0d4a42 40%, #0a5c50 70%, #1a7a60 100%)",
          }}
        >
          {/* Background wave/glow image — top right area */}
          <img
            src={bgImage}
            alt=""
            aria-hidden="true"
            className="absolute top-0 right-0 w-2/3 h-full object-cover opacity-30 pointer-events-none"
          />

          {/* Dark overlay gradient from left to ensure text readability */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, rgba(10,40,35,0.95) 0%, rgba(10,40,35,0.7) 50%, transparent 100%)",
            }}
          />

          {/* Content wrapper */}
          <div className="relative z-10 flex items-center justify-between px-6 sm:px-8 lg:px-10 py-16 sm:py-20 gap-6 lg:gap-8">
            {/* Left — Text + Buttons */}
            <div className="flex flex-col gap-6 max-w-lg">
              <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold leading-snug font-syne">
                Merchant and Customer Satisfaction{" "}
                <span className="block">is Our First Priority</span>
              </h2>

              <p className="text-white/80 text-base sm:text-lg leading-relaxed font-dm-sans">
                We offer the lowest delivery charge with the highest value along
                with 100% safety of your product. ZapShift courier delivers your
                parcels in every corner of Bangladesh right on time.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4 mt-2">
                <button
                  className="px-6 py-3 rounded-lg text-base font-semibold transition-all hover:opacity-90 text-gray-900"
                  style={{ backgroundColor: "#c6f135" }}
                >
                  Become a Merchant
                </button>
                <button
                  className="px-6 py-3 border-2 border-white/50 rounded-lg text-white font-semibold hover:bg-white/10 transition-all"
                >
                  Earn with ZapShift Courier
                </button>
              </div>
            </div>

            {/* Right — Location/Parcel illustration */}
            <div className="hidden md:flex flex-shrink-0 items-end justify-end w-80 h-64">
              <img
                src={locationImg}
                alt="Parcel delivery illustration"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MerchantBanner;