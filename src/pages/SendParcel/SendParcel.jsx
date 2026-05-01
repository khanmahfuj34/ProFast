import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { districts } from '../../data/districts';
import { calculateDeliveryPrice } from '../../utils/pricingCalculator';
import { useParcel } from '../../hooks/useParcel';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';

const inputStyle =
  "w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition";

const cardStyle =
  "bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8";

const labelStyle =
  "block text-sm font-medium text-gray-700 mb-2";

const headingStyle =
  "text-xl font-semibold text-gray-900";

const SendParcel = () => {
  const navigate = useNavigate();
  const { setParcelData } = useParcel();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch: formWatch,
    getValues,
    setValue
  } = useForm({
    defaultValues: {
      parcelType: 'document',
      deliveryType: 'within-city'
    }
  });
  const {user}=useAuth();
  const axiosSecure = useAxiosSecure();
  const [senderDistrictSearch, setSenderDistrictSearch] = useState('');
  const [receiverDistrictSearch, setReceiverDistrictSearch] = useState('');
  const [showSenderDropdown, setShowSenderDropdown] = useState(false);
  const [showReceiverDropdown, setShowReceiverDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryTypeWarning, setDeliveryTypeWarning] = useState('');

  // Auto-adjust delivery type when receiver district changes
  useEffect(() => {
    if (senderDistrictSearch && receiverDistrictSearch) {
      if (senderDistrictSearch !== receiverDistrictSearch) {
        // Different districts = must be "outside-city"
        if (getValues('deliveryType') === 'within-city') {
          setValue('deliveryType', 'outside-city');
          setDeliveryTypeWarning('Delivery type auto-set to "Outside City" - different districts detected');
        }
      } else {
        // Same district = can be "within-city"
        setDeliveryTypeWarning('');
      }
    }
  }, [receiverDistrictSearch, senderDistrictSearch, setValue, getValues]);

  // Watch form values for real-time price calculation
  const parcelType = formWatch('parcelType');
  const parcelWeight = formWatch('parcelWeight');
  const deliveryType = formWatch('deliveryType');

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

  // Real-time price calculation
  const priceInfo = useMemo(() => {
    if (parcelWeight && deliveryType) {
      const result = calculateDeliveryPrice(parcelType, parcelWeight, deliveryType);
      if (!result.error) {
        return result;
      }
    }
    return null;
  }, [parcelType, parcelWeight, deliveryType]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // Validate all required fields
    if (!senderDistrictSearch) {
      Swal.fire('Error', 'Please select sender district', 'error');
      setIsSubmitting(false);
      return;
    }

    if (!receiverDistrictSearch) {
      Swal.fire('Error', 'Please select receiver district', 'error');
      setIsSubmitting(false);
      return;
    }

    // Validate delivery type matches district selection
    const isSameDistrict = senderDistrictSearch === receiverDistrictSearch;
    const isWithinCity = data.deliveryType === 'within-city';

    if (!isSameDistrict && isWithinCity) {
      Swal.fire('Invalid Delivery Type', 'Please select "Outside City/District" for deliveries to different districts', 'error');
      setIsSubmitting(false);
      return;
    }

    if (!priceInfo) {
      Swal.fire('Error', 'Invalid weight or delivery type', 'error');
      setIsSubmitting(false);
      return;
    }

    // Show confirmation modal
    const confirmResult = await Swal.fire({
      title: '📦 Confirm Your Order',
      html: `
        <div style="text-align: left; background: #f9fafb; padding: 20px; border-radius: 8px;">
          <div style="margin-bottom: 15px;">
            <strong>Parcel Type:</strong> ${data.parcelType === 'document' ? 'Document' : 'Non-Document'}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Weight:</strong> ${parcelWeight} KG
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Delivery Type:</strong> ${data.deliveryType === 'within-city' ? 'Within City' : 'Outside City/District'}
          </div>
          <div style="border-top: 2px solid #65a30d; padding-top: 15px; margin-top: 15px;">
            <strong style="font-size: 18px; color: #15803d;">Total Price: ৳${priceInfo.totalPrice}</strong>
          </div>
          ${priceInfo.extraCharges > 0 ? `
            <div style="font-size: 13px; color: #666; margin-top: 10px;">
              Base: ৳${priceInfo.basePrice} + Extra: ৳${priceInfo.extraCharges}
            </div>
          ` : ''}
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: '✅ Confirm',
      cancelButtonText: '❌ Cancel',
      confirmButtonColor: '#65a30d',
      cancelButtonColor: '#d1d5db'
    });

    if (confirmResult.isConfirmed) {
      //save the info to the database
      try {
        // Prepare parcel data
        const completeParcelData = {
          ...data,
          senderDistrict: senderDistrictSearch,
          receiverDistrict: receiverDistrictSearch,
          basePrice: priceInfo.basePrice,
          extraCharges: priceInfo.extraCharges,
          totalPrice: priceInfo.totalPrice
        };

        const res = await axiosSecure.post('/parcels', completeParcelData);
        console.log('Parcel saved:', res.data);

        // Store parcel data in context
        setParcelData(completeParcelData);

        // Show success message
        await Swal.fire({
          title: 'Success!',
          text: 'Your parcel order has been created. Redirecting to confirmation...',
          icon: 'success',
          allowOutsideClick: false,
          didOpen: async () => {
            setTimeout(() => {
              navigate('/parcel-confirmation');
            }, 1500);
          }
        });
      } catch (error) {
        console.error('Error saving parcel:', error);
        Swal.fire('Error', 'Failed to save parcel. Please try again.', 'error');
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
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
                {errors.parcelName && <p className="text-red-500 text-sm mt-1">{errors.parcelName.message}</p>}
              </div>

              <div>
                <label className={labelStyle}>Weight (KG) *</label>
                <input type="number" step="0.1" {...register("parcelWeight", { required: "Weight is required", min: { value: 0.1, message: "Weight must be greater than 0" } })} className={inputStyle} placeholder="Enter weight in KG" />
                {errors.parcelWeight && <p className="text-red-500 text-sm mt-1">{errors.parcelWeight.message}</p>}
              </div>

            </div>
          </div>

          {/* Delivery Type & Pricing */}
          <div className={cardStyle}>
            <h2 className={headingStyle + " mb-6"}>Delivery Type & Pricing</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Delivery Type *</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" value="within-city" {...register("deliveryType")} className="accent-lime-500 w-5 h-5" />
                    <span className="text-gray-800 font-medium">Within City</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" value="outside-city" {...register("deliveryType")} className="accent-lime-500 w-5 h-5" />
                    <span className="text-gray-800 font-medium">Outside City/District</span>
                  </label>
                </div>
                {deliveryTypeWarning && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    ℹ️ {deliveryTypeWarning}
                  </div>
                )}
              </div>

              <div>
                <label className={labelStyle}>Estimated Price</label>
                {priceInfo ? (
                  <div className="bg-gradient-to-br from-lime-50 to-green-50 border-2 border-lime-500 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">Base Charge: ৳{priceInfo.basePrice}</div>
                    {priceInfo.extraCharges > 0 && (
                      <div className="text-sm text-gray-600 mb-2">Extra Charges: ৳{priceInfo.extraCharges}</div>
                    )}
                    <div className="text-2xl font-bold text-lime-600">৳{priceInfo.totalPrice}</div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-4 text-gray-500 text-center">
                    Enter weight to calculate price
                  </div>
                )}
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
                  <input {...register("senderName", { required: "Name is required" })} defaultValue={user?.displayName} className={inputStyle} placeholder="Enter your name" />
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
                  <label className={labelStyle}>Email *</label>
                  <input 
                    type="email"
                    {...register("senderEmail", { 
                      required: "Email is required"
                    })} 
                    defaultValue={user?.email}
                    className={inputStyle} 
                    placeholder="Enter your email" 
                  />
                  {errors.senderEmail && <p className="text-red-500 text-sm mt-1">{errors.senderEmail.message}</p>}
                </div>

                <div>
                  <label className={labelStyle}>Phone Number *</label>
                  <input {...register("senderPhone", { required: "Phone is required", pattern: { value: /^[0-9]{10,11}$/, message: "Phone must be 10-11 digits" } })} className={inputStyle} placeholder="Enter phone number" />
                  {errors.senderPhone && <p className="text-red-500 text-sm mt-1">{errors.senderPhone.message}</p>}
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
                  {!senderDistrictSearch && errors.senderDistrict && <p className="text-red-500 text-sm mt-1">Please select a district</p>}
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
                  <input {...register("receiverPhone", { required: "Phone is required", pattern: { value: /^[0-9]{10,11}$/, message: "Phone must be 10-11 digits" } })} className={inputStyle} placeholder="Enter contact number" />
                  {errors.receiverPhone && <p className="text-red-500 text-sm mt-1">{errors.receiverPhone.message}</p>}
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
                  {!receiverDistrictSearch && errors.receiverDistrict && <p className="text-red-500 text-sm mt-1">Please select a district</p>}
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
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 font-semibold rounded-lg shadow-md transition ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white hover:shadow-lg'
              }`}
            >
              {isSubmitting ? '⏳ Processing...' : '✔️ Proceed to Confirm'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SendParcel;