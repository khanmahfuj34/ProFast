import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { districts } from '../../data/districts';

const inputStyle =
  "w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition";

const cardStyle =
  "bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8";

const labelStyle =
  "block text-sm font-medium text-gray-700 mb-2";

const headingStyle =
  "text-xl font-semibold text-gray-900";

const SendParcel = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [senderDistrictSearch, setSenderDistrictSearch] = useState('');
  const [receiverDistrictSearch, setReceiverDistrictSearch] = useState('');
  const [showSenderDropdown, setShowSenderDropdown] = useState(false);
  const [showReceiverDropdown, setShowReceiverDropdown] = useState(false);

  const filteredSenderDistricts = useMemo(() => {
    return districts.filter(d =>
      d.name.toLowerCase().includes(senderDistrictSearch.toLowerCase())
    );
  }, [senderDistrictSearch]);

  const filteredReceiverDistricts = useMemo(() => {
    return districts.filter(d =>
      d.name.toLowerCase().includes(receiverDistrictSearch.toLowerCase())
    );
  }, [receiverDistrictSearch]);

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Send A Parcel</h1>
          <p className="text-gray-600 mt-2">Enter Your Parcel Details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Parcel Type */}
          <div className={cardStyle}>
            <h2 className={headingStyle + " mb-4"}>Parcel Type</h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="document" {...register("parcelType")} className="accent-lime-500 w-5 h-5" />
                <span className="text-gray-800 font-medium">Document</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="non-document" {...register("parcelType")} className="accent-lime-500 w-5 h-5" />
                <span className="text-gray-800 font-medium">Non-Document</span>
              </label>
            </div>
          </div>

          {/* Parcel Info */}
          <div className={cardStyle}>
            <h2 className={headingStyle + " mb-6"}>Parcel Information</h2>
            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className={labelStyle}>Parcel Name *</label>
                <input {...register("parcelName", { required: "Parcel name is required" })} className={inputStyle} placeholder="Enter parcel name" />
              </div>

              <div>
                <label className={labelStyle}>Weight (KG) *</label>
                <input type="number" step="0.1" {...register("parcelWeight", { required: "Weight is required", min: { value: 0.1 } })} className={inputStyle} placeholder="Enter weight in KG" />
              </div>

            </div>
          </div>

          {/* Sender + Receiver */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Sender */}
            <div className={cardStyle}>
              <h2 className={headingStyle + " mb-6"}>Sender Details</h2>
              <div className="space-y-5">

                <div>
                  <label className={labelStyle}>Sender Name *</label>
                  <input {...register("senderName", { required: "Name is required" })} className={inputStyle} placeholder="Enter your name" />
                </div>

                <div>
                  <label className={labelStyle}>Address *</label>
                  <input {...register("senderAddress", { required: "Address is required" })} className={inputStyle} placeholder="Enter your address" />
                </div>

                <div>
                  <label className={labelStyle}>Sender Info</label>
                  <textarea {...register("senderInfo")} className={inputStyle} placeholder="Additional information" rows="3" />
                </div>

                <div>
                  <label className={labelStyle}>Phone Number *</label>
                  <input {...register("senderPhone", { required: "Phone is required", pattern: { value: /^[0-9]{10,11}$/, message: "Enter a valid phone number" } })} className={inputStyle} placeholder="Enter phone number" />
                </div>

                <div>
                  <label className={labelStyle}>Your District *</label>
                  <div className="relative">
                    <input
                      value={senderDistrictSearch}
                      onChange={(e) => setSenderDistrictSearch(e.target.value)}
                      onFocus={() => setShowSenderDropdown(true)}
                      onBlur={() => setTimeout(() => setShowSenderDropdown(false), 200)}
                      placeholder="Search and select district"
                      className={inputStyle}
                    />

                    {showSenderDropdown && (
                      <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-auto z-50 mt-1">
                        {filteredSenderDistricts.length > 0 ? (
                          filteredSenderDistricts.map(d => (
                            <div
                              key={d.name}
                              onClick={() => {
                                setSenderDistrictSearch(d.name);
                                setShowSenderDropdown(false);
                              }}
                              className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer transition"
                            >
                              {d.name}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No districts found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Pickup Instruction</label>
                  <textarea {...register("pickupInstruction")} className={inputStyle} placeholder="Special pickup instructions" rows="3" />
                </div>

              </div>
            </div>

            {/* Receiver */}
            <div className={cardStyle}>
              <h2 className={headingStyle + " mb-6"}>Receiver Details</h2>
              <div className="space-y-5">

                <div>
                  <label className={labelStyle}>Receiver Name *</label>
                  <input {...register("receiverName", { required: "Name is required" })} className={inputStyle} placeholder="Enter receiver name" />
                </div>

                <div>
                  <label className={labelStyle}>Receiver Address *</label>
                  <input {...register("receiverAddress", { required: "Address is required" })} className={inputStyle} placeholder="Enter receiver address" />
                </div>

                <div>
                  <label className={labelStyle}>Contact Number *</label>
                  <input {...register("receiverPhone", { required: "Phone is required", pattern: { value: /^[0-9]{10,11}$/, message: "Enter a valid phone number" } })} className={inputStyle} placeholder="Enter contact number" />
                </div>

                <div>
                  <label className={labelStyle}>Receiver District *</label>
                  <div className="relative">
                    <input
                      value={receiverDistrictSearch}
                      onChange={(e) => setReceiverDistrictSearch(e.target.value)}
                      onFocus={() => setShowReceiverDropdown(true)}
                      onBlur={() => setTimeout(() => setShowReceiverDropdown(false), 200)}
                      placeholder="Search and select district"
                      className={inputStyle}
                    />

                    {showReceiverDropdown && (
                      <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-auto z-50 mt-1">
                        {filteredReceiverDistricts.length > 0 ? (
                          filteredReceiverDistricts.map(d => (
                            <div
                              key={d.name}
                              onClick={() => {
                                setReceiverDistrictSearch(d.name);
                                setShowReceiverDropdown(false);
                              }}
                              className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer transition"
                            >
                              {d.name}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No districts found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Delivery Instruction</label>
                  <textarea {...register("deliveryInstruction")} className={inputStyle} placeholder="Special delivery instructions" rows="3" />
                </div>

              </div>
            </div>

          </div>

          {/* Note */}
          <div className="bg-gradient-to-r from-lime-50 to-green-50 border border-lime-200 p-6 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="font-semibold text-gray-900">Pickup time: 4 PM – 7 PM (approx)</p>
                <p className="text-sm text-gray-600 mt-1">Our rider will pick up your parcel within the specified time window.</p>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="text-center pt-4">
            <button className="px-8 py-3 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition">
              Proceed to Confirm
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SendParcel;