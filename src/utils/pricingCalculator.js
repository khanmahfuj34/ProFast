/**
 * Parcel Pricing Calculator
 * Calculates delivery price based on type, weight, and location
 */

export const calculateDeliveryPrice = (parcelType, weight, deliveryType) => {
    // Validation
    if (!parcelType || !weight || !deliveryType) {
        return { error: "Missing required fields" };
    }

    const weightNum = parseFloat(weight);

    if (isNaN(weightNum) || weightNum <= 0) {
        return { error: "Invalid weight" };
    }

    let basePrice = 0;
    let extraCharges = 0;

    if (parcelType === "document") {
        // Document pricing
        if (deliveryType === "within-city") {
            basePrice = 60;
        } else {
            basePrice = 80;
        }
    } else if (parcelType === "non-document") {
        // Non-Document pricing
        if (weightNum <= 3) {
            if (deliveryType === "within-city") {
                basePrice = 110;
            } else {
                basePrice = 150;
            }
        } else {
            // Above 3kg
            const extraKg = weightNum - 3;
            const extraKgCharge = extraKg * 40;

            if (deliveryType === "within-city") {
                basePrice = 110;
                extraCharges = extraKgCharge;
            } else {
                basePrice = 150;
                extraCharges = extraKgCharge + 40; // Extra kg + outside charge
            }
        }
    }

    const totalPrice = basePrice + extraCharges;

    return {
        basePrice,
        extraCharges,
        totalPrice,
        error: null
    };
};

export const getPricingDetails = (parcelType, weight, deliveryType) => {
    const result = calculateDeliveryPrice(parcelType, weight, deliveryType);

    if (result.error) {
        return null;
    }

    return {
        parcelType,
        weight: parseFloat(weight),
        deliveryType,
        basePrice: result.basePrice,
        extraCharges: result.extraCharges,
        totalPrice: result.totalPrice
    };
};