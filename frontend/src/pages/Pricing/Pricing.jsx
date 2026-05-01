import React, { useState, useMemo } from 'react';
import { coverageData } from '../../data/coverage-data';
import { calculateDeliveryPrice } from '../../utils/pricingCalculator';

const inputStyle =
  "w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition";

const labelStyle =
  "block text-sm font-medium text-gray-700 mb-2";

const cardStyle =
  "bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8";

const Pricing = () => {
  const [parcelType, setParcelType] = useState('document');
  const [weight, setWeight] = useState('');
  const [senderDistrict, setSenderDistrict] = useState('');
  const [receiverDistrict, setReceiverDistrict] = useState('');
  const [senderSearch, setSenderSearch] = useState('');
  const [receiverSearch, setReceiverSearch] = useState('');
  const [showSenderDropdown, setShowSenderDropdown] = useState(false);
  const [showReceiverDropdown, setShowReceiverDropdown] = useState(false);
  const [pricingResult, setPricingResult] = useState(null);
  const [error, setError] = useState('');

  // Get unique districts from coverage data
  const uniqueDistricts = useMemo(() => {
    const districts = coverageData.map(item => item.district);
    return [...new Set(districts)].sort();
  }, []);

  // Filter districts based on search
  const filteredSenderDistricts = useMemo(() => {
    return uniqueDistricts.filter(d =>
      d.toLowerCase().includes(senderSearch.toLowerCase())
    );
  }, [senderSearch, uniqueDistricts]);

  const filteredReceiverDistricts = useMemo(() => {
    return uniqueDistricts.filter(d =>
      d.toLowerCase().includes(receiverSearch.toLowerCase())
    );
  }, [receiverSearch, uniqueDistricts]);

  // Determine delivery type based on sender and receiver districts
  const deliveryType = useMemo(() => {
    if (senderDistrict && receiverDistrict) {
      return senderDistrict === receiverDistrict ? 'within-city' : 'outside-city';
    }
    return null;
  }, [senderDistrict, receiverDistrict]);

  // Calculate price
  const handleCalculate = () => {
    setError('');
    setPricingResult(null);

    // Validation
    if (!parcelType) {
      setError('Please select a parcel type');
      return;
    }

    if (!weight || parseFloat(weight) <= 0) {
      setError('Please enter a valid weight (greater than 0)');
      return;
    }

    if (!senderDistrict) {
      setError('Please select sender district');
      return;
    }

    if (!receiverDistrict) {
      setError('Please select receiver district');
      return;
    }

    // Calculate price
    const result = calculateDeliveryPrice(parcelType, weight, deliveryType);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Set pricing result
    setPricingResult({
      parcelType,
      weight: parseFloat(weight),
      senderDistrict,
      receiverDistrict,
      deliveryType,
      basePrice: result.basePrice,
      extraCharges: result.extraCharges,
      totalPrice: result.totalPrice
    });
  };

  // Reset form
  const handleReset = () => {
    setParcelType('document');
    setWeight('');
    setSenderDistrict('');
    setReceiverDistrict('');
    setSenderSearch('');
    setReceiverSearch('');
    setPricingResult(null);
    setError('');
  };

  // Parcel type details
  const parcelTypeInfo = {
    document: { label: 'Document', icon: '📄', description: 'Letters, invoices, or papers' },
    'non-document': { label: 'Non-Document', icon: '📦', description: 'Packages, goods, items' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            💰 Pricing Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Calculate your delivery cost instantly based on parcel type, destination, and weight
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Calculator Form */}
          <div className={cardStyle + " h-fit"}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Calculate Your Cost</h2>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Parcel Type */}
              <div>
                <label className={labelStyle}>Parcel Type *</label>
                <div className="space-y-3">
                  {Object.entries(parcelTypeInfo).map(([type, info]) => (
                    <label key={type} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                      style={{
                        borderColor: parcelType === type ? '#65a30d' : '#e5e7eb',
                        backgroundColor: parcelType === type ? '#f0fdf4' : 'white'
                      }}
                    >
                      <input
                        type="radio"
                        name="parcelType"
                        value={type}
                        checked={parcelType === type}
                        onChange={(e) => setParcelType(e.target.value)}
                        className="w-5 h-5 accent-lime-500"
                      />
                      <div>
                        <div className="font-semibold text-gray-800">
                          <span className="mr-2">{info.icon}</span>
                          {info.label}
                        </div>
                        <div className="text-sm text-gray-500">{info.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className={labelStyle}>Weight (KG) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight in kilograms"
                  className={inputStyle}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Documents are typically 0.1-0.5 KG. Non-documents vary based on items.
                </p>
              </div>

              {/* Sender District */}
              <div>
                <label className={labelStyle}>From District *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={senderSearch}
                    onChange={(e) => setSenderSearch(e.target.value)}
                    onFocus={() => setShowSenderDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSenderDropdown(false), 200)}
                    placeholder="Search and select sender district"
                    className={inputStyle}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Selected: <span className="font-semibold text-gray-700">{senderDistrict || 'None'}</span>
                  </div>

                  {showSenderDropdown && (
                    <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto z-50 mt-1">
                      {filteredSenderDistricts.length > 0 ? (
                        filteredSenderDistricts.map(d => (
                          <div
                            key={d}
                            onClick={() => {
                              setSenderDistrict(d);
                              setSenderSearch(d);
                              setShowSenderDropdown(false);
                            }}
                            className="px-4 py-3 text-gray-800 hover:bg-lime-50 cursor-pointer transition border-b border-gray-100 last:border-b-0"
                          >
                            📍 {d}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500">No districts found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Receiver District */}
              <div>
                <label className={labelStyle}>To District *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={receiverSearch}
                    onChange={(e) => setReceiverSearch(e.target.value)}
                    onFocus={() => setShowReceiverDropdown(true)}
                    onBlur={() => setTimeout(() => setShowReceiverDropdown(false), 200)}
                    placeholder="Search and select receiver district"
                    className={inputStyle}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Selected: <span className="font-semibold text-gray-700">{receiverDistrict || 'None'}</span>
                  </div>

                  {showReceiverDropdown && (
                    <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto z-50 mt-1">
                      {filteredReceiverDistricts.length > 0 ? (
                        filteredReceiverDistricts.map(d => (
                          <div
                            key={d}
                            onClick={() => {
                              setReceiverDistrict(d);
                              setReceiverSearch(d);
                              setShowReceiverDropdown(false);
                            }}
                            className="px-4 py-3 text-gray-800 hover:bg-lime-50 cursor-pointer transition border-b border-gray-100 last:border-b-0"
                          >
                            📍 {d}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500">No districts found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Type Info */}
              {deliveryType && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Delivery Type:</span> {deliveryType === 'within-city' ? '🏙️ Within City' : '🌍 Outside City/District'}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleCalculate}
                  className="flex-1 btn btn-lg bg-lime-500 hover:bg-lime-600 text-white border-none rounded-xl font-semibold transition-all"
                >
                  🧮 Calculate
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 btn btn-lg bg-gray-200 hover:bg-gray-300 text-gray-800 border-none rounded-xl font-semibold transition-all"
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Pricing Result */}
          <div>
            {pricingResult ? (
              <div className={cardStyle + " bg-gradient-to-br from-lime-50 to-green-50 border-lime-300"}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">💵 Pricing Breakdown</h2>

                <div className="space-y-6">
                  {/* Summary Info */}
                  <div className="space-y-3 pb-6 border-b border-lime-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Parcel Type:</span>
                      <span className="font-semibold text-gray-900">
                        {parcelTypeInfo[pricingResult.parcelType].icon} {parcelTypeInfo[pricingResult.parcelType].label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Weight:</span>
                      <span className="font-semibold text-gray-900">{pricingResult.weight} KG</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Route:</span>
                      <span className="font-semibold text-gray-900">
                        {pricingResult.senderDistrict} → {pricingResult.receiverDistrict}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Delivery Type:</span>
                      <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                        pricingResult.deliveryType === 'within-city'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-orange-100 text-orange-900'
                      }`}>
                        {pricingResult.deliveryType === 'within-city' ? '🏙️ Within City' : '🌍 Outside City'}
                      </span>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Base Charge:</span>
                      <span className="font-semibold">৳{pricingResult.basePrice}</span>
                    </div>
                    {pricingResult.extraCharges > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span>Extra Charges:</span>
                        <span className="font-semibold text-orange-600">+ ৳{pricingResult.extraCharges}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="bg-white rounded-lg p-6 border-2 border-lime-500">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm mb-2">Total Cost</p>
                      <p className="text-5xl font-bold text-lime-600 mb-1">
                        ৳{pricingResult.totalPrice}
                      </p>
                      <p className="text-xs text-gray-500">All-inclusive delivery fee</p>
                    </div>
                  </div>

                  {/* Pricing Notes */}
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-2">
                    <p className="font-semibold text-gray-700">📌 Pricing Information:</p>
                    <ul className="space-y-1 text-xs">
                      <li>✓ Documents: ৳60 (within city) / ৳80 (outside)</li>
                      <li>✓ Non-Doc ≤3kg: ৳110 (within) / ৳150 (outside)</li>
                      <li>✓ Extra weight: ৳40 per KG above 3kg</li>
                      <li>✓ Pricing includes tax and all charges</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className={cardStyle + " bg-gradient-to-br from-gray-50 to-blue-50"}>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Calculation Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Fill in the form on the left and click "Calculate" to see your pricing breakdown
                  </p>
                  <div className="bg-white rounded-lg p-6 text-left space-y-3 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">How it works:</p>
                    <ol className="space-y-2 ml-4">
                      <li>1️⃣ Select your parcel type (document or non-document)</li>
                      <li>2️⃣ Enter the weight of your parcel</li>
                      <li>3️⃣ Choose sender and receiver districts</li>
                      <li>4️⃣ Click Calculate to see instant pricing</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Table Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">📋 Complete Pricing Guide</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-lime-50 border-b-2 border-lime-500">
                  <th className="px-6 py-4 text-left font-bold text-gray-900">Parcel Type</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-900">Weight Range</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-900">Within City</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-900">Outside City</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">📄 Document</td>
                  <td className="px-6 py-4 text-gray-700">Any weight</td>
                  <td className="px-6 py-4 text-center font-semibold text-lime-600">৳60</td>
                  <td className="px-6 py-4 text-center font-semibold text-orange-600">৳80</td>
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
                  <td className="px-6 py-4 font-semibold text-gray-900">📦 Non-Document</td>
                  <td className="px-6 py-4 text-gray-700">≤ 3 KG</td>
                  <td className="px-6 py-4 text-center font-semibold text-lime-600">৳110</td>
                  <td className="px-6 py-4 text-center font-semibold text-orange-600">৳150</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">📦 Non-Document</td>
                  <td className="px-6 py-4 text-gray-700">&gt; 3 KG</td>
                  <td className="px-6 py-4 text-center text-gray-600">Base (৳110) + ৳40/KG</td>
                  <td className="px-6 py-4 text-center text-gray-600">Base (৳150) + ৳40/KG</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600 mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            💡 <strong>Note:</strong> All prices include taxes and handling charges. Prices are fixed across all covered districts. 
            Same district delivery is considered "Within City", different district delivery is "Outside City/District".
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
