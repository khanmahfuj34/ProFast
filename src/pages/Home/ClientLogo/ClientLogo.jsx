// Removed dependency on react-fast-marquee

// Replace with your actual logo imports
// All logos should be inside: src/assets/logos/
import logo1 from '../../../assets/brands/amazon.png'
import logo2 from '../../../assets/brands/amazon_vector.png'
import logo3 from '../../../assets/brands/casio.png'
import logo4 from '../../../assets/brands/moonstar.png'
import logo5 from '../../../assets/brands/randstad.png'
import logo6 from '../../../assets/brands/star.png'
import logo7 from '../../../assets/brands/start_people.png'

const logos = [
  { src: logo1, alt: "Client 1" },
  { src: logo2, alt: "Client 2" },
  { src: logo3, alt: "Client 3" },
  { src: logo4, alt: "Client 4" },
  { src: logo5, alt: "Client 5" },
  { src: logo6, alt: "Client 6" },
  { src: logo7, alt: "Client 7" },
];

const marqueeStyle = `
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }
  .marquee-container {
    overflow: hidden;
    background: white;
  }
  .marquee {
    display: flex;
    animation: scroll 20s linear infinite;
  }
  .marquee:hover {
    animation-play-state: paused;
  }
  .marquee-item {
    flex-shrink: 0;
    margin: 0 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .marquee-item img {
    height: 40px;
    width: auto;
    object-fit: contain;
    opacity: 0.6;
    transition: opacity 0.3s;
  }
  .marquee-item:hover img {
    opacity: 1;
  }
`;

const ClientLogo = () => {
  return (
    <>
      <style>{marqueeStyle}</style>
      <section className="py-12 bg-base-100">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">We've helped thousands of sales teams</h2>
            <p className="text-base-content/60 text-sm">
              Companies that trust us to deliver on time, every time.
            </p>
          </div>
        </div>

        {/* Custom Marquee */}
        <div className="marquee-container">
          <div className="marquee">
            {logos.map((logo, index) => (
              <div key={index} className="marquee-item">
                <img src={logo.src} alt={logo.alt} />
              </div>
            ))}
            {logos.map((logo, index) => (
              <div key={`dup-${index}`} className="marquee-item">
                <img src={logo.src} alt={logo.alt} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ClientLogo;