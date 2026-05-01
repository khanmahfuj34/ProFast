import React from 'react';
import { Link } from 'react-router-dom';
import trackingImg from '../../assets/live-tracking.png';
import deliveryImg from '../../assets/safe-delivery.png';

const About = () => {
  const stats = [
    { number: '50K+', label: 'Parcels Delivered' },
    { number: '15K+', label: 'Happy Customers' },
    { number: '500+', label: 'Active Riders' },
    { number: '24/7', label: 'Customer Support' }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Mission-Driven',
      description: 'Revolutionizing last-mile delivery with speed, reliability, and innovation.'
    },
    {
      icon: '💡',
      title: 'Innovation First',
      description: 'Constantly innovating our technology to provide the best delivery experience.'
    },
    {
      icon: '🤝',
      title: 'Community Focused',
      description: 'Building strong relationships with riders, customers, and partners.'
    },
    {
      icon: '🌍',
      title: 'Sustainable Growth',
      description: 'Committed to eco-friendly and socially responsible delivery solutions.'
    }
  ];

  const milestones = [
    { year: '2020', title: 'Founded', description: 'ProFast begins revolutionizing last-mile delivery' },
    { year: '2021', title: '1 Million Deliveries', description: 'Milestone achieved and expanded to 64 districts' },
    { year: '2022', title: 'Technology Upgrade', description: 'Launched real-time tracking and AI routing' },
    { year: '2023', title: '24/7 Support', description: 'Introduced round-the-clock customer support' }
  ];

  const teamRoles = [
    { role: 'Logistics Manager', count: 5, icon: '📦' },
    { role: 'Customer Support', count: 20, icon: '📞' },
    { role: 'Operations Team', count: 15, icon: '⚙️' },
    { role: 'Technology Team', count: 25, icon: '💻' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-lime-50 to-green-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-lime-600">ProFast</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Transforming the delivery industry with cutting-edge technology, reliable service, and a commitment to excellence. 
              We're not just delivering parcels—we're delivering trust.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                To revolutionize last-mile delivery by providing fast, affordable, and reliable parcel delivery services 
                across Bangladesh. We empower riders, delight customers, and create sustainable economic opportunities through 
                innovative logistics solutions.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🌟</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                To become the most trusted and efficient delivery platform in South Asia, leveraging technology and 
                human excellence to connect businesses and customers seamlessly. We envision a future where delivery is 
                predictable, secure, and environmentally responsible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Our Impact by Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 bg-gradient-to-br from-lime-50 to-green-50 rounded-xl hover:shadow-lg transition-shadow"
              >
                <p className="text-5xl font-bold text-lime-600 mb-2">{stat.number}</p>
                <p className="text-gray-700 font-semibold text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-500 text-white font-bold text-xl">
                    {milestone.year}
                  </div>
                </div>
                <div className="flex-grow pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600 text-lg">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Overview */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Our diverse team of 65+ dedicated professionals works tirelessly to ensure your parcels reach their destination safely and on time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamRoles.map((team, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl mb-4">{team.icon}</div>
                <p className="text-3xl font-bold text-lime-600 mb-2">{team.count}</p>
                <p className="text-gray-700 font-semibold">{team.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Why Choose ProFast?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-xl p-8">
              <img src={trackingImg} alt="Real-time Tracking" className="w-16 h-16 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Real-Time Tracking</h3>
              <p className="text-gray-700 leading-relaxed">
                Monitor your parcels every step of the way with our advanced tracking system. Get instant notifications from pickup to delivery.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8">
              <img src={deliveryImg} alt="Safe Delivery" className="w-16 h-16 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Safe & Reliable</h3>
              <p className="text-gray-700 leading-relaxed">
                Your parcels are in safe hands. Our trained riders and quality assurance processes guarantee damage-free delivery every time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8">
              <div className="text-4xl mb-6">🚀</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Fast & Affordable</h3>
              <p className="text-gray-700 leading-relaxed">
                Competitive pricing without compromising quality. Express delivery options available to meet your urgent delivery needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-lime-500 to-green-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Experience ProFast?</h2>
          <p className="text-xl text-white mb-8 opacity-90 leading-relaxed">
            Join thousands of satisfied customers and riders who trust ProFast for their delivery needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/send-parcel" 
              className="btn btn-lg bg-white text-lime-600 hover:bg-gray-100 border-none rounded-xl font-semibold transition-all"
            >
              Send a Parcel
            </Link>
            <Link 
              to="/be-rider" 
              className="btn btn-lg bg-transparent text-white border-2 border-white hover:bg-white hover:text-lime-600 rounded-xl font-semibold transition-all"
            >
              Become a Rider
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Info Footer */}
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-lime-500 mb-2">📞 24/7 Support</p>
              <p className="text-gray-400">+880 1234-567890</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-lime-500 mb-2">📧 Email Us</p>
              <p className="text-gray-400">support@profast.com</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-lime-500 mb-2">📍 Headquarter</p>
              <p className="text-gray-400">Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
